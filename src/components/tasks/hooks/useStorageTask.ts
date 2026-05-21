import { useState, useRef, useEffect } from 'react';
import { synthSFX } from '../../../utils/sound';

interface UseStorageTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export function useStorageTask({ onComplete, isCompleted }: UseStorageTaskProps) {
  const [fuelLevel, setFuelLevel] = useState(0);
  const [refuelState, setRefuelState] = useState<'idle' | 'refueling' | 'completed'>('idle');
  const fuelTimerRef = useRef<NodeJS.Timeout | null>(null);

  const playLocalSound = (freq: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth', duration: number, volume = 0.05) => {
    synthSFX.playTone(freq, type, duration, volume);
  };
  const playBeep = () => synthSFX.playBeep();
  const playSuccessTune = () => {
    synthSFX.playTone(523.25, 'sine', 0.3, 0.04);
    setTimeout(() => synthSFX.playTone(659.25, 'sine', 0.3, 0.04), 100);
    setTimeout(() => synthSFX.playTone(783.99, 'sine', 0.5, 0.04), 200);
  };

  const startRefueling = () => {
    if (refuelState === 'completed') return;
    setRefuelState('refueling');
    playBeep();
    fuelTimerRef.current = setInterval(() => {
      setFuelLevel((prev) => {
        if (prev >= 100) {
          if (fuelTimerRef.current) clearInterval(fuelTimerRef.current);
          fuelTimerRef.current = null;
          setRefuelState('completed');
          onComplete();
          playSuccessTune();
          return 100;
        }
        if (prev % 12 === 0) playLocalSound(300 + prev * 2, 'square', 0.08, 0.03);
        return prev + 4;
      });
    }, 80);
  };

  const stopRefueling = () => {
    if (refuelState === 'refueling') setRefuelState('idle');
    if (fuelTimerRef.current) {
      clearInterval(fuelTimerRef.current);
      fuelTimerRef.current = null;
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (fuelTimerRef.current) clearInterval(fuelTimerRef.current);
    };
  }, []);

  // Handle skip game via props
  useEffect(() => {
    if (isCompleted && refuelState !== 'completed') {
      setRefuelState('completed');
      setFuelLevel(100);
    }
  }, [isCompleted, refuelState]);

  return {
    fuelLevel,
    refuelState,
    startRefueling,
    stopRefueling
  };
}
