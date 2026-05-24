import { type PointerEvent, useCallback, useEffect, useState } from "react";
import { synthSFX } from "../../../utils/sound";

export const NODES = [
	{ x: 10, y: 50 },
	{ x: 35, y: 20 },
	{ x: 65, y: 80 },
	{ x: 90, y: 50 },
];

interface UseNavigationTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export function useNavigationTask({
	onComplete,
	isCompleted,
}: UseNavigationTaskProps) {
	const [currentNodeIndex, setCurrentNodeIndex] = useState(1);
	const [shipPos, setShipPos] = useState({ x: NODES[0].x, y: NODES[0].y });
	const [isDragging, setIsDragging] = useState(false);

	const playLocalSound = (
		freq: number,
		type: "sine" | "square" | "triangle" | "sawtooth",
		duration: number,
		volume = 0.05,
	) => {
		synthSFX.playTone(freq, type, duration, volume);
	};

	const playSuccessTune = useCallback(() => {
		synthSFX.playTone(523.25, "sine", 0.3, 0.04);
		setTimeout(() => synthSFX.playTone(659.25, "sine", 0.3, 0.04), 100);
		setTimeout(() => synthSFX.playTone(783.99, "sine", 0.5, 0.04), 200);
	}, []);

	// Handle skip game via props
	useEffect(() => {
		if (isCompleted && currentNodeIndex < NODES.length) {
			setCurrentNodeIndex(NODES.length);
			setShipPos({
				x: NODES[NODES.length - 1].x,
				y: NODES[NODES.length - 1].y,
			});
		}
	}, [isCompleted, currentNodeIndex]);

	const updateShipPosition = (e: PointerEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		let x = ((e.clientX - rect.left) / rect.width) * 100;
		let y = ((e.clientY - rect.top) / rect.height) * 100;

		x = Math.max(0, Math.min(100, x));
		y = Math.max(0, Math.min(100, y));

		setShipPos({ x, y });

		// Check collision with the next node
		if (currentNodeIndex < NODES.length) {
			const target = NODES[currentNodeIndex];
			// Normalize distance calculation to handle aspect ratio differences roughly
			const dx = x - target.x;
			const dy = (y - target.y) * (rect.height / rect.width);
			const dist = Math.sqrt(dx * dx + dy * dy);

			if (dist < 8) {
				// 8% threshold
				playLocalSound(400 + currentNodeIndex * 100, "sine", 0.1, 0.05);

				if (currentNodeIndex === NODES.length - 1) {
					setIsDragging(false);
					setShipPos({ x: target.x, y: target.y });
					setCurrentNodeIndex(NODES.length);
					onComplete();
					playSuccessTune();
				} else {
					setCurrentNodeIndex((prev) => prev + 1);
				}
			}
		}
	};

	const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (isCompleted || currentNodeIndex >= NODES.length) return;
		setIsDragging(true);
		e.currentTarget.setPointerCapture(e.pointerId);

		// Play grab sound
		playLocalSound(300, "sine", 0.05, 0.02);

		updateShipPosition(e);
	};

	const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (!isDragging || isCompleted || currentNodeIndex >= NODES.length) return;
		updateShipPosition(e);
	};

	const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
		if (!isDragging) return;
		setIsDragging(false);
		try {
			e.currentTarget.releasePointerCapture(e.pointerId);
		} catch (_err) {}

		// Snap back to last reached node
		if (currentNodeIndex < NODES.length) {
			const lastNode = NODES[currentNodeIndex - 1];
			setShipPos({ x: lastNode.x, y: lastNode.y });
			playLocalSound(200, "square", 0.1, 0.05);
		}
	};

	return {
		currentNodeIndex,
		shipPos,
		isDragging,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
	};
}
