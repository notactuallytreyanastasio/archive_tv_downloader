import { app } from 'electron';
import path from 'node:path';
import { ArchiveClient } from '../src/lib/archive-client.js';
import { VideoDatabase } from '../src/lib/database.js';
import type { Video } from '../src/lib/types.js';

// Initialize database in Electron's userData directory
const dbPath = path.join(app.getPath('userData'), 'videos.db');
const db = new VideoDatabase(dbPath);

export class VideoService {
  async getAllVideos(): Promise<Video[]> {
    try {
      return db.getAllVideos();
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  }

  async searchVideos(query: string): Promise<Video[]> {
    if (!query || query.trim() === '') {
      return this.getAllVideos();
    }

    try {
      return db.searchVideos(query);
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
    }
  }

  async syncCollection(
    identifierOrCollection: string,
    onProgress?: (fetched: number, total: number) => void
  ): Promise<void> {
    try {
      const archiveClient = new ArchiveClient();
      const videos = await archiveClient.detectAndSync(identifierOrCollection, onProgress);

      for (const video of videos) {
        db.insertVideo(video);
      }

      console.log(`Sync complete! Total videos: ${videos.length} from: ${identifierOrCollection}`);
    } catch (error) {
      console.error('Error syncing:', error);
      throw error;
    }
  }

  async getVideoCount(): Promise<number> {
    try {
      return db.getVideoCount();
    } catch (error) {
      console.error('Error getting video count:', error);
      return 0;
    }
  }

  async deleteVideo(id: string): Promise<void> {
    console.log(`[VideoService] Deleting video: ${id}`);
    db.deleteVideo(id);
  }

  async renameVideo(id: string, newName: string): Promise<void> {
    console.log(`[VideoService] Renaming video: ${id} to ${newName}`);

    const video = db.getVideo(id);
    if (!video || !video.localPath) {
      throw new Error('Video not found or not downloaded');
    }

    const fs = await import('node:fs');
    const path = await import('node:path');

    const oldPath = video.localPath;
    const dir = path.dirname(oldPath);
    const ext = path.extname(oldPath);
    const newPath = path.join(dir, `${newName}${ext}`);

    // Check if file exists
    if (!fs.existsSync(oldPath)) {
      throw new Error('Downloaded file not found');
    }

    // Check if new name already exists
    if (fs.existsSync(newPath) && oldPath !== newPath) {
      throw new Error('A file with that name already exists');
    }

    // Rename the file
    fs.renameSync(oldPath, newPath);

    // Update database
    db.updateDownloadStatus(id, 'completed', newPath);

    console.log(`[VideoService] Renamed ${oldPath} to ${newPath}`);
  }

  async getVideo(id: string): Promise<Video | null> {
    console.log(`[VideoService] Looking up video with ID: ${id}`);
    const video = db.getVideo(id);
    console.log(`[VideoService] Video found:`, video ? video.title : 'NOT FOUND');
    return video;
  }

  async updateDownloadStatus(id: string, status: string, localPath?: string): Promise<void> {
    db.updateDownloadStatus(id, status, localPath);
  }
}

export const videoService = new VideoService();
