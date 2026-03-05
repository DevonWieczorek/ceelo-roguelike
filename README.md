# Cee-Lo Roguelike - Organized React App

This is the **fully refactored** version of the single-file Cee-Lo Roguelike game, organized into a proper React application structure with modular components and CSS.

## ✅ Project Complete!

All components have been created and the game is ready to run!

## Quick Start

```bash
yarn install
yarn dev
```

Open `http://localhost:3000` in your browser.

## File Structure

```
ceelo-roguelike/
├── index.html                    ✅ HTML entry point (project root, required by Vite)
├── src/
│   ├── components/
│   │   ├── Game.jsx            ✅ Main game orchestrator
│   │   ├── screens/
│   │   │   ├── MenuScreen.jsx  ✅ + MenuScreen.css
│   │   │   ├── PreRoundScreen.jsx ✅ + PreRoundScreen.css
│   │   │   ├── CombatScreen.jsx ✅ + CombatScreen.css
│   │   │   ├── ShopScreen.jsx  ✅ + ShopScreen.css
│   │   │   ├── VictoryScreen.jsx ✅ + VictoryScreen.css
│   │   │   └── DefeatScreen.jsx ✅ + DefeatScreen.css
│   │   ├── ui/
│   │   │   ├── Dice.jsx        ✅ + Dice.css
│   │   │   ├── HPBar.jsx       ✅ + HPBar.css
│   │   │   ├── StatBox.jsx     ✅
│   │   │   ├── ShopItem.jsx    ✅ + ShopItem.css
│   │   │   └── RulesModal.jsx  ✅ + RulesModal.css
│   │   └── layout/
│   │       ├── SoundToggle.jsx ✅
│   │       ├── HelpButton.jsx  ✅
│   │       └── CombatLog.jsx   ✅ + CombatLog.css
│   ├── hooks/
│   │   ├── useGameState.js     ✅ Game state management
│   │   ├── useAudio.js         ✅ Audio system
│   │   ├── useCombat.js        ✅ Combat logic & turn system
│   │   └── useLog.js           ✅ Combat log management
│   ├── utils/
│   │   ├── diceLogic.js        ✅ Roll analysis, luck modifiers
│   │   ├── audio.js            ✅ Procedural sound generation
│   │   └── economy.js          ✅ Price calculations, purchases
│   ├── constants/
│   │   └── gameConfig.js       ✅ All game configuration
│   ├── styles/
│   │   └── globalStyles.js     ✅ Global styles only
│   ├── main.jsx                ✅ React entry point
│   └── App.jsx                 ✅ Root component
├── package.json                ✅ Dependencies
├── vite.config.js              ✅ Vite configuration
└── README.md                   ✅ This file
```

## Modular CSS Architecture

Each component has its own CSS file co-located with it:

**Component Styles:**
- `Dice.css` - Die animations (pulse, shake, glow, rolling)
- `HPBar.css` - Health bar gradients and transitions
- `FloatingNumber.css` - Floating damage/heal number animations
- `ShopItem.css` - Shop item flex layout
- `CombatLog.css` - Scrollable log with color coding
- `RulesModal.css` - Modal overlay and rules sections

**Screen Styles:**
- `MenuScreen.css` - Powerup badge grid
- `PreRoundScreen.css` - Roll result styling
- `CombatScreen.css` - Responsive sidebar layout, dice container, action buttons, mobile compact views
- `ShopScreen.css` - Shop grid layout
- `VictoryScreen.css` - Victory powerup display
- `DefeatScreen.css` - Defeat powerup display

**Global Styles (`globalStyles.js`):**
- Base typography (Press Start 2P font)
- Color scheme (#1a1a2e background)
- Button variants (success, warning, danger)
- Layout containers and pixel borders
- Fixed position elements (sound toggle, help button)

## Component Architecture

### Core Components

**Game.jsx** - Main orchestrator
- Manages all game state via hooks
- Handles game flow (victory, defeat, restart)
- Routes to appropriate screens
- Coordinates combat logic

### Screen Components

**MenuScreen** - Main menu
- Props: `gameState`, `activePowerups`, `onStartRound`, `onVisitShop`
- Displays stats and powerups
- Start round or visit shop

**PreRoundScreen** - Pre-combat setup
- Props: `gameState`, `activePowerups`, `onBeginCombat`, `onBackToMenu`, `onUseFirstStrike`, `playSound`
- Preview enemy HP
- Use consumable items (First Strike)
- Begin combat

**CombatScreen** - Combat interface
- Props: `gameState`, `combat`, `dice`, `enemyDice`, `rollResult`, `enemyRollResult`, `canPlayerRoll`, `playerHasRolled`, `wildDieUsed`, `pendingWildDie`, handlers
- Desktop: 2-column layout with right sidebar (HP bars, stats) + main area (dice, actions)
- Mobile: compact stacked layout with inline HP bars, collapsible enemy roll, and inventory below action buttons
- Roll dice, attack, defend, reroll
- Wild Die clicking

**ShopScreen** - Powerup shop
- Props: `gameState`, `onBuyPowerup`, `onContinue`, `playSound`
- Lists all powerups with prices
- Buy powerups
- Continue to menu

**VictoryScreen** - Victory screen
- Props: `gameState`, `activePowerups`, `onNewRun`, `onShop`, `playSound`
- Shows final stats
- Lists acquired powerups
- New run or shop

**DefeatScreen** - Defeat screen
- Props: `gameState`, `activePowerups`, `onNewRun`, `onMainMenu`, `playSound`
- Shows stats at death
- Lists acquired powerups
- New run or main menu

### UI Components

**Dice** - Individual die
- Props: `value`, `type`, `isPointDie`, `isPairDie`, `onClick`, `clickable`, `isRolling`
- Styled based on roll type
- Point die renders larger, pair dice render smaller
- Clickable for Wild Die powerup
- Rolling animation cycles random values before settling

**FloatingNumber** - Floating damage/heal number
- Props: `value`, `onDone`
- Positive value = green heal, negative = red damage
- Floats upward and fades out over 1s

**HPBar** - Health bar
- Props: `current`, `max`, `label`, `type`
- Animated width transitions
- Player (green) or enemy (red) gradient

**StatBox** - Stat display box
- Props: `label`, `value`, `icon`, `special`
- Displays any stat with icon
- Special styling (e.g., gold color)

**ShopItem** - Shop item row
- Props: `icon`, `name`, `count`, `description`, `price`, `onBuy`, `canAfford`, `buttonClass`
- Shows powerup info and price
- Purchase button

**RulesModal** - Help overlay
- Props: `onClose`, `playSound`
- Comprehensive game rules
- Scrollable modal
- Click outside to close

### Layout Components

**SoundToggle** - Fixed sound button
- Props: `soundEnabled`, `onToggle`
- Bottom-left corner
- Toggles sound on/off

**HelpButton** - Fixed help button
- Props: `onClick`
- Bottom-right corner
- Opens rules modal

**CombatLog** - Combat log
- Props: `log`, `logRef`
- Scrollable log
- Color-coded entries
- Auto-scrolls to bottom

## Custom Hooks

**useGameState** - Game state management
- Returns: `gameState`, `setGameState`, `updateGameState`, `restart`
- Manages gold, HP, damage, round, powerups, prices
- Restart resets to defaults

**useAudio** - Sound system
- Returns: `soundEnabled`, `toggleSound`, `playSound`
- Creates audio context
- Plays procedural sounds

**useCombat** - Combat state & turn logic
- Returns: combat state, dice, results, turn functions
- Manages turn order (enemy first / player first alternating)
- Executes enemy and player turns
- Handles auto-reroll on no-score

**useLog** - Combat log
- Returns: `log`, `addLog`, `clearLog`, `logRef`
- Manages log array
- Auto-scrolls to bottom on updates

## Key Features

### Modular CSS Benefits
✅ **Co-location** - Styles next to components
✅ **Maintainability** - Easy to find and update
✅ **Scoped** - Each component owns its styles
✅ **Reusability** - Global styles for common patterns
✅ **Performance** - Only load styles needed

### Advantages Over Single File
✅ **Organization** - Clear folder structure
✅ **Maintainability** - Easy to find and edit
✅ **Testing** - Test components individually
✅ **Reusability** - Import components across projects
✅ **Collaboration** - Multiple developers can work simultaneously
✅ **IDE Support** - Better autocomplete and refactoring
✅ **Build Optimization** - Vite tree-shaking and code splitting

### Trade-offs vs Single File
❌ **More Files** - Requires navigation
❌ **Build Tools** - Needs Vite setup
❌ **Not Portable** - Can't share single file
❌ **Setup Time** - More initial overhead

## Development

### Available Scripts

```bash
yarn dev         # Start development server
yarn build       # Build for production
yarn preview     # Preview production build
yarn deploy      # Deploy to GitHub Pages
```

### Adding New Powerups

1. Add to `POWERUP_INFO` in `constants/gameConfig.js`
2. Add to `INITIAL_PRICES` in `constants/gameConfig.js`
3. Add to initial state in `hooks/useGameState.js`
4. Add to `restart()` function in `useGameState.js`
5. Add logic in appropriate component (e.g., `CombatScreen.jsx`)
6. Update `RulesModal.jsx` with description

### Testing Checklist

- [ ] All screens render correctly
- [ ] Can navigate between screens
- [ ] Combat rolls work (player and enemy)
- [ ] Attack/Defend/Reroll work
- [ ] Powerups can be purchased
- [ ] Powerups affect gameplay
- [ ] Audio plays on actions
- [ ] Victory advances to next round
- [ ] Defeat shows defeat screen
- [ ] Restart resets everything
- [ ] Turn order alternates
- [ ] First Strike works
- [ ] Wild Die clickable
- [ ] Luck modifiers activate

## Differences from Original

### Evolved Gameplay
- Core dice mechanics preserved
- Same powerups, rebalanced economy (see Balance Changes)
- Extended from 5 to 10 rounds
- Responsive layout for desktop and mobile

### New Architecture
- 30+ separate files vs 1 file
- Modular CSS vs inline styles
- Custom hooks for logic
- Component-based UI
- Vite build system

## Balance Changes (10-Round Update)

The game was extended from 5 to 10 rounds with the following rebalancing:

- **Enemy HP scaling softened**: Changed from quadratic (`round^2 * 2`) to sub-quadratic (`round^1.5 * 3`) so late-round enemies are challenging but not insurmountable
- **Victory rewards improved**: HP and damage rewards now scale linearly with round (`2 + round` DMG, `3 + round` HP) instead of half-round, so the player can keep pace with enemy scaling
- **Shop inflation reduced**: Global price inflation dropped from 2% to 1% per purchase so the shop stays relevant in later rounds

## Next Steps

### Possible Enhancements
1. **Persistence** - localStorage for save files
2. **More Powerups** - Expand the shop
3. **Enemy Types** - Different enemy abilities
4. **Achievements** - Track player progress
5. **Testing** - Unit tests with Vitest

### Performance
- No performance issues expected
- Vite handles optimization automatically
- React re-renders are minimal (proper state management)
- Styles are scoped and lightweight

## Resources

- **Original File**: `dice-roguelike-ceelo.jsx` (reference implementation)
- **Documentation**: `CEELO_ROGUELIKE_DOCUMENTATION.md` (complete game guide)
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

## License

Same as original single-file version.

---

**Ready to Play!** 🎲

Run `yarn install && yarn dev` and start rolling!
