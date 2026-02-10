import { useState, useRef, useEffect } from 'react';

export const useLog = () => {
  const [log, setLog] = useState(['🎲 Welcome to Cee-lo Roguelike!']);
  const logRef = useRef(null);

  const addLog = (message) => {
    setLog(prev => [...prev, message]);
  };

  const clearLog = () => {
    setLog(['🎲 Welcome to Cee-lo Roguelike!']);
  };

  // Auto-scroll to bottom when log updates
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  return {
    log,
    addLog,
    clearLog,
    logRef,
  };
};
