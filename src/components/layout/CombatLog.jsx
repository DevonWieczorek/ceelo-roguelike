import './CombatLog.css';

const CombatLog = ({ log, logRef }) => {
  const getLogClass = (entry) => {
    if (entry.includes('⚔️') || entry.includes('⚡')) return 'log-attack';
    if (entry.includes('🛡️')) return 'log-defend';
    if (entry.includes('💰') || entry.includes('gold') || entry.includes('Bought')) return 'log-gold';
    if (entry.includes('🎉') || entry.includes('Victory')) return 'log-victory';
    if (entry.includes('TRIPS')) return 'log-trips';
    if (entry.includes('1-2-3') || entry.includes('BACKFIRE')) return 'log-cursed';
    return '';
  };

  return (
    <div className="combat-log pixel-border" ref={logRef}>
      <div className="stat-label">GAME LOG</div>
      {log.slice(-10).map((entry, idx) => (
        <div
          key={idx}
          className={`log-entry ${getLogClass(entry)}`}
        >
          {entry}
        </div>
      ))}
    </div>
  );
};

export default CombatLog;
