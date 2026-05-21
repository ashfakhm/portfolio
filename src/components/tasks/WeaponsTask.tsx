import React, { useState, useEffect } from 'react';
import Projects from '../portfolio/Projects';
import { synthSFX } from '../../utils/sound';

interface WeaponsTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function WeaponsTask({ onComplete, isCompleted }: WeaponsTaskProps) {
  const [asteroidsShot, setAsteroidsShot] = useState(0);
  const [targets, setTargets] = useState<{id: number, x: number, y: number, size: number, speedX: number, speedY: number}[]>([]);

  const playLaser = () => synthSFX.playLaser();
  const playSuccessTune = () => {
    synthSFX.playTone(523.25, 'sine', 0.3, 0.04);
    setTimeout(() => synthSFX.playTone(659.25, 'sine', 0.3, 0.04), 100);
    setTimeout(() => synthSFX.playTone(783.99, 'sine', 0.5, 0.04), 200);
  };

  useEffect(() => {
    if (asteroidsShot < 5) {
      setTargets([
        { id: 1, x: 50, y: 50, speedX: 1, speedY: 1, size: 24 },
        { id: 2, x: 200, y: 100, speedX: -1.5, speedY: 0.5, size: 30 },
      ]);
    }
  }, []);

  // Simple animation loop for targets
  useEffect(() => {
    let frameId: number;
    const animateTargets = () => {
      setTargets(prev => prev.map(t => {
        let newX = t.x + t.speedX;
        let newY = t.y + t.speedY;
        let newSpeedX = t.speedX;
        let newSpeedY = t.speedY;

        if (newX < 10 || newX > 320) newSpeedX *= -1;
        if (newY < 10 || newY > 160) newSpeedY *= -1;

        return { ...t, x: newX, y: newY, speedX: newSpeedX, speedY: newSpeedY };
      }));
      frameId = requestAnimationFrame(animateTargets);
    };
    if (asteroidsShot < 5 && !isCompleted) {
      frameId = requestAnimationFrame(animateTargets);
    }
    return () => cancelAnimationFrame(frameId);
  }, [asteroidsShot, isCompleted]);

  // Handle skip game via props
  useEffect(() => {
    if (isCompleted && asteroidsShot < 5) {
      setAsteroidsShot(5);
    }
  }, [isCompleted, asteroidsShot]);

  return (
    <div className="flex-1 flex flex-col">
      {asteroidsShot < 5 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
            DESTROY 5 INCOMING METEORS (SHOT: {asteroidsShot}/5)
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
                onClick={() => {
                  playLaser();
                  setTargets((prev) => prev.filter((tar) => tar.id !== t.id));
                  setAsteroidsShot((prev) => {
                    const next = prev + 1;
                    if (next >= 5) {
                      onComplete();
                      playSuccessTune();
                    }
                    return next;
                  });
                  
                  setTimeout(() => {
                    setTargets((prev) => {
                      if (prev.length < 3 && asteroidsShot < 4) {
                        return [
                          ...prev,
                          {
                            id: Date.now(),
                            x: Math.random() * 260 + 40,
                            y: Math.random() * 120 + 30,
                            speedX: (Math.random() - 0.5) * 4.5,
                            speedY: (Math.random() - 0.5) * 4.5,
                            size: Math.random() * 18 + 18
                          }
                        ];
                      }
                      return prev;
                    });
                  }, 500);
                }}
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
            
            <div className="absolute bottom-2 left-2 text-[8px] font-mono text-green-400">DEFLECTION SHIELD ENERGY: NOMINAL</div>
            <div className="absolute bottom-2 right-2 text-[8px] font-mono text-green-400">AMMUNITION: UNLIMITED</div>
          </div>
        </div>
      ) : (
        <Projects />
      )}
    </div>
  );
}
