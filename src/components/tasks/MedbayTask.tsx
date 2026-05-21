import React, { useState, useEffect } from 'react';
import CrewmateSprite, { CrewmateColor } from '../CrewmateSprite';
import WorkExperience from '../portfolio/WorkExperience';

interface MedbayTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
  playerColor: CrewmateColor;
}

export default function MedbayTask({ onComplete, isCompleted, playerColor }: MedbayTaskProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanDiagnostics, setScanDiagnostics] = useState<string[]>([]);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'completed'>('idle');

  const startScanning = () => {
    setScanState('scanning');
    setScanProgress(0);
    setScanDiagnostics(['INITIALIZING DIAGNOSTIC LABS...', 'LOCATING SCAN SUBJECT: ASHFAKH M']);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (scanState === 'scanning') {
      timer = setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + 2;
          
          if (next === 20) {
            setScanDiagnostics((d) => [...d, 'STATION STATUS: EXCELLENT']);
          } else if (next === 45) {
            setScanDiagnostics((d) => [...d, 'COMPILING DEGREE: BSC COMPUTER SCIENCE']);
          } else if (next === 70) {
            setScanDiagnostics((d) => [...d, 'ISSUER: FAROOK COLLEGE, KERALA']);
          } else if (next === 90) {
            setScanDiagnostics((d) => [...d, 'VERIFYING CREDENTIAL: META FRONT-END PROFESSIONAL']);
          } else if (next >= 100) {
            clearInterval(timer);
            setScanState('completed');
            onComplete();
            setScanDiagnostics((d) => [...d, 'SCAN RESULT: CANDIDATE CLEAR FOR LANDING!']);
            return 100;
          }
          return next;
        });
      }, 80);
    }
    return () => clearInterval(timer);
  }, [scanState, onComplete]);

  // Handle skip game via props
  useEffect(() => {
    if (isCompleted && scanState !== 'completed') {
      setScanState('completed');
      setScanProgress(100);
      setScanDiagnostics([
        'BYPASS CRITICAL DATA LOCK',
        'QUALIFICATIONS SHOWN'
      ]);
    }
  }, [isCompleted, scanState]);

  return (
    <div className="flex-1 flex flex-col">
      {scanState !== 'completed' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-2 space-y-6">
          <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-700 rounded-lg p-4 flex flex-col items-center relative overflow-hidden">
            
            {scanState === 'scanning' && (
              <div className="absolute inset-x-0 h-1 bg-green-400 text-green-400 shadow-[0_0_10px_#4caf50] animate-[laser_1.8s_infinite_ease-in-out]" />
            )}

            <div className="mb-4">
              <CrewmateSprite color={playerColor} hat="none" isMoving={false} direction="right" size={90} />
            </div>

            <div className="w-full bg-black/80 rounded p-3 h-28 overflow-y-auto border border-neutral-800 text-[10px] text-green-400 space-y-1 text-left font-mono">
              {scanDiagnostics.map((line, i) => (
                <div key={i} className="leading-tight">{line}</div>
              ))}
              {scanState === 'scanning' && <div className="text-yellow-400 animate-pulse font-bold">SCANNING IN PROGRESS {scanProgress}%...</div>}
            </div>

            {scanState === 'idle' ? (
              <button 
                onClick={startScanning}
                className="mt-4 w-full p-2 bg-green-600 hover:bg-green-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-md shadow border-2 border-black active:translate-y-0.5 cursor-pointer"
                style={{ fontFamily: '"Press Start 2P"' }}
              >
                SUBMIT SCAN
              </button>
            ) : (
              <span className="text-[9px] mt-4 text-gray-500 font-mono animate-pulse">DO NOT STEP OFF PAD</span>
            )}
          </div>
          
          <style>{`
            @keyframes laser {
              0%, 100% { top: 10%; }
              50% { top: 90%; }
            }
          `}</style>
        </div>
      ) : (
        <WorkExperience />
      )}
    </div>
  );
}
