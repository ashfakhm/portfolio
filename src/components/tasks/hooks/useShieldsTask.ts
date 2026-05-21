import { useState, useEffect } from 'react';
import { synthSFX } from '../../../utils/sound';

interface UseShieldsTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export function useShieldsTask({ onComplete, isCompleted }: UseShieldsTaskProps) {
  const [shieldsState, setShieldsState] = useState<boolean[]>([false, false, false, false, false, false]);

  const playShieldClick = () => synthSFX.playTone(400, 'triangle', 0.1, 0.05);
  const playSuccessTune = () => {
    synthSFX.playTone(523.25, 'sine', 0.3, 0.04);
    setTimeout(() => synthSFX.playTone(659.25, 'sine', 0.3, 0.04), 100);
    setTimeout(() => synthSFX.playTone(783.99, 'sine', 0.5, 0.04), 200);
  };

  // Handle skip game via props
  useEffect(() => {
    if (isCompleted && shieldsState.includes(false)) {
      setShieldsState([true, true, true, true, true, true]);
    }
  }, [isCompleted, shieldsState]);

  const toggleShield = (idx: number) => {
    playShieldClick();
    setShieldsState(prev => {
      const next = [...prev];
      next[idx] = !next[idx]; // toggle shield
      if (!next.includes(false)) {
        onComplete();
        playSuccessTune();
      }
      return next;
    });
  };

  return {
    shieldsState,
    toggleShield
  };
}
