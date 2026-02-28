// Simple SQLite database for videos
import Database from 'better-sqlite3';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type { Video } from './types';

export class VideoDatabase {
  private db: Database.Database;

  constructor(dbPath: string) {
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        publicDate TEXT NOT NULL,
        duration REAL,
        thumbnailUrl TEXT NOT NULL,
        primaryVideoUrl TEXT NOT NULL,
        primaryFormat TEXT NOT NULL,
        collection TEXT NOT NULL,
        downloadStatus TEXT DEFAULT 'not_downloaded',
        localPath TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_videos_title ON videos(title);
      CREATE INDEX IF NOT EXISTS idx_videos_downloadStatus ON videos(downloadStatus);
    `);
  }

  insertVideo(video: Video): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO videos (
        id, title, description, publicDate, duration,
        thumbnailUrl, primaryVideoUrl, primaryFormat, collection,
        downloadStatus, localPath, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      video.id,
      video.title,
      video.description,
      video.publicDate.toISOString(),
      video.duration,
      video.thumbnailUrl,
      video.primaryVideoUrl,
      video.primaryFormat,
      video.collection,
      video.downloadStatus || 'not_downloaded',
      video.localPath || null
    );
  }

  getAllVideos(): Video[] {
    const stmt = this.db.prepare('SELECT * FROM videos ORDER BY publicDate DESC');
    const rows = stmt.all();
    return rows.map(this.rowToVideo);
  }

  searchVideos(query: string): Video[] {
    const stmt = this.db.prepare(`
      SELECT * FROM videos
      WHERE title LIKE ? OR description LIKE ?
      ORDER BY publicDate DESC
    `);
    const searchPattern = `%${query}%`;
    const rows = stmt.all(searchPattern, searchPattern);
    return rows.map(this.rowToVideo);
  }

  getVideo(id: string): Video | null {
    const stmt = this.db.prepare('SELECT * FROM videos WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.rowToVideo(row) : null;
  }

  updateDownloadStatus(id: string, status: string, localPath?: string): void {
    const stmt = this.db.prepare(`
      UPDATE videos
      SET downloadStatus = ?, localPath = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(status, localPath || null, id);
  }

  getVideoCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM videos');
    const row = stmt.get() as { count: number };
    return row.count;
  }

  deleteVideo(id: string): void {
    const stmt = this.db.prepare('DELETE FROM videos WHERE id = ?');
    stmt.run(id);
  }

  private rowToVideo(row: any): Video {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      publicDate: new Date(row.publicDate),
      duration: row.duration,
      thumbnailUrl: row.thumbnailUrl,
      primaryVideoUrl: row.primaryVideoUrl,
      primaryFormat: row.primaryFormat,
      collection: row.collection,
      downloadStatus: row.downloadStatus,
      localPath: row.localPath,
    };
  }

  close(): void {
    this.db.close();
  }
}
