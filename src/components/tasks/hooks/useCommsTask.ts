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
		let timer: NodeJS.Timeout;
		if (downloadState === "downloading") {
			timer = setInterval(() => {
				setDownloadSpeed(Math.floor(Math.random() * 80) + 120); // 120-200 kB/s
				setDownloadProgress((prev) => {
					const next = prev + 5;
					return next >= 100 ? 100 : next;
				});
			}, 150);
		}
		return () => clearInterval(timer);
	}, [downloadState]);

	// Separate effect to handle task completion side-effects cleanly
	useEffect(() => {
		if (downloadProgress >= 100 && downloadState === "downloading") {
			setDownloadState("completed");
			onComplete();
		}
	}, [downloadProgress, downloadState, onComplete]);

	// Handle skip game via props
	useEffect(() => {
		if (isCompleted && downloadState !== "completed") {
			setDownloadState("completed");
			setDownloadProgress(100);
		}
	}, [isCompleted, downloadState]);

	return {
		downloadProgress,
		downloadSpeed,
		downloadState,
		startDownloading,
	};
}
