import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "../store/useGameStore";
import { synthSFX } from "../utils/sound";

export function useGameState() {
  const {
    showCinematic,
    showVictory,
    setShowVictory,
    completedCount,
    totalTasks,
    startIntroSequence,
  } = useGameStore(
    useShallow((state) => ({
      showCinematic: state.showCinematic,
      showVictory: state.showVictory,
      setShowVictory: state.setShowVictory,
      completedCount: state.completedCount,
      totalTasks: state.totalTasks,
      startIntroSequence: state.startIntroSequence,
    })),
  );

  // Initial cinematic splash on load
  useEffect(() => {
    if (showCinematic) {
      startIntroSequence();
    }
  }, [startIntroSequence, showCinematic]);

  // 5. Victory Condition Check
  useEffect(() => {
    if (totalTasks > 0 && completedCount === totalTasks && !showCinematic) {
      if (!showVictory) {
        setShowVictory(true);
        synthSFX.playSuccess();
      }
    }
  }, [completedCount, totalTasks, showCinematic, showVictory, setShowVictory]);

  return {
    startIntroSequence,
  };
}
