import { PRICE_SCALING, POWERUP_INFO } from '../constants/gameConfig';

/**
 * Calculates the new price for a powerup after purchase
 */
export const calculateNewPrice = (powerupKey, currentPrice, isStackable) => {
  const multiplier = isStackable 
    ? PRICE_SCALING.STACKABLE_INCREASE 
    : PRICE_SCALING.ONE_TIME_INCREASE;
  
  return Math.floor(currentPrice * multiplier);
};

/**
 * Applies global inflation to all prices
 */
export const applyGlobalInflation = (prices, purchaseCount) => {
  const globalMultiplier = Math.pow(PRICE_SCALING.GLOBAL_INFLATION, purchaseCount);
  
  const newPrices = {};
  Object.keys(prices).forEach(key => {
    newPrices[key] = Math.floor(prices[key] * globalMultiplier);
  });
  
  return newPrices;
};

/**
 * Processes a powerup purchase and returns updated state
 */
export const processPowerupPurchase = (powerupKey, gameState) => {
  const { prices, powerups, gold, purchaseCount } = gameState;
  const price = prices[powerupKey];
  
  if (gold < price) {
    return null; // Can't afford
  }
  
  const powerupInfo = POWERUP_INFO[powerupKey];
  const isStackable = powerupInfo?.stackable || false;
  
  // Update powerups
  const newPowerups = {
    ...powerups,
    [powerupKey]: powerups[powerupKey] + 1
  };
  
  // Update individual powerup price
  const newPrices = {
    ...prices,
    [powerupKey]: calculateNewPrice(powerupKey, price, isStackable)
  };
  
  // Apply global inflation to all prices
  const inflatedPrices = applyGlobalInflation(newPrices, purchaseCount + 1);
  
  return {
    gold: gold - price,
    powerups: newPowerups,
    prices: inflatedPrices,
    purchaseCount: purchaseCount + 1
  };
};

/**
 * Gets active powerups for display
 */
export const getActivePowerups = (powerups) => {
  return Object.entries(powerups)
    .filter(([key, value]) => value > 0)
    .map(([key, value]) => ({
      key,
      label: POWERUP_INFO[key]?.name || key,
      icon: POWERUP_INFO[key]?.icon || '',
      value: value > 1 ? value : null
    }));
};
