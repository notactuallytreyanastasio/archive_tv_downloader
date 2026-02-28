import { useEffect } from 'react';
import { useDownloadStore } from '../../store/downloadStore';
import QueueItem from './QueueItem';
import './QueueView.css';

export default function QueueView() {
  const {
    queue,
    activeDownloads,
    completedDownloads,
    failedDownloads,
    addToQueue,
    updateProgress,
    markCompleted,
    markFailed,
    clearCompleted,
  } = useDownloadStore();

  useEffect(() => {
    // Subscribe to download events
    const unsubscribeQueued = window.electronAPI.onDownloadQueued((_event, data) => {
      addToQueue(data.videoId, data.position);
    });

    const unsubscribeProgress = window.electronAPI.onDownloadProgress((_event, data) => {
      updateProgress(data);
    });

    const unsubscribeComplete = window.electronAPI.onDownloadComplete((_event, data) => {
      markCompleted(data.videoId);
    });

    const unsubscribeFailed = window.electronAPI.onDownloadFailed((_event, data) => {
      markFailed(data.videoId, data.error);
    });

    return () => {
      unsubscribeQueued();
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeFailed();
    };
  }, []);

  const handlePauseAll = async () => {
    await window.electronAPI.pauseDownloads();
  };

  const handleResumeAll = async () => {
    await window.electronAPI.resumeDownloads();
  };

  const handleCancelDownload = async (videoId: string) => {
    await window.electronAPI.cancelDownload(videoId);
  };

  const activeDownloadsList = Array.from(activeDownloads.entries());
  const hasActiveOrQueued = queue.length > 0 || activeDownloadsList.length > 0;

  return (
    <div className="queue-view">
      <div className="queue-header">
        <h2>Download Queue</h2>
        <div className="queue-controls">
          <button onClick={handlePauseAll} disabled={!hasActiveOrQueued}>
            Pause All
          </button>
          <button onClick={handleResumeAll} disabled={!hasActiveOrQueued}>
            Resume All
          </button>
          <button onClick={clearCompleted} disabled={completedDownloads.size === 0}>
            Clear Completed
          </button>
        </div>
      </div>

      <div className="queue-content">
        {/* Active Downloads */}
        {activeDownloadsList.length > 0 && (
          <div className="queue-section">
            <h3>Downloading</h3>
            <div className="queue-list">
              {activeDownloadsList.map(([videoId, progress]) => (
                <QueueItem
                  key={videoId}
                  videoId={videoId}
                  progress={progress}
                  status="downloading"
                  onCancel={handleCancelDownload}
                />
              ))}
            </div>
          </div>
        )}

        {/* Queued Downloads */}
        {queue.length > 0 && (
          <div className="queue-section">
            <h3>Queued ({queue.length})</h3>
            <div className="queue-list">
              {queue.map((item) => (
                <QueueItem
                  key={item.videoId}
                  videoId={item.videoId}
                  status="queued"
                  position={item.position}
                  onCancel={handleCancelDownload}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Downloads */}
        {completedDownloads.size > 0 && (
          <div className="queue-section">
            <h3>Completed ({completedDownloads.size})</h3>
            <div className="queue-list">
              {Array.from(completedDownloads).map((videoId) => (
                <QueueItem key={videoId} videoId={videoId} status="completed" />
              ))}
            </div>
          </div>
        )}

        {/* Failed Downloads */}
        {failedDownloads.size > 0 && (
          <div className="queue-section">
            <h3>Failed ({failedDownloads.size})</h3>
            <div className="queue-list">
              {Array.from(failedDownloads.entries()).map(([videoId, error]) => (
                <QueueItem key={videoId} videoId={videoId} status="failed" error={error} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasActiveOrQueued && completedDownloads.size === 0 && failedDownloads.size === 0 && (
          <div className="empty-queue">
            <p>No downloads yet. Go to the Library and click Download on any video.</p>
          </div>
        )}
      </div>
    </div>
  );
}
