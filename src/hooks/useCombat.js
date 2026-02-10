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

  const performEnemyRoll = (onComplete) => {
    const enemyRoll = rollDice(3, false, false);
    const enemyResult = analyzeCeeloRoll(enemyRoll, 0, false, false);
    
    setEnemyDice(enemyRoll);
    setEnemyRollResult(enemyResult);
    
    addLog(`🎲 Enemy rolls: ${enemyRoll.join('-')} - ${enemyResult.display}`);
    
    if (enemyResult.type === ROLL_TYPES.INSTANT_WIN) {
      playSound('cursed');
      addLog('💀 Enemy rolled 4-5-6! INSTANT DEFEAT!');
      return 'defeat';
    } else if (enemyResult.type === ROLL_TYPES.INSTANT_LOSS) {
      playSound('victory');
      addLog('🎉 Enemy rolled 1-2-3! INSTANT VICTORY!');
      return 'victory';
    } else if (enemyResult.type === ROLL_TYPES.NONE) {
      addLog('🔄 Enemy no score - rolling again (free)');
      return 'reroll';
    }
    
    onComplete(enemyResult);
    return 'continue';
  };

  const executeEnemyTurn = (onComplete) => {
    addLog('💀 Enemy turn...');
    
    const rollEnemy = () => {
      setTimeout(() => {
        const result = performEnemyRoll((enemyResult) => {
          setTimeout(() => {
            let enemyDamage = 0;
            const enemyBaseDamage = Math.floor(gameState.baseDamage * GAME_CONFIG.ENEMY_DAMAGE_MULTIPLIER);
            
            if (enemyResult.type === ROLL_TYPES.TRIPS) {
              enemyDamage = enemyBaseDamage * enemyResult.value;
              playSound('cursed');
              addLog(`⚔️ Enemy TRIPS attack! ${enemyDamage} damage!`);
            } else if (enemyResult.type === ROLL_TYPES.POINT) {
              enemyDamage = enemyBaseDamage * enemyResult.value;
              playSound('attack');
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
        });

        if (result === 'reroll') {
          rollEnemy();
        } else if (result === 'defeat' || result === 'victory') {
          if (onComplete) onComplete(result);
        }
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
    executeEnemyTurn,
    executePlayerTurn,
    performEnemyRoll,
    resetCombatState,
  };
};
