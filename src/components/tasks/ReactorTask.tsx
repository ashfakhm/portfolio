import React, { useState } from 'react';
import { Zap, User } from 'lucide-react';

interface ReactorTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function ReactorTask({ onComplete, isCompleted }: ReactorTaskProps) {
  const [reactorPower, setReactorPower] = useState(25);

  const handleReactorAlignment = (val: number) => {
    setReactorPower(val);
    if (val === 100) {
      onComplete();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {!isCompleted ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full border-4 border-yellow-500 flex items-center justify-center bg-yellow-950/30 animate-pulse relative">
            <div className="absolute inset-2 border-2 border-dashed border-yellow-500 rounded-full animate-spin" />
            <Zap size={36} className="text-yellow-400" />
          </div>
          
          <div className="max-w-md space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-yellow-400" style={{ fontFamily: '"Press Start 2P"' }}>STABILIZE REACTOR UNIT</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Core temperature is fluctuating! Slide the lever to 100% manual power output to lock in the "Who I Am" bio logs.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold mb-1">
              <span>REACTOR LEVEL: {reactorPower}%</span>
              <span className={reactorPower === 100 ? 'text-green-400' : 'text-yellow-400'}>
                {reactorPower === 100 ? 'STABLE' : 'ALIGNING...'}
              </span>
            </div>
            <input
              type="range"
              min="25"
              max="100"
              step="5"
              value={reactorPower}
              onChange={(e) => handleReactorAlignment(parseInt(e.target.value))}
              className="w-full accent-yellow-400 h-3 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>25% MIN</span>
              <span>100% COMPLETED</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
          <div className="border-2 border-green-500/40 bg-[#122c1b]/30 p-3 rounded flex items-center gap-3">
            <div className="p-1 px-2.5 bg-green-950 rounded text-green-400 text-xs font-bold border border-green-500">ONLINE</div>
            <span className="text-xs font-mono text-green-400">REACTOR SYSTEMS STATUS: OPTIMAL COOLDOWN ACTIVE.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 bg-[#1a1a2e] border-2 border-[#3a3a5e] p-4 rounded-lg flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs text-[#1a9eff] font-bold uppercase tracking-wider">CREWMATE DOSSIER</h4>
                <div className="space-y-2.5 text-xs text-gray-300">
                  <div>
                    <span className="text-gray-500 block">DESIGNATION</span>
                    <span className="text-white font-medium">Ashfakh M</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">BASE HUB</span>
                    <span className="text-white font-medium">Malappuram, Kerala, India</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">ROLE ARCHETYPE</span>
                    <span className="text-yellow-400 font-medium">Solo Full Stack Innovator</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#3a3a5e] space-y-2 text-[10px]" style={{ fontFamily: '"Fira Code", monospace' }}>
                <div className="text-slate-400">env_variables:</div>
                <div className="text-green-400">NEXT_JS_EXPERTISE = 100/100</div>
                <div className="#38FEDE">WEBHOOKS_IDEMPOTENT = true</div>
                <div className="text-red-400">META_CERTIFIED = true</div>
              </div>
            </div>

            <div className="md:col-span-3 bg-[#111122] border border-[#3a3a5e] p-5 rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-green-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">Developer Bio & Missions</h4>
              </div>
              
              <div className="text-xs text-slate-300 leading-relaxed space-y-3">
                <p>
                  I'm Ashfakh, a Full Stack Developer located in Malappuram, Kerala. I specialize in building blazing fast React based web architectures and bulletproof backend models that don't crack under heavy volumes.
                </p>
                <p>
                  <strong>My Engineering Creed:</strong> I own products soup to nuts. I've engineered rich service-oriented web apps, school exam ecosystems, secured banking gates and automatic settlement timelines — single handedly.
                </p>
                <p>
                  Completed my BSc in Computer Science at Farook College (Class of 2026). I code every single hour of my day, keeping modern stack standards inside my head.
                </p>
              </div>

              <div className="bg-[#1c1c38]/40 p-3 rounded border border-[#3a3a5e] text-[11px] text-[#38FEDE]">
                "Committed to delivering pristine UI performance (100 SEO & 90+ Lighthouse Core Web Vitals) alongside optimal server latency."
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
