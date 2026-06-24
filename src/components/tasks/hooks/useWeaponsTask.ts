import { useEffect, useRef, useState } from "react";
import { playSuccessTune, synthSFX } from "../../../utils/sound";

interface UseWeaponsTaskProps {
	isCompleted: boolean;
	onComplete: () => void;
}

interface Target {
	id: number;
	x: number;
	y: number;
	size: number;
	speedX: number;
	speedY: number;
}

const playLaser = () => synthSFX.playLaser();

const updateTarget = (t: Target): Target => {
	const newX = t.x + t.speedX;
	const newY = t.y + t.speedY;

	const clampedX = Math.min(Math.max(newX, 10), 320);
	const clampedY = Math.min(Math.max(newY, 10), 160);

	const bounceX = clampedX !== newX ? -1 : 1;
	const bounceY = clampedY !== newY ? -1 : 1;

	return {
		...t,
		x: newX,
		y: newY,
		speedX: t.speedX * bounceX,
		speedY: t.speedY * bounceY,
	};
};

const createRandomTarget = (): Target => ({
	id: Date.now(),
	x: Math.random() * 260 + 40,
	y: Math.random() * 120 + 30,
	speedX: (Math.random() - 0.5) * 1.5,
	speedY: (Math.random() - 0.5) * 1.5,
	size: Math.random() * 20 + 35,
});

export function useWeaponsTask({
	isCompleted,
	onComplete,
}: UseWeaponsTaskProps) {
	const [asteroidsShot, setAsteroidsShot] = useState(0);
	const asteroidsShotRef = useRef(0);
	const [targets, setTargets] = useState<Target[]>([
		{ id: 1, x: 50, y: 50, speedX: 0.5, speedY: 0.5, size: 40 },
		{ id: 2, x: 200, y: 100, speedX: -0.8, speedY: 0.3, size: 45 },
	]);

	const isGameFinished = isCompleted || asteroidsShot >= 5;

	// Simple animation loop for targets
	useEffect(() => {
		if (isGameFinished) return;

		let frameId: number;
		const animateTargets = () => {
			setTargets((prev) => prev.map(updateTarget));
			frameId = requestAnimationFrame(animateTargets);
		};

		frameId = requestAnimationFrame(animateTargets);
		return () => cancelAnimationFrame(frameId);
	}, [isGameFinished]);

	const shootTarget = (tId: number) => {
		if (isGameFinished) return;
		playLaser();
		setTargets((prev) => prev.filter((tar) => tar.id !== tId));
		
		const nextShot = asteroidsShotRef.current + 1;
		asteroidsShotRef.current = nextShot;
		setAsteroidsShot(nextShot);

		if (nextShot >= 5) {
			onComplete();
			playSuccessTune();
		}

		setTimeout(() => {
			setTargets((prev) =>
				prev.length < 3 && asteroidsShotRef.current < 5
					? [...prev, createRandomTarget()]
					: prev,
			);
		}, 500);
	};

	return {
		asteroidsShot,
		targets,
		shootTarget,
		isGameFinished,
	};
}
