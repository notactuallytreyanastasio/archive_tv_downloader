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
        <div className="video-count">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="video-grid">
        {filteredVideos.length === 0 ? (
          <div className="empty-state">
            <p>No videos found. Try syncing the collection.</p>
          </div>
        ) : (
          filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} onDownload={handleDownload} />
          ))
        )}
      </div>
    </div>
  );
}
