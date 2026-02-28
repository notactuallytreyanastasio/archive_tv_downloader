import { formatBytes, formatSpeed, formatETA } from '../../utils/format';
import ProgressBar from './ProgressBar';
import './QueueItem.css';

interface DownloadProgress {
  videoId: string;
  bytesDownloaded: number;
  totalBytes: number | null;
  percent: number;
  speed: number;
  eta: number | null;
}

interface QueueItemProps {
  videoId: string;
  status: 'queued' | 'downloading' | 'completed' | 'failed';
  progress?: DownloadProgress;
  position?: number;
  error?: string;
  onCancel?: (videoId: string) => void;
}

export default function QueueItem({
  videoId,
  status,
  progress,
  position,
  error,
  onCancel,
}: QueueItemProps) {
  return (
    <div className={`queue-item queue-item-${status}`}>
      <div className="queue-item-header">
        <div className="queue-item-title">{videoId}</div>
        <div className="queue-item-status">
          {status === 'queued' && `Position: ${position}`}
          {status === 'downloading' && 'Downloading...'}
          {status === 'completed' && '✓ Completed'}
          {status === 'failed' && '✗ Failed'}
        </div>
      </div>

      {status === 'downloading' && progress && (
        <div className="queue-item-progress">
          <ProgressBar percent={progress.percent} />
          <div className="progress-stats">
            <span>
              {formatBytes(progress.bytesDownloaded)}
              {progress.totalBytes && ` / ${formatBytes(progress.totalBytes)}`}
            </span>
            <span>{progress.speed > 0 && formatSpeed(progress.speed)}</span>
            <span>{progress.eta !== null && `ETA: ${formatETA(progress.eta)}`}</span>
          </div>
        </div>
      )}

      {status === 'failed' && error && (
        <div className="queue-item-error">
          <span>Error: {error}</span>
        </div>
      )}

      {(status === 'queued' || status === 'downloading') && onCancel && (
        <div className="queue-item-actions">
          <button onClick={() => onCancel(videoId)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
