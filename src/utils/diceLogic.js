import { ROLL_TYPES, GAME_CONFIG } from '../constants/gameConfig';

/**
 * Analyzes a roll of three dice and returns the result type
 */
export const analyzeCeeloRoll = (dice, pointBoostCount = 0, aceSaverActive = false, usedAceSaver = false) => {
  const sorted = [...dice].sort((a, b) => a - b);
  const [d1, d2, d3] = sorted;
  
  // Check for 1-2-3 (instant loss)
  if (d1 === 1 && d2 === 2 && d3 === 3) {
    return { type: ROLL_TYPES.INSTANT_LOSS, value: 0, display: '💀 1-2-3 INSTANT LOSS!' };
  }
  
  // Check for 4-5-6 (instant win)
  if (d1 === 4 && d2 === 5 && d3 === 6) {
    return { type: ROLL_TYPES.INSTANT_WIN, value: 0, display: '🎉 4-5-6 INSTANT WIN!' };
  }
  
  // Check for trips (all three match)
  if (d1 === d2 && d2 === d3) {
    // Ace saver: 1-1-1 becomes 6-6-6
    if (d1 === 1 && aceSaverActive && !usedAceSaver) {
      return { type: ROLL_TYPES.TRIPS, value: 6 + GAME_CONFIG.TRIPS_BONUS, display: `TRIPS! ${6}-${6}-${6}`, usedAceSaver: true };
    }
    return { type: ROLL_TYPES.TRIPS, value: d1 + GAME_CONFIG.TRIPS_BONUS, display: `TRIPS! ${d1}-${d1}-${d1}` };
  }
  
  // Check for point (pair + singleton)
  let point = null;
  if (d1 === d2) point = d3;
  else if (d2 === d3) point = d1;
  else if (d1 === d3) point = d2;
  
  if (point !== null) {
    const boostedPoint = point + pointBoostCount;
    return { type: ROLL_TYPES.POINT, value: boostedPoint, display: `POINT: ${boostedPoint}` };
  }
  
  // No scoring combination
  return { type: ROLL_TYPES.NONE, value: 0, display: 'No Score - Reroll' };
};

/**
 * Applies luck modifiers to dice after rolling
 */
export const applyLuckModifiers = (dice, luckyCloverCount, devilsWardCount, addLog) => {
  let modifiedDice = [...dice];
  const sorted = [...dice].sort((a, b) => a - b);
  
  // Check if this would be 1-2-3 (instant loss)
  if (sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) {
    // Devil's Ward: Each level gives 20% chance to reroll one die
    const devilsWardChance = devilsWardCount * 0.2;
    if (Math.random() < devilsWardChance) {
      // Reroll one of the dice to try to break the 1-2-3
      const indexToReroll = Math.floor(Math.random() * 3);
      modifiedDice[indexToReroll] = Math.floor(Math.random() * 6) + 1;
      addLog(`🛡️ Devil's Ward activates! Rerolling to avoid 1-2-3`);
      return modifiedDice;
    }
  }
  
  // Lucky Clover: Each level gives 15% chance to reroll towards 4-5-6
  if (luckyCloverCount > 0) {
    const luckyCloverChance = luckyCloverCount * 0.15;
    
    // If we have exactly 4, 5, 6 don't touch it
    const has4 = dice.includes(4);
    const has5 = dice.includes(5);
    const has6 = dice.includes(6);
    
    // If we're missing 1 or 2 dice for 4-5-6, try to get them
    if (!has4 || !has5 || !has6) {
      if (Math.random() < luckyCloverChance) {
        // Find a die that's not 4, 5, or 6 and reroll it to 4, 5, or 6
        for (let i = 0; i < modifiedDice.length; i++) {
          if (modifiedDice[i] < 4) {
            modifiedDice[i] = Math.floor(Math.random() * 3) + 4; // Roll 4, 5, or 6
            addLog(`🍀 Lucky Clover activates! Rerolling towards 4-5-6`);
            break;
          }
        }
      }
    }
  }
  
  return modifiedDice;
};

/**
 * Generates random dice with powerup modifiers applied
 */
export const rollDice = (count, hasLoadedDice, hasHighRoller) => {
  let rolls = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  
  // Apply loaded dice (lock one to 6)
  if (hasLoadedDice && rolls.length === 3) {
    rolls[0] = 6;
  }
  
  // Apply high roller (all dice ≥4)
  if (hasHighRoller) {
    rolls = rolls.map(d => d < 4 ? Math.floor(Math.random() * 3) + 4 : d);
  }
  
  return rolls;
};
