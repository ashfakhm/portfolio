import { useShieldsTask } from "./hooks/useShieldsTask";

interface ShieldsTaskProps {
	onComplete: () => void;
	isCompleted: boolean;
}

export default function ShieldsTask({
	onComplete,
	isCompleted,
}: ShieldsTaskProps) {
	const { shieldsState, toggleShield } = useShieldsTask({
		onComplete,
		isCompleted,
	});

	return (
		<div className="flex-1 flex flex-col">
			{shieldsState.includes(false) ? (
				<div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
					<div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
						TAP RED PANELS TO PRIME AND ACTIVATE PROPULSION SHIELDS
					</div>

					<div className="w-full max-w-sm bg-neutral-950/80 backdrop-blur-md border border-slate-700/50 shadow-inner rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[220px]">
						<div className="grid grid-cols-3 gap-3.5 max-w-[240px]">
							{shieldsState.map((active, idx) => (
								<button
									key={idx}
									onClick={() => toggleShield(idx)}
									className={`w-14 h-16 relative flex items-center justify-center cursor-pointer transition-transform duration-100 hover:scale-105 select-none ${
										active
											? "text-[#3498db] filter drop-shadow-[0_0_8px_#3498db]"
											: "text-red-600 filter drop-shadow-[0_0_4px_#ef4444]"
									}`}
								>
									<svg viewBox="0 0 100 115" className="w-full h-full">
										<polygon
											points="50,2 97,30 97,85 50,113 3,85 3,30"
											fill="currentColor"
											stroke="black"
											strokeWidth="8"
										/>
										<polygon
											points="50,10 90,34 90,81 50,105 10,81 10,34"
											fill={
												active
													? "rgba(52, 152, 219, 0.25)"
													: "rgba(239, 68, 68, 0.2)"
											}
											stroke={active ? "#34e7e4" : "#ff5e57"}
											strokeWidth="4"
										/>
									</svg>
									<span className="absolute text-[8px] font-black text-white font-mono uppercase">
										{active ? "OK" : "OFF"}
									</span>
								</button>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className="flex-1 flex flex-col gap-4 animate-fadeIn">
					<div className="bg-[#0e2118] border-2 border-emerald-500/30 p-2.5 rounded-lg flex items-center justify-between text-xs text-emerald-400 font-mono">
						<span className="font-bold">
							SHIELD CELL ENERGETICS COMPLIANT [100% SECURE]
						</span>
						<span>LIGHTHOUSE AUDIT MATRIX VERIFIED</span>
					</div>

					<div className="bg-[#0b1712] border border-emerald-500/20 p-4 rounded-xl space-y-3 font-mono">
						<h4 className="text-white text-xs font-bold uppercase tracking-wide border-b border-dashed border-emerald-500/20 pb-1 flex items-center gap-2">
							<span>LIGHTHOUSE SYSTEM PROFILE // CORE PERFORMANCE LOCK</span>
						</h4>

						<div className="grid grid-cols-4 gap-2 text-center text-xs">
							<div className="bg-neutral-900 border border-zinc-800 p-2 rounded">
								<span className="block text-emerald-400 font-black text-sm">
									100
								</span>
								<span className="text-[8px] text-zinc-500 uppercase block mt-1">
									SEO SCORE
								</span>
							</div>
							<div className="bg-neutral-900 border border-zinc-800 p-2 rounded">
								<span className="block text-emerald-500 font-bold text-sm">
									94+
								</span>
								<span className="text-[8px] text-zinc-500 uppercase block mt-1">
									PERFORMANCE
								</span>
							</div>
							<div className="bg-neutral-900 border border-zinc-800 p-2 rounded">
								<span className="block text-emerald-500 font-bold text-sm">
									95
								</span>
								<span className="text-[8px] text-zinc-500 uppercase block mt-1">
									ACCESS
								</span>
							</div>
							<div className="bg-neutral-900 border border-zinc-800 p-2 rounded">
								<span className="block text-emerald-400 font-black text-sm">
									100
								</span>
								<span className="text-[8px] text-zinc-500 uppercase block mt-1">
									PRACTICES
								</span>
							</div>
						</div>
						<p className="text-[10px] text-slate-400 leading-normal italic text-center pt-1.5">
							"I write performant, clean-rendered responsive elements certified
							for standard network limits."
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
