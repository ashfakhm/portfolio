import { useEffect, useState } from "react";

interface UseCommsTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export function useCommsTask({ onComplete, isCompleted }: UseCommsTaskProps) {
	const [state, setState] = useState({
		progress: 0,
		speed: 0,
		status: "idle" as "idle" | "downloading" | "completed",
	});

	const startDownloading = () => {
		setState({
			status: "downloading",
			progress: 0,
			speed: 0,
		});
	};

	useEffect(() => {
		if (state.status !== "downloading") return;

		const timer = window.setInterval(() => {
			const nextSpeed = Math.floor(Math.random() * 80) + 120; // 120-200 kB/s
			setState((prev) => {
				const nextProgress = prev.progress + 5;
				if (nextProgress >= 100) {
					clearInterval(timer);
					window.setTimeout(onComplete, 0);
					return {
						progress: 100,
						speed: nextSpeed,
						status: "completed",
					};
				}
				return {
					progress: nextProgress,
					speed: nextSpeed,
					status: "downloading",
				};
			});
		}, 150);

		return () => clearInterval(timer);
	}, [state.status, onComplete]);

	const displayedProgress = isCompleted ? 100 : state.progress;
	const displayedState = isCompleted ? "completed" : state.status;

	return {
		downloadProgress: displayedProgress,
		downloadSpeed: state.speed,
		downloadState: displayedState,
		startDownloading,
	};
}
