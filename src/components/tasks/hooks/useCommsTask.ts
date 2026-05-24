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
					if (prev >= 100) {
						clearInterval(timer);
						setDownloadState("completed");
						onComplete();
						return 100;
					}
					return prev + 5;
				});
			}, 150);
		}
		return () => clearInterval(timer);
	}, [downloadState, onComplete]);

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
