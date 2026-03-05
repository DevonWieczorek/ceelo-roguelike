import './FloatingNumber.css';

const FloatingNumber = ({ value, onDone }) => {
  const display = value > 0 ? `+${value}` : `${value}`;
  const type = value > 0 ? 'heal' : 'damage';

  return (
    <div className={`floating-number ${type}`} onAnimationEnd={onDone}>
      {display}
    </div>
  );
};

export default FloatingNumber;
