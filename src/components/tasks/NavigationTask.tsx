import { Navigation2, Target } from 'lucide-react';
import { useNavigationTask, NODES } from './hooks/useNavigationTask';

interface NavigationTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function NavigationTask({ onComplete, isCompleted }: NavigationTaskProps) {
  const {
    currentNodeIndex,
    shipPos,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  } = useNavigationTask({ onComplete, isCompleted });


  return (
    <div className="flex-1 flex flex-col">
      {currentNodeIndex < NODES.length ? (
        <div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
          <div className="text-[12px] text-gray-400 font-bold uppercase text-center tracking-wider">
            CHART COURSE
          </div>

          <div 
            className="w-full max-w-lg bg-[#0e1726]/80 backdrop-blur-md border border-[#1f2937]/50 shadow-inner rounded-2xl relative min-h-[260px] overflow-hidden touch-none cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="absolute inset-0 bg-[#000000]/40 bg-[radial-gradient(circle,rgba(30,144,255,0.08)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {/* Path guideline */}
              <polyline 
                points={NODES.map(n => `${n.x}%,${n.y}%`).join(' ')} 
                fill="none" 
                stroke="rgba(59,130,246,0.3)" 
                strokeWidth="4" 
                strokeDasharray="8 8"
              />
              
              {/* Completed segments */}
              {currentNodeIndex > 1 && (
                <polyline 
                  points={NODES.slice(0, currentNodeIndex).map(n => `${n.x}%,${n.y}%`).join(' ')} 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="4" 
                />
              )}

              {/* Active dragging line */}
              {isDragging && currentNodeIndex < NODES.length && (
                <line
                  x1={`${NODES[currentNodeIndex - 1].x}%`}
                  y1={`${NODES[currentNodeIndex - 1].y}%`}
                  x2={`${shipPos.x}%`}
                  y2={`${shipPos.y}%`}
                  stroke="#3b82f6"
                  strokeWidth="4"
                />
              )}
            </svg>

            {/* Nodes */}
            {NODES.map((node, i) => (
              <div
                key={i}
                className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center z-20 transition-colors duration-300 ${
                  i < currentNodeIndex 
                    ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] border-2 border-white' 
                    : 'bg-gray-800 border-2 border-gray-500 shadow-inner'
                }`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {i === NODES.length - 1 && (
                  <Target className={`w-3 h-3 ${i < currentNodeIndex ? 'text-white' : 'text-gray-500'}`} />
                )}
                {i < currentNodeIndex && i !== NODES.length - 1 && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
            ))}

            {/* The Ship */}
            <div
              className={`absolute w-10 h-10 -ml-5 -mt-5 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center z-30 shadow-[0_0_20px_rgba(59,130,246,0.8)] pointer-events-none ${isDragging ? 'scale-110' : 'scale-100'}`}
              style={{ 
                left: `${shipPos.x}%`, 
                top: `${shipPos.y}%`,
                transition: isDragging ? 'none' : 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <Navigation2 className="w-5 h-5 text-white transform rotate-45 -ml-0.5 mt-0.5" />
            </div>

            <div className="absolute bottom-4 w-full text-center pointer-events-none">
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/40 px-3 py-1 rounded backdrop-blur-sm border border-cyan-800/50">
                DRAG SHIP THROUGH WAYPOINTS
              </span>
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
              STATUS: I am currently in Malappuram district and ready to relocate if the task or website needs it.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

