import { useEffect } from 'react';

interface UseSecurityTaskProps {
  onComplete: () => void;
}

export function useSecurityTask({ onComplete }: UseSecurityTaskProps) {
  useEffect(() => {
    // Security has no real task to complete, it completes immediately so the X button works
    onComplete();
  }, [onComplete]);
}
