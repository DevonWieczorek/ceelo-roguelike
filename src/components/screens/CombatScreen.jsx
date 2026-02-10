import HPBar from '../ui/HPBar';
import StatBox from '../ui/StatBox';
import Dice from '../ui/Dice';
import { GAME_CONFIG } from '../../constants/gameConfig';
import './CombatScreen.css';

const CombatScreen = ({
  gameState,
  combat,
  dice,
  enemyDice,
  rollResult,
  enemyRollResult,
  canPlayerRoll,
  playerHasRolled,
  wildDieUsed,
  onRollDice,
  onAttack,
  onDefend,
  onReroll,
  onWildDie,
}) => {
  if (!combat) return null;

  return (
    <div className="card-8bit pixel-border">
      <h2 className="title">⚔️ ROUND {gameState.round}</h2>
      
      {/* Enemy HP Bar */}
      <HPBar
        current={combat.enemyHP}
        max={combat.enemyMaxHP}
        label="ENEMY HP"
        type="enemy"
      />

      {/* Player HP Bar */}
      <HPBar
        current={combat.playerHP}
        max={Math.max(combat.playerHP, combat.playerMaxHP)}
        label="YOUR HP"
        type="player"
      />

      {/* Enemy Dice Display */}
      {enemyRollResult && (
        <div style={{ marginTop: '20px' }}>
          <div className="stat-label">ENEMY ROLL</div>
          <div className="dice-container">
            {enemyDice.map((value, idx) => (
              <Dice
                key={idx}
                value={value}
                type={enemyRollResult.type}
                isPointDie={
                  enemyRollResult.type === 'point' && 
                  enemyDice.filter(d => d === value).length === 1
                }
                clickable={false}
              />
            ))}
          </div>

          <div className={`roll-result pixel-border ${enemyRollResult.type}`}>
            <div style={{ fontSize: '14px', marginBottom: '5px' }}>
              {enemyRollResult.display}
            </div>
            {(enemyRollResult.type === 'trips' || enemyRollResult.type === 'point') && (
              <div style={{ fontSize: '8px', color: '#e94560' }}>
                Enemy Damage: {Math.floor(gameState.baseDamage * GAME_CONFIG.ENEMY_DAMAGE_MULTIPLIER)} × {enemyRollResult.value} = {Math.floor(gameState.baseDamage * GAME_CONFIG.ENEMY_DAMAGE_MULTIPLIER) * enemyRollResult.value}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Player Dice Display */}
      <div style={{ marginTop: '20px' }}>
        <div className="stat-label">YOUR ROLL</div>
        {rollResult ? (
          <>
            <div className="dice-container">
              {dice.map((value, idx) => (
                <Dice
                  key={idx}
                  value={value}
                  type={rollResult.type}
                  isPointDie={
                    rollResult.type === 'point' && 
                    dice.filter(d => d === value).length === 1
                  }
                  onClick={() => onWildDie(idx, (value % 6) + 1)}
                  clickable={playerHasRolled && wildDieUsed < gameState.powerups.wildDie}
                />
              ))}
            </div>

            <div className={`roll-result pixel-border ${rollResult.type}`} style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '14px', marginBottom: '5px' }}>
                {rollResult.display}
              </div>
              {rollResult.type === 'trips' && (
                <div style={{ fontSize: '8px' }}>
                  Damage: {gameState.baseDamage} × {rollResult.value}{gameState.powerups.doubleDown > 0 ? ' × 2' : ''} = {gameState.baseDamage * rollResult.value * (gameState.powerups.doubleDown > 0 ? 2 : 1)}
                </div>
              )}
              {rollResult.type === 'point' && (
                <>
                  <div style={{ fontSize: '8px' }}>
                    Damage: {gameState.baseDamage} × {rollResult.value} = {gameState.baseDamage * rollResult.value}
                  </div>
                  <div style={{ fontSize: '8px', marginTop: '5px', color: '#2ecc71' }}>
                    Heal: {rollResult.value} × 3 = {rollResult.value * 3}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="roll-result pixel-border">
            <div style={{ fontSize: '14px', marginBottom: '5px' }}>
              {canPlayerRoll ? '🎲 Ready to roll!' : '⏳ Waiting for enemy...'}
            </div>
          </div>
        )}
      </div>

      {/* Combat Stats */}
      <div className="status-grid">
        <StatBox label="REROLLS" value={combat.rerollsLeft} icon="🔄" />
        <StatBox 
          label="WILD DIE" 
          value={gameState.powerups.wildDie - wildDieUsed} 
          icon="🎯" 
        />
        <StatBox 
          label="ROUND" 
          value={`${gameState.round}/${gameState.maxRounds}`} 
          icon="📍" 
        />
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        {!playerHasRolled && (
          <button 
            className="button-8bit button-success" 
            onClick={onRollDice}
            disabled={!canPlayerRoll}
            style={{ fontSize: '12px', width: '100%', marginBottom: '10px' }}
          >
            🎲 ROLL DICE
          </button>
        )}
        
        {playerHasRolled && (
          <>
            <button 
              className="button-8bit button-danger" 
              onClick={onAttack}
              disabled={!rollResult || rollResult.type === 'none' || rollResult.type === 'instant_win' || rollResult.type === 'cursed'}
            >
              ⚔️ ATTACK
            </button>
            <button 
              className="button-8bit button-success" 
              onClick={onDefend}
              disabled={!rollResult || rollResult.type === 'none' || rollResult.type === 'cursed' || rollResult.type === 'instant_win'}
            >
              🛡️ DEFEND
            </button>
            <button 
              className="button-8bit button-warning" 
              onClick={onReroll}
              disabled={!rollResult || combat.rerollsLeft === 0 || rollResult.type === 'instant_win' || rollResult.type === 'cursed'}
            >
              🔄 REROLL ({combat.rerollsLeft})
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CombatScreen;
