import './HPBar.css';

const HPBar = ({ current, max, label, type = 'player' }) => {
  const percentage = Math.min((current / Math.max(current, max)) * 100, 100);

  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="hp-bar pixel-border">
        <div
          className={`hp-fill ${type}`}
          style={{ width: `${percentage}%` }}
        />
        <div className="hp-text">{current} / {max}</div>
      </div>
    </div>
  );
};

export default HPBar;
