import { useState, useRef, useEffect } from 'react';
import { createAudioContext, playSound as playSoundUtil } from '../utils/audio';

export const useAudio = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
  }, [soundEnabled]);

  const playSound = (type) => {
    if (soundEnabled && audioContextRef.current) {
      playSoundUtil(audioContextRef.current, type);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  return {
    soundEnabled,
    toggleSound,
    playSound
  };
};
