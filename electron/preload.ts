import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

export type ElectronAPI = {
  // Videos
  getVideos: () => Promise<any[]>;
  searchVideos: (query: string) => Promise<any[]>;
  syncCollection: () => Promise<void>;

  // Downloads
  downloadVideo: (videoId: string) => Promise<void>;
  cancelDownload: (videoId: string) => Promise<boolean>;
  pauseDownloads: () => Promise<void>;
  resumeDownloads: () => Promise<void>;
  getQueueState: () => Promise<any>;

  // Events
  onDownloadProgress: (callback: (event: IpcRendererEvent, data: any) => void) => () => void;
  onDownloadComplete: (callback: (event: IpcRendererEvent, data: any) => void) => () => void;
  onDownloadFailed: (callback: (event: IpcRendererEvent, data: any) => void) => () => void;
  onDownloadQueued: (callback: (event: IpcRendererEvent, data: any) => void) => () => void;
  onDownloadStarted: (callback: (event: IpcRendererEvent, data: any) => void) => () => void;
  onSyncProgress: (callback: (event: IpcRendererEvent, data: any) => void) => () => void;

  // Settings
  selectDownloadPath: () => Promise<string | null>;
  getSettings: () => Promise<{ downloadPath: string; maxConcurrent: number; autoStart: boolean }>;
  saveSettings: (settings: {
    downloadPath?: string;
    maxConcurrent?: number;
    autoStart?: boolean;
  }) => Promise<void>;
};

const electronAPI: ElectronAPI = {
  // Videos
  getVideos: () => ipcRenderer.invoke('get-videos'),
  searchVideos: (query: string) => ipcRenderer.invoke('search-videos', query),
  syncCollection: () => ipcRenderer.invoke('sync-collection'),

  // Downloads
  downloadVideo: (videoId: string) => ipcRenderer.invoke('download-video', videoId),
  cancelDownload: (videoId: string) => ipcRenderer.invoke('cancel-download', videoId),
  pauseDownloads: () => ipcRenderer.invoke('pause-downloads'),
  resumeDownloads: () => ipcRenderer.invoke('resume-downloads'),
  getQueueState: () => ipcRenderer.invoke('get-queue-state'),

  // Events
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', callback);
    return () => ipcRenderer.removeListener('download-progress', callback);
  },
  onDownloadComplete: (callback) => {
    ipcRenderer.on('download-complete', callback);
    return () => ipcRenderer.removeListener('download-complete', callback);
  },
  onDownloadFailed: (callback) => {
    ipcRenderer.on('download-failed', callback);
    return () => ipcRenderer.removeListener('download-failed', callback);
  },
  onDownloadQueued: (callback) => {
    ipcRenderer.on('download-queued', callback);
    return () => ipcRenderer.removeListener('download-queued', callback);
  },
  onDownloadStarted: (callback) => {
    ipcRenderer.on('download-started', callback);
    return () => ipcRenderer.removeListener('download-started', callback);
  },
  onSyncProgress: (callback) => {
    ipcRenderer.on('sync-progress', callback);
    return () => ipcRenderer.removeListener('sync-progress', callback);
  },

  // Settings
  selectDownloadPath: () => ipcRenderer.invoke('select-download-path'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
