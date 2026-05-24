import { Compass, MessageSquare, Volume2, VolumeX } from "lucide-react";
import { useGameStore } from "../../store/useGameStore";
import { synthSFX } from "../../utils/sound";

interface RightActionWidgetsProps {
	chatOpen: boolean;
	soundOn: boolean;
	onToggleMap: () => void;
	onToggleChat: () => void;
	onToggleSound: () => void;
}

export function RightActionWidgetsView({
	chatOpen,
	soundOn,
	onToggleMap,
	onToggleChat,
	onToggleSound,
}: RightActionWidgetsProps) {
	return (
		<div className="absolute right-3 top-16 sm:right-4 sm:top-24 pointer-events-auto flex flex-col items-end space-y-2 sm:space-y-3">
			<button
				onClick={onToggleMap}
				aria-label="Open Holographic Map"
				className="p-2.5 sm:px-4 sm:py-2 bg-hud-bg/90 backdrop-blur-md border border-brand-blue/40 hover:border-brand-cyan hover:bg-brand-blue/10 text-white hover:text-brand-cyan flex items-center justify-center gap-2 rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 ring-1 ring-inset ring-brand-blue/20"
			>
				<Compass size={20} className="animate-spin-slow text-brand-blue" />
				<span className="hidden sm:inline text-[10px] uppercase tracking-wider font-mono font-bold">
					Holographic Map (M)
				</span>
			</button>

			<button
				onClick={onToggleChat}
				aria-label="Toggle Crew Logs Chat"
				className={`hidden md:flex p-2.5 sm:px-4 sm:py-2 bg-hud-bg/90 backdrop-blur-md items-center justify-center gap-2 rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 ${
					chatOpen
						? "border-2 border-brand-success/50 text-brand-success bg-brand-success/10 shadow-[0_0_15px_rgba(28,189,87,0.3)]"
						: "border border-white/10 hover:border-white/30 text-white hover:bg-white/5 ring-1 ring-inset ring-white/5"
				}`}
			>
				<MessageSquare size={18} />
				<span className="hidden sm:inline text-[10px] uppercase tracking-wider font-mono font-bold">
					Crew Logs Chat
				</span>
			</button>

			<button
				onClick={onToggleSound}
				aria-label={soundOn ? "Mute Sound" : "Enable Sound"}
				className="p-2.5 sm:px-3 sm:py-2 bg-hud-bg/80 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-300 rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 text-[10px] font-mono tracking-wider ring-1 ring-inset ring-white/5"
			>
				{soundOn ? (
					<Volume2 size={16} className="text-brand-success" />
				) : (
					<VolumeX size={16} />
				)}
				<span className="hidden sm:inline">
					{soundOn ? "SOUND ON" : "MUTED"}
				</span>
			</button>
		</div>
	);
}

export default function RightActionWidgets() {
	const { chatOpen, setChatOpen, soundOn, setSoundOn, setShowHologramMap } =
		useGameStore();

	return (
		<RightActionWidgetsView
			chatOpen={chatOpen}
			soundOn={soundOn}
			onToggleMap={() => {
				setShowHologramMap(true);
				synthSFX.playBeep();
			}}
			onToggleChat={() => {
				setChatOpen(!chatOpen);
				synthSFX.playBeep();
			}}
			onToggleSound={() => setSoundOn(!soundOn)}
		/>
	);
}
