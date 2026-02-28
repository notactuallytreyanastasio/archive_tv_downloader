import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import './SettingsDialog.css';

interface SettingsDialogProps {
  onClose: () => void;
}

export default function SettingsDialog({ onClose }: SettingsDialogProps) {
  const { downloadPath, maxConcurrent, autoStart, updateSettings, loadSettings, saveSettings } =
    useSettingsStore();

  const [localPath, setLocalPath] = useState(downloadPath);
  const [localMaxConcurrent, setLocalMaxConcurrent] = useState(maxConcurrent);
  const [localAutoStart, setLocalAutoStart] = useState(autoStart);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setLocalPath(downloadPath);
    setLocalMaxConcurrent(maxConcurrent);
    setLocalAutoStart(autoStart);
  }, [downloadPath, maxConcurrent, autoStart]);

  const handleSelectPath = async () => {
    const path = await window.electronAPI.selectDownloadPath();
    if (path) {
      setLocalPath(path);
    }
  };

  const handleSave = async () => {
    updateSettings({
      downloadPath: localPath,
      maxConcurrent: localMaxConcurrent,
      autoStart: localAutoStart,
    });

    await saveSettings();
    onClose();
  };

  const handleCancel = () => {
    // Reset to original values
    setLocalPath(downloadPath);
    setLocalMaxConcurrent(maxConcurrent);
    setLocalAutoStart(autoStart);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-title">Settings</div>

        <div className="dialog-content">
          <div className="setting-group">
            <label htmlFor="download-path">Download Directory:</label>
            <div className="path-selector">
              <input
                id="download-path"
                type="text"
                value={localPath}
                readOnly
                className="path-input"
              />
              <button onClick={handleSelectPath}>Browse...</button>
            </div>
          </div>

          <div className="setting-group">
            <label htmlFor="max-concurrent">Maximum Concurrent Downloads:</label>
            <div className="slider-container">
              <input
                id="max-concurrent"
                type="range"
                min="1"
                max="5"
                value={localMaxConcurrent}
                onChange={(e) => setLocalMaxConcurrent(Number(e.target.value))}
                className="slider"
              />
              <span className="slider-value">{localMaxConcurrent}</span>
            </div>
          </div>

          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={localAutoStart}
                onChange={(e) => setLocalAutoStart(e.target.checked)}
              />
              Auto-start downloads when queued
            </label>
          </div>
        </div>

        <div className="dialog-buttons">
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
