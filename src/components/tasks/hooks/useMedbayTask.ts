import { useEffect, useState } from "react";

interface UseMedbayTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export function useMedbayTask({ onComplete, isCompleted }: UseMedbayTaskProps) {
	const [scanProgress, setScanProgress] = useState(0);
	const [scanDiagnostics, setScanDiagnostics] = useState<string[]>([]);
	const [scanState, setScanState] = useState<"idle" | "scanning" | "completed">(
		"idle",
	);

	const startScanning = () => {
		setScanState("scanning");
		setScanProgress(0);
		setScanDiagnostics([
			"INITIALIZING DIAGNOSTIC LABS...",
			"LOCATING SCAN SUBJECT: ASHFAKH M",
		]);
	};

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (scanState === "scanning") {
			timer = setInterval(() => {
				setScanProgress((prev) => {
					const next = prev + 2;

					if (prev < 20 && next >= 20) {
						setScanDiagnostics((d) => [...d, "STATION STATUS: EXCELLENT"]);
					} else if (prev < 45 && next >= 45) {
						setScanDiagnostics((d) => [
							...d,
							"COMPILING DEGREE: BSC COMPUTER SCIENCE",
						]);
					} else if (prev < 70 && next >= 70) {
						setScanDiagnostics((d) => [...d, "ISSUER: FAROOK COLLEGE, KERALA"]);
					} else if (prev < 90 && next >= 90) {
						setScanDiagnostics((d) => [
							...d,
							"VERIFYING CREDENTIAL: META FRONT-END PROFESSIONAL",
						]);
					} else if (next >= 100) {
						clearInterval(timer);
						setScanState("completed");
						onComplete();
						setScanDiagnostics((d) => [
							...d,
							"SCAN RESULT: CANDIDATE CLEAR FOR LANDING!",
						]);
						return 100;
					}
					return next;
				});
			}, 80);
		}
		return () => clearInterval(timer);
	}, [scanState, onComplete]);

	const displayedProgress = isCompleted ? 100 : scanProgress;
	const displayedState = isCompleted ? "completed" : scanState;
	const displayedDiagnostics = isCompleted
		? ["BYPASS CRITICAL DATA LOCK", "QUALIFICATIONS SHOWN"]
		: scanDiagnostics;

	return {
		scanProgress: displayedProgress,
		scanDiagnostics: displayedDiagnostics,
		scanState: displayedState,
		startScanning,
	};
}
