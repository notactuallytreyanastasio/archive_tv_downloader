import { useState, useEffect } from 'react';
import VideoLibrary from './components/VideoLibrary/VideoLibrary';
import DownloadQueue from './components/DownloadQueue/QueueView';
import SettingsDialog from './components/Settings/SettingsDialog';

function App() {
  const [currentView, setCurrentView] = useState<'library' | 'queue'>('library');
  const [showSettings, setShowSettings] = useState(false);
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [collectionUrl, setCollectionUrl] = useState('');
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
      setShowCollectionInput(true);
    }
  };

  const handleSyncCollection = async () => {
    if (!collectionUrl.trim()) return;

    // Extract collection name from URL
    // Supports: https://archive.org/details/collectionname or just "collectionname"
    const match = collectionUrl.match(/archive\.org\/details\/([^\/\?]+)|^([a-zA-Z0-9_-]+)$/);
    const collectionName = match ? (match[1] || match[2]) : collectionUrl;

    setIsSyncing(true);
    setShowCollectionInput(false);
    try {
      await window.electronAPI.syncCollection(collectionName);
    } catch (error) {
      console.error('Sync failed:', error);
      alert(`Failed to sync collection: ${error}`);
      setShowCollectionInput(true);
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
        <div className="menu-bar-item" onClick={() => setShowCollectionInput(true)}>
          New Collection
        </div>
      </div>

      {/* Main Content */}
      <div className="app-content">
        {/* Collection Input Dialog */}
        {showCollectionInput && (
          <div className="dialog-overlay">
            <div className="dialog">
              <div className="dialog-title">Enter Archive.org Collection</div>
              <div className="dialog-content">
                <p>Enter a collection or video URL:</p>
                <input
                  type="text"
                  value={collectionUrl}
                  onChange={(e) => setCollectionUrl(e.target.value)}
                  placeholder="https://archive.org/details/..."
                  style={{ width: '100%', marginTop: '8px' }}
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSyncCollection()}
                />
                <p style={{ fontSize: '10px', marginTop: '8px', color: '#888' }}>
                  Works with both collections and individual videos
                </p>
              </div>
              <div className="dialog-buttons">
                {!isSyncing && (
                  <button onClick={() => setShowCollectionInput(false)}>Cancel</button>
                )}
                <button onClick={handleSyncCollection} disabled={!collectionUrl.trim()}>
                  Sync Collection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sync Progress */}
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
