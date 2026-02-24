import StatBox from '../ui/StatBox';
import './MenuScreen.css';

const MenuScreen = ({ gameState, activePowerups, onStartRound, onVisitShop }) => {
  return (
    <div className="card-8bit pixel-border menu-card">
      <h1 className="title">🎲 CEE-LO ROGUELIKE</h1>
      <p className="subtitle">Tactical Dice Combat</p>

      <div className="status-grid">
        <StatBox label="GOLD" value={gameState.gold} icon="💰" special="gold" />
        <StatBox label="HP" value={gameState.baseHP} icon="❤️" />
        <StatBox label="BASE DMG" value={gameState.baseDamage} icon="⚔️" />
        <StatBox label="ROUND" value={`${gameState.round}/${gameState.maxRounds}`} icon="📍" />
      </div>

      {activePowerups.length > 0 && (
        <div className="powerups-section">
          <div className="stat-label">ACTIVE POWERUPS</div>
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
        <button className="button-8bit button-success" onClick={onStartRound}>
          START ROUND {gameState.round}
        </button>
        <button className="button-8bit" onClick={onVisitShop}>
          VISIT SHOP
        </button>
      </div>
    </div>
  );
};

export default MenuScreen;
