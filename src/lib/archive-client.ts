// Archive.org API client - standalone version
import type { Video } from './types';

const ARCHIVE_API_BASE = 'https://archive.org';
const DEFAULT_COLLECTION = 'markpines';

interface ArchiveSearchResponse {
  response: {
    docs: ArchiveDoc[];
    numFound: number;
  };
}

interface ArchiveDoc {
  identifier: string;
  title: string;
  description?: string;
  publicdate?: string;
  creator?: string;
  runtime?: string;
}

interface ArchiveMetadataResponse {
  files: ArchiveFile[];
  metadata: {
    title: string;
    description?: string;
    creator?: string;
    date?: string;
    runtime?: string;
  };
  d1?: string;
  d2?: string;
  dir?: string;
  server?: string;
}

interface ArchiveFile {
  name: string;
  format: string;
  size?: string;
  source?: string;
  height?: string;
  width?: string;
}

export class ArchiveClient {
  private collection: string;

  constructor(collection: string = DEFAULT_COLLECTION) {
    this.collection = collection;
  }

  async searchCollection(rows: number = 100, start: number = 0): Promise<ArchiveDoc[]> {
    const fields = 'identifier,title,description,publicdate,creator,runtime';
    const url = `${ARCHIVE_API_BASE}/advancedsearch.php?q=collection:${this.collection}&fl=${fields}&rows=${rows}&page=1&output=json&sort=publicdate+desc&start=${start}`;

    const response = await fetch(url);
    const data: ArchiveSearchResponse = await response.json();
    return data.response.docs;
  }

  async getMetadata(identifier: string): Promise<ArchiveMetadataResponse> {
    const url = `${ARCHIVE_API_BASE}/metadata/${identifier}`;
    const response = await fetch(url);
    return await response.json();
  }

  async getAllVideos(onProgress?: (fetched: number, total: number) => void): Promise<Video[]> {
    const videos: Video[] = [];
    let start = 0;
    const batchSize = 100;
    let total = 0;

    // First batch to get total count
    const firstBatch = await this.searchCollection(batchSize, start);

    for (const doc of firstBatch) {
      const video = await this.docToVideo(doc);
      if (video) videos.push(video);
      if (onProgress) onProgress(videos.length, total || firstBatch.length);
    }

    // Continue fetching if there are more
    start += batchSize;
    while (firstBatch.length === batchSize) {
      const batch = await this.searchCollection(batchSize, start);
      if (batch.length === 0) break;

      for (const doc of batch) {
        const video = await this.docToVideo(doc);
        if (video) videos.push(video);
        if (onProgress) onProgress(videos.length, total || videos.length);
      }

      start += batchSize;
      if (batch.length < batchSize) break;
    }

    return videos;
  }

  private async docToVideo(doc: ArchiveDoc): Promise<Video | null> {
    try {
      const metadata = await this.getMetadata(doc.identifier);
      const videoFile = this.selectBestVideoFile(metadata.files);

      if (!videoFile) return null;

      const downloadUrl = this.constructDownloadUrl(metadata, videoFile);
      const thumbnailUrl = `${ARCHIVE_API_BASE}/services/img/${doc.identifier}`;

      return {
        id: doc.identifier,
        title: metadata.metadata.title || doc.title,
        description: metadata.metadata.description || doc.description || null,
        publicDate: new Date(doc.publicdate || Date.now()),
        duration: this.parseDuration(doc.runtime || metadata.metadata.runtime),
        thumbnailUrl,
        primaryVideoUrl: downloadUrl,
        primaryFormat: videoFile.format,
        collection: this.collection,
        downloadStatus: 'not_downloaded',
      };
    } catch (error) {
      console.error(`Failed to fetch metadata for ${doc.identifier}:`, error);
      return null;
    }
  }

  private selectBestVideoFile(files: ArchiveFile[]): ArchiveFile | null {
    const videoFormats = ['h.264', 'MPEG4', '512Kb MPEG4', 'WebM', 'Ogg Video'];

    for (const format of videoFormats) {
      const file = files.find(f => f.format === format && f.source !== 'original');
      if (file) return file;
    }

    return null;
  }

  private constructDownloadUrl(metadata: ArchiveMetadataResponse, file: ArchiveFile): string {
    const server = metadata.server || metadata.d1 || 'ia600000.us.archive.org';
    const dir = metadata.dir || `/0/items/${metadata.metadata.title}`;
    return `https://${server}${dir}/${file.name}`;
  }

  private parseDuration(runtime?: string): number | null {
    if (!runtime) return null;

    // Try to parse HH:MM:SS or MM:SS format
    const parts = runtime.split(':').map(p => parseInt(p, 10));
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }

    // Try to parse as seconds
    const seconds = parseFloat(runtime);
    return isNaN(seconds) ? null : seconds;
  }
}
