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
  const hasConsumables = gameState.powerups.firstStrike > 0;
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

      {/* Consumable Items Section */}
      <div className="consumables-section">
        <div className="stat-label">CONSUMABLE ITEMS</div>
        <div className="roll-result pixel-border consumable-content">
          {hasConsumables ? (
            <>
              {(gameState.powerups.firstStrike > 0) && (
                <div className="consumable-detail">
                  <div className="consumable-title">
                    ⚡ FIRST STRIKE × {gameState.powerups.firstStrike}
                  </div>
                  <div className="stat-label consumable-desc">
                    Go first in the upcoming round (consumed on use)
                  </div>
                  <button
                    className="button-8bit button-warning button-consumable"
                    onClick={onUseFirstStrike}
                  >
                    USE FIRST STRIKE
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="consumable-empty">
              No consumable items available. Visit the shop!
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons preround-action-buttons">
        <button
          className="button-8bit button-success button-begin"
          onClick={() => {
            playSound('click');
            onBeginCombat();
          }}
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
