import './ProgressBar.css';

interface ProgressBarProps {
  percent: number;
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <div className="download-progress-bar">
      <div className="download-progress-fill" style={{ width: `${Math.min(100, percent)}%` }} />
      <div className="download-progress-text">{Math.round(percent)}%</div>
    </div>
  );
}
