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

					if (next === 20) {
						setScanDiagnostics((d) => [...d, "STATION STATUS: EXCELLENT"]);
					} else if (next === 45) {
						setScanDiagnostics((d) => [
							...d,
							"COMPILING DEGREE: BSC COMPUTER SCIENCE",
						]);
					} else if (next === 70) {
						setScanDiagnostics((d) => [...d, "ISSUER: FAROOK COLLEGE, KERALA"]);
					} else if (next === 90) {
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

	// Handle skip game via props
	useEffect(() => {
		if (isCompleted && scanState !== "completed") {
			setScanState("completed");
			setScanProgress(100);
			setScanDiagnostics(["BYPASS CRITICAL DATA LOCK", "QUALIFICATIONS SHOWN"]);
		}
	}, [isCompleted, scanState]);

	return {
		scanProgress,
		scanDiagnostics,
		scanState,
		startScanning,
	};
}
