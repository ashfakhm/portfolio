import Achievements from "../portfolio/Achievements";
import { useSecurityTask } from "./hooks/useSecurityTask";

interface SecurityTaskProps {
	onComplete: () => void;
}

export default function SecurityTask({ onComplete }: SecurityTaskProps) {
	useSecurityTask({ onComplete });

	return (
		<div className="flex-1 flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-2 h-full w-full p-2">
				<div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
					<div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]">
						<div className="w-2 h-2 rounded-full bg-red-500"></div> REC
					</div>
					<div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">
						CAFETERIA CCTV
					</div>
					<div
						className="w-full h-full opacity-30 pointer-events-none"
						style={{
							backgroundImage:
								"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
						}}
					></div>
					<span className="text-slate-600 text-xs font-mono">No signal</span>
				</div>
				<div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
					<div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]">
						<div className="w-2 h-2 rounded-full bg-red-500"></div> REC
					</div>
					<div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">
						ADMIN CCTV
					</div>
					<div
						className="w-full h-full opacity-30 pointer-events-none"
						style={{
							backgroundImage:
								"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
						}}
					></div>
					<span className="text-slate-600 text-xs font-mono">No signal</span>
				</div>
				<div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
					<div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]">
						<div className="w-2 h-2 rounded-full bg-red-500"></div> REC
					</div>
					<div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">
						O2 CCTV
					</div>
					<div
						className="w-full h-full opacity-30 pointer-events-none"
						style={{
							backgroundImage:
								"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
						}}
					></div>
					<span className="text-slate-600 text-xs font-mono">No signal</span>
				</div>
				<div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
					<div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]">
						<div className="w-2 h-2 rounded-full bg-red-500"></div> REC
					</div>
					<div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">
						SECURITY CCTV
					</div>
					<div
						className="w-full h-full opacity-30 pointer-events-none"
						style={{
							backgroundImage:
								"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
						}}
					></div>
					<span className="text-slate-600 text-xs font-mono">No signal</span>
				</div>
			</div>

			<Achievements />
		</div>
	);
}
