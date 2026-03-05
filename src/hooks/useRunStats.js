import { useState } from 'react';

const STORAGE_KEY = 'ceeloRunStats';

const defaultStats = {
  totalRuns: 0,
  wins: 0,
  losses: 0,
  highestRound: 0,
  totalGoldEarned: 0,
};

const loadStats = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultStats, ...JSON.parse(raw) } : { ...defaultStats };
  } catch {
    return { ...defaultStats };
  }
};

const saveStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // silently fail (e.g. private browsing)
  }
};

export const useRunStats = () => {
  const [runStats, setRunStats] = useState(loadStats);

  const recordRun = ({ won, finalRound, finalGold }) => {
    setRunStats(prev => {
      const next = {
        totalRuns: prev.totalRuns + 1,
        wins: prev.wins + (won ? 1 : 0),
        losses: prev.losses + (won ? 0 : 1),
        highestRound: Math.max(prev.highestRound, finalRound),
        totalGoldEarned: prev.totalGoldEarned + finalGold,
      };
      saveStats(next);
      return next;
    });
  };

  return { runStats, recordRun };
};
