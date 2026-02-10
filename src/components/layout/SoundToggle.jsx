const SoundToggle = ({ soundEnabled, onToggle }) => {
  return (
    <button
      className="sound-toggle button-8bit"
      onClick={onToggle}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );
};

export default SoundToggle;
