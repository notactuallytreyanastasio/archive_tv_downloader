import { ipcMain, dialog } from 'electron';
import { videoService } from './video-service.js';
import { downloadService } from './download-service.js';
import { store } from './store.js';
import { getMainWindow } from './main.js';

export function setupIPCHandlers() {
  // Video handlers
  ipcMain.handle('get-videos', async () => {
    try {
      return await videoService.getAllVideos();
    } catch (error) {
      console.error('Error in get-videos handler:', error);
      throw error;
    }
  });

  ipcMain.handle('search-videos', async (_event, query: string) => {
    try {
      return await videoService.searchVideos(query);
    } catch (error) {
      console.error('Error in search-videos handler:', error);
      throw error;
    }
  });

  ipcMain.handle('sync-collection', async (_event, collectionName: string) => {
    try {
      const mainWindow = getMainWindow();

      await videoService.syncCollection(collectionName, (fetched, total) => {
        if (mainWindow) {
          mainWindow.webContents.send('sync-progress', { fetched, total });
        }
      });
    } catch (error) {
      console.error('Error in sync-collection handler:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-video', async (_event, videoId: string) => {
    try {
      await videoService.deleteVideo(videoId);
    } catch (error) {
      console.error('Error in delete-video handler:', error);
      throw error;
    }
  });

  // Download handlers
  ipcMain.handle('download-video', async (_event, videoId: string) => {
    try {
      await downloadService.downloadVideo(videoId);
    } catch (error) {
      console.error('Error in download-video handler:', error);
      throw error;
    }
  });

  ipcMain.handle('cancel-download', async (_event, videoId: string) => {
    try {
      return await downloadService.cancelDownload(videoId);
    } catch (error) {
      console.error('Error in cancel-download handler:', error);
      return false;
    }
  });

  ipcMain.handle('pause-downloads', async () => {
    try {
      downloadService.pauseDownloads();
    } catch (error) {
      console.error('Error in pause-downloads handler:', error);
      throw error;
    }
  });

  ipcMain.handle('resume-downloads', async () => {
    try {
      downloadService.resumeDownloads();
    } catch (error) {
      console.error('Error in resume-downloads handler:', error);
      throw error;
    }
  });

  ipcMain.handle('get-queue-state', async () => {
    try {
      return downloadService.getQueueState();
    } catch (error) {
      console.error('Error in get-queue-state handler:', error);
      throw error;
    }
  });

  // Settings handlers
  ipcMain.handle('select-download-path', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Download Directory',
      buttonLabel: 'Select',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle('get-settings', async () => {
    return {
      downloadPath: store.get('downloadPath'),
      maxConcurrent: store.get('maxConcurrent'),
      autoStart: store.get('autoStart'),
    };
  });

  ipcMain.handle(
    'save-settings',
    async (
      _event,
      settings: {
        downloadPath?: string;
        maxConcurrent?: number;
        autoStart?: boolean;
      }
    ) => {
      if (settings.downloadPath !== undefined) {
        store.set('downloadPath', settings.downloadPath);
        downloadService.updateDownloadPath(settings.downloadPath);
      }

      if (settings.maxConcurrent !== undefined) {
        store.set('maxConcurrent', settings.maxConcurrent);
        downloadService.updateMaxConcurrent(settings.maxConcurrent);
      }

      if (settings.autoStart !== undefined) {
        store.set('autoStart', settings.autoStart);
      }
    }
  );
}
