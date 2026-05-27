import { CheckCircle2, HelpCircle, Rocket, Trophy } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "../../store/useGameStore";

interface TopStatusHUDProps {
  progressPercent: number;
  completedCount: number;
  totalTasks: number;
  onHelpClick: () => void;
}

function TopStatusHUDView({
  progressPercent,
  completedCount,
  totalTasks,
  onHelpClick,
}: TopStatusHUDProps) {
  return (
    <div className="w-full max-w-2xl mx-auto pointer-events-auto bg-hud-bg/90 backdrop-blur-md border border-white/10 p-2 sm:p-2.5 rounded-2xl flex flex-col gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/5">
      <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-green-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={12} />{" "}
          <span className="hidden sm:inline">TOTAL SHIP TASKS STATUS:</span>
          <span className="sm:hidden">TASKS:</span>
        </span>
        <div className="flex items-center gap-3">
          <span>
            {progressPercent}%{" "}
            <span className="hidden sm:inline">
              COMPLETED ({completedCount}/{totalTasks})
            </span>
          </span>
          <button
            type="button"
            onClick={onHelpClick}
            aria-label="Help Tutorial"
            className="bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-[9px] font-semibold text-sky-300 p-1.5 sm:px-2.5 sm:py-1 rounded-md cursor-pointer uppercase transition-all tracking-wider font-mono hover:scale-105 active:scale-95 leading-none flex items-center gap-1"
          >
            <HelpCircle size={12} />{" "}
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>
      </div>

      <div className="w-full h-3.5 bg-zinc-950 border border-border-subtle rounded overflow-hidden p-0.5 relative">
        <div
          className="h-full bg-brand-success rounded-sm transition-all duration-300 shadow-[0_0_10px_#1cbd57]"
          style={{ width: `${progressPercent}%` }}
        />
        {progressPercent === 100 && (
          <div
            className="absolute inset-x-0 inset-y-0 text-[8px] font-black tracking-widest text-white leading-none flex items-center justify-center animate-pulse uppercase drop-shadow-md"
            style={{ fontFamily: '"Press Start 2P"' }}
          >
            <Rocket size={10} className="mr-2" /> ALL SYSTEMS STABILIZED!{" "}
            <Trophy size={10} className="ml-2 text-brand-gold" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopStatusHUD() {
  const { completedCount, totalTasks, setShowTutorial } = useGameStore(
    useShallow((state) => ({
      completedCount: state.completedCount,
      totalTasks: state.totalTasks,
      setShowTutorial: state.setShowTutorial,
    })),
  );

  const progressPercent = Math.min(
    100,
    Math.floor((completedCount / totalTasks) * 100),
  );

  return (
    <TopStatusHUDView
      progressPercent={progressPercent}
      completedCount={completedCount}
      totalTasks={totalTasks}
      onHelpClick={() => setShowTutorial(true)}
    />
  );
}
