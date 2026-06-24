import { useState } from "react";
import { playSuccessTune, synthSFX } from "../../../utils/sound";

interface UseShieldsTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

const playShieldClick = () => synthSFX.playTone(400, "triangle", 0.1, 0.05);

export function useShieldsTask({
	onComplete,
	isCompleted,
}: UseShieldsTaskProps) {
	const [shieldsState, setShieldsState] = useState<boolean[]>([
		false,
		false,
		false,
		false,
		false,
		false,
	]);

	const toggleShield = (idx: number) => {
		playShieldClick();
		setShieldsState((prev) => {
			const next = [...prev];
			next[idx] = !next[idx]; // toggle shield
			if (!next.includes(false)) {
				onComplete();
				playSuccessTune();
			}
			return next;
		});
	};

	const displayedShields = isCompleted
		? [true, true, true, true, true, true]
		: shieldsState;

	return {
		shieldsState: displayedShields,
		toggleShield,
	};
}
