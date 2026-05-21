import React, { useState, useEffect } from 'react';
import { synthSFX } from '../../utils/sound';

interface NavigationTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function NavigationTask({ onComplete, isCompleted }: NavigationTaskProps) {
  const [shipNavPos, setShipNavPos] = useState({ x: 0 });
  const [navAligned, setNavAligned] = useState(false);

  const playLocalSound = (freq: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth', duration: number, volume = 0.05) => {
    synthSFX.playTone(freq, type, duration, volume);
  };
  const playSuccessTune = () => {
    synthSFX.playTone(523.25, 'sine', 0.3, 0.04);
    setTimeout(() => synthSFX.playTone(659.25, 'sine', 0.3, 0.04), 100);
    setTimeout(() => synthSFX.playTone(783.99, 'sine', 0.5, 0.04), 200);
  };

  // Handle skip game via props
  useEffect(() => {
    if (isCompleted && !navAligned) {
      setNavAligned(true);
      setShipNavPos({ x: 100 });
    }
  }, [isCompleted, navAligned]);

  return (
    <div className="flex-1 flex flex-col">
      {!navAligned ? (
        <div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
          <div className="text-[12px] text-gray-400 font-bold uppercase text-center tracking-wider">
            CHART COURSE
          </div>

          <div className="w-full max-w-lg bg-[#0e1726]/80 backdrop-blur-md border border-[#1f2937]/50 shadow-inner rounded-2xl p-8 flex flex-col items-center relative min-h-[220px] justify-center">
            <div className="absolute inset-0 bg-[#000000]/40 bg-[radial-gradient(circle,rgba(30,144,255,0.08)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />

            <div className="w-full relative py-8 px-4">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 -translate-y-1/2 border-y border-white/5" />
              
              <div className="absolute top-1/2 left-0 w-3 h-3 bg-white rounded-full -translate-y-1/2 transform -translate-x-1.5" />
              <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-white rounded-full -translate-y-1/2 transform -translate-x-1.5" />
              <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-white rounded-full -translate-y-1/2 transform -translate-x-1.5" />
              <div className="absolute top-1/2 right-0 w-3 h-3 bg-white rounded-full -translate-y-1/2 transform translate-x-1.5" />

              <input
                type="range"
                min="0"
                max="100"
                value={shipNavPos.x > 100 ? 100 : shipNavPos.x}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setShipNavPos({ x: val });
                  playLocalSound(300 + val * 2, 'sine', 0.02, 0.02);
                  if (val >= 98) {
                    setNavAligned(true);
                    onComplete();
                    playSuccessTune();
                  }
                }}
                className="w-full h-8 absolute top-1/2 left-0 -translate-y-1/2 opacity-0 cursor-pointer z-20"
              />

              <div 
                className="absolute top-1/2 -translate-y-1/2 w-10 h-10 -ml-5 bg-blue-500 border-[3px] border-white rounded-full flex items-center justify-center text-lg z-10 pointer-events-none shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                style={{ left: `${shipNavPos.x > 100 ? 100 : shipNavPos.x}%` }}
              >
              </div>
            </div>
            
            <div className="mt-8 text-[9px] font-mono text-cyan-500 bg-cyan-900/20 px-3 py-1 rounded z-10">
              DRAG SHIP RIGHT TO CHART COURSE
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
          <div className="bg-blue-950/20 border-2 border-blue-500/30 p-2.5 rounded-lg flex items-center justify-between text-xs text-blue-400 font-mono">
            <span className="font-bold">COURSE LOCK CONFIRMED // RADAR TRACK LOCKED</span>
            <span>BASE HUB TARGET: MALAPPURAM, KERALA</span>
          </div>

          <div className="bg-[#0b141d] border border-blue-500/20 p-4 rounded-xl space-y-2 text-xs font-mono">
            <h4 className="text-white text-xs font-bold uppercase tracking-wide border-b border-dashed border-blue-500/20 pb-1 flex items-center gap-2">
              <span>LOCAL METADATA LOCK: KERALA coordinate</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              Target locked! Ashfakh operates natively from Kozhikode/Malappuram hub base inside Kerala (India), delivering remote software code globally with precise latency specs.
            </p>
            <div className="bg-[#0a0d14] p-2 rounded text-[10px] text-blue-400 border border-blue-950">
              GPS COORDINATES: 11.0510° N, 76.0711° E (Malappuram Dev Lab)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
