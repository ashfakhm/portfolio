import { AlertTriangle } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import CrewmateSprite from "./CrewmateSprite";

export default function CinematicSplash() {
	const { showCinematic, showImpostorAlert, setShowImpostorAlert } =
		useGameStore();

	if (!showCinematic && !showImpostorAlert) return null;
	return (
		<>
			{/* ==================================================== */}
			{showCinematic && (
				<div className="absolute inset-0 z-50 bg-[#000] flex flex-col items-center justify-center text-center p-6 select-none transition-all overflow-hidden">
					{/* STAGE 1: THE ACCLAIMED "SHH!" RED SCREEN WITH GLOW CIRCLE */}
					<div className="flex flex-col items-center justify-center gap-6 max-w-xl animate-scaleIn">
						<div
							className="text-[#ff1c1c] text-6xl md:text-8xl font-black uppercase tracking-widest animate-shake-big"
							style={{
								fontFamily: '"Press Start 2P"',
								textShadow: "0 8px 0 #4a0404",
							}}
						>
							SHH!
						</div>

						{/* Crewmate putting a white gloved finger in front of visor outline */}
						<div className="my-10 relative flex items-center justify-center transform scale-125 drop-shadow-[0_0_22px_rgba(239,68,68,0.7)]">
							{/* Spotlight background glow circle */}
							<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-[180px] rounded-full bg-slate-400/20 blur-xl z-0"></div>

							<div className="relative z-10">
								<CrewmateSprite
									color="red"
									hat="none"
									isMoving={false}
									direction="left"
									size={105}
								/>

								{/* Glove/Hand doing SHH! Overlay */}
								<div className="absolute top-[42%] left-[30%] w-12 h-16 z-20 transform -translate-x-1/2 -translate-y-1/2 scale-x-[-1]">
									<svg
										viewBox="-2 -10 25 50"
										className="w-full h-full drop-shadow-md pointer-events-none"
									>
										<path
											d="M0,32 Q10,29 14,27 Q15,22 14,18 Q5,21 0,23 Z"
											fill="#7A0808"
											stroke="#000"
											strokeWidth="2.5"
										/>
										<path
											d="M0,30 Q10,27 13,25 Q14,20 13,16 Q5,19 0,21 Z"
											fill="#C51111"
										/>
										<circle
											cx="15"
											cy="14"
											r="5.5"
											fill="#FFF"
											stroke="#000"
											strokeWidth="2.5"
										/>
										<rect
											x="12"
											y="-5"
											width="5.5"
											height="16"
											rx="2.5"
											fill="#FFF"
											stroke="#000"
											strokeWidth="2.5"
										/>
									</svg>
								</div>
							</div>
						</div>

						<div
							className="text-red-500 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em]"
							style={{ fontFamily: '"Press Start 2P"' }}
						>
							Escape the Boogeyman! Finish tasks to win!
						</div>
					</div>
				</div>
			)}

			{/* ==================================================== */}
			{/* 3. IMPOSTOR RED JUMPSCARE ALERTER */}
			{/* ==================================================== */}
			{showImpostorAlert && (
				<button
					type="button"
					aria-label="Dismiss jumpscare alert"
					onClick={() => setShowImpostorAlert(false)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							setShowImpostorAlert(false);
						}
					}}
					className="absolute inset-0 w-full h-full z-50 bg-[#c51111ee] animate-pulse flex flex-col items-center justify-center text-center cursor-pointer p-4 transition-all focus:outline-none border-none outline-none"
				>
					<div className="gap-5 flex flex-col items-center justify-center animate-pulse">
						<AlertTriangle
							className="text-white mx-auto drop-shadow-lg animate-pulse"
							size={56}
						/>
						<h1
							className="text-white text-3xl sm:text-5xl font-black uppercase tracking-widest max-w-xl leading-tight"
							style={{
								fontFamily: '"Press Start 2P"',
								textShadow: "0 4px 15px rgba(0,0,0,0.5)",
							}}
						>
							BOOGEYMAN IS COMING!
						</h1>
						<p className="font-mono text-xs tracking-widest text-red-200 uppercase pt-2 bg-black/40 px-4 py-2 rounded-lg border border-red-500/30 backdrop-blur-sm">
							The Boogeyman has infiltrated the ship. Tap or press enter to resume!
						</p>
					</div>
				</button>
			)}
		</>
	);
}
