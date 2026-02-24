import './ShopItem.css';

const ShopItem = ({ icon, name, count, description, price, onBuy, canAfford, buttonClass = 'button-success' }) => {
  return (
    <div className="shop-item pixel-border">
      <div>
        <div className="shop-item-name">
          {icon} {name.toUpperCase()} ({count})
        </div>
        <div className="stat-label">{description}</div>
      </div>
      <button
        className={`button-8bit ${buttonClass}`}
        onClick={onBuy}
        disabled={!canAfford}
      >
        {price}g
      </button>
    </div>
  );
};

export default ShopItem;
