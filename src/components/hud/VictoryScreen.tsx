import CrewmateSprite, {
	type CrewmateColor,
	type CrewmateHat,
} from "../CrewmateSprite";

interface VictoryScreenProps {
	playerColor: CrewmateColor;
	playerHat: CrewmateHat;
	onPlayAgain: () => void;
}

export default function VictoryScreen({
	playerColor,
	playerHat,
	onPlayAgain,
}: VictoryScreenProps) {
	return (
		<div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-fadeIn select-none backdrop-blur-md p-4">
			<div
				className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
				style={{
					backgroundImage:
						"radial-gradient(circle at center, var(--color-brand-blue) 0%, transparent 70%)",
				}}
			/>
			<div
				className="text-brand-cyan text-5xl md:text-8xl font-black uppercase tracking-[0.1em] drop-shadow-[0_0_40px_rgba(56,254,222,0.8)] mb-8 z-10 text-center w-full max-w-lg"
				style={{
					fontFamily: '"Press Start 2P"',
					textShadow: "4px 4px 0px #0b5030, -2px -2px 0px #fff",
				}}
			>
				VICTORY
			</div>
			<div className="flex gap-4 mb-8 z-10 transform scale-125">
				<CrewmateSprite
					color={playerColor}
					hat={playerHat}
					isMoving={false}
					size={105}
					direction="right"
					name="You"
				/>
			</div>
			<div className="bg-modal-bg/80 border-2 border-brand-cyan p-4 md:p-6 rounded-lg text-center shadow-[0_0_30px_rgba(56,254,222,0.2)] mb-8 max-w-sm w-full z-10 backdrop-blur-sm relative overflow-hidden">
				<div className="absolute top-0 left-0 w-full h-1 bg-brand-cyan opacity-50" />
				<p className="font-mono text-brand-cyan font-bold text-base md:text-lg">
					ALL TASKS COMPLETED
				</p>
				<p className="text-gray-300 text-xs mt-2 font-mono">
					The Boogeyman has been defeated. The system is secure.
				</p>
			</div>
			<button
				onClick={onPlayAgain}
				aria-label="Play Again"
				className="px-8 py-4 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-cyan hover:text-black hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_#0d4d80] active:shadow-[0_2px_0_#0d4d80] active:translate-y-1 z-10 border-2 border-black tracking-widest uppercase text-xs"
				style={{ fontFamily: '"Press Start 2P"' }}
			>
				PLAY AGAIN
			</button>
		</div>
	);
}
