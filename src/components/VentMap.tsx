import { FLOATING_VENTS } from '../gameConfig';

interface VentMapProps {
  isOpen: boolean;
  onClose: () => void;
  triggerVentTravel: (targetRoomId: string) => void;
}

export default function VentMap({ isOpen, onClose, triggerVentTravel }: VentMapProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/90 z-40 flex flex-col items-center justify-center p-6 text-center select-none font-mono animate-fadeIn">
      <div className="w-full max-w-md bg-[#111122] border-4 border-[#3a3a5e] p-5 rounded-xl text-center space-y-4">
        <h3 className="text-xs font-bold text-[#38FEDE]" style={{ fontFamily: '"Press Start 2P"' }}>💨 SECTOR VENTILATION DUCTWAYS</h3>
        <p className="text-[11px] text-slate-400 font-medium">Bypass security rooms to emerge instantly at secondary ports.</p>
        
        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
          {FLOATING_VENTS.map((v) => (
            <button
              key={v.id}
              onClick={() => triggerVentTravel(v.rx)}
              className="p-3 bg-[#0a0a16] hover:bg-[#38FEDE]/10 border-2 border-slate-800 hover:border-[#38FEDE] text-white hover:text-[#38FEDE] rounded transition-all cursor-pointer font-bold flex flex-col items-center"
            >
              <span className="text-lg">⚙</span>
              <span className="mt-1 truncate uppercase text-[9px]">{v.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="mt-4 text-[10px] text-gray-500 underline hover:text-white cursor-pointer"
        >
          Cancel - Exit Duct
        </button>
      </div>
    </div>
  );
}
