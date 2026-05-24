import Projects from "../portfolio/Projects";
import { useWeaponsTask } from "./hooks/useWeaponsTask";

interface WeaponsTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export default function WeaponsTask({
	onComplete,
	isCompleted,
}: WeaponsTaskProps) {
	const { asteroidsShot, targets, shootTarget, isGameFinished } = useWeaponsTask({
		isCompleted,
		onComplete,
	});

	return (
		<div className="flex-1 flex flex-col">
			{!isGameFinished ? (
				<div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
					<div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
						DESTROY 5 INCOMING METEORS (SHOT: {asteroidsShot}/5)
					</div>
					<div className="text-xs text-yellow-400/90 font-bold uppercase tracking-wider text-center animate-pulse bg-yellow-400/10 py-1 px-3 rounded-full mx-auto w-fit border border-yellow-400/20">
						CLICK / TAP ON THE METEORS TO DESTROY THEM
					</div>

					<div className="w-full max-w-lg h-[240px] bg-black/60 backdrop-blur-md border border-slate-700/50 rounded-xl relative overflow-hidden select-none cursor-crosshair shadow-inner">
						<div className="absolute inset-0 bg-[#0e1712]/30 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />

						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-[#50F01E]/20 rounded-full pointer-events-none flex items-center justify-center">
							<div className="w-12 h-12 border border-[#50F01E]/40 rounded-full" />
							<div className="absolute w-full h-[1px] bg-[#50F01E]/15" />
							<div className="absolute w-[1px] h-full bg-[#50F01E]/15" />
						</div>

						{targets.map((t) => (
							<button
								key={t.id}
								onClick={() => shootTarget(t.id)}
								className="absolute cursor-pointer rounded-full flex items-center justify-center filter active:scale-90 transition-transform select-none bg-zinc-800 border-2 border-zinc-600 group"
								style={{
									left: `${t.x}px`,
									top: `${t.y}px`,
									width: `${t.size}px`,
									height: `${t.size}px`,
								}}
							>
								<div className="w-[4px] h-[4px] bg-zinc-950 rounded-full absolute top-1 left-2 opacity-50" />
								<div className="w-[6px] h-[6px] bg-zinc-950 rounded-full absolute bottom-1.5 right-2 opacity-50" />
								<div className="w-[3px] h-[3px] bg-zinc-950 rounded-full absolute top-3 right-1.5 opacity-50" />
								<div className="absolute -inset-1 border border-red-500/0 group-hover:border-red-500/50 rounded-full animate-ping" />
							</button>
						))}

						<div className="absolute bottom-2 left-2 text-[8px] font-mono text-green-400">
							DEFLECTION SHIELD ENERGY: NOMINAL
						</div>
						<div className="absolute bottom-2 right-2 text-[8px] font-mono text-green-400">
							AMMUNITION: UNLIMITED
						</div>
					</div>
				</div>
			) : (
				<Projects />
			)}
		</div>
	);
}
