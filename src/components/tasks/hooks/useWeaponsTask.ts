import { useEffect, useState } from "react";
import { synthSFX } from "../../../utils/sound";

interface UseWeaponsTaskProps {
	isCompleted: boolean;
	onComplete: () => void;
}

export function useWeaponsTask({
	isCompleted,
	onComplete,
}: UseWeaponsTaskProps) {
	const [asteroidsShot, setAsteroidsShot] = useState(0);
	const [targets, setTargets] = useState<
		{
			id: number;
			x: number;
			y: number;
			size: number;
			speedX: number;
			speedY: number;
		}[]
	>([
		{ id: 1, x: 50, y: 50, speedX: 0.5, speedY: 0.5, size: 40 },
		{ id: 2, x: 200, y: 100, speedX: -0.8, speedY: 0.3, size: 45 },
	]);

	const playLaser = () => synthSFX.playLaser();
	const playSuccessTune = () => {
		synthSFX.playTone(523.25, "sine", 0.3, 0.04);
		setTimeout(() => synthSFX.playTone(659.25, "sine", 0.3, 0.04), 100);
		setTimeout(() => synthSFX.playTone(783.99, "sine", 0.5, 0.04), 200);
	};

	const isGameFinished = isCompleted || asteroidsShot >= 5;

	// Simple animation loop for targets
	useEffect(() => {
		if (isGameFinished) return;

		let frameId: number;
		const animateTargets = () => {
			setTargets((prev) =>
				prev.map((t) => {
					const newX = t.x + t.speedX;
					const newY = t.y + t.speedY;
					let newSpeedX = t.speedX;
					let newSpeedY = t.speedY;

					if (newX < 10 || newX > 320) newSpeedX *= -1;
					if (newY < 10 || newY > 160) newSpeedY *= -1;

					return {
						...t,
						x: newX,
						y: newY,
						speedX: newSpeedX,
						speedY: newSpeedY,
					};
				}),
			);
			frameId = requestAnimationFrame(animateTargets);
		};

		frameId = requestAnimationFrame(animateTargets);
		return () => cancelAnimationFrame(frameId);
	}, [isGameFinished]);

	const shootTarget = (tId: number) => {
		if (isGameFinished) return;
		playLaser();
		setTargets((prev) => prev.filter((tar) => tar.id !== tId));
		setAsteroidsShot((prev) => {
			const next = prev + 1;
			if (next >= 5) {
				onComplete();
				playSuccessTune();
			}
			return next;
		});

		setTimeout(() => {
			setTargets((prev) => {
				if (prev.length < 3 && asteroidsShot < 4) {
					return [
						...prev,
						{
							id: Date.now(),
							x: Math.random() * 260 + 40,
							y: Math.random() * 120 + 30,
							speedX: (Math.random() - 0.5) * 1.5,
							speedY: (Math.random() - 0.5) * 1.5,
							size: Math.random() * 20 + 35,
						},
					];
				}
				return prev;
			});
		}, 500);
	};

	return {
		asteroidsShot,
		targets,
		shootTarget,
		isGameFinished,
	};
}
