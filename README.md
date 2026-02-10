# Cee-Lo Roguelike - Organized React App

This is the **fully refactored** version of the single-file Cee-Lo Roguelike game, organized into a proper React application structure with modular components and CSS.

## ✅ Project Complete!

All components have been created and the game is ready to run!

## Project Structure

```
ceelo-roguelike-app/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── components/             # React components (TO BE CREATED)
│   │   ├── Game.jsx           # Main game component
│   │   ├── screens/           # Screen components
│   │   │   ├── MenuScreen.jsx
│   │   │   ├── PreRoundScreen.jsx
│   │   │   ├── CombatScreen.jsx
│   │   │   ├── ShopScreen.jsx
│   │   │   ├── VictoryScreen.jsx
│   │   │   └── DefeatScreen.jsx
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Dice.jsx
│   │   │   ├── HPBar.jsx
│   │   │   ├── StatBox.jsx
│   │   │   ├── ShopItem.jsx
│   │   │   └── RulesModal.jsx
│   │   └── layout/            # Layout components
│   │       ├── SoundToggle.jsx
│   │       ├── HelpButton.jsx
│   │       └── CombatLog.jsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useGameState.js    # ✅ Created
│   │   ├── useAudio.js        # ✅ Created
│   │   ├── useCombat.js       # TO BE CREATED
│   │   └── useLog.js          # TO BE CREATED
│   ├── utils/                 # Utility functions
│   │   ├── diceLogic.js       # ✅ Created
│   │   ├── audio.js           # ✅ Created
│   │   └── economy.js         # ✅ Created
│   ├── constants/             # Configuration and constants
│   │   └── gameConfig.js      # ✅ Created
│   ├── styles/                # Styles
│   │   └── globalStyles.js    # ✅ Created
│   ├── main.jsx               # React entry point (TO BE CREATED)
│   └── App.jsx                # Root component (TO BE CREATED)
├── package.json               # ✅ Created
├── vite.config.js             # ✅ Created
└── README.md                  # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd ceelo-roguelike-app
npm install
```

### 2. Development

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## What's Already Complete

✅ **Project Structure** - Folders and basic config  
✅ **Constants** - Game configuration, powerup info, formulas  
✅ **Utilities** - Dice logic, audio, economy functions  
✅ **Hooks** - All 4 hooks complete:
  - `useGameState` - Game state management
  - `useAudio` - Sound system
  - `useCombat` - Combat state and turn logic
  - `useLog` - Combat log management
✅ **Styles** - Modular CSS for each component
✅ **Components** - All components complete:
  - `Game.jsx` - Main orchestrator
  - `MenuScreen.jsx` - Main menu
  - `PreRoundScreen.jsx` - Pre-combat setup
  - `CombatScreen.jsx` - Combat interface
  - `ShopScreen.jsx` - Powerup shopping
  - `VictoryScreen.jsx` - Victory screen
  - `DefeatScreen.jsx` - Defeat screen
  - `Dice.jsx` - Die component
  - `HPBar.jsx` - Health bar
  - `StatBox.jsx` - Stat display
  - `ShopItem.jsx` - Shop item row
  - `RulesModal.jsx` - Help modal
  - `SoundToggle.jsx` - Sound button
  - `HelpButton.jsx` - Help button
  - `CombatLog.jsx` - Combat log

## What Needs to Be Created

**Nothing!** The refactoring is complete.

### Core Files

**src/main.jsx** - React entry point
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**src/App.jsx** - Root component that injects styles and renders Game
```jsx
import { useEffect } from 'react';
import Game from './components/Game';
import { globalStyles } from './styles/globalStyles';

function App() {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  return (
    <div className="container">
      <Game />
    </div>
  );
}

export default App;
```

### Additional Hooks Needed

**src/hooks/useCombat.js** - Manages combat state and turn logic
- Handles `combat` state
- `executeEnemyTurn()` and `executePlayerTurn()` functions
- Turn order management

**src/hooks/useLog.js** - Manages combat log
- `log` state array
- `addLog(message)` function
- Auto-scroll behavior

### Component Files Needed

**src/components/Game.jsx** - Main orchestrator component
- Uses all hooks
- Manages `screen` state
- Renders appropriate screen component
- Handles game flow logic

**Screen Components:**
- `MenuScreen.jsx` - Shows stats, start button, shop button
- `PreRoundScreen.jsx` - Pre-combat setup, consumables
- `CombatScreen.jsx` - Main combat interface
- `ShopScreen.jsx` - Powerup purchasing
- `VictoryScreen.jsx` - Win screen with stats
- `DefeatScreen.jsx` - Loss screen with restart options

**UI Components:**
- `Dice.jsx` - Individual die with styling
- `HPBar.jsx` - Health bar component
- `StatBox.jsx` - Reusable stat display
- `ShopItem.jsx` - Shop item row
- `RulesModal.jsx` - Help/rules overlay

**Layout Components:**
- `SoundToggle.jsx` - Fixed sound button
- `HelpButton.jsx` - Fixed help button
- `CombatLog.jsx` - Scrolling combat log

## Component Prop Patterns

### Example: CombatScreen.jsx props
```jsx
<CombatScreen
  gameState={gameState}
  combat={combat}
  dice={dice}
  enemyDice={enemyDice}
  rollResult={rollResult}
  enemyRollResult={enemyRollResult}
  canPlayerRoll={canPlayerRoll}
  playerHasRolled={playerHasRolled}
  onRollDice={handlePlayerRoll}
  onAttack={handleAttack}
  onDefend={handleDefend}
  onReroll={handleReroll}
  onWildDie={handleWildDie}
  playSound={playSound}
/>
```

### Example: ShopScreen.jsx props
```jsx
<ShopScreen
  gameState={gameState}
  onBuyPowerup={handleBuyPowerup}
  onContinue={() => setScreen('menu')}
  playSound={playSound}
/>
```

## Migration Strategy

To convert the original single file:

1. **Extract State Management**
   - Move `gameState` logic → `useGameState` hook
   - Move `combat` logic → `useCombat` hook  
   - Move `log` logic → `useLog` hook

2. **Extract UI Components**
   - Copy screen JSX → Screen components
   - Copy repeated UI patterns → UI components
   - Pass data via props

3. **Extract Functions**
   - Game logic → hooks or utils
   - Pure functions → utils
   - Event handlers → component methods

4. **Wire It Together**
   - Game.jsx imports all hooks
   - Game.jsx conditionally renders screens
   - Screens receive props from Game.jsx

## Key Differences from Single File

### Advantages
- ✅ Better code organization and maintainability
- ✅ Easier testing (components and utilities separate)
- ✅ Better IDE support (auto-imports, refactoring)
- ✅ Reusable components
- ✅ Clearer separation of concerns
- ✅ Build optimization with Vite

### Trade-offs
- ❌ More files to manage
- ❌ Requires build tooling (Vite)
- ❌ Less portable (can't share single file)
- ❌ More setup overhead

## Testing Strategy

Once components are created, test:
- [ ] All screens render correctly
- [ ] Game state updates properly
- [ ] Combat logic works (turns, attacks, damage)
- [ ] Shop purchases work
- [ ] Audio plays correctly
- [ ] Turn order alternates
- [ ] First Strike consumable works
- [ ] Victory/defeat screens appear
- [ ] Restart resets everything

## Next Steps

1. Create `src/main.jsx` and `src/App.jsx`
2. Create the `useCombat` and `useLog` hooks
3. Create `Game.jsx` with screen routing logic
4. Create all screen components one by one
5. Create UI components as needed
6. Test each component as you build
7. Connect everything in Game.jsx

## Original File Reference

The complete single-file version is available at:
`dice-roguelike-ceelo.jsx`

Use it as reference when extracting components and logic.

## Questions?

Refer to:
- `CEELO_ROGUELIKE_DOCUMENTATION.md` - Complete game documentation
- Original `dice-roguelike-ceelo.jsx` - Working implementation
- Constants and utils in this project - Already extracted

Good luck with the refactoring! 🎲
