import { type PointerEvent, useState } from "react";
import { playSuccessTune, synthSFX } from "../../../utils/sound";

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

const calculateRelativePosition = (
	clientX: number,
	clientY: number,
	rect: DOMRect,
) => {
	const x = Math.max(
		0,
		Math.min(100, ((clientX - rect.left) / rect.width) * 100),
	);
	const y = Math.max(
		0,
		Math.min(100, ((clientY - rect.top) / rect.height) * 100),
	);
	return { x, y };
};

const checkCollision = (
	x: number,
	y: number,
	target: { x: number; y: number },
	rect: DOMRect,
): boolean => {
	const dx = x - target.x;
	const dy = (y - target.y) * (rect.height / rect.width);
	return Math.sqrt(dx * dx + dy * dy) < 8;
};

export function useNavigationTask({
	onComplete,
	isCompleted,
}: UseNavigationTaskProps) {
	const [currentNodeIndex, setCurrentNodeIndex] = useState(1);
	const [shipPos, setShipPos] = useState({ x: NODES[0].x, y: NODES[0].y });
	const [isDragging, setIsDragging] = useState(false);

	const displayedNodeIndex = isCompleted ? NODES.length : currentNodeIndex;
	const displayedShipPos = isCompleted ? NODES[NODES.length - 1] : shipPos;

	const updateShipPosition = (e: PointerEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const { x, y } = calculateRelativePosition(e.clientX, e.clientY, rect);
		setShipPos({ x, y });

		if (
			currentNodeIndex < NODES.length &&
			checkCollision(x, y, NODES[currentNodeIndex], rect)
		) {
			synthSFX.playTone(400 + currentNodeIndex * 100, "sine", 0.1, 0.05);
			if (currentNodeIndex === NODES.length - 1) {
				setIsDragging(false);
				setShipPos(NODES[currentNodeIndex]);
				setCurrentNodeIndex(NODES.length);
				onComplete();
				playSuccessTune();
			} else {
				setCurrentNodeIndex((prev) => prev + 1);
			}
		}
	};

	const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (isCompleted || currentNodeIndex >= NODES.length) return;
		setIsDragging(true);
		e.currentTarget.setPointerCapture(e.pointerId);
		synthSFX.playTone(300, "sine", 0.05, 0.02);
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

		if (currentNodeIndex < NODES.length) {
			setShipPos(NODES[currentNodeIndex - 1]);
			synthSFX.playTone(200, "square", 0.1, 0.05);
		}
	};

	return {
		currentNodeIndex: displayedNodeIndex,
		shipPos: displayedShipPos,
		isDragging,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
	};
}
