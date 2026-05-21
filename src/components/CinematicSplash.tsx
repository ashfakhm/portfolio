import CrewmateSprite, { CrewmateColor, CrewmateHat } from "./CrewmateSprite";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface CinematicSplashProps {
  showCinematic: boolean;
  cinematicPhase: "shh" | "reveal";
  playerColor: CrewmateColor;
  playerHat: CrewmateHat;
  completedCount: number;
  totalTasks: number;
  showImpostorAlert: boolean;
  setShowImpostorAlert: (v: boolean) => void;
}

export default function CinematicSplash({ showCinematic, cinematicPhase, playerColor, playerHat, completedCount, totalTasks, showImpostorAlert, setShowImpostorAlert }: CinematicSplashProps) {
  if (!showCinematic) return null;
  return (
    <>
      {/* ==================================================== */}
      {showCinematic && (
        <div className="absolute inset-0 z-50 bg-[#000] flex flex-col items-center justify-center text-center p-6 select-none transition-all overflow-hidden">
          
          {cinematicPhase === 'shh' ? (
            /* STAGE 1: THE ACCLAIMED "SHH!" RED SCREEN WITH GLOW CIRCLE */
            <div className="flex flex-col items-center justify-center space-y-6 max-w-xl animate-scaleIn">

              <div className="text-[#ff1c1c] text-6xl md:text-8xl font-black uppercase tracking-widest animate-shake-big" style={{ fontFamily: '"Press Start 2P"', textShadow: '0 8px 0 #4a0404' }}>
                SHH!
              </div>

              {/* Crewmate putting a white gloved finger in front of visor outline */}
              <div className="my-10 relative flex items-center justify-center transform scale-125 drop-shadow-[0_0_22px_rgba(239,68,68,0.7)]">
                {/* Spotlight background glow circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full bg-slate-400/20 blur-xl z-0"></div>
                
                <div className="relative z-10">
                  <CrewmateSprite color="red" hat="none" isMoving={false} direction="left" size={105} />
                  
                  {/* Glove/Hand doing SHH! Overlay */}
                  <div className="absolute top-[42%] left-[30%] w-12 h-16 z-20 transform -translate-x-1/2 -translate-y-1/2 scale-x-[-1]">
                    <svg viewBox="-2 -10 25 50" className="w-full h-full drop-shadow-md pointer-events-none">
                      <path d="M0,32 Q10,29 14,27 Q15,22 14,18 Q5,21 0,23 Z" fill="#7A0808" stroke="#000" strokeWidth="2.5" />
                      <path d="M0,30 Q10,27 13,25 Q14,20 13,16 Q5,19 0,21 Z" fill="#C51111" />
                      <circle cx="15" cy="14" r="5.5" fill="#FFF" stroke="#000" strokeWidth="2.5" />
                      <rect x="12" y="-5" width="5.5" height="16" rx="2.5" fill="#FFF" stroke="#000" strokeWidth="2.5" />
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
          ) : (
            /* STAGE 2: THE IMMERSIVE "CREWMATE" TEAM ALLIANCES ALIGNMENT SCREEN */
            <div className="space-y-6 flex flex-col items-center justify-center animate-fadeIn max-w-4xl">
              
              {/* Crewmate Cyan Header block */}
              <h1 
                className="text-[#38FEDE] text-5xl md:text-7xl font-black uppercase tracking-widest animate-[fadeIn_0.5s_ease-out]"
                style={{ fontFamily: '"Press Start 2P"', textShadow: '0 8px 0 #0b4b5a', letterSpacing: '0.12em' }}
              >
                CREWMATE
              </h1>

              {/* Teammates Alliance alignment panel list */}
              <div className="my-8 flex items-center justify-center gap-6 sm:gap-10 py-5">
                
                {/* Bot 1: Purple Pizza */}
                <div className="flex flex-col items-center space-y-2 opacity-85 transform -rotate-[4deg] scale-95 translate-y-2">
                  <div className="transform scale-95">
                    <CrewmateSprite color="purple" hat="crown" isMoving={false} direction="right" size={90} />
                  </div>
                  <span className="font-mono text-[9px] text-[#A29BFE] font-bold uppercase tracking-wider bg-black/55 px-1.5 py-0.5 rounded">Pizza</span>
                </div>

                {/* Main Centered Player (YOU!) */}
                <div className="flex flex-col items-center space-y-2 transform scale-125 z-10 filter drop-shadow-[0_0_15px_rgba(56,254,222,0.3)]">
                  <div className="transform rotate-[6deg]">
                    <CrewmateSprite color={playerColor} hat={playerHat} isMoving={false} direction="right" size={105} />
                  </div>
                  <span className="font-sans text-[10px] text-white font-extrabold uppercase tracking-widest bg-emerald-600/90 border border-emerald-400 px-2.5 py-0.5 rounded flex items-center gap-1 leading-none shadow-md">
                    You
                  </span>
                </div>

                {/* Bot 3: Lime Tech */}
                <div className="flex flex-col items-center space-y-2 opacity-85 transform rotate-[4deg] scale-95 translate-y-2">
                  <div className="transform scale-95">
                    <CrewmateSprite color="lime" hat="plant" isMoving={false} direction="right" size={90} />
                  </div>
                  <span className="font-mono text-[9px] text-[#55E6C1] font-bold uppercase tracking-wider bg-black/55 px-1.5 py-0.5 rounded">LimeTech</span>
                </div>

              </div>

              <p 
                className="text-[10px] md:text-xs font-bold tracking-[0.2em] max-w-xl leading-relaxed uppercase"
                style={{ fontFamily: '"Press Start 2P"' }}
              >
                {completedCount === totalTasks ? (
                  <span className="text-yellow-400">ALL VEHICLE SYSTEMS SHIELD STABILIZED</span>
                ) : (
                  <span className="text-white">Escape the <span className="text-red-500">Boogeyman</span>! Finish tasks to win!</span>
                )}
              </p>

              <div className="bg-[#121926]/80 backdrop-blur-md border border-slate-700/50 px-5 py-3 rounded-xl text-[9px] font-mono text-slate-400 max-w-lg mt-3 uppercase tracking-wider flex items-center gap-2 shadow-lg">
                <ShieldCheck size={14} className="text-[#38FEDE]" /> GOAL: REPAIR WIRE NODES · CALIBRATE CORES · PASSAGE SENSOR CHECKS
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================================================== */}
      {/* 3. IMPOSTOR RED JUMPSCARE ALERTER */}
      {/* ==================================================== */}
      {showImpostorAlert && (
        <div 
          onClick={() => setShowImpostorAlert(false)}
          className="absolute inset-0 z-50 bg-[#c51111ee] animate-pulse flex flex-col items-center justify-center text-center cursor-pointer p-4 transition-all"
        >
          <div className="space-y-5 flex flex-col items-center justify-center animate-bounce">
            <AlertTriangle className="text-white mx-auto drop-shadow-lg" size={56} />
            <h1 
              className="text-white text-3xl sm:text-5xl font-black uppercase tracking-widest max-w-xl leading-tight"
              style={{ fontFamily: '"Press Start 2P"', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
            >
              BOOGEYMAN IS COMING!
            </h1>
            <p className="font-mono text-xs tracking-widest text-red-200 uppercase pt-2 bg-black/40 px-4 py-2 rounded-lg border border-red-500/30 backdrop-blur-sm">
              The Boogeyman has infiltrated the ship. Tap to resume!
            </p>
          </div>
        </div>
      )}

    </>
  );
}
