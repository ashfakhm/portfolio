import { useEffect, useRef, useState } from "react";
import { playSuccessTune, synthSFX } from "../../../utils/sound";

interface UseStorageTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

const playBeep = () => synthSFX.playBeep();

export function useStorageTask({
	onComplete,
	isCompleted,
}: UseStorageTaskProps) {
	const [fuelLevel, setFuelLevel] = useState(0);
	const [refuelState, setRefuelState] = useState<
		"idle" | "refueling" | "completed"
	>("idle");
	const fuelTimerRef = useRef<NodeJS.Timeout | null>(null);

	const startRefueling = () => {
		if (refuelState === "completed") return;
		setRefuelState("refueling");
		playBeep();
		fuelTimerRef.current = setInterval(() => {
			setFuelLevel((prev) => {
				if (prev >= 100) {
					if (fuelTimerRef.current) clearInterval(fuelTimerRef.current);
					fuelTimerRef.current = null;
					setRefuelState("completed");
					onComplete();
					playSuccessTune();
					return 100;
				}
				if (prev % 12 === 0)
					synthSFX.playTone(300 + prev * 2, "square", 0.08, 0.03);
				return prev + 4;
			});
		}, 80);
	};

	const stopRefueling = () => {
		if (refuelState === "refueling") setRefuelState("idle");
		if (fuelTimerRef.current) {
			clearInterval(fuelTimerRef.current);
			fuelTimerRef.current = null;
		}
	};

	// Cleanup interval on unmount
	useEffect(() => {
		const refCopy = fuelTimerRef;
		return () => {
			if (refCopy.current) clearInterval(refCopy.current);
		};
	}, []);

	const displayedFuelLevel = isCompleted ? 100 : fuelLevel;
	const displayedState = isCompleted ? "completed" : refuelState;

	return {
		fuelLevel: displayedFuelLevel,
		refuelState: displayedState,
		startRefueling,
		stopRefueling,
	};
}
