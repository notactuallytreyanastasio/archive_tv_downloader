import { formatDuration } from '../../utils/format';
import './VideoCard.css';

interface Video {
  id: string;
  title: string;
  description: string | null;
  publicDate: Date;
  duration: number | null;
  thumbnailUrl: string;
  downloadStatus?: string;
}

interface VideoCardProps {
  video: Video;
  onDownload: (videoId: string) => void;
  onDelete: (videoId: string) => void;
  onRename: (videoId: string, newName: string) => void;
}

export default function VideoCard({ video, onDownload, onDelete, onRename }: VideoCardProps) {
  const handleRename = () => {
    const currentName = video.localPath?.split('/').pop()?.replace(/\.[^.]+$/, '') || video.title;
    const newName = prompt('Enter new filename (without extension):', currentName);

    if (newName && newName.trim() !== '' && newName !== currentName) {
      onRename(video.id, newName.trim());
    }
  };
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const isDownloaded = video.downloadStatus === 'completed';
  const isDownloading = video.downloadStatus === 'downloading' || video.downloadStatus === 'queued';

  return (
    <div className="video-card">
      <div className="video-thumbnail">
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
      </div>
      <div className="video-info">
        <div className="video-title">{video.title}</div>
        <div className="video-meta">
          <span>{formatDate(video.publicDate)}</span>
          {video.duration && (
            <>
              <span className="separator">•</span>
              <span>{formatDuration(video.duration)}</span>
            </>
          )}
        </div>
        {video.description && (
          <div className="video-description">{video.description.substring(0, 120)}...</div>
        )}
      </div>
      <div className="video-actions">
        <div className="video-actions-row">
          {isDownloaded ? (
            <>
              <button disabled>Downloaded</button>
              <button onClick={handleRename} className="rename-button" title="Rename file">
                Rename
              </button>
            </>
          ) : isDownloading ? (
            <button disabled>Downloading...</button>
          ) : (
            <button onClick={() => onDownload(video.id)}>Download</button>
          )}
        </div>
        <div className="video-actions-row">
          <button
            onClick={() => {
              if (confirm(`Remove "${video.title}" from library?`)) {
                onDelete(video.id);
              }
            }}
            className="delete-button"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
