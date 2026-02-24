import StatBox from '../ui/StatBox';
import './VictoryScreen.css';

const VictoryScreen = ({ gameState, activePowerups, onNewRun, playSound }) => {
  return (
    <div className="card-8bit pixel-border">
      <h1 className="title title-victory">🎉 VICTORY!</h1>
      <p className="subtitle">You conquered all {gameState.maxRounds} rounds!</p>

      <div className="status-grid">
        <StatBox label="FINAL GOLD" value={gameState.gold} icon="💰" special="gold" />
        <StatBox label="FINAL HP" value={gameState.baseHP} icon="❤️" />
        <StatBox label="FINAL DMG" value={gameState.baseDamage} icon="⚔️" />
        <StatBox label="ROUNDS WON" value={gameState.maxRounds} icon="🏆" />
      </div>

      {activePowerups.length > 0 && (
        <div className="powerups-earned">
          <div className="stat-label">POWERUPS ACQUIRED</div>
          <div className="powerup-list">
            {activePowerups.map(p => (
              <span key={p.key} className="powerup-badge">
                {p.icon} {p.label}{p.value ? ` (${p.value})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button
          className="button-8bit button-success"
          onClick={() => {
            playSound('click');
            onNewRun();
          }}
        >
          🎲 NEW RUN
        </button>
      </div>
    </div>
  );
};

export default VictoryScreen;
