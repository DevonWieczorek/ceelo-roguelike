import { SOUND_TYPES } from '../constants/gameConfig';

/**
 * Creates and initializes the audio context
 */
export const createAudioContext = () => {
  if (typeof window === 'undefined') return null;
  return new (window.AudioContext || window.webkitAudioContext)();
};

/**
 * Plays a procedural sound effect
 */
export const playSound = (audioContext, type) => {
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  switch (type) {
    case SOUND_TYPES.ATTACK:
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      oscillator.type = 'square';
      oscillator.start(now);
      oscillator.stop(now + 0.1);
      break;

    case SOUND_TYPES.DEFEND:
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.linearRampToValueAtTime(400, now + 0.2);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.type = 'sine';
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      break;

    case SOUND_TYPES.REROLL:
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.linearRampToValueAtTime(600, now + 0.05);
      oscillator.frequency.linearRampToValueAtTime(300, now + 0.1);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      oscillator.type = 'sawtooth';
      oscillator.start(now);
      oscillator.stop(now + 0.1);
      break;

    case SOUND_TYPES.TRIPS:
      // Multi-tone fanfare
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, now + i * 0.075);
        gain.gain.setValueAtTime(0.2, now + i * 0.075);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.075 + 0.3);
        osc.type = 'sine';
        osc.start(now + i * 0.075);
        osc.stop(now + i * 0.075 + 0.3);
      });
      return;

    case SOUND_TYPES.CURSED:
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.type = 'sawtooth';
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      break;

    case SOUND_TYPES.VICTORY:
      [262, 330, 392, 523].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
        osc.type = 'sine';
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
      });
      return;

    case SOUND_TYPES.BUY:
      oscillator.frequency.setValueAtTime(800, now);
      oscillator.frequency.linearRampToValueAtTime(1000, now + 0.15);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      oscillator.type = 'sine';
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      break;

    case SOUND_TYPES.CLICK:
      oscillator.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      oscillator.type = 'square';
      oscillator.start(now);
      oscillator.stop(now + 0.05);
      break;

    default:
      oscillator.stop(now);
      return;
  }
};
