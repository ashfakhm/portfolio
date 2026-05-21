import { useEffect } from 'react';

interface UseCafeteriaTaskProps {
  onComplete: () => void;
}

export function useCafeteriaTask({ onComplete }: UseCafeteriaTaskProps) {
  useEffect(() => {
    // Cafeteria has no real task to complete, it completes immediately so the X button works
    onComplete();
  }, [onComplete]);
}
