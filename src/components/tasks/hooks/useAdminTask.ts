import type React from "react";
import { useEffect, useRef, useState } from "react";

interface UseAdminTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export function useAdminTask({ onComplete, isCompleted }: UseAdminTaskProps) {
	const [swipeProgress, setSwipeProgress] = useState(0); // 0 to 100
	const [swipeStatus, setSwipeStatus] = useState<
		"idle" | "swiping" | "too-fast" | "too-slow" | "success" | "bad-read"
	>("idle");
	const [cardGrabbed, setCardGrabbed] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);
	const swipeTrackRef = useRef<HTMLDivElement>(null);

	// We don't enforce too-fast/too-slow strictly here for better UX, but we can if desired.
	const handleCardDragStart = () => {
		if (swipeStatus === "success" || isCompleted) return;
		setCardGrabbed(true);
		setSwipeStatus("swiping");
	};

	const handleCardDrag = (
		e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
	) => {
		if (!cardGrabbed || !swipeTrackRef.current) return;

		const rect = swipeTrackRef.current.getBoundingClientRect();
		const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
		const relativeX = clientX - rect.left;

		let percentage = (relativeX / rect.width) * 100;
		percentage = Math.max(0, Math.min(100, percentage));
		setSwipeProgress(percentage);

		if (percentage >= 80) {
			setCardGrabbed(false);
			setSwipeStatus("success");
			onComplete();
		}
	};

	useEffect(() => {
		const handleDragEnd = () => {
			if (cardGrabbed) {
				setCardGrabbed(false);
				if (swipeStatus === "swiping") {
					setSwipeStatus("idle");
					setSwipeProgress(0);
				}
			}
		};

		document.addEventListener("mouseup", handleDragEnd);
		document.addEventListener("touchend", handleDragEnd);
		return () => {
			document.removeEventListener("mouseup", handleDragEnd);
			document.removeEventListener("touchend", handleDragEnd);
		};
	}, [cardGrabbed, swipeStatus]);

	return {
		swipeProgress,
		swipeStatus,
		cardGrabbed,
		cardRef,
		swipeTrackRef,
		handleCardDragStart,
		handleCardDrag,
	};
}
