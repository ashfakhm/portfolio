import { useEffect, useState } from "react";

interface UseMedbayTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export function useMedbayTask({ onComplete, isCompleted }: UseMedbayTaskProps) {
	const [state, setState] = useState({
		progress: 0,
		diagnostics: [] as string[],
		status: "idle" as "idle" | "scanning" | "completed",
	});

	const startScanning = () => {
		setState({
			status: "scanning",
			progress: 0,
			diagnostics: [
				"INITIALIZING DIAGNOSTIC LABS...",
				"LOCATING SCAN SUBJECT: ASHFAKH M",
			],
		});
	};

	useEffect(() => {
		let timer: any;
		if (state.status === "scanning") {
			timer = window.setInterval(() => {
				setState((prev) => {
					const nextProgress = prev.progress + 2;
					const nextDiagnostics = [...prev.diagnostics];

					if (prev.progress < 20 && nextProgress >= 20) {
						nextDiagnostics.push("STATION STATUS: EXCELLENT");
					} else if (prev.progress < 45 && nextProgress >= 45) {
						nextDiagnostics.push("COMPILING DEGREE: BSC COMPUTER SCIENCE");
					} else if (prev.progress < 70 && nextProgress >= 70) {
						nextDiagnostics.push("ISSUER: FAROOK COLLEGE, KERALA");
					} else if (prev.progress < 90 && nextProgress >= 90) {
						nextDiagnostics.push("VERIFYING CREDENTIAL: META FRONT-END PROFESSIONAL");
					} else if (nextProgress >= 100) {
						clearInterval(timer);
						window.setTimeout(onComplete, 0);
						return {
							progress: 100,
							status: "completed",
							diagnostics: [
								...nextDiagnostics,
								"SCAN RESULT: CANDIDATE CLEAR FOR LANDING!",
							],
						};
					}

					return {
						progress: nextProgress,
						status: "scanning",
						diagnostics: nextDiagnostics,
					};
				});
			}, 80);
		}
		return () => clearInterval(timer);
	}, [state.status, onComplete]);

	const displayedProgress = isCompleted ? 100 : state.progress;
	const displayedState = isCompleted ? "completed" : state.status;
	const displayedDiagnostics = isCompleted
		? ["BYPASS CRITICAL DATA LOCK", "QUALIFICATIONS SHOWN"]
		: state.diagnostics;

	return {
		scanProgress: displayedProgress,
		scanDiagnostics: displayedDiagnostics,
		scanState: displayedState,
		startScanning,
	};
}
