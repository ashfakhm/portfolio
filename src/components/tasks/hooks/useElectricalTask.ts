import { useState } from "react";
import { synthSFX } from "../../../utils/sound";

interface UseElectricalTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export function useElectricalTask({
	onComplete,
	isCompleted,
}: UseElectricalTaskProps) {
	const [wireConnections, setWireConnections] = useState<
		Record<string, string>
	>({});
	const [activeWireDrag, setActiveWireDrag] = useState<string | null>(null);
	const [rightWireColors] = useState<string[]>(() =>
		["red", "blue", "yellow", "pink"].sort(() => Math.random() - 0.5),
	);

	const playWireSpark = () => synthSFX.playTone(80, "sawtooth", 0.1, 0.05);
	const playBeep = () => synthSFX.playBeep();
	const playLocalSound = (
		freq: number,
		type: "sine" | "square" | "triangle" | "sawtooth",
		duration: number,
		volume = 0.05,
	) => {
		synthSFX.playTone(freq, type, duration, volume);
	};
	const playSuccessTune = () => {
		synthSFX.playTone(523.25, "sine", 0.3, 0.04);
		setTimeout(() => synthSFX.playTone(659.25, "sine", 0.3, 0.04), 100);
		setTimeout(() => synthSFX.playTone(783.99, "sine", 0.5, 0.04), 200);
	};

	const handleLeftWireClick = (color: string) => {
		playWireSpark();
		setActiveWireDrag(color);
	};

	const handleRightWireClick = (color: string) => {
		if (!activeWireDrag) return;
		if (activeWireDrag === color) {
			setWireConnections((prev) => {
				const next = { ...prev, [color]: color };
				if (Object.keys(next).length === 4) {
					onComplete();
					playSuccessTune();
				}
				return next;
			});
			playBeep();
			setActiveWireDrag(null);
		} else {
			playLocalSound(160, "square", 0.2, 0.05);
			setActiveWireDrag(null);
		}
	};

	const displayedConnections = isCompleted
		? { red: "red", blue: "blue", yellow: "yellow", pink: "pink" }
		: wireConnections;

	return {
		wireConnections: displayedConnections,
		activeWireDrag,
		rightWireColors,
		handleLeftWireClick,
		handleRightWireClick,
	};
}
