import React, { useEffect } from 'react';
import CrewmateSprite, { CrewmateColor } from '../CrewmateSprite';

interface CafeteriaTaskProps {
  onComplete: () => void;
  playerColor: CrewmateColor;
}

export default function CafeteriaTask({ onComplete, playerColor }: CafeteriaTaskProps) {
  useEffect(() => {
    // Cafeteria has no real task to complete, it completes immediately so the X button works
    onComplete();
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 items-center justify-center p-2 animate-fadeIn">
      <div className="flex flex-col items-center justify-center py-4 bg-[#1a1a2e] border-2 border-[#3a3a5e] p-6 rounded-lg w-full md:w-5/12 text-center relative overflow-hidden">
        <div className="absolute top-2 left-2 rotate-[5deg] bg-red-600 px-2 py-0.5 text-[8px] rounded font-bold animate-pulse">ASHFAKH M</div>
        <div className="mb-4">
          <CrewmateSprite color={playerColor} hat="plant" isMoving={true} direction="right" size={120} name="Ashfakh" />
        </div>
        <div className="space-y-1.5 w-full">
          <div className="text-[10px] text-gray-400 uppercase">LOCATION</div>
          <div className="text-xs font-semibold text-red-400">Malappuram, Kerala, India</div>
          <div className="text-[10px] text-gray-400 uppercase mt-2">CLASS</div>
          <div className="text-xs text-white">Full Stack Crewmate</div>
        </div>
      </div>

      <div className="flex-1 space-y-4 max-w-md">
        <div className="bg-[#0D0D1A] p-4 rounded-lg border-2 border-[#1a9eff]/30 space-y-2">
          <h3 className="text-xs text-[#1a9eff] font-bold tracking-widest uppercase">GREETINGS CREWMATE!</h3>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            Ashfakh M
          </h1>
          <p className="text-sm font-semibold text-green-400">
            Full Stack Developer — Frontend Specialist
          </p>
          <p className="text-xs text-slate-300 leading-relaxed pt-2">
            "I craft performance-tuned React architectures, responsive layouts, and rock-solid Node/FastAPI servers designed to sustain warp load speeds."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="border border-[#3a3a5e] p-2.5 rounded bg-[#10101a] flex flex-col">
            <span className="text-gray-500 text-[10px]">ACADEMIC CLEARANCE</span>
            <span className="text-white font-medium truncate mt-0.5">BSc Computer Science</span>
            <span className="text-gray-400 text-[9px] mt-0.5">Farook College ('26)</span>
          </div>
          <div className="border border-[#3a3a5e] p-2.5 rounded bg-[#10101a] flex flex-col">
            <span className="text-gray-500 text-[10px]">TRUST METRIC</span>
            <span className="text-green-400 font-medium truncate mt-0.5">100 SEO Score</span>
            <span className="text-gray-400 text-[9px] mt-0.5">Chrome Lighthouse Verified</span>
          </div>
        </div>

        <div className="font-mono text-[9px] text-[#38FEDE]/70 text-center select-none pt-2 animate-pulse">
          &lt;&lt; WALK INTO THE OTHER ROOMS TO DISCOVER DETAILS &gt;&gt;
        </div>
      </div>
    </div>
  );
}
