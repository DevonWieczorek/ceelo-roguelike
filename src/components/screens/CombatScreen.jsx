import HPBar from '../ui/HPBar';
import StatBox from '../ui/StatBox';
import Dice from '../ui/Dice';
import FloatingNumber from '../ui/FloatingNumber';
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
  pendingWildDie,
  isDiceRolling,
  animatingDice,
  isEnemyDiceRolling,
  enemyAnimatingDice,
  floatingNumbers,
  onRemoveFloat,
  highRollerActive,
  onUseHighRoller,
  doubleDownActive,
  onUseDoubleDown,
  onRollDice,
  onAttack,
  onDefend,
  onReroll,
  onWildDie,
}) => {
  const displayDice = isDiceRolling ? animatingDice : dice;
  const displayEnemyDice = isEnemyDiceRolling ? (enemyAnimatingDice || [1, 1, 1]) : enemyDice;
  if (!combat) return null;

  return (
    <div className="combat-layout">
      <main className="combat-main card-8bit pixel-border">
        <h2 className="title">⚔️ ROUND {gameState.round}/{gameState.maxRounds}</h2>

        {/* Mobile-only HP bars */}
        <div className="combat-mobile-status">
          <div className="combat-mobile-hp">
            <div className="hp-float-container">
              <HPBar
                current={combat.playerHP}
                max={Math.max(combat.playerHP, combat.playerMaxHP)}
                label="YOUR HP"
                type="player"
              />
              {floatingNumbers.player.map(n => (
                <FloatingNumber key={n.id} value={n.value} onDone={() => onRemoveFloat(n.id, 'player')} />
              ))}
            </div>
            <div className="hp-float-container">
              <HPBar
                current={combat.enemyHP}
                max={combat.enemyMaxHP}
                label="ENEMY HP"
                type="enemy"
              />
              {floatingNumbers.enemy.map(n => (
                <FloatingNumber key={n.id} value={n.value} onDone={() => onRemoveFloat(n.id, 'enemy')} />
              ))}
            </div>
          </div>
        </div>

        {/* Enemy Dice Display — always full on desktop, full on mobile until player rolls */}
        {(enemyRollResult || isEnemyDiceRolling) && (
          <div className={`enemy-roll-full enemy-roll-margin${playerHasRolled && !isEnemyDiceRolling ? ' hide-on-mobile' : ''}`}>
            <div className="stat-label">ENEMY ROLL</div>
            <div className="dice-container">
              {displayEnemyDice.map((value, idx) => (
                <Dice
                  key={idx}
                  value={value}
                  type={enemyRollResult ? enemyRollResult.type : undefined}
                  isRolling={isEnemyDiceRolling}
                  isPointDie={
                    !isEnemyDiceRolling &&
                    enemyRollResult?.type === 'point' &&
                    enemyDice.filter(d => d === value).length === 1
                  }
                  isPairDie={
                    !isEnemyDiceRolling &&
                    enemyRollResult?.type === 'point' &&
                    enemyDice.filter(d => d === value).length !== 1
                  }
                  clickable={false}
                />
              ))}
            </div>

            {enemyRollResult && !isEnemyDiceRolling && (
              <div className={`roll-result pixel-border ${enemyRollResult.type}`}>
                <div className="roll-result-display">
                  {enemyRollResult.display}
                </div>
                {(enemyRollResult.type === 'trips' || enemyRollResult.type === 'point') && (
                  <div className="roll-result-damage">
                    Enemy Damage: {Math.floor(gameState.baseDamage * GAME_CONFIG.ENEMY_DAMAGE_MULTIPLIER)} × {enemyRollResult.value} = {Math.floor(gameState.baseDamage * GAME_CONFIG.ENEMY_DAMAGE_MULTIPLIER) * enemyRollResult.value}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enemy Roll — compact (mobile only, after player rolls) */}
        {enemyRollResult && playerHasRolled && !isEnemyDiceRolling && (
          <div className={`enemy-roll-compact roll-result pixel-border ${enemyRollResult.type}`}>
            <span>ENEMY: {enemyRollResult.display}</span>
            {(enemyRollResult.type === 'trips' || enemyRollResult.type === 'point') && (
              <span className="text-danger">
                {' '}({Math.floor(gameState.baseDamage * GAME_CONFIG.ENEMY_DAMAGE_MULTIPLIER) * enemyRollResult.value} dmg)
              </span>
            )}
          </div>
        )}

        {/* Player Dice Display */}
        <div className="player-roll-section">
          <div className="stat-label">YOUR ROLL</div>

          {/* Dice — shown when rolling or result available */}
          {(isDiceRolling || rollResult) && (
            <div className="dice-container">
              {(displayDice || []).map((value, idx) => (
                <Dice
                  key={idx}
                  value={value}
                  type={rollResult ? rollResult.type : undefined}
                  isRolling={isDiceRolling}
                  isPointDie={
                    !isDiceRolling &&
                    rollResult?.type === 'point' &&
                    dice.filter(d => d === value).length === 1
                  }
                  isPairDie={
                    !isDiceRolling &&
                    rollResult?.type === 'point' &&
                    dice.filter(d => d === value).length !== 1
                  }
                  onClick={() => onWildDie(idx, (value % 6) + 1)}
                  clickable={!isDiceRolling && dice.length > 0 && (
                    (pendingWildDie && pendingWildDie.index === idx) ||
                    (wildDieUsed + (pendingWildDie ? 1 : 0)) < gameState.powerups.wildDie
                  )}
                />
              ))}
            </div>
          )}

          {/* Result banner */}
          {rollResult && !isDiceRolling ? (
            <div className={`roll-result pixel-border ${rollResult.type}`} style={{ marginTop: '10px' }}>
              <div className="roll-result-display">
                {rollResult.display}
              </div>
              {rollResult.type === 'trips' && (
                <div className="roll-result-detail">
                  Damage: {gameState.baseDamage} × {rollResult.value}{doubleDownActive ? ' × 2' : ''} = {gameState.baseDamage * rollResult.value * (doubleDownActive ? 2 : 1)}
                </div>
              )}
              {rollResult.type === 'point' && (
                <>
                  <div className="roll-result-detail">
                    Damage: {gameState.baseDamage} × {rollResult.value} = {gameState.baseDamage * rollResult.value}
                  </div>
                  <div className="roll-result-heal">
                    Heal: {rollResult.value} × 3 = {rollResult.value * 3}
                  </div>
                </>
              )}
            </div>
          ) : !isDiceRolling ? (
            <div className="roll-result pixel-border">
              <div className="roll-result-display">
                {canPlayerRoll ? '🎲 Ready to roll!' : '⏳ Waiting for enemy...'}
              </div>
            </div>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {!playerHasRolled && (
            <>
              <button
                className="button-8bit button-success button-roll"
                onClick={onRollDice}
                disabled={!canPlayerRoll}
              >
                🎲 ROLL DICE
              </button>
              {(gameState.powerups.highRoller > 0 || highRollerActive) && (
                <button
                  className="button-8bit button-warning"
                  onClick={onUseHighRoller}
                  disabled={highRollerActive || !canPlayerRoll}
                >
                  {highRollerActive ? '🎰 HIGH ROLLER READY' : `🎰 HIGH ROLLER (${gameState.powerups.highRoller})`}
                </button>
              )}
            </>
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
              {rollResult?.type === 'trips' && gameState.powerups.doubleDown > 0 && !doubleDownActive && (
                <button
                  className="button-8bit button-warning"
                  onClick={onUseDoubleDown}
                >
                  💎 DOUBLE DOWN ({gameState.powerups.doubleDown})
                </button>
              )}
              {doubleDownActive && (
                <div className="consumable-active-badge">💎 2× DAMAGE ACTIVE</div>
              )}
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

        {/* Mobile-only inventory */}
        <div className="combat-mobile-stats">
          <StatBox label="REROLLS" value={combat.rerollsLeft} icon="🔄" />
          <StatBox
            label="WILD DIE"
            value={gameState.powerups.wildDie - wildDieUsed - (pendingWildDie ? 1 : 0)}
            icon="🎯"
          />
        </div>
      </main>

      <aside className="combat-sidebar card-8bit pixel-border">
        <div className="hp-float-container">
          <HPBar
            current={combat.playerHP}
            max={Math.max(combat.playerHP, combat.playerMaxHP)}
            label="YOUR HP"
            type="player"
          />
          {floatingNumbers.player.map(n => (
            <FloatingNumber key={n.id} value={n.value} onDone={() => onRemoveFloat(n.id, 'player')} />
          ))}
        </div>
        <div className="hp-float-container">
          <HPBar
            current={combat.enemyHP}
            max={combat.enemyMaxHP}
            label="ENEMY HP"
            type="enemy"
          />
          {floatingNumbers.enemy.map(n => (
            <FloatingNumber key={n.id} value={n.value} onDone={() => onRemoveFloat(n.id, 'enemy')} />
          ))}
        </div>
        <div className="status-grid">
          <StatBox label="REROLLS" value={combat.rerollsLeft} icon="🔄" />
          <StatBox
            label="WILD DIE"
            value={gameState.powerups.wildDie - wildDieUsed - (pendingWildDie ? 1 : 0)}
            icon="🎯"
          />
        </div>
      </aside>
    </div>
  );
};

export default CombatScreen;
