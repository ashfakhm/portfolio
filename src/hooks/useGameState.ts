import { useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import { synthSFX } from "../utils/sound";

export function useGameState() {
	const {
		showCinematic,
		showVictory,
		setShowVictory,
		completedTasks,
		setCompletedTasks,
		completedCount,
		totalTasks,
		startIntroSequence,
	} = useGameStore();

	// 1. Sync tasks with session storage on mount
	useEffect(() => {
		const saved = sessionStorage.getItem("completedTasks");
		if (saved) {
			try {
				setCompletedTasks(JSON.parse(saved));
			} catch (_e) {}
		}
	}, [setCompletedTasks]);

	// 2. Sync tasks to session storage on change
	useEffect(() => {
		sessionStorage.setItem("completedTasks", JSON.stringify(completedTasks));
	}, [completedTasks]);

	// 3. Initial cinematic splash on load
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
