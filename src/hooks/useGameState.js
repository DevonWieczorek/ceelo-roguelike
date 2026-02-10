import { useState } from 'react';
import { GAME_CONFIG, INITIAL_PRICES } from '../constants/gameConfig';

const createInitialState = () => ({
  gold: GAME_CONFIG.STARTING_GOLD,
  baseHP: GAME_CONFIG.STARTING_HP,
  baseDamage: GAME_CONFIG.STARTING_DAMAGE,
  round: 1,
  maxRounds: GAME_CONFIG.MAX_ROUNDS,
  rerolls: GAME_CONFIG.STARTING_REROLLS,
  powerups: {
    loadedDice: 0,
    doubleDown: 0,
    pointBoost: 0,
    aceSaver: 0,

    highRoller: 0,
    wildDie: 0,
    extraReroll: 0,
    luckyClover: 0,
    devilsWard: 0,
    firstStrike: 0,
  },
  prices: { ...INITIAL_PRICES },
  purchaseCount: 0,
});

export const useGameState = () => {
  const [gameState, setGameState] = useState(createInitialState());

  const restart = () => {
    setGameState(createInitialState());
  };

  const updateGameState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  return {
    gameState,
    setGameState,
    updateGameState,
    restart
  };
};
