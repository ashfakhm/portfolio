import React, { useState, useRef, useEffect } from 'react';
import { User, Shield } from 'lucide-react';

interface AdminTaskProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export default function AdminTask({ onComplete, isCompleted }: AdminTaskProps) {
  const [swipeProgress, setSwipeProgress] = useState(0); // 0 to 100
  const [swipeStatus, setSwipeStatus] = useState<'idle' | 'swiping' | 'too-fast' | 'too-slow' | 'success' | 'bad-read'>('idle');
  const [cardGrabbed, setCardGrabbed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const swipeTrackRef = useRef<HTMLDivElement>(null);

  // We don't enforce too-fast/too-slow strictly here for better UX, but we can if desired.
  const handleCardDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (swipeStatus === 'success') return;
    setCardGrabbed(true);
    setSwipeStatus('swiping');
  };

  const handleCardDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!cardGrabbed || !swipeTrackRef.current) return;
    
    const rect = swipeTrackRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left;
    
    let percentage = (relativeX / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    setSwipeProgress(percentage);

    if (percentage >= 80) {
      setCardGrabbed(false);
      setSwipeStatus('success');
      onComplete();
    }
  };

  useEffect(() => {
    const handleDragEnd = () => {
      if (cardGrabbed) {
        setCardGrabbed(false);
        if (swipeStatus === 'swiping') {
          setSwipeStatus('idle');
          setSwipeProgress(0);
        }
      }
    };
    
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
    return () => {
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [cardGrabbed, swipeStatus]);

  return (
    <div className="flex-1 flex flex-col">
      {!isCompleted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-2 space-y-6">
          <div className="w-full max-w-[600px] h-full sm:h-auto min-h-[400px] bg-[#d3d3d3] border-[16px] border-[#9e9e9e] rounded-[30px] p-6 flex flex-col justify-between shadow-2xl relative">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 h-24 bg-black border-[6px] border-[#6b6b6b] rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center font-mono font-bold tracking-wider uppercase text-sm">
                  {swipeStatus === 'idle' && <span className="text-green-500 animate-pulse">PLEASE INSERT CARD.</span>}
                  {swipeStatus === 'swiping' && <span className="text-yellow-400">READING CARD...</span>}
                  {swipeStatus === 'too-fast' && <span className="text-red-500 animate-shake">TOO FAST. TRY AGAIN.</span>}
                  {swipeStatus === 'too-slow' && <span className="text-red-500 animate-shake">TOO SLOW. TRY AGAIN.</span>}
                  {swipeStatus === 'bad-read' && <span className="text-red-500 animate-shake">BAD READ. TRY AGAIN.</span>}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 pt-2 pr-2">
                <div className={`w-6 h-6 rounded-full border-4 border-slate-600 ${['too-fast', 'too-slow', 'bad-read'].includes(swipeStatus) ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-red-900'}`} />
                <div className={`w-6 h-6 rounded-full border-4 border-slate-600 ${swipeStatus === 'success' ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-green-900'}`} />
              </div>
            </div>

            <div className="w-full relative flex-1 flex flex-col justify-center my-6">
              <div className="w-full h-20 bg-black border-y-8 border-[#3f3f3f] flex items-center shadow-inner relative z-0">
                 <div className="absolute inset-x-0 w-full flex justify-around text-[#3f3f3f] text-2xl font-black select-none pointer-events-none">
                    <span>»</span><span>»</span><span>»</span><span>»</span><span>»</span>
                 </div>
              </div>
              
              <div 
                ref={swipeTrackRef}
                onMouseMove={handleCardDrag}
                onTouchMove={handleCardDrag}
                className="absolute inset-x-0 inset-y-0 z-10 flex items-center min-h-[160px]"
              >
                <div
                  ref={cardRef}
                  onMouseDown={handleCardDragStart}
                  onTouchStart={handleCardDragStart}
                  className={`absolute cursor-grab active:cursor-grabbing w-[200px] h-[120px] bg-white border-2 border-gray-300 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.4)] flex flex-col p-3 transition-opacity ${swipeStatus === 'success' ? 'opacity-0 pointer-events-none' : ''}`}
                  style={{ 
                    left: `calc(2% + ${swipeProgress * 0.6}%)`,
                    top: '50%',
                    translate: '0 -50%',
                    transition: cardGrabbed ? 'none' : 'left 0.3s ease-out'
                  }}
                >
                  <div className="w-full flex-1 flex gap-3">
                     <div className="w-16 h-20 bg-gray-200 border border-gray-400 rounded flex items-center justify-center text-3xl overflow-hidden shadow-inner">
                       <User size={32} className="text-gray-500" />
                     </div>
                     <div className="flex-1 flex flex-col pt-1">
                       <div className="w-full h-4 bg-red-600 mb-3 rounded-sm opacity-90 shadow-sm" />
                       <span className="text-[10px] font-black text-black uppercase mb-1">ASHFAKH M</span>
                       <span className="text-[8px] font-bold text-gray-500 uppercase">Engineer ID: #994</span>
                     </div>
                  </div>
                  
                  <div className="flex gap-1.5 mt-auto px-1 h-4">
                     <div className="w-1 h-full bg-black/80" />
                     <div className="w-2.5 h-full bg-black/80" />
                     <div className="w-1.5 h-full bg-black/80" />
                     <div className="w-0.5 h-full bg-black/80" />
                     <div className="w-3 h-full bg-black/80" />
                     <div className="w-1.5 h-full bg-black/80" />
                     <div className="w-2.5 h-full bg-black/80" />
                     <div className="w-1 h-full bg-black/80" />
                     <div className="w-0.5 h-full bg-black/80" />
                     <div className="w-0.5 h-full bg-black/80" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center font-bold text-[#6b6b6b] text-xs uppercase tracking-widest bg-black/5 rounded p-2 border-2 border-black/10 mt-auto shadow-inner">
              Click & drag ID card entirely to the right
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 bg-[#1a1a2e] border-2 border-[#3a3a5e] p-4 rounded-lg flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-400" />
                  <h4 className="text-xs text-green-400 font-bold uppercase tracking-wider">SECURE AUTHORIZATION</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Credentials authenticated. Ashfakh's technological coordinates list is fully exposed across Stations.
                </p>
              </div>

              <div className="pt-4 border-t border-[#3a3a5e] space-y-1 text-[10px]" style={{ fontFamily: '"Fira Code", monospace' }}>
                <div className="text-yellow-400">SEO: 100/100</div>
                <div className="text-blue-400">PERSISTENCE: 100%</div>
                <div className="text-green-400">STABILITY: IMMUNE</div>
              </div>
            </div>

            <div className="md:col-span-3 space-y-4">
              <div className="bg-[#10101f] border border-[#3a3a5e] p-3 rounded-lg">
                <span className="text-[10px] text-[#38FEDE] font-bold uppercase tracking-wider block mb-1.5 border-b border-dashed border-[#3a3a5e] pb-1">STATION 1 — FRONTEND CONTROL</span>
                <div className="flex flex-wrap gap-2">
                  {['Next.js (App Router)', 'React.js', 'TypeScript', 'Tailwind CSS', 'SSR', 'Server Actions'].map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] cursor-pointer bg-slate-900 border border-slate-700 hover:border-[#1a9eff] px-2 py-1 rounded text-white flex items-center gap-1.5 transition-all"
                      title="100 SEO score achieved"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#10101f] border border-[#3a3a5e] p-3 rounded-lg">
                <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider block mb-1.5 border-b border-dashed border-[#3a3a5e] pb-1 font-mono">STATION 2 — BACKEND PIPELINES</span>
                <div className="flex flex-wrap gap-2">
                  {['FastAPI', 'Django', 'Node.js', 'RESTful APIs', 'Webhooks', 'Idempotent Logic'].map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] cursor-pointer bg-slate-900 border border-slate-700 hover:border-yellow-400 px-2 py-1 rounded text-white flex items-center gap-1.5 transition-all"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#10101f] border border-[#3a3a5e] p-3 rounded-lg">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block mb-1.5 border-b border-dashed border-[#3a3a5e] pb-1">STATION 3 — DATASTORES & LANGUAGES</span>
                <div className="flex flex-wrap gap-1.5 text-[9px]">
                  {['MongoDB', 'PostgreSQL', 'Prisma ORM', 'Python', 'TypeScript', 'JavaScript(ES6)', 'Java', 'SQL', 'PHP'].map((skill, idx) => (
                    <span key={idx} className="bg-[#18182d] px-1.5 py-0.5 rounded border border-[#3a3a5e] text-slate-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#10101f] border border-[#3a3a5e] p-3 rounded-lg">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1.5 border-b border-dashed border-[#3a3a5e] pb-1">STATION 4 — TOOLKITS</span>
                <div className="flex flex-wrap gap-1.5 text-[9px]">
                  {['Git', 'GitHub', 'Postman', 'Vercel', 'VS Code', 'Google Lighthouse'].map((tool, idx) => (
                    <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-[#3a3a5e] text-slate-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
