// Archive.org API client - supports both collections and individual items
import type { Video } from './types';

const ARCHIVE_API_BASE = 'https://archive.org';

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
    mediatype?: string;
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
  async getMetadata(identifier: string): Promise<ArchiveMetadataResponse> {
    const url = `${ARCHIVE_API_BASE}/metadata/${identifier}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    return await response.json();
  }

  async getSingleItem(identifier: string): Promise<Video[]> {
    try {
      const metadata = await this.getMetadata(identifier);
      const videoFiles = this.getAllVideoFiles(metadata.files);

      if (videoFiles.length === 0) {
        throw new Error('No video files found in this item');
      }

      const thumbnailUrl = `${ARCHIVE_API_BASE}/services/img/${identifier}`;
      const baseTitle = metadata.metadata.title || identifier;
      const videos: Video[] = [];

      // If there's only one video file, treat it as a single video
      if (videoFiles.length === 1) {
        const downloadUrl = this.constructDownloadUrl(metadata, videoFiles[0]);
        videos.push({
          id: identifier,
          title: baseTitle,
          description: metadata.metadata.description || null,
          publicDate: new Date(metadata.metadata.date || Date.now()),
          duration: this.parseDuration(metadata.metadata.runtime),
          thumbnailUrl,
          primaryVideoUrl: downloadUrl,
          primaryFormat: videoFiles[0].format,
          collection: identifier,
          downloadStatus: 'not_downloaded',
        });
      } else {
        // Multiple video files - create separate entries for each
        for (let i = 0; i < videoFiles.length; i++) {
          const videoFile = videoFiles[i];
          const downloadUrl = this.constructDownloadUrl(metadata, videoFile);

          // Extract episode/part name from filename
          const fileName = videoFile.name.replace(/\.(mp4|mkv|avi|ogv|webm)$/i, '');
          const episodeTitle = this.extractEpisodeTitle(fileName, baseTitle);

          videos.push({
            id: `${identifier}_${i + 1}`,
            title: episodeTitle,
            description: metadata.metadata.description || null,
            publicDate: new Date(metadata.metadata.date || Date.now()),
            duration: null, // Individual file durations not available in metadata
            thumbnailUrl,
            primaryVideoUrl: downloadUrl,
            primaryFormat: videoFile.format,
            collection: identifier,
            downloadStatus: 'not_downloaded',
          });
        }
      }

      return videos;
    } catch (error) {
      console.error(`Failed to fetch item ${identifier}:`, error);
      throw error;
    }
  }

  private extractEpisodeTitle(fileName: string, baseTitle: string): string {
    // Try to extract episode number or meaningful title from filename
    // Common patterns: "01 Episode Name", "Episode 01", "S01E01", etc.

    // Remove common prefixes
    let title = fileName
      .replace(new RegExp(`^${baseTitle}\\s*-?\\s*`, 'i'), '')
      .replace(/^(ep|episode|part|chapter)\s*/i, '')
      .trim();

    // If we extracted something meaningful, use it
    if (title && title.length > 0 && title !== fileName) {
      return `${baseTitle} - ${title}`;
    }

    // Otherwise use the filename
    return title || fileName;
  }

  private getAllVideoFiles(files: ArchiveFile[]): ArchiveFile[] {
    const videoFormats = ['h.264', 'MPEG4', '512Kb MPEG4', 'WebM', 'Ogg Video', 'MPEG2', 'Matroska'];

    return files
      .filter(f => videoFormats.includes(f.format))
      .sort((a, b) => {
        // Sort by name to keep episodes in order
        return a.name.localeCompare(b.name);
      });
  }

  async searchCollection(collection: string, rows: number = 100, start: number = 0): Promise<ArchiveDoc[]> {
    const fields = 'identifier,title,description,publicdate,creator,runtime';
    const url = `${ARCHIVE_API_BASE}/advancedsearch.php?q=collection:${collection}&fl=${fields}&rows=${rows}&page=1&output=json&sort=publicdate+desc&start=${start}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to search collection: ${response.statusText}`);
    }
    const data: ArchiveSearchResponse = await response.json();
    return data.response.docs;
  }

  async getAllFromCollection(collection: string, onProgress?: (fetched: number, total: number) => void): Promise<Video[]> {
    const videos: Video[] = [];
    let start = 0;
    const batchSize = 100;

    // First batch to get total count
    const firstBatch = await this.searchCollection(collection, batchSize, start);

    if (firstBatch.length === 0) {
      throw new Error(`Collection "${collection}" not found or is empty`);
    }

    for (const doc of firstBatch) {
      const video = await this.docToVideo(doc, collection);
      if (video) videos.push(video);
      if (onProgress) onProgress(videos.length, firstBatch.length);
    }

    // Continue fetching if there are more
    start += batchSize;
    while (firstBatch.length === batchSize) {
      const batch = await this.searchCollection(collection, batchSize, start);
      if (batch.length === 0) break;

      for (const doc of batch) {
        const video = await this.docToVideo(doc, collection);
        if (video) videos.push(video);
        if (onProgress) onProgress(videos.length, videos.length);
      }

      start += batchSize;
      if (batch.length < batchSize) break;
    }

    return videos;
  }

  async detectAndSync(identifierOrCollection: string, onProgress?: (fetched: number, total: number) => void): Promise<Video[]> {
    // First, try to get metadata to see if it's a single item
    try {
      const metadata = await this.getMetadata(identifierOrCollection);

      // Check if it's a video item (not a collection)
      if (metadata.metadata.mediatype === 'movies' || this.hasVideoFiles(metadata.files)) {
        console.log(`Detected video item: ${identifierOrCollection}`);
        const videos = await this.getSingleItem(identifierOrCollection);
        if (videos && videos.length > 0) {
          if (onProgress) onProgress(videos.length, videos.length);
          return videos;
        }
        return [];
      }
    } catch (error) {
      // If metadata fetch fails, assume it's a collection
      console.log(`Could not fetch as item, trying as collection: ${identifierOrCollection}`);
    }

    // Try as collection
    return await this.getAllFromCollection(identifierOrCollection, onProgress);
  }

  private hasVideoFiles(files: ArchiveFile[]): boolean {
    return files.some(f =>
      ['h.264', 'MPEG4', '512Kb MPEG4', 'WebM', 'Ogg Video', 'MPEG2'].includes(f.format)
    );
  }

  private async docToVideo(doc: ArchiveDoc, collection: string): Promise<Video | null> {
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
        collection,
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

    // Fallback to any video format
    return files.find(f =>
      ['h.264', 'MPEG4', '512Kb MPEG4', 'WebM', 'Ogg Video', 'MPEG2'].includes(f.format)
    ) || null;
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
