import './Dice.css';

const Dice = ({ value, type, isPointDie, onClick, clickable }) => {
  const getClassNames = () => {
    let classes = 'die pixel-border';
    if (type === 'trips') classes += ' trips';
    if (type === 'cursed') classes += ' cursed';
    if (type === 'instant_win') classes += ' instant-win';
    if (isPointDie) classes += ' point-die';
    return classes;
  };

  return (
    <div
      className={getClassNames()}
      onClick={clickable ? onClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      {value}
    </div>
  );
};

export default Dice;
