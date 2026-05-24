import { GameConstants } from "../gameConfig";
import { useEngineStore } from "../store/useEngineStore";

export function useMobileJoystick() {
	const {
		joystickActive,
		setJoystickActive,
		joystickOffset,
		setJoystickOffset,
		joystickCenter,
		setJoystickCenter,
		joystickCurrent,
		setJoystickCurrent,
	} = useEngineStore();

	const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		const touch = e.touches[0];
		const pos = { x: touch.clientX, y: touch.clientY };
		setJoystickCenter(pos);
		setJoystickCurrent(pos);
		setJoystickActive(true);
		setJoystickOffset({ x: 0, y: 0 });
	};

	const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		if (!joystickActive || !joystickCenter) return;
		const touch = e.touches[0];
		setJoystickCurrent({ x: touch.clientX, y: touch.clientY });

		const dx = touch.clientX - joystickCenter.x;
		const dy = touch.clientY - joystickCenter.y;
		const distanceThreshold = GameConstants.UI.JOYSTICK_DISTANCE_THRESHOLD;
		const length = Math.sqrt(dx * dx + dy * dy);

		if (length > 0) {
			const angle = Math.atan2(dy, dx);
			const intensity = Math.min(length, distanceThreshold) / distanceThreshold;

			setJoystickOffset({
				x: Math.cos(angle) * intensity * 2,
				y: Math.sin(angle) * intensity * 2,
			});
		} else {
			setJoystickOffset({ x: 0, y: 0 });
		}
	};

	const handleJoystickTouchEnd = () => {
		setJoystickActive(false);
		setJoystickCenter(null);
		setJoystickCurrent(null);
		setJoystickOffset({ x: 0, y: 0 });
	};

	return {
		joystickActive,
		joystickOffset,
		joystickCenter,
		joystickCurrent,
		handleJoystickTouchStart,
		handleJoystickTouchMove,
		handleJoystickTouchEnd,
	};
}
