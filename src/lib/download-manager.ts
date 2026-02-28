// Download manager - standalone version
import * as fs from 'node:fs';
import * as path from 'node:path';
import { EventEmitter } from 'node:events';

export interface DownloadRequest {
  videoId: string;
  url: string;
  filename: string;
  priority?: number;
}

export interface DownloadProgress {
  videoId: string;
  bytesDownloaded: number;
  totalBytes: number | null;
  percent: number;
  speed: number;
  eta: number | null;
}

export interface DownloadResult {
  videoId: string;
  localPath: string;
  size: number;
  duration: number;
}

export interface DownloadError {
  videoId: string;
  error: string;
  retryCount: number;
}

export type DownloadEvent =
  | { type: 'queued'; videoId: string; position: number }
  | { type: 'started'; videoId: string }
  | { type: 'progress'; data: DownloadProgress }
  | { type: 'completed'; data: DownloadResult }
  | { type: 'failed'; data: DownloadError }
  | { type: 'cancelled'; videoId: string };

export type DownloadEventHandler = (event: DownloadEvent) => void;

interface QueueItem {
  request: DownloadRequest;
  priority: number;
  retryCount: number;
}

export class DownloadManager extends EventEmitter {
  private downloadDir: string;
  private maxConcurrent: number;
  private maxRetries: number;
  private queue: QueueItem[] = [];
  private activeDownloads: Map<string, AbortController> = new Map();
  private isPaused: boolean = false;

  constructor(config: {
    downloadDir: string;
    maxConcurrent?: number;
    maxRetries?: number;
  }) {
    super();
    this.downloadDir = config.downloadDir;
    this.maxConcurrent = config.maxConcurrent || 2;
    this.maxRetries = config.maxRetries || 3;

    // Ensure download directory exists
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
  }

  queueDownload(request: DownloadRequest): number {
    const item: QueueItem = {
      request,
      priority: request.priority || 0,
      retryCount: 0,
    };

    this.queue.push(item);
    this.queue.sort((a, b) => b.priority - a.priority);

    const position = this.queue.findIndex(q => q.request.videoId === request.videoId) + 1;
    this.emit('download-event', { type: 'queued', videoId: request.videoId, position } as DownloadEvent);

    this.processQueue();
    return position;
  }

  cancel(videoId: string): boolean {
    // Cancel active download
    const controller = this.activeDownloads.get(videoId);
    if (controller) {
      controller.abort();
      this.activeDownloads.delete(videoId);
      this.emit('download-event', { type: 'cancelled', videoId } as DownloadEvent);
      return true;
    }

    // Remove from queue
    const index = this.queue.findIndex(q => q.request.videoId === videoId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.emit('download-event', { type: 'cancelled', videoId } as DownloadEvent);
      return true;
    }

    return false;
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    this.processQueue();
  }

  start(): void {
    this.resume();
  }

  stop(): void {
    this.pause();
    for (const [videoId, controller] of this.activeDownloads) {
      controller.abort();
      this.emit('download-event', { type: 'cancelled', videoId } as DownloadEvent);
    }
    this.activeDownloads.clear();
  }

  getQueueState() {
    return {
      state: this.isPaused ? 'paused' : this.activeDownloads.size > 0 ? 'downloading' : 'idle',
      queueSize: this.queue.length,
      activeCount: this.activeDownloads.size,
      queue: this.queue.map(q => ({
        videoId: q.request.videoId,
        priority: q.priority,
        retryCount: q.retryCount,
      })),
      activeIds: Array.from(this.activeDownloads.keys()),
    };
  }

  onEvent(handler: DownloadEventHandler): void {
    this.on('download-event', handler);
  }

  offEvent(handler: DownloadEventHandler): void {
    this.off('download-event', handler);
  }

  private async processQueue(): Promise<void> {
    if (this.isPaused) return;
    if (this.activeDownloads.size >= this.maxConcurrent) return;
    if (this.queue.length === 0) return;

    const item = this.queue.shift();
    if (!item) return;

    this.downloadFile(item);
    this.processQueue(); // Process next item
  }

  private async downloadFile(item: QueueItem): Promise<void> {
    const { request } = item;
    const controller = new AbortController();
    this.activeDownloads.set(request.videoId, controller);

    this.emit('download-event', { type: 'started', videoId: request.videoId } as DownloadEvent);

    const outputPath = path.join(this.downloadDir, request.filename);
    const tempPath = `${outputPath}.download`;

    try {
      const startTime = Date.now();
      let bytesDownloaded = 0;
      let lastUpdate = Date.now();
      let lastBytes = 0;

      const response = await fetch(request.url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const totalBytes = response.headers.get('content-length')
        ? parseInt(response.headers.get('content-length')!, 10)
        : null;

      const fileStream = fs.createWriteStream(tempPath);
      const reader = response.body!.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fileStream.write(value);
        bytesDownloaded += value.length;

        // Emit progress every 500ms
        const now = Date.now();
        if (now - lastUpdate > 500) {
          const speed = (bytesDownloaded - lastBytes) / ((now - lastUpdate) / 1000);
          const eta = totalBytes && speed > 0
            ? (totalBytes - bytesDownloaded) / speed
            : null;

          this.emit('download-event', {
            type: 'progress',
            data: {
              videoId: request.videoId,
              bytesDownloaded,
              totalBytes,
              percent: totalBytes ? (bytesDownloaded / totalBytes) * 100 : 0,
              speed,
              eta,
            } as DownloadProgress,
          } as DownloadEvent);

          lastUpdate = now;
          lastBytes = bytesDownloaded;
        }
      }

      fileStream.end();
      await new Promise(resolve => fileStream.on('finish', resolve));

      // Rename temp file to final path
      fs.renameSync(tempPath, outputPath);

      const duration = Date.now() - startTime;

      this.emit('download-event', {
        type: 'completed',
        data: {
          videoId: request.videoId,
          localPath: outputPath,
          size: bytesDownloaded,
          duration,
        } as DownloadResult,
      } as DownloadEvent);
    } catch (error: any) {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      if (error.name === 'AbortError') {
        this.emit('download-event', { type: 'cancelled', videoId: request.videoId } as DownloadEvent);
      } else {
        // Retry logic
        if (item.retryCount < this.maxRetries) {
          item.retryCount++;
          this.queue.push(item);
          console.log(`Retrying download for ${request.videoId} (attempt ${item.retryCount})`);
        } else {
          this.emit('download-event', {
            type: 'failed',
            data: {
              videoId: request.videoId,
              error: error.message,
              retryCount: item.retryCount,
            } as DownloadError,
          } as DownloadEvent);
        }
      }
    } finally {
      this.activeDownloads.delete(request.videoId);
      this.processQueue();
    }
  }
}
