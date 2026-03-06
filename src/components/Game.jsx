import { useState, useRef, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useAudio } from '../hooks/useAudio';
import { useCombat } from '../hooks/useCombat';
import { useLog } from '../hooks/useLog';
import { useRunStats } from '../hooks/useRunStats';
import { processPowerupPurchase, getActivePowerups } from '../utils/economy';
import { getEnemyHP, getVictoryRewards } from '../constants/gameConfig';
import { rollDice, analyzeCeeloRoll, applyLuckModifiers } from '../utils/diceLogic';

// Layout components
import SoundToggle from './layout/SoundToggle';
import HelpButton from './layout/HelpButton';
import CombatLog from './layout/CombatLog';

// UI components
import RulesModal from './ui/RulesModal';

// Screen components
import MenuScreen from './screens/MenuScreen';
import PreRoundScreen from './screens/PreRoundScreen';
import CombatScreen from './screens/CombatScreen';
import ShopScreen from './screens/ShopScreen';
import VictoryScreen from './screens/VictoryScreen';
import DefeatScreen from './screens/DefeatScreen';

const Game = () => {
  const { gameState, setGameState, updateGameState, restart } = useGameState();
  const { soundEnabled, toggleSound, playSound } = useAudio();
  const { log, addLog, clearLog, logRef } = useLog();
  const combat = useCombat(gameState, playSound, addLog);
  const { runStats, recordRun } = useRunStats();
  
  const [screen, setScreen] = useState('menu');
  const [showRules, setShowRules] = useState(false);
  const [playerGoesFirst, setPlayerGoesFirst] = useState(false);
  const [highRollerActive, setHighRollerActive] = useState(false);
  const [doubleDownActive, setDoubleDownActive] = useState(false);

  // Dice rolling animation state
  const [diceRolling, setDiceRolling] = useState(false);
  const [animatingDice, setAnimatingDice] = useState(null);

  // Floating damage/heal numbers
  const [floatingNumbers, setFloatingNumbers] = useState({ player: [], enemy: [] });
  const prevPlayerHP = useRef(null);
  const prevEnemyHP = useRef(null);

  // Reset floating numbers and HP refs when leaving combat
  useEffect(() => {
    if (screen !== 'combat') {
      setFloatingNumbers({ player: [], enemy: [] });
      prevPlayerHP.current = null;
      prevEnemyHP.current = null;
    }
  }, [screen]);

  // Spawn floating numbers when HP changes
  useEffect(() => {
    if (!combat.combat || screen !== 'combat') return;
    const current = combat.combat.playerHP;
    if (prevPlayerHP.current !== null) {
      const diff = current - prevPlayerHP.current;
      if (diff !== 0) {
        const id = Date.now() + Math.random();
        setFloatingNumbers(prev => ({ ...prev, player: [...prev.player, { id, value: diff }] }));
      }
    }
    prevPlayerHP.current = current;
  }, [combat.combat?.playerHP]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!combat.combat || screen !== 'combat') return;
    const current = combat.combat.enemyHP;
    if (prevEnemyHP.current !== null) {
      const diff = current - prevEnemyHP.current;
      if (diff < 0) {
        const id = Date.now() + Math.random();
        setFloatingNumbers(prev => ({ ...prev, enemy: [...prev.enemy, { id, value: diff }] }));
      }
    }
    prevEnemyHP.current = current;
  }, [combat.combat?.enemyHP]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeFloatingNumber = (id, target) => {
    setFloatingNumbers(prev => ({
      ...prev,
      [target]: prev[target].filter(n => n.id !== id),
    }));
  };

  const activePowerups = getActivePowerups(gameState.powerups);

  // Game flow handlers
  const handleStartRound = () => {
    setHighRollerActive(false);
    setDoubleDownActive(false);
    setScreen('preRound');
  };

  const handleBeginCombat = () => {
    const enemyHP = getEnemyHP(gameState.round, gameState.baseHP);
    const totalRerolls = gameState.rerolls + gameState.powerups.extraReroll;
    
    combat.setCombat({
      enemyHP,
      enemyMaxHP: enemyHP,
      playerHP: gameState.baseHP,
      playerMaxHP: gameState.baseHP,
      rerollsLeft: totalRerolls,
      autoRerolls: 3,
    });
    
    combat.resetCombatState();
    setScreen('combat');
    addLog(`🎲 Round ${gameState.round} begins! Enemy: ${enemyHP}HP`);
    
    // Determine turn order
    const playerFirst = playerGoesFirst;
    
    if (playerFirst) {
      addLog(`⚡ You go first this round!`);
      setTimeout(() => {
        combat.executePlayerTurn();
      }, 1000);
    } else {
      addLog(`💀 Enemy goes first this round!`);
      setTimeout(() => {
        combat.executeEnemyTurn((result) => {
          if (result === 'defeat') {
            handleDefeat();
          } else if (result === 'victory') {
            handleVictory();
          } else {
            combat.executePlayerTurn();
          }
        });
      }, 1000);
    }
    
    // Toggle turn order for next round
    setPlayerGoesFirst(!playerFirst);
  };

  const startDiceAnimation = (finalDice, onReveal) => {
    const rand = () => Math.ceil(Math.random() * 6);
    setDiceRolling(true);
    setAnimatingDice([rand(), rand(), rand()]);

    const intervalId = setInterval(() => {
      setAnimatingDice([rand(), rand(), rand()]);
    }, 80);

    setTimeout(() => {
      clearInterval(intervalId);
      setDiceRolling(false);
      setAnimatingDice(null);
      onReveal(finalDice);
    }, 700);
  };

  const handlePlayerRollDice = () => {
    if (!combat.canPlayerRoll) return;

    playSound('reroll');
    combat.setCanPlayerRoll(false);

    let playerDiceRoll = rollDice(3, highRollerActive);

    playerDiceRoll = applyLuckModifiers(
      playerDiceRoll,
      gameState.powerups.luckyClover,
      gameState.powerups.devilsWard,
      addLog
    );

    const playerResult = analyzeCeeloRoll(playerDiceRoll, gameState.powerups.pointBoost);

    startDiceAnimation(playerDiceRoll, () => {
      setHighRollerActive(false);
      combat.setDice(playerDiceRoll);
      combat.setRollResult(playerResult);
      addLog(`🎲 You roll: ${playerDiceRoll.join('-')} - ${playerResult.display}`);

      if (playerResult.type === 'instant_win') {
        combat.setPlayerHasRolled(true);
        setTimeout(() => {
          playSound('victory');
          addLog('🎉 4-5-6! INSTANT VICTORY!');
          handleVictory();
        }, 1000);
      } else if (playerResult.type === 'cursed') {
        combat.setPlayerHasRolled(true);
        setTimeout(() => {
          playSound('cursed');
          addLog('💀 1-2-3! INSTANT DEFEAT!');
          handleDefeat();
        }, 1000);
      } else if (playerResult.type === 'none') {
        addLog('🔄 No score - rolling again (free)');
        setTimeout(() => {
          combat.setCanPlayerRoll(true);
        }, 800);
      } else {
        combat.setPlayerHasRolled(true);
      }
    });
  };

  const handleAttack = () => {
    commitWildDie();
    const { rollResult } = combat;
    if (!rollResult) return;
    
    let damage = 0;
    
    if (rollResult.type === 'trips') {
      let multiplier = rollResult.value;
      if (doubleDownActive) multiplier *= 2;
      damage = gameState.baseDamage * multiplier;
      addLog(`⚡ TRIPS ${rollResult.value}! ${damage} damage!`);
      playSound('trips');
    } else if (rollResult.type === 'point') {
      damage = gameState.baseDamage * rollResult.value;
      addLog(`⚔️ Point ${rollResult.value}! ${damage} damage!`);
      playSound('attack');
    }

    setDoubleDownActive(false);
    combat.setCombat(prev => ({ ...prev, enemyHP: Math.max(0, prev.enemyHP - damage) }));
    
    if (combat.combat.enemyHP - damage <= 0) {
      setTimeout(() => handleVictory(), 500);
    } else {
      // Enemy's turn
      setTimeout(() => {
        combat.setPlayerHasRolled(false);
        combat.setDice([]);
        combat.setRollResult(null);
        combat.setCanPlayerRoll(false);
        
        combat.executeEnemyTurn((result) => {
          if (result === 'defeat') {
            handleDefeat();
          } else if (result === 'victory') {
            handleVictory();
          } else {
            combat.executePlayerTurn();
          }
        });
      }, 600);
    }
  };

  const handleDefend = () => {
    commitWildDie();
    const { rollResult } = combat;
    if (!rollResult) return;

    let heal = 0;

    if (rollResult.type === 'trips') {
      heal = rollResult.value * 5;
      addLog(`🛡️ TRIPS SHIELD! +${heal} HP!`);
      playSound('heal');
    } else if (rollResult.type === 'point') {
      heal = rollResult.value * 3;
      addLog(`🛡️ Point defense! +${heal} HP!`);
      playSound('heal');
    }

    combat.setCombat(prev => ({ ...prev, playerHP: prev.playerHP + heal }));

    // Enemy's turn
    setTimeout(() => {
      combat.setPlayerHasRolled(false);
      combat.setDice([]);
      combat.setRollResult(null);
      combat.setCanPlayerRoll(false);

      combat.executeEnemyTurn((result) => {
        if (result === 'defeat') {
          handleDefeat();
        } else if (result === 'victory') {
          handleVictory();
        } else {
          combat.executePlayerTurn();
        }
      });
    }, 600);
  };

  const handleReroll = () => {
    if (combat.combat.rerollsLeft > 0) {
      commitWildDie();
      playSound('reroll');
      const newDice = rollDice(3, highRollerActive);
      const result = analyzeCeeloRoll(newDice, gameState.powerups.pointBoost);
      combat.setCombat(prev => ({ ...prev, rerollsLeft: prev.rerollsLeft - 1 }));

      startDiceAnimation(newDice, () => {
        setHighRollerActive(false);
        combat.setDice(newDice);
        combat.setRollResult(result);
        addLog(`🔄 Manual reroll: ${newDice.join('-')} - ${result.display}`);

        if (result.type === 'instant_win') {
          setTimeout(() => {
            playSound('victory');
            addLog('🎉 4-5-6! INSTANT VICTORY!');
            handleVictory();
          }, 1000);
        } else if (result.type === 'cursed') {
          setTimeout(() => {
            playSound('cursed');
            addLog('💀 1-2-3! INSTANT DEFEAT!');
            handleDefeat();
          }, 1000);
        } else if (result.type === 'none') {
          addLog('🔄 No score - rolling again (free)');
          combat.setPlayerHasRolled(false);
          setTimeout(() => {
            combat.setCanPlayerRoll(true);
          }, 800);
        }
      });
    }
  };

  const handleWildDie = (index, value) => {
    const pending = combat.pendingWildDie;
    const chargesLeft = gameState.powerups.wildDie - combat.wildDieUsed;

    // If clicking a different die than the one being edited
    if (pending && pending.index !== index) {
      // Need a new charge to edit a second die
      if (chargesLeft <= (pending ? 1 : 0)) return;
    }

    // If no pending edit, need at least 1 charge
    if (!pending && chargesLeft <= 0) return;

    const newDice = [...combat.dice];
    newDice[index] = value;
    combat.setDice(newDice);
    const newResult = analyzeCeeloRoll(newDice, gameState.powerups.pointBoost, false, false);
    combat.setRollResult(newResult);

    // Track which die is being edited (store original value on first click)
    if (!pending || pending.index !== index) {
      // Starting a new die edit — if there was a previous pending edit, commit it
      if (pending) {
        combat.setWildDieUsed(prev => prev + 1);
        addLog(`🎯 WILD DIE locked on die ${pending.index + 1}`);
      }
      combat.setPendingWildDie({ index, originalValue: combat.dice[index] });
    } else {
      // Same die, just cycling — update pending but don't consume charge
      combat.setPendingWildDie({ ...pending });
    }

    // Check for instant outcomes from Wild Die
    if (newResult.type === 'instant_win') {
      combat.setPlayerHasRolled(true);
      combat.setCanPlayerRoll(false);
      commitWildDie();
      setTimeout(() => {
        playSound('victory');
        addLog('🎉 4-5-6! INSTANT VICTORY!');
        handleVictory();
      }, 1000);
      return;
    }

    // If Wild Die turned a no-score into a valid roll, show action buttons
    if (newResult.type !== 'none' && !combat.playerHasRolled) {
      combat.setPlayerHasRolled(true);
      combat.setCanPlayerRoll(false);
    }
  };

  // Commits any pending wild die edit (called before actions)
  const commitWildDie = () => {
    if (combat.pendingWildDie) {
      combat.setWildDieUsed(prev => prev + 1);
      combat.setPendingWildDie(null);
    }
  };

  const handleVictory = () => {
    const rewards = getVictoryRewards(gameState.round);
    const isFinalRound = gameState.round >= gameState.maxRounds;

    playSound(isFinalRound ? 'victory' : 'roundVictory');

    updateGameState({
      gold: gameState.gold + rewards.gold,
      baseHP: gameState.baseHP + rewards.hp,
      baseDamage: gameState.baseDamage + rewards.damage,
      round: gameState.round + 1,
    });

    addLog(`🎉 Victory! +${rewards.gold}g, +${rewards.hp}HP, +${rewards.damage}DMG`);

    if (isFinalRound) {
      recordRun({ won: true, finalRound: gameState.maxRounds, finalGold: gameState.gold + rewards.gold });
      setScreen('victory');
    } else {
      setScreen('preRound');
    }
  };

  const handleDefeat = () => {
    playSound('defeat');
    addLog('💀 Defeated! Run ended...');
    recordRun({ won: false, finalRound: Math.max(1, gameState.round - 1), finalGold: gameState.gold });
    setScreen('defeat');
  };

  const handleBuyPowerup = (powerupKey) => {
    const result = processPowerupPurchase(powerupKey, gameState);
    if (result) {
      updateGameState(result);
      playSound('buy');
      addLog(`💰 Bought powerup!`);
    }
  };

  const handleRestart = () => {
    restart();
    clearLog();
    setScreen('menu');
    setPlayerGoesFirst(false);
  };

  const handleUseFirstStrike = () => {
    if (gameState.powerups.firstStrike > 0) {
      playSound('click');
      updateGameState({
        powerups: { ...gameState.powerups, firstStrike: gameState.powerups.firstStrike - 1 }
      });
      setPlayerGoesFirst(true);
      addLog('⚡ First Strike activated! You go first this round!');
    }
  };

  const handleUseHighRoller = () => {
    if (gameState.powerups.highRoller > 0 && !highRollerActive) {
      playSound('click');
      updateGameState({
        powerups: { ...gameState.powerups, highRoller: gameState.powerups.highRoller - 1 }
      });
      setHighRollerActive(true);
      addLog('🎰 High Roller activated! Next roll will be 4-6!');
    }
  };

  const handleUseDoubleDown = () => {
    if (gameState.powerups.doubleDown > 0 && !doubleDownActive) {
      playSound('click');
      updateGameState({
        powerups: { ...gameState.powerups, doubleDown: gameState.powerups.doubleDown - 1 }
      });
      setDoubleDownActive(true);
      addLog('💎 Double Down activated! Next trips attack deals 2× damage!');
    }
  };

  return (
    <>
      {/* Main Screen — key triggers fade-in animation on screen change */}
      <div key={screen} className="screen-transition">
        {screen === 'menu' && (
          <MenuScreen
            gameState={gameState}
            activePowerups={activePowerups}
            runStats={runStats}
            onStartRound={handleStartRound}
            onVisitShop={() => setScreen('shop')}
          />
        )}

        {screen === 'preRound' && (
          <PreRoundScreen
            gameState={gameState}
            activePowerups={activePowerups}
            onBeginCombat={handleBeginCombat}
            onVisitShop={() => setScreen('shop')}
            onUseFirstStrike={handleUseFirstStrike}
            playSound={playSound}
          />
        )}

        {screen === 'combat' && (
          <CombatScreen
            gameState={gameState}
            combat={combat.combat}
            dice={combat.dice}
            enemyDice={combat.enemyDice}
            rollResult={combat.rollResult}
            enemyRollResult={combat.enemyRollResult}
            canPlayerRoll={combat.canPlayerRoll}
            playerHasRolled={combat.playerHasRolled}
            wildDieUsed={combat.wildDieUsed}
            pendingWildDie={combat.pendingWildDie}
            isDiceRolling={diceRolling}
            animatingDice={animatingDice}
            isEnemyDiceRolling={combat.enemyDiceRolling}
            enemyAnimatingDice={combat.enemyAnimatingDice}
            floatingNumbers={floatingNumbers}
            onRemoveFloat={removeFloatingNumber}
            highRollerActive={highRollerActive}
            onUseHighRoller={handleUseHighRoller}
            doubleDownActive={doubleDownActive}
            onUseDoubleDown={handleUseDoubleDown}
            onRollDice={handlePlayerRollDice}
            onAttack={handleAttack}
            onDefend={handleDefend}
            onReroll={handleReroll}
            onWildDie={handleWildDie}
          />
        )}

        {screen === 'shop' && (
          <ShopScreen
            gameState={gameState}
            onBuyPowerup={handleBuyPowerup}
            onContinue={() => setScreen('menu')}
            playSound={playSound}
          />
        )}

        {screen === 'victory' && (
          <VictoryScreen
            gameState={gameState}
            activePowerups={activePowerups}
            onNewRun={handleRestart}
            playSound={playSound}
          />
        )}

        {screen === 'defeat' && (
          <DefeatScreen
            gameState={gameState}
            activePowerups={activePowerups}
            onNewRun={handleRestart}
            playSound={playSound}
          />
        )}
      </div>

      {/* Combat Log - Always visible */}
      <CombatLog log={log} logRef={logRef} />

      {/* Fixed UI Elements */}
      <SoundToggle soundEnabled={soundEnabled} onToggle={toggleSound} />
      <HelpButton onClick={() => setShowRules(true)} />

      {/* Rules Modal */}
      {showRules && (
        <RulesModal
          onClose={() => setShowRules(false)}
          playSound={playSound}
        />
      )}
    </>
  );
};

export default Game;
