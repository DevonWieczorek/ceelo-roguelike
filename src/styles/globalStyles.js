export const globalStyles = `
  * {
    font-family: 'Press Start 2P', cursive;
  }
  
  body {
    margin: 0;
    padding: 0;
    background: #1a1a2e;
    color: #eee;
  }
  
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .pixel-border {
    border: 4px solid #0f3460;
    box-shadow: 
      0 0 0 2px #16213e,
      0 0 0 4px #0f3460,
      4px 4px 0 4px rgba(0,0,0,0.3);
    image-rendering: pixelated;
  }
  
  .button-8bit {
    background: #e94560;
    border: none;
    color: white;
    padding: 12px 24px;
    font-size: 10px;
    cursor: pointer;
    position: relative;
    box-shadow: 
      inset -4px -4px 0 0 rgba(0,0,0,0.2),
      inset 4px 4px 0 0 rgba(255,255,255,0.2),
      0 0 0 2px #16213e,
      4px 4px 0 2px rgba(0,0,0,0.3);
    transition: all 0.1s;
  }
  
  .button-8bit:hover {
    background: #ff5577;
    transform: translate(2px, 2px);
    box-shadow: 
      inset -4px -4px 0 0 rgba(0,0,0,0.2),
      inset 4px 4px 0 0 rgba(255,255,255,0.2),
      0 0 0 2px #16213e,
      2px 2px 0 2px rgba(0,0,0,0.3);
  }
  
  .button-8bit:active {
    transform: translate(4px, 4px);
    box-shadow: 
      inset -4px -4px 0 0 rgba(0,0,0,0.2),
      inset 4px 4px 0 0 rgba(255,255,255,0.2),
      0 0 0 2px #16213e;
  }
  
  .button-8bit:disabled {
    background: #555;
    cursor: not-allowed;
    opacity: 0.5;
  }
  
  .button-success {
    background: #2ecc71;
  }
  
  .button-success:hover {
    background: #3ae67b;
  }
  
  .button-warning {
    background: #f39c12;
  }
  
  .button-warning:hover {
    background: #ffb84d;
  }
  
  .button-danger {
    background: #e94560;
  }
  
  .card-8bit {
    background: #16213e;
    padding: 30px;
    margin: 20px 0;
  }
  
  .title {
    font-size: 20px;
    text-align: center;
    color: #e94560;
    text-shadow: 4px 4px 0 rgba(0,0,0,0.3);
    margin: 0 0 20px 0;
  }
  
  .subtitle {
    font-size: 10px;
    text-align: center;
    color: #aaa;
    margin: -10px 0 20px 0;
  }
  
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin: 20px 0;
  }
  
  .stat-box {
    background: #0f3460;
    padding: 15px;
    text-align: center;
  }
  
  .stat-label {
    font-size: 8px;
    color: #888;
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 14px;
    color: #fff;
  }
  
  .stat-value.gold {
    color: #f39c12;
  }
  
  .sound-toggle {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 50px;
    height: 50px;
    padding: 0;
    font-size: 20px;
    z-index: 1000;
  }
  
  .help-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    padding: 0;
    font-size: 20px;
    z-index: 1000;
  }
`;
