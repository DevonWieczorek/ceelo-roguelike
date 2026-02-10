const StatBox = ({ label, value, icon, special }) => {
  return (
    <div className="stat-box pixel-border">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${special || ''}`}>
        {icon && `${icon} `}{value}
      </div>
    </div>
  );
};

export default StatBox;
