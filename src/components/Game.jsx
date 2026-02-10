import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { useAudio } from '../hooks/useAudio';
import { useCombat } from '../hooks/useCombat';
import { useLog } from '../hooks/useLog';
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
  
  const [screen, setScreen] = useState('menu');
  const [showRules, setShowRules] = useState(false);
  const [playerGoesFirst, setPlayerGoesFirst] = useState(false);

  const activePowerups = getActivePowerups(gameState.powerups);

  // Game flow handlers
  const handleStartRound = () => {
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

  const handlePlayerRollDice = () => {
    if (!combat.canPlayerRoll) return;
    
    playSound('reroll');
    combat.setCanPlayerRoll(false);
    
    let playerDiceRoll = rollDice(
      3,
      gameState.powerups.loadedDice > 0,
      gameState.powerups.highRoller > 0
    );
    
    // Apply luck modifiers
    playerDiceRoll = applyLuckModifiers(
      playerDiceRoll,
      gameState.powerups.luckyClover,
      gameState.powerups.devilsWard,
      addLog
    );
    
    const playerResult = analyzeCeeloRoll(
      playerDiceRoll,
      gameState.powerups.pointBoost,
      gameState.powerups.aceSaver > 0,
      combat.usedAceSaver
    );
    
    if (playerResult.usedAceSaver) {
      combat.setUsedAceSaver(true);
      addLog('✨ ACE SAVER! 1-1-1 → 6-6-6');
    }
    
    combat.setDice(playerDiceRoll);
    combat.setRollResult(playerResult);
    
    addLog(`🎲 You roll: ${playerDiceRoll.join('-')} - ${playerResult.display}`);
    
    // Check for instant outcomes
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
      // Auto-reroll on no score
      addLog('🔄 No score - rolling again (free)');
      setTimeout(() => {
        combat.setCanPlayerRoll(true);
      }, 800);
    } else {
      // Valid roll
      combat.setPlayerHasRolled(true);
    }
  };

  const handleAttack = () => {
    const { rollResult } = combat;
    if (!rollResult) return;
    
    let damage = 0;
    
    if (rollResult.type === 'trips') {
      let multiplier = rollResult.value;
      if (gameState.powerups.doubleDown > 0) multiplier *= 2;
      damage = gameState.baseDamage * multiplier;
      addLog(`⚡ TRIPS ${rollResult.value}! ${damage} damage!`);
      playSound('trips');
    } else if (rollResult.type === 'point') {
      damage = gameState.baseDamage * rollResult.value;
      addLog(`⚔️ Point ${rollResult.value}! ${damage} damage!`);
      playSound('attack');
    }
    
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
          } else {
            combat.executePlayerTurn();
          }
        });
      }, 600);
    }
  };

  const handleDefend = () => {
    const { rollResult } = combat;
    if (!rollResult) return;
    
    let heal = 0;
    
    if (rollResult.type === 'trips') {
      heal = rollResult.value * 5;
      addLog(`🛡️ TRIPS SHIELD! +${heal} HP!`);
      playSound('defend');
    } else if (rollResult.type === 'point') {
      heal = rollResult.value * 3;
      addLog(`🛡️ Point defense! +${heal} HP!`);
      playSound('defend');
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
        } else {
          combat.executePlayerTurn();
        }
      });
    }, 600);
  };

  const handleReroll = () => {
    if (combat.combat.rerollsLeft > 0) {
      playSound('reroll');
      const newDice = rollDice(
        3,
        gameState.powerups.loadedDice > 0,
        gameState.powerups.highRoller > 0
      );
      const result = analyzeCeeloRoll(
        newDice,
        gameState.powerups.pointBoost,
        false,
        false
      );
      combat.setDice(newDice);
      combat.setRollResult(result);
      combat.setCombat(prev => ({ ...prev, rerollsLeft: prev.rerollsLeft - 1 }));
      addLog('🔄 Manual reroll!');
    }
  };

  const handleWildDie = (index, value) => {
    if (combat.wildDieUsed < gameState.powerups.wildDie) {
      const newDice = [...combat.dice];
      newDice[index] = value;
      combat.setDice(newDice);
      combat.setRollResult(analyzeCeeloRoll(newDice, gameState.powerups.pointBoost, false, false));
      combat.setWildDieUsed(prev => prev + 1);
      addLog(`🎯 WILD DIE! Set to ${value}`);
    }
  };

  const handleVictory = () => {
    const rewards = getVictoryRewards(gameState.round);
    
    playSound('victory');
    
    updateGameState({
      gold: gameState.gold + rewards.gold,
      baseHP: gameState.baseHP + rewards.hp,
      baseDamage: gameState.baseDamage + rewards.damage,
      round: gameState.round + 1,
    });
    
    addLog(`🎉 Victory! +${rewards.gold}g, +${rewards.hp}HP, +${rewards.damage}DMG`);
    
    if (gameState.round >= gameState.maxRounds) {
      setScreen('victory');
    } else {
      setScreen('preRound');
    }
  };

  const handleDefeat = () => {
    playSound('cursed');
    addLog('💀 Defeated! Run ended...');
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
        powerups: {
          ...gameState.powerups,
          firstStrike: gameState.powerups.firstStrike - 1
        }
      });
      setPlayerGoesFirst(true);
      addLog('⚡ First Strike activated! You go first this round!');
    }
  };

  return (
    <>
      {/* Main Screen */}
      {screen === 'menu' && (
        <MenuScreen
          gameState={gameState}
          activePowerups={activePowerups}
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
          onShop={() => setScreen('shop')}
          playSound={playSound}
        />
      )}

      {screen === 'defeat' && (
        <DefeatScreen
          gameState={gameState}
          activePowerups={activePowerups}
          onNewRun={handleRestart}
          onMainMenu={() => {
            handleRestart();
            setScreen('menu');
          }}
          playSound={playSound}
        />
      )}

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
