import { useElectricalTask } from './hooks/useElectricalTask';

interface ElectricalTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function ElectricalTask({ onComplete, isCompleted }: ElectricalTaskProps) {
  const {
    wireConnections,
    activeWireDrag,
    rightWireColors,
    handleLeftWireClick,
    handleRightWireClick
  } = useElectricalTask({ onComplete, isCompleted });

  return (
    <div className="flex-1 flex flex-col">
      {Object.keys(wireConnections).length < 4 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
          <div className="text-[10px] text-gray-400 font-bold uppercase text-center tracking-wider">
            CLICK A WIRE ON LEFT, THEN MATCH WITH IT'S COLOR ON RIGHT
          </div>

          <div className="w-full max-w-sm bg-neutral-950/80 backdrop-blur-md border border-slate-700/50 shadow-inner rounded-xl p-5 flex relative min-h-[220px]">
            <div className="flex-1 flex flex-col justify-between items-start space-y-4 z-10">
              {['red', 'blue', 'yellow', 'pink'].map((color) => {
                const isConnected = wireConnections[color] !== undefined;
                const isSelected = activeWireDrag === color;
                return (
                  <button
                    key={color}
                    onClick={() => handleLeftWireClick(color)}
                    disabled={isConnected}
                    className={`px-3 py-1.5 rounded border-2 font-mono text-[9px] uppercase font-bold text-black transition-all flex items-center gap-2 select-none ${
                      isConnected ? 'opacity-40 cursor-not-allowed bg-green-500 border-green-700 text-white' :
                      isSelected ? 'ring-2 ring-white scale-105 bg-white text-black' :
                      color === 'red' ? 'bg-red-500 border-red-700' :
                      color === 'blue' ? 'bg-blue-500 border-blue-700 text-white' :
                      color === 'yellow' ? 'bg-yellow-500 border-yellow-600' :
                      'bg-pink-500 border-pink-700 text-white'
                    }`}
                  >
                    <span>{color}</span>
                    {isConnected && <span>✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="absolute inset-x-20 inset-y-0 pointer-events-none z-0">
              <svg className="w-full h-full">
                {Object.entries(wireConnections).map(([leftColor, rightColor]) => {
                  const leftIdx = ['red', 'blue', 'yellow', 'pink'].indexOf(leftColor);
                  const rightIdx = rightWireColors.indexOf(rightColor);
                  
                  const y1 = 28 + leftIdx * 51;
                  const y2 = 28 + rightIdx * 51;
                  
                  return (
                    <line
                      key={leftColor}
                      x1="0"
                      y1={y1}
                      x2="100%"
                      y2={y2}
                      stroke={
                        leftColor === 'red' ? '#ef4444' :
                        leftColor === 'blue' ? '#3b82f6' :
                        leftColor === 'yellow' ? '#f59e0b' :
                        '#ec4899'
                      }
                      strokeWidth="4.5"
                      strokeDasharray="4 2"
                      className="animate-[pulse_1.5s_infinite]"
                    />
                  );
                })}
              </svg>
            </div>

            <div className="flex-1 flex flex-col justify-between items-end space-y-4 z-10">
              {rightWireColors.map((color) => {
                const isMatched = Object.values(wireConnections).includes(color);
                return (
                  <button
                    key={color}
                    onClick={() => handleRightWireClick(color)}
                    disabled={isMatched}
                    className={`px-3 py-1.5 rounded border-2 font-mono text-[9px] uppercase font-bold text-black transition-all flex items-center gap-2 select-none ${
                      isMatched ? 'opacity-40 cursor-not-allowed bg-green-500 border-green-700 text-white' :
                      activeWireDrag ? 'hover:scale-105 active:scale-95 bg-slate-800 text-white border-dashed border-zinc-500' :
                      color === 'red' ? 'bg-red-500 border-red-700' :
                      color === 'blue' ? 'bg-blue-500 border-blue-700 text-white' :
                      color === 'yellow' ? 'bg-yellow-500 border-yellow-600' :
                      'bg-pink-500 border-pink-700 text-white'
                    }`}
                  >
                    <span>{color}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {activeWireDrag && (
            <div className="text-[9px] text-yellow-400 font-mono animate-pulse">
              DRAGGING ACTIVE // CLICK MATCHING RIGHT WIRE
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
          <div className="bg-lime-950/20 border-2 border-lime-500/30 p-2.5 rounded-lg flex items-center justify-between text-xs text-lime-400 font-mono">
            <span className="font-bold">STACK SWITCHBOARD COMPLETED SYSTEM SHUNT</span>
            <span>AUTOMATIC ELECTRICAL SWITCHING ONLINE</span>
          </div>

          <div className="bg-[#0e160f] border border-lime-500/20 p-4 rounded-xl space-y-3">
            <h4 className="text-white text-xs font-bold font-mono uppercase tracking-wider border-b border-dashed border-lime-500/20 pb-1.5">
              INTEGRATED STACK SWITCHES // DIRECT DATA PIPELINES
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
              Connections verified! Just like aligning electrical routes, Ashfakh designs fault-tolerant codebases, plugging RESTful endpoints cleanly into distributed datastores.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1.5">
              <div className="p-2.5 bg-neutral-900 border border-zinc-800 rounded">
                <span className="text-lime-400 block font-bold font-mono text-[10px]">ROUTE A/B: FETCH ENDPOINT</span>
                <span className="text-zinc-400 text-[10px] block mt-0.5">High velocity payload routing under &lt; 80ms latency.</span>
              </div>
              <div className="p-2.5 bg-neutral-900 border border-zinc-800 rounded">
                <span className="text-lime-400 block font-bold font-mono text-[10px]">SYNC C/D: API GATEWAY</span>
                <span className="text-zinc-400 text-[10px] block mt-0.5">Dual-auth security matching headers securely.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
