import './Dice.css';

const Dice = ({ value, type, isPointDie, isPairDie, onClick, clickable, isRolling }) => {
  const getClassNames = () => {
    let classes = 'die pixel-border';
    if (isRolling) return classes + ' die-rolling';
    if (type === 'trips') classes += ' trips';
    if (type === 'cursed') classes += ' cursed';
    if (type === 'instant_win') classes += ' instant-win';
    if (isPointDie) classes += ' point-die';
    if (isPairDie) classes += ' pair-die';
    if (clickable) classes += ' die-clickable';
    return classes;
  };

  return (
    <div
      className={getClassNames()}
      onClick={clickable ? onClick : undefined}
    >
      {value}
    </div>
  );
};

export default Dice;
