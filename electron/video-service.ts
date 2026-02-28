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
