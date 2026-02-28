import { app } from 'electron';
import path from 'node:path';
import { DownloadManager } from '../src/lib/download-manager.js';
import type { DownloadEvent, DownloadEventHandler } from '../src/lib/download-manager.js';
import { store } from './main.js';
import { getMainWindow } from './main.js';
import { videoService } from './video-service.js';

export class DownloadService {
  private downloadManager: DownloadManager;

  constructor() {
    const downloadPath = store.get('downloadPath') || app.getPath('downloads');
    const maxConcurrent = store.get('maxConcurrent') || 2;

    this.downloadManager = new DownloadManager({
      downloadDir: downloadPath,
      maxConcurrent,
      maxRetries: 3,
    });

    // Forward download events to renderer
    this.downloadManager.onEvent(this.handleDownloadEvent);

    // Auto-start if enabled
    if (store.get('autoStart')) {
      this.downloadManager.start();
    }
  }

  private handleDownloadEvent: DownloadEventHandler = (event: DownloadEvent) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return;

    switch (event.type) {
      case 'queued':
        mainWindow.webContents.send('download-queued', {
          videoId: event.videoId,
          position: event.position,
        });
        break;

      case 'started':
        mainWindow.webContents.send('download-started', {
          videoId: event.videoId,
        });
        break;

      case 'progress':
        mainWindow.webContents.send('download-progress', event.data);
        break;

      case 'completed':
        mainWindow.webContents.send('download-complete', event.data);
        // Update database
        videoService.updateDownloadStatus(event.data.videoId, 'completed', event.data.localPath);
        break;

      case 'failed':
        mainWindow.webContents.send('download-failed', event.data);
        // Update database
        videoService.updateDownloadStatus(event.data.videoId, 'failed');
        break;

      case 'cancelled':
        mainWindow.webContents.send('download-cancelled', {
          videoId: event.videoId,
        });
        break;
    }
  };

  async downloadVideo(videoId: string): Promise<void> {
    try {
      // Get video from database
      const video = await videoService.getVideo(videoId);

      if (!video) {
        throw new Error(`Video not found: ${videoId}`);
      }

      const downloadPath = store.get('downloadPath') || app.getPath('downloads');

      // Generate filename from title and format
      const safeTitle = video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = this.getExtensionFromFormat(video.primaryFormat);
      const filename = `${safeTitle}_${videoId}.${extension}`;

      // Queue the download
      this.downloadManager.queueDownload({
        videoId: video.id,
        url: video.primaryVideoUrl,
        filename,
        priority: 0,
      });

      // Update video status in database
      await videoService.updateDownloadStatus(videoId, 'queued');
    } catch (error) {
      console.error('Error queueing download:', error);
      throw error;
    }
  }

  async cancelDownload(videoId: string): Promise<boolean> {
    const cancelled = this.downloadManager.cancel(videoId);
    if (cancelled) {
      // Update database
      await videoService.updateDownloadStatus(videoId, 'not_downloaded');
    }
    return cancelled;
  }

  pauseDownloads(): void {
    this.downloadManager.pause();
  }

  resumeDownloads(): void {
    this.downloadManager.resume();
  }

  getQueueState() {
    return this.downloadManager.getQueueState();
  }

  updateDownloadPath(newPath: string): void {
    store.set('downloadPath', newPath);
  }

  updateMaxConcurrent(max: number): void {
    store.set('maxConcurrent', max);
  }

  private getExtensionFromFormat(format: string): string {
    const formatMap: Record<string, string> = {
      'h.264': 'mp4',
      'MPEG4': 'mp4',
      '512Kb MPEG4': 'mp4',
      'WebM': 'webm',
      'Ogg Video': 'ogv',
      'Cinepack': 'avi',
      'MPEG2': 'mpg',
    };

    return formatMap[format] || 'mp4';
  }
}

export const downloadService = new DownloadService();
