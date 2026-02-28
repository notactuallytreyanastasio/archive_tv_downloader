import { create } from 'zustand';

interface DownloadProgress {
  videoId: string;
  bytesDownloaded: number;
  totalBytes: number | null;
  percent: number;
  speed: number;
  eta: number | null;
}

interface QueuedDownload {
  videoId: string;
  position: number;
  priority: number;
}

interface DownloadStore {
  queue: QueuedDownload[];
  activeDownloads: Map<string, DownloadProgress>;
  completedDownloads: Set<string>;
  failedDownloads: Map<string, string>;

  addToQueue: (videoId: string, position: number) => void;
  removeFromQueue: (videoId: string) => void;
  updateProgress: (progress: DownloadProgress) => void;
  markCompleted: (videoId: string, localPath: string) => void;
  markFailed: (videoId: string, error: string) => void;
  clearCompleted: () => void;
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  queue: [],
  activeDownloads: new Map(),
  completedDownloads: new Set(),
  failedDownloads: new Map(),

  addToQueue: (videoId, position) => {
    const queue = get().queue;
    if (!queue.find((q) => q.videoId === videoId)) {
      set({ queue: [...queue, { videoId, position, priority: 0 }] });
    }
  },

  removeFromQueue: (videoId) => {
    const queue = get().queue.filter((q) => q.videoId !== videoId);
    set({ queue });
  },

  updateProgress: (progress) => {
    const activeDownloads = new Map(get().activeDownloads);
    activeDownloads.set(progress.videoId, progress);
    set({ activeDownloads });
  },

  markCompleted: (videoId, localPath) => {
    const completedDownloads = new Set(get().completedDownloads);
    completedDownloads.add(videoId);

    const activeDownloads = new Map(get().activeDownloads);
    activeDownloads.delete(videoId);

    set({
      completedDownloads,
      activeDownloads,
      queue: get().queue.filter((q) => q.videoId !== videoId),
    });
  },

  markFailed: (videoId, error) => {
    const failedDownloads = new Map(get().failedDownloads);
    failedDownloads.set(videoId, error);

    const activeDownloads = new Map(get().activeDownloads);
    activeDownloads.delete(videoId);

    set({
      failedDownloads,
      activeDownloads,
      queue: get().queue.filter((q) => q.videoId !== videoId),
    });
  },

  clearCompleted: () => {
    set({ completedDownloads: new Set() });
  },
}));
