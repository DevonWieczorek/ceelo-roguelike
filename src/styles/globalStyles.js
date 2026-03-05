export const globalStyles = `
  :root {
    /* Colors */
    --color-bg: #1a1a2e;
    --color-surface: #16213e;
    --color-surface-deep: #0f3460;
    --color-danger: #e94560;
    --color-danger-hover: #ff5577;
    --color-success: #2ecc71;
    --color-success-hover: #3ae67b;
    --color-success-dark: #27ae60;
    --color-warning: #f39c12;
    --color-warning-hover: #ffb84d;
    --color-warning-dark: #e67e22;
    --color-error: #e74c3c;
    --color-error-dark: #c0392b;
    --color-point: #3498db;
    --color-point-dark: #2980b9;
    --color-text: #eee;
    --color-text-light: #fff;
    --color-text-muted: #ccc;
    --color-text-dim: #aaa;
    --color-text-label: #888;
    --color-text-disabled: #555;
    --color-gold: #f39c12;

    /* Spacing */
    --space-2xs: 4px;
    --space-xs: 8px;
    --space-sm: 10px;
    --space-md: 15px;
    --space-lg: 20px;
    --space-xl: 30px;
    --space-2xl: 40px;
    --space-3xl: 120px;

    /* Font sizes */
    --font-2xs: 7px;
    --font-xs: 8px;
    --font-sm: 10px;
    --font-md: 14px;
    --font-lg: 20px;
    --font-xl: 24px;
    --font-2xl: 32px;

    /* Shadows */
    --shadow-pixel-border:
      0 0 0 2px var(--color-surface),
      0 0 0 4px var(--color-surface-deep),
      4px 4px 0 4px rgba(0,0,0,0.3);
    --shadow-button:
      inset -4px -4px 0 0 rgba(0,0,0,0.2),
      inset 4px 4px 0 0 rgba(255,255,255,0.2),
      0 0 0 2px var(--color-surface),
      4px 4px 0 2px rgba(0,0,0,0.3);
    --shadow-button-hover:
      inset -4px -4px 0 0 rgba(0,0,0,0.2),
      inset 4px 4px 0 0 rgba(255,255,255,0.2),
      0 0 0 2px var(--color-surface),
      2px 2px 0 2px rgba(0,0,0,0.3);
    --shadow-button-active:
      inset -4px -4px 0 0 rgba(0,0,0,0.2),
      inset 4px 4px 0 0 rgba(255,255,255,0.2),
      0 0 0 2px var(--color-surface);
    --shadow-text-title: 4px 4px 0 rgba(0,0,0,0.3);
    --shadow-text-hp: 2px 2px 0 rgba(0,0,0,0.5);

    /* Transitions */
    --transition-fast: all 0.1s;
    --transition-normal: all 0.3s;
    --transition-hp: width 0.3s ease;
  }

  * {
    font-family: 'Press Start 2P', cursive;
  }

  body {
    margin: 0;
    padding: 0;
    background: var(--color-bg);
    color: var(--color-text);
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-lg);
  }

  @media (min-width: 768px) {
    .container {
      max-width: 1250px;
    }
  }

  .pixel-border {
    border: 4px solid var(--color-surface-deep);
    box-shadow: var(--shadow-pixel-border);
    image-rendering: pixelated;
  }

  .button-8bit {
    background: var(--color-danger);
    border: none;
    color: var(--color-text-light);
    padding: 12px 24px;
    font-size: var(--font-sm);
    cursor: pointer;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-shadow: var(--shadow-button);
    transition: var(--transition-fast);
  }

  .button-8bit:hover {
    background: var(--color-danger-hover);
    transform: translate(2px, 2px);
    box-shadow: var(--shadow-button-hover);
  }

  .button-8bit:active {
    transform: translate(4px, 4px);
    box-shadow: var(--shadow-button-active);
  }

  .button-8bit:disabled {
    background: var(--color-text-disabled);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .button-success {
    background: var(--color-success);
  }

  .button-success:hover {
    background: var(--color-success-hover);
  }

  .button-warning {
    background: var(--color-warning);
  }

  .button-warning:hover {
    background: var(--color-warning-hover);
  }

  .button-danger {
    background: var(--color-danger);
  }

  .card-8bit {
    background: var(--color-surface);
    padding: var(--space-xl);
    margin: var(--space-lg) 0;
  }

  .title {
    font-size: var(--font-lg);
    text-align: center;
    color: var(--color-danger);
    text-shadow: var(--shadow-text-title);
    margin: 0 0 var(--space-lg) 0;
  }

  .subtitle {
    font-size: var(--font-sm);
    text-align: center;
    color: var(--color-text-dim);
    margin: -10px 0 var(--space-lg) 0;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
    margin: var(--space-lg) 0;
  }

  .stat-box {
    background: var(--color-surface-deep);
    padding: var(--space-md);
    text-align: center;
  }

  .stat-label {
    font-size: var(--font-xs);
    color: var(--color-text-label);
    margin-bottom: var(--space-xs);
  }

  .stat-value {
    font-size: var(--font-md);
    color: var(--color-text-light);
  }

  .stat-value.gold {
    color: var(--color-gold);
  }

  .sound-toggle {
    position: fixed;
    bottom: var(--space-lg);
    left: var(--space-lg);
    width: 50px;
    height: 50px;
    padding: 0;
    font-size: var(--font-lg);
    z-index: 1000;
  }

  .help-button {
    position: fixed;
    bottom: var(--space-lg);
    right: var(--space-lg);
    width: 50px;
    height: 50px;
    padding: 0;
    font-size: var(--font-lg);
    z-index: 1000;
  }

  /* Utility classes */
  .text-danger { color: var(--color-danger); }
  .text-success { color: var(--color-success); }
  .text-warning { color: var(--color-warning); }
  .text-muted { color: var(--color-text-label); }

  .title-victory { color: var(--color-success); }

  .powerups-section { margin-top: var(--space-lg); }

  .screen-transition {
    animation: screenFadeIn 0.25s ease-out;
  }

  @keyframes screenFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
