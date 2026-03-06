// Game configuration constants
export const GAME_CONFIG = {
  STARTING_GOLD: 20,
  STARTING_HP: 50,
  STARTING_DAMAGE: 5,
  STARTING_REROLLS: 1,
  MAX_ROUNDS: 10,
  ENEMY_DAMAGE_MULTIPLIER: 0.8,
  TRIPS_BONUS: 6,
};

// Initial powerup prices
export const INITIAL_PRICES = {
  doubleDown: 30,
  pointBoost: 15,
  highRoller: 40,
  wildDie: 25,
  extraReroll: 12,
  luckyClover: 30,
  devilsWard: 30,
  firstStrike: 20,
};

// Powerup metadata
export const POWERUP_INFO = {
  doubleDown: {
    name: 'Double Down',
    icon: '💎',
    description: 'Trips deal 2× damage',
    stackable: false,
  },
  pointBoost: {
    name: 'Point Boost',
    icon: '📈',
    description: '+1 to all point values',
    stackable: true,
  },
  highRoller: {
    name: 'High Roller',
    icon: '🎰',
    description: 'All dice roll 4-6 this round (consumable)',
    stackable: true,
    consumable: true,
  },
  wildDie: {
    name: 'Wild Die',
    icon: '🎯',
    description: 'Click dice to set value once per round',
    stackable: true,
  },
  extraReroll: {
    name: 'Extra Reroll',
    icon: '🔄',
    description: '+1 manual reroll per round',
    stackable: true,
  },
  luckyClover: {
    name: 'Lucky Clover',
    icon: '🍀',
    description: '15% chance per level to push towards 4-5-6',
    stackable: true,
  },
  devilsWard: {
    name: "Devil's Ward",
    icon: '🛡️',
    description: '20% chance per level to avoid 1-2-3',
    stackable: true,
  },
  firstStrike: {
    name: 'First Strike',
    icon: '⚡',
    description: 'Go first next round (consumable)',
    stackable: true,
    consumable: true,
  },
};

// Price scaling configuration
export const PRICE_SCALING = {
  GLOBAL_INFLATION: 1.01, // 1% per purchase
  STACKABLE_INCREASE: 1.4, // 40% per purchase
  ONE_TIME_INCREASE: 1.5, // 50% per purchase
};

// Victory rewards formulas
export const getVictoryRewards = (round) => ({
  gold: 15 + round * 5,
  hp: 3 + round,
  damage: 2 + round,
});

// Enemy HP formula
export const getEnemyHP = (round, playerBaseHP) => {
  const baseEnemyHP = 15 + round * 5;
  const roundScaling = Math.floor(Math.pow(round, 1.5) * 3);
  const playerScaling = Math.floor((playerBaseHP - GAME_CONFIG.STARTING_HP) / 2);
  return baseEnemyHP + roundScaling + playerScaling;
};

// Roll result types
export const ROLL_TYPES = {
  INSTANT_WIN: 'instant_win',
  INSTANT_LOSS: 'cursed',
  TRIPS: 'trips',
  POINT: 'point',
  NONE: 'none',
};

// Sound types
export const SOUND_TYPES = {
  ATTACK: 'attack',
  DEFEND: 'defend',
  REROLL: 'reroll',
  TRIPS: 'trips',
  CURSED: 'cursed',
  VICTORY: 'victory',
  ROUND_VICTORY: 'roundVictory',
  DEFEAT: 'defeat',
  ENEMY_ATTACK: 'enemyAttack',
  HEAL: 'heal',
  BUY: 'buy',
  CLICK: 'click',
};
