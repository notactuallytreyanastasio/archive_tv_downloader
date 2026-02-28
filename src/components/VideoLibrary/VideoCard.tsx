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
}

export default function VideoCard({ video, onDownload }: VideoCardProps) {
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
        {isDownloaded ? (
          <button disabled>Downloaded</button>
        ) : isDownloading ? (
          <button disabled>Downloading...</button>
        ) : (
          <button onClick={() => onDownload(video.id)}>Download</button>
        )}
      </div>
    </div>
  );
}
