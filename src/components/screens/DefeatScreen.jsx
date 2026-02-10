import StatBox from '../ui/StatBox';
import './DefeatScreen.css';

const DefeatScreen = ({ gameState, activePowerups, onNewRun, onMainMenu, playSound }) => {
  return (
    <div className="card-8bit pixel-border">
      <h1 className="title" style={{ color: '#e94560' }}>💀 DEFEATED</h1>
      <p className="subtitle">Your journey ends at Round {gameState.round}</p>
      
      <div className="status-grid">
        <StatBox 
          label="ROUNDS SURVIVED" 
          value={gameState.round - 1} 
          icon="📍" 
        />
        <StatBox label="GOLD EARNED" value={gameState.gold} icon="💰" special="gold" />
        <StatBox label="FINAL HP" value={gameState.baseHP} icon="❤️" />
        <StatBox label="FINAL DMG" value={gameState.baseDamage} icon="⚔️" />
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

      <div className="action-buttons" style={{ marginTop: '30px' }}>
        <button 
          className="button-8bit button-success" 
          onClick={() => { 
            playSound('click'); 
            onNewRun(); 
          }}
        >
          🎲 NEW RUN
        </button>
        <button 
          className="button-8bit" 
          onClick={() => { 
            playSound('click'); 
            onMainMenu(); 
          }}
        >
          📋 MAIN MENU
        </button>
      </div>
    </div>
  );
};

export default DefeatScreen;
