import { useState } from "react";
import { playSuccessTune, synthSFX } from "../../../utils/sound";

interface UseElectricalTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

const playWireSpark = () => synthSFX.playTone(80, "sawtooth", 0.1, 0.05);
const playBeep = () => synthSFX.playBeep();

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
			synthSFX.playTone(160, "square", 0.2, 0.05);
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
