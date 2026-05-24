import { AlertTriangle, Wind } from "lucide-react";
import type { RoomConfig } from "../../gameConfig";
import { useEngineStore } from "../../store/useEngineStore";
import { useGameStore } from "../../store/useGameStore";
import CrewmateSprite, {
	CREWMATE_COLORS,
	CREWMATE_HATS,
	type CrewmateColor,
	type CrewmateHat,
} from "../CrewmateSprite";

interface BottomActionControlsProps {
	playerColor: CrewmateColor;
	playerHat: CrewmateHat;
	playerMoving: boolean;
	direction: "left" | "right";
	nearVent: boolean;
	nearestRoom: RoomConfig | null;
	setPlayerColor: (color: CrewmateColor) => void;
	setPlayerHat: (hat: CrewmateHat) => void;
	onCrewClick: () => void;
	onVentClick: () => void;
	onEmergencyClick: () => void;
	onUseClick: () => void;
}

export function BottomActionControlsView({
	playerColor,
	playerHat,
	playerMoving,
	direction,
	nearVent,
	nearestRoom,
	setPlayerColor,
	setPlayerHat,
	onCrewClick,
	onVentClick,
	onEmergencyClick,
	onUseClick,
}: BottomActionControlsProps) {
	return (
		<div className="w-full py-1 pointer-events-auto flex justify-end md:justify-between items-end gap-3">
			{/* Live customizer */}
			<div className="bg-hud-bg/90 backdrop-blur-md border border-white/10 p-3 rounded-xl items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/5 max-w-sm hidden lg:flex">
				<button
					onClick={onCrewClick}
					aria-label="Tap crewmate"
					className="cursor-pointer group relative bg-transparent border-none p-0"
				>
					<CrewmateSprite
						color={playerColor}
						hat={playerHat}
						isMoving={playerMoving}
						direction={direction}
						size={50}
					/>
					<div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7px] font-bold text-red-500 font-mono text-center">
						TAP 5X!
					</div>
				</button>
				<div className="flex flex-col space-y-1 font-mono text-xs">
					<div className="font-bold text-white flex items-center gap-1">
						<span>Suit Designator</span>
					</div>
					<div className="flex gap-1">
						{(["red", "lime", "cyan", "pink", "yellow"] as CrewmateColor[]).map(
							(col) => (
								<button
									key={col}
									onClick={() => setPlayerColor(col)}
									aria-label={`Select ${col} color`}
									className={`w-4 h-4 rounded-full border cursor-pointer hover:scale-110 active:scale-95 transition-all`}
									style={{
										backgroundColor: CREWMATE_COLORS[col].fill,
										borderColor: playerColor === col ? "#FFF" : "#222",
									}}
								/>
							),
						)}
						<span className="text-[10px] text-slate-500 pl-1.5">Hats:</span>
						{(["none", "plant", "egg", "crown"] as CrewmateHat[]).map((h) => (
							<button
								key={h}
								onClick={() => setPlayerHat(h)}
								aria-label={`Select ${h} hat`}
								className={`text-[9px] px-1 py-0.5 rounded border leading-none bg-slate-900 ${
									playerHat === h ? "border-brand-cyan" : "border-slate-800"
								}`}
							>
								{CREWMATE_HATS[h].emoji}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex items-center gap-2 sm:gap-3">
				{nearVent && (
					<button
						onClick={onVentClick}
						aria-label="Use vent passage"
						className="p-3 sm:px-4 sm:py-3 bg-[#4e5564]/80 backdrop-blur-sm hover:bg-[#5f697c]/90 border border-slate-400/50 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 transition-all text-center font-bold text-[9px] tracking-widest uppercase text-brand-cyan flex items-center gap-1.5"
						style={{ fontFamily: '"Press Start 2P"' }}
					>
						<Wind size={16} className="sm:w-3 sm:h-3" />{" "}
						<span className="hidden sm:inline">PASSAGE</span>
					</button>
				)}

				<button
					onClick={onEmergencyClick}
					aria-label="Report emergency"
					className="p-3 sm:px-5 sm:py-4 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-2xl border border-red-500/50 text-center shadow-[0_0_20px_rgba(220,38,38,0.2)] active:scale-95 transition-all w-16 sm:w-[120px] flex flex-col items-center justify-center backdrop-blur-md"
					style={{ fontFamily: '"Press Start 2P"' }}
				>
					<div className="flex flex-col items-center gap-1 sm:gap-1.5">
						<AlertTriangle
							size={18}
							className="text-red-400 sm:w-3.5 sm:h-3.5"
						/>
						<span className="hidden sm:block text-red-300 text-[7px] tracking-[0.2em] mb-0 font-bold leading-none select-none opacity-80">
							EMERGENCY
						</span>
						<span className="font-bold text-[7px] sm:text-[9px] md:text-xs tracking-widest uppercase leading-none select-none text-white drop-shadow-md">
							REPORT
						</span>
					</div>
				</button>

				<button
					onClick={onUseClick}
					disabled={!nearestRoom}
					aria-label="Use station"
					className={`p-3 sm:py-4 sm:px-6 md:py-4 md:px-8 rounded-2xl border text-center cursor-pointer font-bold uppercase transition-all flex flex-col items-center justify-center relative overflow-hidden w-16 sm:w-[140px] backdrop-blur-md ${
						nearestRoom
							? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95"
							: "bg-slate-800/30 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-80 shadow-none"
					}`}
				>
					<span
						className="text-[9px] sm:text-[11px] font-black tracking-widest block drop-shadow-md text-white"
						style={{ fontFamily: '"Press Start 2P"' }}
					>
						USE
					</span>
					{nearestRoom && (
						<span className="hidden sm:block text-[7px] font-mono mt-1 tracking-wider uppercase font-extrabold text-yellow-200/80">
							{nearestRoom.name}
						</span>
					)}
				</button>
			</div>
		</div>
	);
}

interface BottomActionControlsContainerProps {
	onCrewClick: () => void;
	onVentClick: () => void;
	onEmergencyClick: () => void;
	onUseClick: () => void;
}

export default function BottomActionControls(
	props: BottomActionControlsContainerProps,
) {
	const { playerMoving, direction, nearVent, nearestRoom } = useEngineStore();
	const { playerColor, playerHat, setPlayerColor, setPlayerHat } =
		useGameStore();

	return (
		<BottomActionControlsView
			{...props}
			playerMoving={playerMoving}
			direction={direction}
			nearVent={!!nearVent}
			nearestRoom={nearestRoom}
			playerColor={playerColor}
			playerHat={playerHat}
			setPlayerColor={setPlayerColor}
			setPlayerHat={setPlayerHat}
		/>
	);
}
