import { useStorageTask } from './hooks/useStorageTask';

interface StorageTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function StorageTask({ onComplete, isCompleted }: StorageTaskProps) {
  const { fuelLevel, refuelState, startRefueling, stopRefueling } = useStorageTask({ onComplete, isCompleted });

  return (
    <div className="flex-1 flex flex-col">
      {refuelState !== 'completed' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-2 space-y-6">
          <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-700 rounded-lg p-5 flex flex-col items-center relative overflow-hidden">
            <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">Refuel engine to establish communication paths</div>
            
            <div className="w-24 h-36 bg-neutral-950 border-4 border-slate-600 rounded-xl relative overflow-hidden flex flex-col justify-end p-1">
              <div className="absolute top-1 left-1.5 text-[8px] font-mono text-zinc-600">FUEL CELL</div>
              <div 
                className="w-full bg-[#f1c40f] border-t border-yellow-300 rounded-sm transition-all duration-100"
                style={{ height: `${fuelLevel}%` }}
              >
                {fuelLevel > 15 && (
                  <div className="text-[10px] text-black font-extrabold text-center select-none animate-pulse">
                    {fuelLevel}%
                  </div>
                )}
              </div>
            </div>

            <div className="w-full mt-5 space-y-3">
              <button
                onMouseDown={startRefueling}
                onMouseUp={stopRefueling}
                onMouseLeave={stopRefueling}
                onTouchStart={startRefueling}
                onTouchEnd={stopRefueling}
                className={`w-full py-3 bg-[#e67e22] hover:bg-[#d35400] text-black font-extrabold text-[10px] sm:text-xs uppercase tracking-wider rounded border-2 border-black active:translate-y-0.5 cursor-pointer touch-none select-none text-center ${
                  refuelState === 'refueling' ? 'animate-pulse bg-yellow-500' : ''
                }`}
                style={{ fontFamily: '"Press Start 2P"' }}
              >
                {refuelState === 'refueling' ? 'FUELING...' : 'HOLD TO REFUEL'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
          <div className="bg-amber-950/20 border-2 border-yellow-500/30 p-3 rounded-lg flex items-center justify-between text-xs text-yellow-500 font-mono">
            <span className="font-bold">ESTABLISHED DIRECT CHANNELS TO ASHFAKH'S TRANSMISSIONS</span>
            <span>LOCAL STATION CLOUD SECURED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


            {/* LinkedIn Node */}
            <a href="https://linkedin.com/in/ashfakhm/" target="_blank" rel="noreferrer" className="bg-[#10101f] border border-[#3a3a5e] p-6 rounded-lg flex items-center gap-4 hover:border-blue-500/50 hover:bg-[#1a1a2e] transition-all group">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all border border-blue-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </div>
              <div>
                <h4 className="text-white font-bold tracking-widest text-sm uppercase font-mono group-hover:text-blue-400 transition-colors">LinkedIn Hub</h4>
                <p className="text-xs text-gray-500 font-mono mt-1">/in/ashfakhm/</p>
              </div>
            </a>

            {/* GitHub Node */}
            <a href="https://github.com/ashfakhm" target="_blank" rel="noreferrer" className="bg-[#10101f] border border-[#3a3a5e] p-6 rounded-lg flex items-center gap-4 hover:border-slate-400 hover:bg-[#1a1a2e] transition-all group">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-slate-700 group-hover:scale-110 transition-all border border-slate-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </div>
              <div>
                <h4 className="text-white font-bold tracking-widest text-sm uppercase font-mono group-hover:text-slate-300 transition-colors">GitHub Repository</h4>
                <p className="text-xs text-gray-500 font-mono mt-1">@ashfakhm</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
