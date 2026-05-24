import { useState } from "react";

interface UseReactorTaskProps {
	onComplete: () => void;
}

export function useReactorTask({ onComplete }: UseReactorTaskProps) {
	const [reactorPower, setReactorPower] = useState(25);

	const handleReactorAlignment = (val: number) => {
		setReactorPower(val);
		if (val === 100) {
			onComplete();
		}
	};

	return {
		reactorPower,
		handleReactorAlignment,
	};
}
