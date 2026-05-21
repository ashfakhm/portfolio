import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { synthSFX } from '../utils/sound';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('tutorialMinimized') === 'true';
  });

  useEffect(() => {
    // Detect typical touch / mobile dimensions
    const checkMobile = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobileDevice(isTouch || isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Minimize slowly after presentation if not permanently dismissed
  useEffect(() => {
    if (isOpen) {
      const isPermanentlyMinimized = localStorage.getItem('tutorialMinimized') === 'true';
      if (!isPermanentlyMinimized) {
        setIsMinimized(false);
        const t = setTimeout(() => setIsMinimized(true), 8000);
        return () => clearTimeout(t);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 max-h-[calc(100vh-2rem)] w-[360px] max-w-[calc(100vw-2rem)] z-[60] flex flex-col pointer-events-none animate-fadeIn">
      <div 
        className={`w-full bg-[#0f111a]/90 backdrop-blur-md border border-[#38FEDE]/40 rounded-xl flex flex-col shadow-[0_4px_25px_rgba(56,254,222,0.15)] relative overflow-hidden text-left pointer-events-auto transition-all duration-300 ${isMinimized ? 'h-[50px]' : 'max-h-[70vh]'}`}
        style={{ textShadow: 'none' }}
      >
        {/* Glowing top border accent */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#3a3a5e] via-[#38FEDE] to-[#3a3a5e]" />

        {/* Header (Always Visible) */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer bg-slate-900/50 hover:bg-slate-800/50 transition-colors"
          onClick={() => {
            const next = !isMinimized;
            setIsMinimized(next);
            localStorage.setItem('tutorialMinimized', String(next));
          }}
        >
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg animate-bounce">🎮</span>
            <div className="text-[#38FEDE] text-[10px] font-black uppercase tracking-widest" style={{ fontFamily: '"Press Start 2P"' }}>
              CO-PILOT MANUAL
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                synthSFX.playBeep();
              }}
              className="text-slate-400 hover:text-white hover:bg-rose-500/20 p-1 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body (Hidden when minimized) */}
        {!isMinimized && (
          <div className="flex-1 p-4 pt-0 space-y-4 text-xs font-mono text-slate-300 overflow-y-auto mt-2 custom-scrollbar">
            <p className="text-[9px] text-[#38FEDE] uppercase tracking-wider font-bold select-none leading-relaxed">
              The Boogeyman is coming to kill you! Finish your tasks quickly. If you finish them all, you win. Otherwise, the Boogeyman wins!
            </p>

            {/* Grid content */}
            <div className="space-y-3 text-left">
              <div className="bg-[#141724] border border-slate-700 p-2.5 rounded space-y-1.5 flex gap-2.5">
                 <div className="text-lg">🕹️</div>
                 <div className="flex-1">
                   <div className="font-bold text-white uppercase text-[#ffd700] tracking-wider text-[10px] font-sans border-b border-slate-700 pb-1 mb-1.5">How to Move</div>
                   {isMobileDevice ? (
                    <ul className="list-disc pl-4 space-y-1 text-[9px] text-slate-400">
                      <li><strong className="text-slate-200">On-Screen Pad:</strong> Drag the bottom-left stick.</li>
                      <li><strong className="text-slate-200">Autopilot Click:</strong> Tap floor map to auto-run.</li>
                      <li><strong className="text-slate-200">HUD Nav:</strong> Tap any mission in top-left list.</li>
                    </ul>
                  ) : (
                    <ul className="list-disc pl-4 space-y-1 text-[9px] text-slate-400">
                      <li><strong className="text-slate-200">Move:</strong> <kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-white">W</kbd><kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-white">A</kbd><kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-white">S</kbd><kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-white">D</kbd> or Arrows.</li>
                      <li><strong className="text-slate-200">Map:</strong> <kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-white">M</kbd> or <kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-white">TAB</kbd>.</li>
                      <li><strong className="text-slate-200">Autopilot Click:</strong> Click floor map to run.</li>
                      <li><strong className="text-slate-200">HUD Nav:</strong> Click mission list top-left.</li>
                    </ul>
                  )}
                 </div>
              </div>

              <div className="bg-[#141724] border border-slate-700 p-2.5 rounded space-y-1.5 flex gap-2.5">
                 <div className="text-lg">🚀</div>
                 <div className="flex-1">
                  <div className="font-bold text-white uppercase text-[#ffd700] tracking-wider text-[10px] font-sans border-b border-slate-700 pb-1 mb-1.5">Doing Tasks</div>
                  <ul className="list-disc pl-4 space-y-1 text-[9px] text-slate-400">
                    <li><strong className="text-slate-200">Interact:</strong> Go to yellow markers, tap green <strong className="text-[#38FEDE]">USE</strong> or hit <kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-white">SPACE</kbd>.</li>
                    <li><strong className="text-slate-200">Fix Mini-games:</strong> Don't close early or it resets!</li>
                  </ul>
                 </div>
              </div>

              <div className="bg-[#141724] border border-slate-700 p-2.5 rounded space-y-1.5 flex gap-2.5">
                <div className="text-lg">🚇</div>
                <div className="flex-1">
                  <div className="font-bold text-white uppercase text-[#ffd700] tracking-wider text-[10px] font-sans border-b border-slate-700 pb-1 mb-1.5">Warping & Reporting</div>
                  <ul className="list-disc pl-4 space-y-1 text-[9px] text-slate-400">
                    <li><strong className="text-slate-200">Fast Travel:</strong> Use secret passages via <kbd className="px-1 bg-slate-900 border border-slate-700 rounded text-white">V</kbd> or <strong className="text-sky-400">PASSAGE</strong> button.</li>
                    <li><strong className="text-slate-200">Report:</strong> Tap Cafeteria red table button to contact.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Horizontal Confirm Bar */}
            <div className="mt-4 pb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                  localStorage.setItem('tutorialMinimized', 'true');
                  synthSFX.playBeep();
                }}
                className="w-full bg-[#38FEDE]/10 hover:bg-[#38FEDE]/20 text-[#38FEDE] border border-[#38FEDE]/50 py-3 rounded uppercase font-bold tracking-widest text-[10px] transition-colors flex items-center justify-center gap-2"
                style={{ fontFamily: '"Press Start 2P"' }}
              >
                <span>CONFIRM & START</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
