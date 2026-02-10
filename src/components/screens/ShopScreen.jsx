import ShopItem from '../ui/ShopItem';
import { POWERUP_INFO } from '../../constants/gameConfig';
import './ShopScreen.css';

const ShopScreen = ({ gameState, onBuyPowerup, onContinue, playSound }) => {
  const powerupKeys = Object.keys(POWERUP_INFO);

  return (
    <div className="card-8bit pixel-border">
      <h2 className="title">💰 POWERUP SHOP</h2>
      <p className="subtitle">Round {gameState.round} - {gameState.gold} Gold</p>

      <div className="shop-grid">
        {powerupKeys.map(key => {
          const info = POWERUP_INFO[key];
          const price = gameState.prices[key];
          const count = gameState.powerups[key];
          const canAfford = gameState.gold >= price;
          
          return (
            <ShopItem
              key={key}
              icon={info.icon}
              name={info.name}
              count={count}
              description={info.description}
              price={price}
              onBuy={() => {
                onBuyPowerup(key);
                playSound('buy');
              }}
              canAfford={canAfford}
              buttonClass={info.consumable ? 'button-warning' : 'button-success'}
            />
          );
        })}
      </div>

      <div className="action-buttons" style={{ marginTop: '20px' }}>
        <button 
          className="button-8bit button-success" 
          onClick={() => { 
            playSound('click'); 
            onContinue(); 
          }}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export default ShopScreen;
