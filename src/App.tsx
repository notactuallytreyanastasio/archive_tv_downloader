import { useState, useEffect } from 'react';
import VideoLibrary from './components/VideoLibrary/VideoLibrary';
import DownloadQueue from './components/DownloadQueue/QueueView';
import SettingsDialog from './components/Settings/SettingsDialog';

function App() {
  const [currentView, setCurrentView] = useState<'library' | 'queue'>('library');
  const [showSettings, setShowSettings] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ fetched: 0, total: 0 });

  useEffect(() => {
    // Check if this is first run (no videos in database)
    checkFirstRun();

    // Listen for sync progress
    const unsubscribe = window.electronAPI.onSyncProgress((_event, data) => {
      setSyncProgress(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkFirstRun = async () => {
    const videos = await window.electronAPI.getVideos();
    if (videos.length === 0) {
      setIsFirstRun(true);
      // Auto-start sync on first run
      startSync();
    }
  };

  const startSync = async () => {
    setIsSyncing(true);
    try {
      await window.electronAPI.syncCollection();
      setIsFirstRun(false);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="app">
      {/* Menu Bar */}
      <div className="menu-bar">
        <div className="menu-bar-item" onClick={() => setShowSettings(true)}>
          File
        </div>
        <div className="menu-bar-item" onClick={() => setCurrentView('library')}>
          Library
        </div>
        <div className="menu-bar-item" onClick={() => setCurrentView('queue')}>
          Downloads
        </div>
      </div>

      {/* Main Content */}
      <div className="app-content">
        {isSyncing && (
          <div className="sync-overlay">
            <div className="sync-dialog">
              <h2>Syncing Archive.org Collection</h2>
              <p>
                Fetching videos: {syncProgress.fetched} / {syncProgress.total || '?'}
              </p>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: syncProgress.total
                      ? `${(syncProgress.fetched / syncProgress.total) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {currentView === 'library' && <VideoLibrary />}
        {currentView === 'queue' && <DownloadQueue />}
      </div>

      {/* Settings Dialog */}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
