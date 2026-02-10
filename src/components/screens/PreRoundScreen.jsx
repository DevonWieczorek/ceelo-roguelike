import StatBox from '../ui/StatBox';
import { getEnemyHP } from '../../constants/gameConfig';
import './PreRoundScreen.css';

const PreRoundScreen = ({ 
  gameState, 
  activePowerups, 
  onBeginCombat, 
  onVisitShop,
  onUseFirstStrike,
  playSound 
}) => {
  return (
    <div className="card-8bit pixel-border">
      <h2 className="title">⚔️ ROUND {gameState.round} PREPARATION</h2>
      <p className="subtitle">Prepare for battle - Use items or start the round</p>
      
      <div className="status-grid">
        <StatBox label="YOUR HP" value={gameState.baseHP} icon="❤️" />
        <StatBox label="YOUR DMG" value={gameState.baseDamage} icon="⚔️" />
        <StatBox label="GOLD" value={gameState.gold} icon="💰" special="gold" />
        <StatBox 
          label="ENEMY HP" 
          value={getEnemyHP(gameState.round, gameState.baseHP)} 
          icon="💀" 
        />
      </div>

      {activePowerups.length > 0 && (
        <div style={{ marginTop: '20px' }}>
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

      {/* Consumable Items Section */}
      <div style={{ marginTop: '20px' }}>
        <div className="stat-label">CONSUMABLE ITEMS</div>
        <div className="roll-result pixel-border" style={{ marginTop: '10px' }}>
          {gameState.powerups.firstStrike > 0 ? (
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '11px', marginBottom: '5px' }}>
                ⚡ FIRST STRIKE × {gameState.powerups.firstStrike}
              </div>
              <div className="stat-label" style={{ marginBottom: '10px' }}>
                Go first in the upcoming round (consumed on use)
              </div>
              <button 
                className="button-8bit button-warning"
                style={{ fontSize: '10px' }}
                onClick={onUseFirstStrike}
              >
                USE FIRST STRIKE
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '10px', padding: '10px', color: '#888' }}>
              No consumable items available. Visit the shop!
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons" style={{ marginTop: '30px' }}>
        <button 
          className="button-8bit button-success" 
          onClick={() => { 
            playSound('click'); 
            onBeginCombat(); 
          }}
          style={{ fontSize: '12px' }}
        >
          ⚔️ BEGIN COMBAT
        </button>
        <button 
          className="button-8bit" 
          onClick={() => { 
            playSound('click'); 
            onVisitShop(); 
          }}
        >
          💰 VISIT SHOP
        </button>
      </div>
    </div>
  );
};

export default PreRoundScreen;
