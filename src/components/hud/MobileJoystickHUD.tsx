import { useMobileJoystick } from "../../hooks/useMobileJoystick";

interface MobileJoystickHUDProps {
	joystickActive: boolean;
	joystickCenter: { x: number; y: number } | null;
	joystickCurrent: { x: number; y: number } | null;
	onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
	onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
	onTouchEnd: () => void;
}

export function MobileJoystickHUDView({
	joystickActive,
	joystickCenter,
	joystickCurrent,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
}: MobileJoystickHUDProps) {
	return (
		<div className="absolute bottom-6 left-6 pointer-events-auto z-30 md:hidden flex flex-col items-center justify-center select-none">
			<div
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
				className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-[#10102633] border-2 border-dashed border-slate-600/30 flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
			>
				{joystickActive && joystickCenter && joystickCurrent ? (
					<div
						className="w-20 h-20 rounded-full bg-slate-900/60 border-2 border-brand-blue/50 flex items-center justify-center shadow-[0_0_15px_rgba(26,158,255,0.2)]"
						style={{
							position: "fixed",
							left: joystickCenter.x - 40,
							top: joystickCenter.y - 40,
						}}
					>
						{(() => {
							const dx = joystickCurrent.x - joystickCenter.x;
							const dy = joystickCurrent.y - joystickCenter.y;
							const distanceThreshold = 45;
							const length = Math.sqrt(dx * dx + dy * dy);
							const angle = Math.atan2(dy, dx);
							const intensity =
								length > 0
									? Math.min(length, distanceThreshold) / distanceThreshold
									: 0;
							const thumbX = Math.cos(angle) * intensity * 20;
							const thumbY = Math.sin(angle) * intensity * 20;
							return (
								<div
									className="w-8 h-8 rounded-full bg-brand-blue border border-white flex items-center justify-center shadow shadow-brand-blue/80 pointer-events-none select-none"
									style={{
										transform: `translate(${thumbX}px, ${thumbY}px)`,
									}}
								/>
							);
						})()}
					</div>
				) : (
					<div className="text-[8px] text-slate-500 font-mono text-center uppercase pointer-events-none select-none flex flex-col items-center">
						<span className="text-sm mb-1 opacity-60">🕹️</span>
						<span>DRAG PAD</span>
					</div>
				)}
			</div>
		</div>
	);
}

export default function MobileJoystickHUD() {
	const {
		joystickActive,
		joystickCenter,
		joystickCurrent,
		handleJoystickTouchStart,
		handleJoystickTouchMove,
		handleJoystickTouchEnd,
	} = useMobileJoystick();

	return (
		<MobileJoystickHUDView
			joystickActive={joystickActive}
			joystickCenter={joystickCenter}
			joystickCurrent={joystickCurrent}
			onTouchStart={handleJoystickTouchStart}
			onTouchMove={handleJoystickTouchMove}
			onTouchEnd={handleJoystickTouchEnd}
		/>
	);
}
