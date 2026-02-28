import { useState, useEffect } from 'react';
import { useVideoStore } from '../../store/videoStore';
import './SearchBar.css';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useVideoStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, setSearchQuery]);

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search videos..."
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
      />
      {localQuery && (
        <button className="clear-button" onClick={handleClear}>
          ×
        </button>
      )}
    </div>
  );
}
