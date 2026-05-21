import { Send, RefreshCw } from 'lucide-react';
import CrewmateSprite, { CrewmateColor } from '../CrewmateSprite';
import { useEmergencyTask } from './hooks/useEmergencyTask';

interface EmergencyTaskProps {
  onComplete: () => void;
  playerColor: CrewmateColor;
}

export default function EmergencyTask({ onComplete, playerColor }: EmergencyTaskProps) {
  const {
    gameStarted,
    setGameStarted,
    contactName,
    setContactName,
    contactEmail,
    setContactEmail,
    contactMessage,
    setContactMessage,
    meetingSubmitted,
    setMeetingSubmitted,
    meetingEjectedText,
    isEjecting,
    handleVoteSubmit
  } = useEmergencyTask({ onComplete });


  return (
    <>
      {isEjecting && (
        <div className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute inset-0 animate-pulse bg-[radial-gradient(white_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
          
          <div className="animate-bounce mb-8">
            <CrewmateSprite color={playerColor} hat="none" isMoving={true} direction="right" size={100} />
          </div>
          
          <p 
            className="text-[10px] md:text-sm text-red-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl"
            style={{ fontFamily: '"Press Start 2P"' }}
          >
            {meetingEjectedText}
          </p>
          
          <div className="mt-8 flex items-center gap-2 text-xs text-gray-500">
            <RefreshCw size={14} className="animate-spin" />
            <span>Broadcasting to Kerala, India...</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        {!meetingSubmitted ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-2 items-center">
            
            <div className="md:col-span-2 flex flex-col items-center justify-center p-4 text-center">
              <button
                onClick={() => setGameStarted(true)}
                className={`w-32 h-32 rounded-full bg-red-600 hover:bg-red-500 border-4 border-black relative transition-all active:scale-95 shadow-[0_15px_0_#910505,_0_20px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_0_#910505,_0_15px_15px_rgba(0,0,0,0.3)] select-none cursor-pointer flex items-center justify-center group ${
                  gameStarted ? 'animate-pulse bg-red-500 shadow-none translate-y-2.5 border-red-400' : ''
                }`}
              >
                <span 
                  className="text-[10px] md:text-xs font-black text-white uppercase select-none leading-none max-w-[80px]"
                  style={{ fontFamily: '"Press Start 2P"' }}
                >
                  {gameStarted ? 'TAP IN!' : 'REPORT INFO' }
                </span>
              </button>
              
              <div className="text-xs text-red-500 font-bold mt-10 uppercase tracking-widest leading-relaxed">
                "IN EMERGENCY MEETING, REPORT CORRESPONDENCE FEED!"
              </div>
            </div>

            <div className="md:col-span-3 bg-[#1c1c30] border border-[#3a3a5e] p-5 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Send size={16} className="text-red-500 animate-bounce" />
                <h4 className="text-sm font-semibold tracking-wide text-white uppercase">VOTE TO ACQUIRE INBOX LOGS</h4>
              </div>

              <form onSubmit={handleVoteSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">CREWMATE NAME (Your Name)</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Freelancer / HR Agent"
                    className="w-full p-2 bg-[#0d0d1a] border border-[#3a3a5e] rounded text-white focus:outline-none focus:border-red-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">TRANSMISSION FREQUENCY (Your Email)</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@frequency.com"
                    className="w-full p-2 bg-[#0d0d1a] border border-[#3a3a5e] rounded text-white focus:outline-none focus:border-red-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">YOUR CORRESPONDENCE REPORT (Your Message / Offer)</label>
                  <textarea
                    required
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="We want to recruit you! Let's schedule a meeting."
                    className="w-full p-2 bg-[#0d0d1a] border border-[#3a3a5e] rounded text-white focus:outline-none focus:border-red-500 transition-all font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded cursor-pointer uppercase transition-all tracking-wider text-center border-2 border-black flex items-center justify-center gap-2 text-xs"
                  style={{ fontFamily: '"Press Start 2P"' }}
                >
                  CALL MEETING
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fadeIn">
            <div className="p-4 bg-green-950/20 border border-green-500/30 rounded-lg max-w-md">
              <h3 className="text-sm font-bold text-green-400 mb-2">COMS RECORDED SUCCESSFULLY</h3>
              <p className="text-xs text-gray-300 leading-normal">
                Thank you for submitting! Your report has bypassed firewall protocols and landed securely in ashfakhthedev@gmail.com inbox logs.
              </p>
              <p className="text-[10px] text-slate-400 mt-3 italic">
                "Ashfakh will report back to your coordinates shortly."
              </p>
            </div>
            
            <button 
              onClick={() => setMeetingSubmitted(false)}
              className="p-2 border border-[#3a3a5e] text-xs hover:text-white rounded transition-colors text-slate-400 cursor-pointer"
            >
              SEND ANOTHER REPORT
            </button>
          </div>
        )}
      </div>
    </>
  );
}
