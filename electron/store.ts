import { app } from 'electron';
import Store from 'electron-store';

interface StoreSchema {
  downloadPath: string;
  maxConcurrent: number;
  autoStart: boolean;
}

export const store = new Store<StoreSchema>({
  defaults: {
    downloadPath: app.getPath('downloads'),
    maxConcurrent: 2,
    autoStart: true,
  },
});
