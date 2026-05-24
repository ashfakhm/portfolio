import { useEffect, useState } from "react";

interface UseCommsTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export function useCommsTask({ onComplete, isCompleted }: UseCommsTaskProps) {
	const [downloadProgress, setDownloadProgress] = useState(0);
	const [downloadSpeed, setDownloadSpeed] = useState(0);
	const [downloadState, setDownloadState] = useState<
		"idle" | "downloading" | "completed"
	>("idle");

	const startDownloading = () => {
		setDownloadState("downloading");
		setDownloadProgress(0);
	};

	useEffect(() => {
		if (downloadState !== "downloading") return;

		const timer = setInterval(() => {
			setDownloadSpeed(Math.floor(Math.random() * 80) + 120); // 120-200 kB/s
			setDownloadProgress((prev) => {
				const next = prev + 5;
				if (next >= 100) {
					clearInterval(timer);
					setDownloadState("completed");
					onComplete();
					return 100;
				}
				return next;
			});
		}, 150);

		return () => clearInterval(timer);
	}, [downloadState, onComplete]);

	const displayedProgress = isCompleted ? 100 : downloadProgress;
	const displayedState = isCompleted ? "completed" : downloadState;

	return {
		downloadProgress: displayedProgress,
		downloadSpeed,
		downloadState: displayedState,
		startDownloading,
	};
}
