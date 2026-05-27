import type React from "react";
import { useEffect, useRef, useState } from "react";

interface UseAdminTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export function useAdminTask({ onComplete, isCompleted }: UseAdminTaskProps) {
	const [swipeState, setSwipeState] = useState({
		progress: 0,
		status: "idle" as "idle" | "swiping" | "too-fast" | "too-slow" | "success" | "bad-read",
		cardGrabbed: false,
	});
	const cardRef = useRef<HTMLButtonElement>(null);
	const swipeTrackRef = useRef<HTMLElement>(null);

	const handleCardDragStart = () => {
		if (swipeState.status === "success" || isCompleted) return;
		setSwipeState({
			cardGrabbed: true,
			status: "swiping",
			progress: 0,
		});
	};

	const handleCardDrag = (
		e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
	) => {
		if (!swipeState.cardGrabbed || !swipeTrackRef.current) return;

		const rect = swipeTrackRef.current.getBoundingClientRect();
		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const relativeX = clientX - rect.left;

		let percentage = (relativeX / rect.width) * 100;
		percentage = Math.max(0, Math.min(100, percentage));

		if (percentage >= 80) {
			setSwipeState({
				cardGrabbed: false,
				status: "success",
				progress: percentage,
			});
			onComplete();
		} else {
			setSwipeState((prev) => ({
				...prev,
				progress: percentage,
			}));
		}
	};

	useEffect(() => {
		const handleDragEnd = () => {
			if (swipeState.cardGrabbed) {
				setSwipeState((prev) => {
					if (prev.status === "swiping") {
						return {
							cardGrabbed: false,
							status: "idle",
							progress: 0,
						};
					}
					return {
						...prev,
						cardGrabbed: false,
					};
				});
			}
		};

		document.addEventListener("mouseup", handleDragEnd);
		document.addEventListener("touchend", handleDragEnd, { passive: true });
		return () => {
			document.removeEventListener("mouseup", handleDragEnd);
			document.removeEventListener("touchend", handleDragEnd);
		};
	}, [swipeState.cardGrabbed]);

	return {
		swipeProgress: swipeState.progress,
		swipeStatus: swipeState.status,
		cardGrabbed: swipeState.cardGrabbed,
		cardRef,
		swipeTrackRef,
		handleCardDragStart,
		handleCardDrag,
	};
}
