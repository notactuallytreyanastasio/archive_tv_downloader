export interface Video {
  id: string;
  title: string;
  description: string | null;
  publicDate: Date;
  duration: number | null;
  thumbnailUrl: string;
  primaryVideoUrl: string;
  primaryFormat: string;
  collection: string;
  downloadStatus?: string;
  localPath?: string | null;
}

export interface DownloadProgress {
  videoId: string;
  bytesDownloaded: number;
  totalBytes: number | null;
  percent: number;
  speed: number;
  eta: number | null;
}

export interface QueuedDownload {
  videoId: string;
  position: number;
  priority: number;
}
