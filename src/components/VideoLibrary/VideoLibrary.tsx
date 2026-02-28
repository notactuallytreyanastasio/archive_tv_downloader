import { useEffect } from 'react';
import { useVideoStore } from '../../store/videoStore';
import VideoCard from './VideoCard';
import SearchBar from './SearchBar';
import './VideoLibrary.css';

export default function VideoLibrary() {
  const { filteredVideos, setVideos, isLoading, setLoading } = useVideoStore();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const videos = await window.electronAPI.getVideos();
      setVideos(videos);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (videoId: string) => {
    try {
      await window.electronAPI.downloadVideo(videoId);
    } catch (error) {
      console.error('Failed to queue download:', error);
    }
  };

  const handleDownloadAll = async () => {
    if (filteredVideos.length === 0) return;

    const confirmed = confirm(
      `Queue ${filteredVideos.length} video${filteredVideos.length !== 1 ? 's' : ''} for download?`
    );

    if (!confirmed) return;

    for (const video of filteredVideos) {
      try {
        await window.electronAPI.downloadVideo(video.id);
      } catch (error) {
        console.error(`Failed to queue ${video.title}:`, error);
      }
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      await window.electronAPI.deleteVideo(videoId);
      // Reload videos to update the UI
      await loadVideos();
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const handleRemoveAll = async () => {
    if (filteredVideos.length === 0) return;

    const confirmed = confirm(
      `Remove ${filteredVideos.length} video${filteredVideos.length !== 1 ? 's' : ''} from library?\n\nThis will NOT delete downloaded files, only remove them from the library.`
    );

    if (!confirmed) return;

    for (const video of filteredVideos) {
      try {
        await window.electronAPI.deleteVideo(video.id);
      } catch (error) {
        console.error(`Failed to remove ${video.title}:`, error);
      }
    }

    // Reload videos to update the UI
    await loadVideos();
  };

  if (isLoading) {
    return (
      <div className="video-library loading">
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="video-library">
      <div className="video-library-header">
        <SearchBar />
        <div className="video-header-actions">
          <div className="video-count">
            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
          </div>
          {filteredVideos.length > 0 && (
            <>
              <button onClick={handleDownloadAll} className="download-all-button">
                Download All ({filteredVideos.length})
              </button>
              <button onClick={handleRemoveAll} className="remove-all-button">
                Remove All ({filteredVideos.length})
              </button>
            </>
          )}
        </div>
      </div>

      <div className="video-grid">
        {filteredVideos.length === 0 ? (
          <div className="empty-state">
            <p>No videos found. Try syncing the collection.</p>
          </div>
        ) : (
          filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
