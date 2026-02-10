# Cee-Lo Roguelike - Complete Game Logic Documentation

This document explains every aspect of the game's logic, mechanics, and implementation. Use this as a reference when working on the project.

---

## Table of Contents
1. [Game Overview](#game-overview)
2. [Core Dice Mechanics (Cee-Lo Rules)](#core-dice-mechanics-cee-lo-rules)
3. [Game Flow & State Machine](#game-flow--state-machine)
4. [Combat System](#combat-system)
5. [Economy System](#economy-system)
6. [Powerup System](#powerup-system)
7. [Progression & Scaling](#progression--scaling)
8. [Turn Order System](#turn-order-system)
9. [State Management](#state-management)
10. [Key Formulas](#key-formulas)
11. [Important Constants](#important-constants)
12. [Common Pitfalls & Bugs](#common-pitfalls--bugs)

---

## Game Overview

**Genre**: Roguelike, Dice-Based, Turn-Based Combat  
**Core Loop**: Roll dice → Combat → Shop → Repeat for 5 rounds  
**Win Condition**: Survive all 5 rounds  
**Lose Condition**: HP reaches 0

### High-Level Flow
```
Start → Round 1-5 Loop → Victory
  ↓         ↓
Menu   → Pre-Round Setup → Combat → Shop/Pre-Round → ...
                              ↓
                           Defeat
```

---

## Core Dice Mechanics (Cee-Lo Rules)

### Dice Roll Analysis

Every dice roll is analyzed to determine its **type** and **value**. There are 5 possible outcomes:

#### 1. **4-5-6 (Instant Win)**
- **Condition**: Dice show 4, 5, and 6 in any order
- **Effect**: Immediate victory, round ends instantly
- **Damage**: N/A (bypasses all combat)
- **Example**: [4, 5, 6] or [6, 4, 5]

#### 2. **1-2-3 (Instant Loss)**
- **Condition**: Dice show 1, 2, and 3 in any order
- **Effect**: Immediate defeat, round ends instantly
- **Damage**: N/A (bypasses all combat)
- **Example**: [1, 2, 3] or [3, 1, 2]
- **Important**: Nothing can prevent this once rolled (except Devil's Ward activating BEFORE the roll is finalized)

#### 3. **Trips (Three of a Kind)**
- **Condition**: All three dice match
- **Value**: The number shown (1-6)
- **Damage**: `BASE_DMG × value × multipliers`
- **Example**: [6, 6, 6] = Trips 6
- **Special Cases**:
  - **Trips 1 (1-1-1)**: Worst trips, but Ace Saver can convert to 6-6-6
  - **Trips 6 (6-6-6)**: Best trips, highest damage

#### 4. **Point (Pair + Singleton)**
- **Condition**: Two dice match, one is different
- **Value**: The singleton (the die that doesn't match)
- **Damage/Heal**: `BASE_DMG × value` (attack) or `value × 3` (defend)
- **Example**: [5, 5, 3] = Point 3
- **Boosting**: Point Boost powerup adds +1 to the singleton value

#### 5. **No Score**
- **Condition**: No pairs, not 1-2-3, not 4-5-6
- **Effect**: Auto-reroll for FREE (doesn't consume manual rerolls)
- **Example**: [1, 3, 5] or [2, 4, 6]
- **Important**: Both player AND enemy auto-reroll on no-score until valid

### Roll Analysis Logic (Pseudocode)

```javascript
function analyzeRoll(dice) {
  sorted = sort(dice)  // [1,2,3] or [4,5,6] or check trips/points
  
  // Check instant outcomes first
  if (sorted == [1,2,3]) return INSTANT_LOSS
  if (sorted == [4,5,6]) return INSTANT_WIN
  
  // Check for trips
  if (dice[0] == dice[1] == dice[2]) {
    value = dice[0]
    // Special: Ace Saver can convert 1-1-1 to 6-6-6
    if (value == 1 && hasAceSaver && !usedThisRound) {
      return TRIPS with value=6
    }
    return TRIPS with value
  }
  
  // Check for point (pair + singleton)
  if (two dice match) {
    singleton = the one that doesn't match
    boostedValue = singleton + pointBoostCount
    return POINT with boostedValue
  }
  
  // No scoring combination
  return NO_SCORE
}
```

---

## Game Flow & State Machine

### Screen States

The game has 6 main screens:

1. **Menu** (`screen: 'menu'`)
   - Shows current stats, active powerups
   - Options: Start Round, Visit Shop

2. **Pre-Round Setup** (`screen: 'preRound'`)
   - Shows upcoming enemy HP
   - Use consumable items (First Strike)
   - Options: Begin Combat, Visit Shop

3. **Combat** (`screen: 'combat'`)
   - Turn-based dice combat
   - Roll, Attack, Defend, Reroll actions
   - Continues until player or enemy reaches 0 HP

4. **Shop** (`screen: 'shop'`)
   - Buy powerups with gold
   - All powerups visible with prices
   - Option: Continue (returns to menu or pre-round)

5. **Victory** (`screen: 'victory'`)
   - Shown after completing all 5 rounds
   - Final stats display
   - Options: New Run, Shop

6. **Defeat** (`screen: 'defeat'`)
   - Shown when player HP reaches 0
   - Stats at time of death
   - Options: New Run, Main Menu

### State Transitions

```
[Menu] → Pre-Round → Combat → Victory/Defeat
   ↓          ↓          ↓         ↓
  Shop ← ─────┴──────────┘    New Run → Menu
   ↓
Pre-Round
```

**Key Transitions:**
- `Menu → Pre-Round`: When "Start Round" clicked
- `Pre-Round → Combat`: When "Begin Combat" clicked
- `Pre-Round → Shop`: When "Visit Shop" clicked
- `Combat → Victory`: When enemy HP = 0 AND round < maxRounds
- `Combat → Victory Screen`: When enemy HP = 0 AND round = maxRounds
- `Combat → Defeat`: When player HP = 0
- `Victory → Pre-Round`: Increment round, apply rewards
- `Defeat → Menu`: Call `restart()` to reset everything

---

## Combat System

### Combat Initialization

When combat starts (`startRound()` is called):

1. **Calculate enemy HP** using formula (see Formulas section)
2. **Set combat state**:
   - `enemyHP` and `playerHP` to current values
   - `rerollsLeft` = base rerolls + extra rerolls from powerups
   - `autoRerolls` = 999 if Guaranteed Point, else 3
3. **Reset combat flags**:
   - `usedAceSaver = false`
   - `wildDieUsed = 0`
   - `playerHasRolled = false`
   - Clear dice and roll results
4. **Determine turn order** (see Turn Order section)
5. **Start first turn**

### Turn Structure

Each turn follows this sequence:

```
1. Roll Phase
   ├─ Roll dice (3d6 with powerup modifiers)
   ├─ Apply luck modifiers (Lucky Clover, Devil's Ward)
   ├─ Analyze roll (get type and value)
   └─ Check for instant outcomes (4-5-6, 1-2-3)

2. Action Phase (if not instant outcome)
   ├─ If no score → auto-reroll (free)
   └─ If valid roll → choose action:
       ├─ Attack (deal damage)
       ├─ Defend (heal self)
       └─ Reroll (manual, costs a reroll)

3. Resolution Phase
   ├─ Apply damage/healing
   ├─ Check victory/defeat
   └─ If neither → next player's turn
```

### Player Turn Flow

```javascript
// Player's turn starts
executePlayerTurn() {
  canPlayerRoll = true
  playerHasRolled = false
  log("Your turn! Click ROLL DICE")
}

// Player clicks Roll Dice button
playerRollDice() {
  canPlayerRoll = false
  
  // Generate dice
  dice = rollDice(3)
  dice = applyLuckModifiers(dice)  // Lucky Clover, Devil's Ward
  result = analyzeRoll(dice)
  
  // Handle instant outcomes
  if (result == INSTANT_WIN) {
    playerHasRolled = true
    wait 1s → victory()
    return
  }
  
  if (result == INSTANT_LOSS) {
    playerHasRolled = true
    wait 1s → defeat()
    return
  }
  
  // Handle no score (auto-reroll)
  if (result == NO_SCORE) {
    log("No score - rolling again (free)")
    wait 0.8s → canPlayerRoll = true  // Let them roll again
    return
  }
  
  // Valid roll - show action buttons
  playerHasRolled = true
}

// Player chooses action
attack() {
  calculate damage
  apply damage to enemy
  
  if (enemy.HP <= 0) {
    victory()
  } else {
    reset player states
    executeEnemyTurn(() => executePlayerTurn())
  }
}

defend() {
  calculate healing
  apply healing to player
  
  reset player states
  executeEnemyTurn(() => executePlayerTurn())
}

reroll() {
  if (rerollsLeft > 0) {
    rerollsLeft--
    roll new dice
    analyze result
    // Still playerHasRolled = true, can attack/defend with new roll
  }
}
```

### Enemy Turn Flow

```javascript
executeEnemyTurn(onComplete) {
  log("Enemy turn...")
  
  wait 0.5s
  
  performEnemyRoll((result) => {
    // Check instant outcomes
    if (result == INSTANT_WIN) {
      defeat()
      return
    }
    if (result == INSTANT_LOSS) {
      victory()
      return
    }
    if (result == NO_SCORE) {
      // Recursively reroll
      performEnemyRoll(onComplete)
      return
    }
    
    // Valid roll - enemy attacks
    wait 1s
    
    damage = enemyBaseDamage × result.value
    player.HP -= damage
    
    if (player.HP <= 0) {
      defeat()
    } else {
      onComplete()  // Continue to player turn
    }
  })
}
```

### Damage Calculations

**Player Attack:**
```
Trips Damage = BASE_DMG × trip_value × (hasDoubleDown ? 2 : 1)
Point Damage = BASE_DMG × point_value
```

**Player Defend:**
```
Trips Heal = trip_value × 5
Point Heal = point_value × 3
```

**Enemy Attack:**
```
Enemy Base Damage = player.BASE_DMG × 0.8
Trips Damage = enemyBaseDamage × trip_value
Point Damage = enemyBaseDamage × point_value
```

**Important:** Enemy CANNOT defend (always attacks)

---

## Economy System

### Starting Resources
```javascript
gold: 20
HP: 50
baseDamage: 5
rerolls: 1 per round
```

### Gold Sources

**Victory Rewards (per round):**
```javascript
goldReward = 15 + (round × 5)
// Round 1: 20g
// Round 2: 25g
// Round 3: 30g
// Round 4: 35g
// Round 5: 40g
```

**Total gold available** (if you win every round): 20 (start) + 150 (rewards) = 170g

### Spending Gold

Gold is spent exclusively in the **Shop** to purchase powerups.

**Price Scaling System:**

There are TWO types of price increases:

1. **Global Inflation** (2% per purchase)
   - Applies to ALL items
   - Every time you buy ANY powerup, ALL prices increase by 2%
   - Formula: `price × (1.02 ^ purchaseCount)`

2. **Individual Item Scaling**
   - **Stackable Items** (40% increase): Point Boost, Wild Die, Extra Reroll, Lucky Clover, Devil's Ward, First Strike
   - **One-Time Items** (50% increase): All others

**Combined Price Formula:**
```javascript
// After buying a powerup
newItemPrice = currentItemPrice × itemMultiplier  // 1.4 or 1.5
allPrices = allPrices × globalMultiplier  // 1.02

// Example: Buying Point Boost (15g, stackable)
// 1st purchase: 15g
// After purchase: newPrice = 15 × 1.4 = 21g
// Global inflation: all prices × 1.02
// 2nd purchase: 21 × 1.02 = ~21g (plus global inflation)
// After purchase: newPrice = 21 × 1.4 = ~29g
// And so on...
```

**Price Examples:**

*Point Boost (15g, stackable):*
- 1st: 15g
- 2nd: 21g
- 3rd: 29g
- 4th: 41g
- 5th: 57g

*High Roller (40g, one-time):*
- 1st: 40g
- 2nd: 60g
- 3rd: 90g
- 4th: 135g

**Strategic Implications:**
- Early purchases are cheaper (less global inflation)
- Diversifying is cheaper than stacking one item
- Stackable items are better for multiple purchases (40% vs 50%)
- Can buy multiples of everything (even "one-time" items)

### Purchase Count

`purchaseCount` is a global counter that tracks total number of powerups bought:
- Starts at 0
- Increments by 1 with each purchase
- Used to calculate global inflation
- Never resets (even if you sell - though selling isn't implemented)

---

## Powerup System

### Powerup Categories

**1. Dice Manipulation**
- Loaded Dice: Lock one die to 6
- High Roller: All dice roll 4-6
- Wild Die: Click to set die value

**2. Damage Modifiers**
- Double Down: Trips deal 2× damage
- Point Boost: +1 to point values

**3. Safety/Recovery**
- Ace Saver: 1-1-1 → 6-6-6 conversion
- Guaranteed Point: Unlimited auto-rerolls

**4. Resource Management**
- Extra Reroll: +1 manual reroll per round

**5. Luck Manipulation**
- Lucky Clover: 15% per level to push toward 4-5-6
- Devil's Ward: 20% per level to avoid 1-2-3

**6. Tactical**
- First Strike: Consumable, go first next round

### Powerup Details

#### 🎲 Loaded Dice (25g, one-time)
**Effect:** One die is permanently locked to 6  
**When Applied:** During `rollDice()` - sets `rolls[0] = 6`  
**Benefits:**
- Prevents 1-2-3 (can't have 1,2,3 if one die is 6)
- Easier to get trips 6
- Easier to get 4-5-6 (only need 4 and 5)
**Implementation:**
```javascript
if (hasLoadedDice && rolls.length === 3) {
  rolls[0] = 6;
}
```

#### 💎 Double Down (30g, one-time)
**Effect:** All trips deal 2× damage  
**When Applied:** During damage calculation in `attack()`  
**Benefits:**
- Trips 6 becomes devastating (normally BASE_DMG × 6, now BASE_DMG × 12)
- Synergizes with Loaded Dice + High Roller for guaranteed 6-6-6
**Implementation:**
```javascript
if (rollResult.type === 'trips') {
  multiplier = rollResult.value;
  if (hasDoubleDown) multiplier *= 2;
  damage = baseDamage × multiplier;
}
```

#### 📈 Point Boost (15g, stackable)
**Effect:** +1 to all point values  
**When Applied:** During `analyzeCeeloRoll()` when point is detected  
**Benefits:**
- Point 6 becomes point 7, 8, 9, etc. (with multiple purchases)
- Stacks additively (2 Point Boosts = +2)
**Implementation:**
```javascript
if (point !== null) {
  boostedPoint = point + pointBoostCount;
  return { type: 'point', value: boostedPoint };
}
```

#### ✨ Ace Saver (35g, one-time)
**Effect:** Once per round, convert 1-1-1 to 6-6-6  
**When Applied:** During `analyzeCeeloRoll()` when trips 1 detected  
**Limitations:**
- Only works once per round
- Requires `usedAceSaver = false`
- Resets to false at start of each round
**Implementation:**
```javascript
if (d1 === 1 && d2 === 1 && d3 === 1 && hasAceSaver && !usedAceSaver) {
  usedAceSaver = true;
  return { type: 'trips', value: 6, display: 'TRIPS! 6-6-6' };
}
```

#### 🔄 Guaranteed Point (22g, one-time)
**Effect:** Unlimited auto-rerolls (999 instead of 3)  
**When Applied:** During combat initialization  
**Benefits:**
- Never get stuck with bad rolls
- Essentially guarantees you'll get a valid scoring roll
**Implementation:**
```javascript
autoRerolls: hasGuaranteedPoint ? 999 : 3
```

#### 🎰 High Roller (40g, one-time)
**Effect:** All dice always roll 4, 5, or 6  
**When Applied:** During `rollDice()`  
**Benefits:**
- **Prevents 1-2-3 entirely** (most important!)
- Guarantees decent rolls
- Synergizes with Loaded Dice for 6-6-6
**Implementation:**
```javascript
if (hasHighRoller) {
  rolls = rolls.map(d => d < 4 ? randomInt(4, 6) : d);
}
```

#### 🎯 Wild Die (25g, stackable)
**Effect:** Click a die to set its value once per round (per stack)  
**When Applied:** Player clicks die in UI after rolling  
**Limitations:**
- Only after valid roll (when `playerHasRolled = true`)
- Tracks uses with `wildDieUsed` counter
- Resets to 0 at start of each round
**Implementation:**
```javascript
if (wildDieUsed < wildDieCount && playerHasRolled) {
  // Die is clickable
  onClick: () => {
    newDice[index] = (value % 6) + 1;  // Cycle to next value
    wildDieUsed++;
    reanalyze roll
  }
}
```

#### 🔄 Extra Reroll (12g, stackable)
**Effect:** +1 manual reroll per round  
**When Applied:** During combat initialization  
**Benefits:**
- More chances to improve rolls
- Stacks with base reroll (1)
**Implementation:**
```javascript
totalRerolls = baseRerolls + extraRerollCount;
combat.rerollsLeft = totalRerolls;
```

#### 🍀 Lucky Clover (30g, stackable)
**Effect:** 15% chance per level to reroll low dice toward 4-5-6  
**When Applied:** In `applyLuckModifiers()` after rolling  
**How It Works:**
- After rolling, checks if you're missing 4, 5, or 6
- If yes, 15% × level chance to reroll one die that's < 4 to a value 4-6
- Can help achieve 4-5-6 instant win
**Implementation:**
```javascript
if (luckyCloverCount > 0) {
  chance = luckyCloverCount × 0.15;  // 15%, 30%, 45%, etc.
  if (!has4 || !has5 || !has6) {
    if (random() < chance) {
      find a die < 4
      reroll it to 4, 5, or 6
      log("Lucky Clover activates!")
    }
  }
}
```

#### 🛡️ Devil's Ward (30g, stackable)
**Effect:** 20% chance per level to avoid 1-2-3  
**When Applied:** In `applyLuckModifiers()` after rolling  
**How It Works:**
- After rolling, checks if dice would be 1-2-3
- If yes, 20% × level chance to reroll ONE die
- This breaks the 1-2-3 combination
**Implementation:**
```javascript
if (dice would be [1,2,3]) {
  chance = devilsWardCount × 0.20;  // 20%, 40%, 60%, etc.
  if (random() < chance) {
    pick random die index
    reroll that die to any value 1-6
    log("Devil's Ward activates!")
  }
}
```

#### ⚡ First Strike (20g, stackable/consumable)
**Effect:** Go first in the upcoming round (consumed on use)  
**When Applied:** In Pre-Round Setup screen  
**How It Works:**
- Click "USE FIRST STRIKE" button in pre-round screen
- Sets `playerGoesFirst = true` for that round only
- Decrements `firstStrike` count by 1
- Next round returns to normal alternating pattern
**Implementation:**
```javascript
// In Pre-Round screen
onUseFirstStrike: () => {
  firstStrike--;
  playerGoesFirst = true;
  log("First Strike activated!");
}

// In startRound()
if (playerGoesFirst) {
  executePlayerTurn();  // Player goes first
} else {
  executeEnemyTurn(() => executePlayerTurn());  // Enemy first
}

// After round
playerGoesFirst = !playerGoesFirst;  // Toggle for next round
```

### Powerup Synergies

**Best Combos:**
- **Loaded Dice + High Roller** = Guaranteed 6-6-6 trips (one die locked to 6, all dice 4-6)
- **Double Down + High Roller** = Massive damage with safety
- **Lucky Clover × 3 + Devil's Ward × 2** = 45% toward 4-5-6, 40% avoid 1-2-3
- **Point Boost × 4 + Wild Die** = Guaranteed high points every turn

**Anti-Synergies:**
- **Loaded Dice + Lucky Clover** = Less useful (already have one 6)
- **Guaranteed Point + Extra Reroll** = Redundant (unlimited vs limited rerolls)

---

## Progression & Scaling

### Victory Rewards

After each round victory, player receives:

```javascript
gold = 15 + (round × 5)     // 20, 25, 30, 35, 40
HP = 3 + floor(round / 2)   // +3, +3, +4, +4, +5
damage = 2 + floor(round / 2)  // +2, +2, +3, +3, +4
```

**Total possible progression** (5 rounds):
- Gold: 150g earned (+ 20 start = 170g total)
- HP: +19 (50 start + 19 = 69 final)
- Damage: +14 (5 start + 14 = 19 final)

### Enemy Scaling

Enemy HP increases exponentially:

```javascript
baseEnemyHP = 15 + (round × 5)        // Linear
roundScaling = (round²) × 2           // Exponential
playerScaling = floor((playerHP - 50) / 2)  // Player advantage

enemyHP = baseEnemyHP + roundScaling + playerScaling
```

**Examples:**
- Round 1: 15 + 5 + 2 + 0 = 22 HP
- Round 2: 15 + 10 + 8 + 0 = 33 HP
- Round 3: 15 + 15 + 18 + 2 = 50 HP
- Round 4: 15 + 20 + 32 + 5 = 72 HP
- Round 5: 15 + 25 + 50 + 9 = 99 HP

**Enemy Damage:**
```javascript
enemyBaseDamage = playerBaseDamage × 0.8
```

Enemy deals 80% of player's base damage with their rolls.

### Difficulty Curve

**Round 1-2**: Tutorial phase
- Enemy is weak
- Player learns mechanics
- Easy to survive

**Round 3**: Difficulty spike
- Enemy HP jumps significantly
- Player needs some powerups
- First real challenge

**Round 4-5**: Endgame
- Enemy HP very high
- Requires good build
- Strategic play essential

---

## Turn Order System

### Alternating Pattern

Turn order alternates each round:

```
Round 1: Enemy first → Player
Round 2: Player first → Enemy
Round 3: Enemy first → Player
Round 4: Player first → Enemy
Round 5: Enemy first → Player
```

**Implementation:**
```javascript
// State
playerGoesFirst = false  // Starts false (enemy first R1)

// At start of round
if (playerGoesFirst) {
  executePlayerTurn()
} else {
  executeEnemyTurn(() => executePlayerTurn())
}

// At end of round
playerGoesFirst = !playerGoesFirst  // Toggle
```

### First Strike Override

First Strike consumable overrides the pattern for one round:

```javascript
// In Pre-Round Setup
onUseFirstStrike() {
  firstStrike--
  playerGoesFirst = true
}

// In startRound()
if (playerGoesFirst) {
  log("You go first this round!")
  executePlayerTurn()
} else {
  log("Enemy goes first this round!")
  executeEnemyTurn(...)
}

// After round completes
playerGoesFirst = !playerGoesFirst  // Resets pattern
```

**Example:**
- R1: Enemy first (normal)
- R2: Player first (normal alternation)
- R3: Would be enemy first, but player uses First Strike → Player first
- R4: Back to enemy first (pattern continues as if R3 was player first)

---

## State Management

### Game State Structure

```javascript
gameState = {
  // Resources
  gold: 20,
  baseHP: 50,
  baseDamage: 5,
  
  // Progression
  round: 1,
  maxRounds: 5,
  rerolls: 1,  // Base rerolls per round
  
  // Powerups (counts)
  powerups: {
    loadedDice: 0,
    doubleDown: 0,
    pointBoost: 0,
    aceSaver: 0,
    guaranteedPoint: 0,
    highRoller: 0,
    wildDie: 0,
    extraReroll: 0,
    luckyClover: 0,
    devilsWard: 0,
    firstStrike: 0,
  },
  
  // Economy
  prices: { /* initial prices */ },
  purchaseCount: 0,
}
```

### Combat State Structure

```javascript
combat = {
  enemyHP: number,
  enemyMaxHP: number,
  playerHP: number,
  playerMaxHP: number,
  rerollsLeft: number,
  autoRerolls: number,
}
```

### UI State Structure

```javascript
// Screen navigation
screen: 'menu' | 'preRound' | 'combat' | 'shop' | 'victory' | 'defeat'

// Combat state
dice: [number, number, number]
enemyDice: [number, number, number]
rollResult: { type, value, display } | null
enemyRollResult: { type, value, display } | null

// Turn management
canPlayerRoll: boolean
playerHasRolled: boolean
playerGoesFirst: boolean

// Per-round flags
usedAceSaver: boolean
wildDieUsed: number

// UI
showRules: boolean
log: string[]
```

### State Reset Points

**Full Reset** (restart game):
```javascript
restart() {
  gameState = initialState
  screen = 'menu'
  playerGoesFirst = false
  log = ['🎲 New run started!']
}
```

**Round Reset** (start new round):
```javascript
startRound() {
  // Combat state reset
  usedAceSaver = false
  wildDieUsed = 0
  canPlayerRoll = false
  playerHasRolled = false
  dice = []
  rollResult = null
  
  // Don't reset: gameState, round, powerups, prices
}
```

**Turn Reset** (between player/enemy turns):
```javascript
// After action (attack/defend)
playerHasRolled = false
dice = []
rollResult = null
canPlayerRoll = false
```

---

## Key Formulas

### Damage Calculations

```javascript
// Player Attack - Trips
tripsDamage = baseDamage × tripValue × (hasDoubleDown ? 2 : 1)
// Example: baseDamage=5, trips 6, Double Down
// 5 × 6 × 2 = 60 damage

// Player Attack - Point
pointDamage = baseDamage × pointValue
// Example: baseDamage=5, point 4
// 5 × 4 = 20 damage

// Player Defend - Trips
tripsHeal = tripValue × 5
// Example: trips 6
// 6 × 5 = 30 HP healed

// Player Defend - Point
pointHeal = pointValue × 3
// Example: point 5
// 5 × 3 = 15 HP healed

// Enemy Attack
enemyBaseDamage = playerBaseDamage × 0.8
enemyDamage = enemyBaseDamage × rollValue
// Example: playerBaseDamage=10, enemy rolls trips 5
// 10 × 0.8 = 8 base
// 8 × 5 = 40 damage
```

### Economy Formulas

```javascript
// Victory Rewards
goldReward = 15 + (round × 5)
hpReward = 3 + floor(round / 2)
damageReward = 2 + floor(round / 2)

// Price Scaling
globalMultiplier = Math.pow(1.02, purchaseCount)
stackableMultiplier = 1.4  // 40%
oneTimeMultiplier = 1.5    // 50%

// After purchase
newItemPrice = currentPrice × itemMultiplier
allPrices = allPrices.map(p => p × globalMultiplier)

// Enemy HP
baseEnemyHP = 15 + (round × 5)
roundScaling = (round × round) × 2
playerScaling = floor((playerBaseHP - 50) / 2)
enemyHP = baseEnemyHP + roundScaling + playerScaling
```

### Luck Modifier Chances

```javascript
// Lucky Clover
luckyCloverChance = luckyCloverCount × 0.15
// 1 clover = 15%, 2 = 30%, 3 = 45%, etc.

// Devil's Ward
devilsWardChance = devilsWardCount × 0.20
// 1 ward = 20%, 2 = 40%, 3 = 60%, etc.
```

---

## Important Constants

```javascript
// Starting values
STARTING_GOLD = 20
STARTING_HP = 50
STARTING_DAMAGE = 5
STARTING_REROLLS = 1
MAX_ROUNDS = 5

// Combat
ENEMY_DAMAGE_MULTIPLIER = 0.8  // Enemy deals 80% of player damage
AUTO_REROLL_LIMIT = 999  // For Guaranteed Point

// Economy
GLOBAL_INFLATION = 1.02  // 2% per purchase
STACKABLE_INCREASE = 1.4  // 40%
ONE_TIME_INCREASE = 1.5   // 50%

// Roll types
ROLL_TYPES = {
  INSTANT_WIN: 'instant_win',
  INSTANT_LOSS: 'cursed',
  TRIPS: 'trips',
  POINT: 'point',
  NONE: 'none',
}

// Initial prices
INITIAL_PRICES = {
  loadedDice: 25,
  doubleDown: 30,
  pointBoost: 15,
  aceSaver: 35,
  guaranteedPoint: 22,
  highRoller: 40,
  wildDie: 25,
  extraReroll: 12,
  luckyClover: 30,
  devilsWard: 30,
  firstStrike: 20,
}
```

---

## Common Pitfalls & Bugs

### 1. **playerHasRolled Not Reset**
**Problem:** After enemy turn, player can't roll because buttons show wrong state  
**Cause:** `executePlayerTurn()` sets `canPlayerRoll=true` but doesn't reset `playerHasRolled=false`  
**Fix:**
```javascript
executePlayerTurn() {
  canPlayerRoll = true
  playerHasRolled = false  // ← Must be here
}
```

### 2. **Round Incrementing Twice**
**Problem:** Round skips numbers or increments at wrong time  
**Cause:** `round++` called in multiple places (victory AND combat start)  
**Fix:** Only increment in ONE place (either victory or startRound, not both)

### 3. **Auto-Reroll Infinite Loop**
**Problem:** Game hangs on "no score" rolls  
**Cause:** Recursive auto-reroll with no exit condition  
**Fix:** 
```javascript
if (result.type === 'none') {
  log("No score - rolling again")
  setTimeout(() => playerRollDice(), 800)  // Not immediate
  return
}
```

### 4. **Price Scaling Applied Wrong**
**Problem:** Prices increase too much or not at all  
**Cause:** Forgetting to apply BOTH individual AND global scaling  
**Fix:**
```javascript
// Step 1: Update individual item price
newPrices[item] = currentPrice × itemMultiplier

// Step 2: Apply global inflation to ALL prices
globalMult = Math.pow(1.02, purchaseCount)
finalPrices = Object.map(newPrices, p => p × globalMult)
```

### 5. **Luck Modifiers Not Working**
**Problem:** Lucky Clover/Devil's Ward never activate  
**Cause:** Applied AFTER `analyzeCeeloRoll()` instead of BEFORE  
**Fix:**
```javascript
dice = rollDice(3)
dice = applyLuckModifiers(dice)  // ← Must be before analyze
result = analyzeCeeloRoll(dice)
```

### 6. **Turn Order Broken**
**Problem:** Turn order doesn't alternate or First Strike doesn't work  
**Cause:** `playerGoesFirst` not toggled at end of round  
**Fix:**
```javascript
startRound() {
  // ... combat logic ...
  
  // At the very end
  playerGoesFirst = !playerGoesFirst  // Toggle for next round
}
```

### 7. **State Persisting After Restart**
**Problem:** New run has powerups/gold from old run  
**Cause:** `restart()` not resetting all state  
**Fix:**
```javascript
restart() {
  // Reset EVERYTHING
  setGameState(initialState)
  setCombat(null)
  setDice([])
  setRollResult(null)
  setPlayerHasRolled(false)
  setPlayerGoesFirst(false)
  setLog(['🎲 New run started!'])
  setScreen('menu')
}
```

### 8. **Consumables Not Consumed**
**Problem:** First Strike works multiple times from one purchase  
**Cause:** Count not decremented  
**Fix:**
```javascript
onUseFirstStrike() {
  if (firstStrike > 0) {
    firstStrike--  // ← Must decrement
    playerGoesFirst = true
  }
}
```

### 9. **Wild Die Clickable When Shouldn't Be**
**Problem:** Can click dice before rolling or after using all charges  
**Cause:** Incorrect conditions on onClick  
**Fix:**
```javascript
<Dice 
  clickable={playerHasRolled && wildDieUsed < wildDieCount}
  onClick={...}
/>
```

### 10. **HP Bar Overflow**
**Problem:** HP bar goes over 100% when healing  
**Cause:** Healing doesn't cap at max HP  
**Fix:**
```javascript
// In HP bar calculation
percentage = Math.min((current / max) × 100, 100)

// Or cap healing
newHP = Math.min(currentHP + heal, maxHP)
```

---

## Debugging Tips

### Key Variables to Watch

When debugging combat issues:
```javascript
console.log({
  screen,
  canPlayerRoll,
  playerHasRolled,
  dice,
  rollResult,
  combat: {
    playerHP,
    enemyHP,
    rerollsLeft
  }
})
```

### Common Debug Scenarios

**"Buttons not showing":**
- Check `playerHasRolled` value
- Check `rollResult` is not null
- Check `rollResult.type` is not 'none'

**"Turn stuck":**
- Check `canPlayerRoll` value
- Check if waiting for enemy turn callback
- Check if state reset properly

**"Damage wrong":**
- Check `rollResult.value` matches dice
- Check powerup counts (doubleDown, pointBoost)
- Check if using correct damage formula

**"Prices wrong":**
- Check `purchaseCount` value
- Check powerup counts (should increment)
- Log both item and global multipliers

---

## Testing Checklist

When making changes, test these scenarios:

### Combat Flow
- [ ] Player can roll dice
- [ ] Attack button appears after valid roll
- [ ] Attack deals correct damage
- [ ] Defend heals correct amount
- [ ] Manual reroll works and decrements count
- [ ] Auto-reroll on no-score doesn't consume manual rerolls
- [ ] 4-5-6 instantly wins
- [ ] 1-2-3 instantly loses
- [ ] Turn alternates correctly
- [ ] Enemy attacks correctly

### Economy
- [ ] Victory awards correct gold/HP/DMG
- [ ] Powerups cost correct amount
- [ ] Prices increase after each purchase
- [ ] Can't buy if insufficient gold
- [ ] Purchase count increments

### Powerups
- [ ] Loaded Dice locks one die to 6
- [ ] High Roller prevents 1-2-3
- [ ] Point Boost adds to point values
- [ ] Double Down doubles trips damage
- [ ] Ace Saver converts 1-1-1 to 6-6-6 (once per round)
- [ ] Wild Die allows clicking dice
- [ ] Lucky Clover activates (check logs)
- [ ] Devil's Ward activates (check logs)
- [ ] First Strike overrides turn order
- [ ] Extra Reroll adds to reroll count

### Edge Cases
- [ ] Can't attack/defend with no-score roll
- [ ] Can't reroll with 0 rerolls left
- [ ] HP doesn't go below 0
- [ ] HP doesn't exceed max when healing
- [ ] Round doesn't exceed maxRounds
- [ ] Restart resets everything
- [ ] Victory at round 5 goes to victory screen, not next round

---

## Quick Reference

### File Locations (Modular Version)

```
Constants: src/constants/gameConfig.js
Dice Logic: src/utils/diceLogic.js
Economy: src/utils/economy.js
Audio: src/utils/audio.js
Game State: src/hooks/useGameState.js
Combat Logic: src/hooks/useCombat.js
Main Game: src/components/Game.jsx
Screens: src/components/screens/
UI Components: src/components/ui/
```

### Key Functions

**Dice:**
- `rollDice(count, hasLoadedDice, hasHighRoller)` - Generate dice
- `analyzeCeeloRoll(dice, pointBoost, hasAceSaver, usedAceSaver)` - Determine roll type
- `applyLuckModifiers(dice, luckyClover, devilsWard, addLog)` - Apply luck

**Economy:**
- `processPowerupPurchase(powerupKey, gameState)` - Buy powerup
- `getVictoryRewards(round)` - Calculate rewards
- `getEnemyHP(round, playerHP)` - Calculate enemy HP

**Combat:**
- `startRound()` - Initialize combat
- `executePlayerTurn()` - Start player turn
- `executeEnemyTurn(callback)` - Run enemy turn
- `performEnemyRoll(callback)` - Enemy rolls with auto-reroll

**Actions:**
- `playerRollDice()` - Player rolls
- `attack()` - Deal damage to enemy
- `defend()` - Heal self
- `reroll()` - Manual reroll

**Game Flow:**
- `victory()` - Handle round victory
- `defeat()` - Handle defeat
- `restart()` - Reset game

---

## Final Notes for LLMs

When working on this project:

1. **Always read this document first** before making changes
2. **Test the full game loop** after changes (don't just test one screen)
3. **Watch for state management issues** - React state updates are async
4. **Check both versions** - original single-file and modular app
5. **Log extensively** during debugging - use `addLog()` liberally
6. **Respect the dice rules** - Cee-Lo has strict combinations
7. **Test edge cases** - especially around 1-2-3, 4-5-6, and no-score
8. **Price scaling is complex** - apply both individual AND global
9. **Turn order matters** - test both enemy-first and player-first rounds
10. **Don't break the core loop** - the game must be fun!

Remember: The goal is a strategic, engaging roguelike where every decision matters. Players should feel challenged but not hopeless, and builds should feel impactful.

Good luck! 🎲
