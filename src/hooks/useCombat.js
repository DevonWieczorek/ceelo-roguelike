import { useState } from 'react';
import { rollDice, analyzeCeeloRoll, applyLuckModifiers } from '../utils/diceLogic';
import { GAME_CONFIG, ROLL_TYPES } from '../constants/gameConfig';

export const useCombat = (gameState, playSound, addLog) => {
  const [combat, setCombat] = useState(null);
  const [dice, setDice] = useState([]);
  const [enemyDice, setEnemyDice] = useState([]);
  const [rollResult, setRollResult] = useState(null);
  const [enemyRollResult, setEnemyRollResult] = useState(null);
  const [canPlayerRoll, setCanPlayerRoll] = useState(false);
  const [playerHasRolled, setPlayerHasRolled] = useState(false);
  const [usedAceSaver, setUsedAceSaver] = useState(false);
  const [wildDieUsed, setWildDieUsed] = useState(0);
  const [pendingWildDie, setPendingWildDie] = useState(null); // { index, originalValue }
  const [enemyDiceRolling, setEnemyDiceRolling] = useState(false);
  const [enemyAnimatingDice, setEnemyAnimatingDice] = useState(null);

  // Rolls enemy dice, animates, then calls onResult(enemyRoll, enemyResult)
  const performEnemyRoll = (onResult) => {
    const enemyRoll = rollDice(3, false, false);
    const enemyResult = analyzeCeeloRoll(enemyRoll, 0, false, false);

    const rand = () => Math.ceil(Math.random() * 6);
    setEnemyDiceRolling(true);
    setEnemyAnimatingDice([rand(), rand(), rand()]);

    const intervalId = setInterval(() => {
      setEnemyAnimatingDice([rand(), rand(), rand()]);
    }, 80);

    setTimeout(() => {
      clearInterval(intervalId);
      setEnemyDiceRolling(false);
      setEnemyAnimatingDice(null);
      setEnemyDice(enemyRoll);
      setEnemyRollResult(enemyResult);
      addLog(`🎲 Enemy rolls: ${enemyRoll.join('-')} - ${enemyResult.display}`);
      onResult(enemyRoll, enemyResult);
    }, 700);
  };

  const executeEnemyTurn = (onComplete) => {
    addLog('💀 Enemy turn...');

    const rollEnemy = () => {
      setTimeout(() => {
        performEnemyRoll((enemyRoll, enemyResult) => {
          if (enemyResult.type === ROLL_TYPES.INSTANT_WIN) {
            playSound('defeat');
            addLog('💀 Enemy rolled 4-5-6! INSTANT DEFEAT!');
            if (onComplete) onComplete('defeat');
          } else if (enemyResult.type === ROLL_TYPES.INSTANT_LOSS) {
            playSound('roundVictory');
            addLog('🎉 Enemy rolled 1-2-3! INSTANT VICTORY!');
            if (onComplete) onComplete('victory');
          } else if (enemyResult.type === ROLL_TYPES.NONE) {
            addLog('🔄 Enemy no score - rolling again (free)');
            rollEnemy();
          } else {
            setTimeout(() => {
              let enemyDamage = 0;
              const enemyBaseDamage = Math.floor(gameState.baseDamage * GAME_CONFIG.ENEMY_DAMAGE_MULTIPLIER);

              if (enemyResult.type === ROLL_TYPES.TRIPS) {
                enemyDamage = enemyBaseDamage * enemyResult.value;
                playSound('enemyAttack');
                addLog(`⚔️ Enemy TRIPS attack! ${enemyDamage} damage!`);
              } else if (enemyResult.type === ROLL_TYPES.POINT) {
                enemyDamage = enemyBaseDamage * enemyResult.value;
                playSound('enemyAttack');
                addLog(`⚔️ Enemy point attack! ${enemyDamage} damage!`);
              }

              if (enemyDamage > 0) {
                setCombat(prev => {
                  const newPlayerHP = prev.playerHP - enemyDamage;
                  if (newPlayerHP <= 0) {
                    setTimeout(() => {
                      playSound('cursed');
                      addLog('💀 You have been defeated!');
                      if (onComplete) onComplete('defeat');
                    }, 1000);
                    return { ...prev, playerHP: 0 };
                  }
                  return { ...prev, playerHP: newPlayerHP };
                });
              }

              if (onComplete && enemyDamage >= 0) {
                setTimeout(() => onComplete('continue'), 800);
              }
            }, 1000);
          }
        });
      }, 500);
    };

    rollEnemy();
  };

  const executePlayerTurn = () => {
    addLog('🎲 Your turn! Click ROLL DICE');
    setCanPlayerRoll(true);
    setPlayerHasRolled(false);
  };

  const resetCombatState = () => {
    setDice([]);
    setEnemyDice([]);
    setRollResult(null);
    setEnemyRollResult(null);
    setCanPlayerRoll(false);
    setPlayerHasRolled(false);
    setUsedAceSaver(false);
    setWildDieUsed(0);
    setPendingWildDie(null);
    setEnemyDiceRolling(false);
    setEnemyAnimatingDice(null);
  };

  return {
    combat,
    setCombat,
    dice,
    setDice,
    enemyDice,
    rollResult,
    setRollResult,
    enemyRollResult,
    canPlayerRoll,
    setCanPlayerRoll,
    playerHasRolled,
    setPlayerHasRolled,
    usedAceSaver,
    setUsedAceSaver,
    wildDieUsed,
    setWildDieUsed,
    pendingWildDie,
    setPendingWildDie,
    enemyDiceRolling,
    enemyAnimatingDice,
    executeEnemyTurn,
    executePlayerTurn,
    performEnemyRoll,
    resetCombatState,
  };
};
