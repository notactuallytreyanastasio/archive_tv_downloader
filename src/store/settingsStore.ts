import { create } from 'zustand';

interface Settings {
  downloadPath: string;
  maxConcurrent: number;
  autoStart: boolean;
}

interface SettingsStore extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  downloadPath: '',
  maxConcurrent: 2,
  autoStart: true,

  updateSettings: (settings) => {
    set(settings);
  },

  loadSettings: async () => {
    const settings = await window.electronAPI.getSettings();
    set(settings);
  },

  saveSettings: async () => {
    const { downloadPath, maxConcurrent, autoStart } = get();
    await window.electronAPI.saveSettings({
      downloadPath,
      maxConcurrent,
      autoStart,
    });
  },
}));
