import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "../../store/useGameStore";

interface ChecklistHUDProps {
  completedTasks: Record<string, boolean>;
  onAutoWalk: (roomId: string) => void;
}

const MISSIONS = [
  { id: "cafeteria", label: "Cafeteria: Deck Profile" },
  { id: "reactor", label: "Reactor: About Me" },
  { id: "admin", label: "Admin Desk: Swipe Pass" },
  { id: "comms", label: "Comms Dish: Decrypt Data" },
  { id: "medbay", label: "MedBay Lab: Submit Scan" },
  { id: "security", label: "Security: Camera monitors" },
  { id: "storage", label: "Storage Area: Fuel Cells" },
  { id: "weapons", label: "Weapons: Debris Shooting" },
  { id: "electrical", label: "Electrical: Wiring Grid" },
  { id: "navigation", label: "Navigation: Course Alignment" },
  { id: "shields", label: "Shield Controls: Hex Priming" },
];
export function ChecklistHUDView({
  completedTasks,
  onAutoWalk,
}: ChecklistHUDProps) {
  return (
    <div className="absolute left-3 top-20 pointer-events-auto flex flex-col space-y-2.5 max-w-[220px] hidden md:flex">
      <div className="bg-hud-bg/90 backdrop-blur-md border border-white/10 p-3.5 rounded-xl flex flex-col space-y-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] font-mono text-xs relative overflow-hidden ring-1 ring-inset ring-white/5">
        <div className="absolute top-0 right-0 w-8 h-8 opacity-5 font-bold text-3xl">
          🗂
        </div>
        <div className="text-brand-cyan font-black tracking-widest uppercase border-b flex items-center justify-between border-dashed border-white/10 pb-2 font-mono text-[10px]">
          MISSIONS LIST:
        </div>
        {MISSIONS.map((m) => (
          <button
            key={m.id}
            onClick={() => onAutoWalk(m.id)}
            aria-label={`Auto-walk to ${m.label}`}
            className="text-left group flex items-start gap-1.5 cursor-pointer leading-tight transition-all hover:text-brand-cyan bg-transparent border-none p-0"
          >
            <span
              className={
                completedTasks[m.id]
                  ? "text-brand-success font-bold"
                  : "text-gray-500"
              }
            >
              {completedTasks[m.id] ? "☑" : "☐"}
            </span>
            <span
              className={`${completedTasks[m.id] ? "line-through text-slate-500 font-normal" : "text-slate-300 font-semibold text-[11px]"}`}
            >
              {m.label}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-hud-bg-alpha border border-border-subtle p-2 rounded text-[9px] text-slate-400 font-mono leading-relaxed shadow flex flex-col">
        <span className="font-extrabold uppercase text-brand-gold text-[9px] mb-0.5">
          AUTO-WALK CLIENT:
        </span>
        <span>Click mission above to auto-pilot. Tap Space / USE to run!</span>
      </div>
    </div>
  );
}

interface ChecklistHUDContainerProps {
  onAutoWalk: (roomId: string) => void;
}

export default function ChecklistHUD({
  onAutoWalk,
}: ChecklistHUDContainerProps) {
  const completedTasks = useGameStore(
    useShallow((state) => state.completedTasks),
  );

  return (
    <ChecklistHUDView completedTasks={completedTasks} onAutoWalk={onAutoWalk} />
  );
}
