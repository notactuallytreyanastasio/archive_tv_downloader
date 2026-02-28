import { create } from 'zustand';

interface Video {
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

interface VideoStore {
  videos: Video[];
  searchQuery: string;
  filteredVideos: Video[];
  isLoading: boolean;
  setVideos: (videos: Video[]) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videos: [],
  searchQuery: '',
  filteredVideos: [],
  isLoading: false,

  setVideos: (videos) => {
    set({ videos, filteredVideos: videos });
  },

  setSearchQuery: (query) => {
    const videos = get().videos;
    const filtered = query
      ? videos.filter(
          (v) =>
            v.title.toLowerCase().includes(query.toLowerCase()) ||
            v.description?.toLowerCase().includes(query.toLowerCase())
        )
      : videos;

    set({ searchQuery: query, filteredVideos: filtered });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
