
import { Rocket, Volume2, VolumeX } from "lucide-react";
import CrewmateSprite, { CrewmateColor, CrewmateHat, CREWMATE_COLORS, CREWMATE_HATS } from "./CrewmateSprite";
import ThreeCrewmate from "./ThreeCrewmate";
import { synthSFX } from "../utils/sound";

interface LobbyScreenProps {
  inLobby: boolean;
  progressCount: number;
  lobbyTab: "color" | "hat";
  setLobbyTab: (t: "color" | "hat") => void;
  playerColor: CrewmateColor;
  setPlayerColor: (c: CrewmateColor) => void;
  playerHat: CrewmateHat;
  setPlayerHat: (h: CrewmateHat) => void;
  enterMissionShip: () => void;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
}

export default function LobbyScreen({
  inLobby, progressCount, lobbyTab, setLobbyTab, playerColor, setPlayerColor, playerHat, setPlayerHat, enterMissionShip, soundOn, setSoundOn
}: LobbyScreenProps) {
  if (!inLobby) return null;
  return (
    <>
      {/* ==================================================== */}
      {inLobby && (
        <div className="absolute inset-0 z-50 bg-[#0c121e] flex flex-col items-center justify-center p-4 overflow-y-auto select-none" style={{ backgroundImage: 'radial-gradient(ellipse at center, #1b283a 10%, #06090e 100%)' }}>
          
          {/* Top Yellow Hazard Warning Line */}
          <div className="w-full h-3 bg-repeating-warning opacity-90 absolute top-0 left-0 right-0 border-b-2 border-black" style={{ background: 'repeating-linear-gradient(45deg, #e11d48, #e11d48 10px, #000 10px, #000 20px)' }} />

          <div className="w-full max-w-5xl bg-[#182030] border-[8px] border-black rounded-[24px] p-5 md:p-6 shadow-[0_12px_0_#000] flex flex-col relative md:min-h-[620px] max-h-[92vh] justify-between overflow-hidden">
            
            {/* Header Station ID panel */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b-4 border-black pb-3 mb-4 gap-2 bg-[#090d14] p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping border-2 border-black" />
                <h2 className="text-[10px] md:text-sm font-black text-[#e2e8f0]" style={{ fontFamily: '"Press Start 2P"' }}>
                  🛰️ DROPSHIP HOLDING BAY 04
                </h2>
              </div>
              <div className="text-[9px] md:text-xs text-yellow-500 font-bold uppercase tracking-wider font-mono">
                CO-PILOTS INVITED: 4/10 · REGION: SG-1
              </div>
            </div>

            {/* Central Layout columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch overflow-y-auto pr-1">
              
              {/* Left Column (Lg: 7) - Team bench/Roster of joined players */}
              <div className="lg:col-span-7 bg-[#0b0e14] border-4 border-black rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-[#38FEDE] text-[10px] md:text-xs font-black uppercase tracking-widest mb-3" style={{ fontFamily: '"Press Start 2P"' }}>
                    👥 SHIP CO-PILOTS LIST
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mb-4 uppercase leading-relaxed">
                    A co-pilot's primary duty is task-maintenance and finding the lone impostor.
                  </p>
                </div>

                {/* Team roster entries */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                  
                  {/* Player 1 (YOU!) */}
                  <div className="bg-[#121c2c] border-2 border-[#1a9eff] p-2.5 rounded-lg flex items-center gap-3 shadow-md hover:scale-[1.02] transform transition-all">
                    <div className="bg-black/50 p-1 rounded-md border border-slate-700">
                      <CrewmateSprite color={playerColor} hat={playerHat} isMoving={true} direction="right" size={38} />
                    </div>
                    <div className="font-mono text-left truncate flex-1 leading-normal">
                      <div className="font-black text-rose-500 text-[11px] uppercase tracking-wide flex items-center gap-1">
                        <span>YOU</span>
                        <span className="text-[8px] bg-sky-900 text-sky-200 px-1 py-0 rounded border border-sky-400">YOU</span>
                      </div>
                      <span className="text-[9px] text-[#50F01E] block font-bold">★ LOBBY HOST</span>
                      <span className="text-[8px] text-slate-400 block uppercase">SUIT: {playerColor}</span>
                    </div>
                  </div>

                  {/* Player 2 (Bot Pizza) */}
                  <div className="bg-[#181d28] border-2 border-black p-2.5 rounded-lg flex items-center gap-3 shadow hover:scale-[1.02] transform transition-all">
                    <div className="bg-black/40 p-1 rounded-md border border-slate-800">
                      <CrewmateSprite color="purple" hat="crown" isMoving={true} direction="right" size={38} />
                    </div>
                    <div className="font-mono text-left truncate flex-1 leading-normal">
                      <div className="font-black text-slate-200 text-[11px] uppercase tracking-wide">
                        PIZZA_ACE
                      </div>
                      <span className="text-[9px] text-yellow-500 block font-bold">✦ CO-PILOT</span>
                      <span className="text-[8px] text-slate-400 block uppercase">STATUS: READY</span>
                    </div>
                  </div>

                  {/* Player 3 (Bot BlueTech) */}
                  <div className="bg-[#181d28] border-2 border-black p-2.5 rounded-lg flex items-center gap-3 shadow hover:scale-[1.02] transform transition-all">
                    <div className="bg-black/40 p-1 rounded-md border border-slate-800">
                      <CrewmateSprite color="lime" hat="plant" isMoving={true} direction="right" size={38} />
                    </div>
                    <div className="font-mono text-left truncate flex-1 leading-normal">
                      <div className="font-black text-slate-200 text-[11px] uppercase tracking-wide">
                        LIME_TECH
                      </div>
                      <span className="text-[9px] text-cyan-400 block font-bold">✦ SYS ENGINEER</span>
                      <span className="text-[8px] text-slate-400 block uppercase">STATUS: LOBBED</span>
                    </div>
                  </div>

                  {/* Player 4 (Bot Ronaldo) */}
                  <div className="bg-[#181d28] border-2 border-black p-2.5 rounded-lg flex items-center gap-3 shadow hover:scale-[1.02] transform transition-all">
                    <div className="bg-black/40 p-1 rounded-md border border-slate-800">
                      <CrewmateSprite color="cyan" hat="egg" isMoving={true} direction="right" size={38} />
                    </div>
                    <div className="font-mono text-left truncate flex-1 leading-normal">
                      <div className="font-black text-slate-200 text-[11px] uppercase tracking-wide">
                        RONALDO_9
                      </div>
                      <span className="text-[9px] text-purple-400 block font-bold">✦ NAV SEC</span>
                      <span className="text-[8px] text-slate-400 block uppercase">STATUS: SYNCED</span>
                    </div>
                  </div>

                </div>

                <div className="mt-3 border-t border-slate-800 pt-2 text-left">
                  <span className="text-[8px] md:text-[9px] text-slate-500 block uppercase font-mono">
                    🤖 simulated players automatically populate lobby to enable instant local gameplay.
                  </span>
                </div>
              </div>

              {/* Right Column (Lg: 5) - Customized Laptop Terminal */}
              <div className="lg:col-span-5 bg-[#121824] border-4 border-black rounded-xl p-4 flex flex-col justify-between">
                <div>
                  {/* Title of Customs laptop */}
                  <div className="flex items-center gap-2 mb-2 bg-black/60 p-2 rounded-lg border border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#50F01E] animate-pulse" />
                    <span className="text-[#50F01E] text-[8px] md:text-[9px] font-black uppercase tracking-wider" style={{ fontFamily: '"Press Start 2P"' }}>
                      💻 CUSTOMS LAPTOP CORE
                    </span>
                  </div>

                  {/* Interactive Tab switches */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => { setLobbyTab('color'); synthSFX.playBeep(); }}
                      className={`py-1.5 px-2 text-[9px] tracking-widest font-bold uppercase rounded cursor-pointer border-2 transition-all ${
                        lobbyTab === 'color' 
                          ? 'bg-rose-600 text-white border-black shadow-[0_3px_0_#4a0404]' 
                          : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                      }`}
                      style={{ fontFamily: '"Press Start 2P"' }}
                    >
                      🚀 SUITS
                    </button>
                    <button
                      onClick={() => { setLobbyTab('hat'); synthSFX.playBeep(); }}
                      className={`py-1.5 px-2 text-[9px] tracking-widest font-bold uppercase rounded cursor-pointer border-2 transition-all ${
                        lobbyTab === 'hat' 
                          ? 'bg-rose-600 text-white border-black shadow-[0_3px_0_#4a0404]' 
                          : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
                      }`}
                      style={{ fontFamily: '"Press Start 2P"' }}
                    >
                      👒 HATS
                    </button>
                  </div>

                  {/* Active tab content block */}
                  <div className="bg-[#0b0e14] border-2 border-black p-3.5 rounded-lg max-h-[175px] overflow-y-auto">
                    {lobbyTab === 'color' ? (
                      <div className="space-y-2">
                        <span className="text-[8px] text-[#38FEDE] font-bold block uppercase font-mono">Select Astronaut Fabric:</span>
                        <div className="grid grid-cols-5 gap-1.5 justify-center">
                          {Object.keys(CREWMATE_COLORS).map((col) => (
                            <button
                              key={col}
                              onClick={() => { setPlayerColor(col as CrewmateColor); synthSFX.playBeep(); }}
                              className={`w-8 h-8 rounded-lg border-2 cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-md relative group flex items-center justify-center`}
                              style={{ 
                                backgroundColor: CREWMATE_COLORS[col as CrewmateColor].fill,
                                borderColor: playerColor === col ? '#FFFFFF' : '#334155'
                              }}
                              title={CREWMATE_COLORS[col as CrewmateColor].name}
                            >
                              {playerColor === col && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[8px] text-[#38FEDE] font-bold block uppercase font-mono">Select Spacesuit Headwear:</span>
                        <div className="grid grid-cols-3 gap-1.5 text-xs">
                          {Object.keys(CREWMATE_HATS).map((h) => (
                            <button
                              key={h}
                              onClick={() => { setPlayerHat(h as CrewmateHat); synthSFX.playBeep(); }}
                              className={`p-2 rounded bg-slate-900 border font-mono text-center hover:bg-slate-800 cursor-pointer text-xs transform transition-all active:scale-95 ${
                                playerHat === h ? 'border-[#38FEDE] text-white bg-slate-800' : 'border-slate-800 text-gray-400'
                              }`}
                              title={CREWMATE_HATS[h as CrewmateHat].name}
                            >
                              <div className="text-sm">{CREWMATE_HATS[h as CrewmateHat].emoji}</div>
                              <div className="text-[6px] truncate font-bold uppercase mt-1">{CREWMATE_HATS[h as CrewmateHat].name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom astronaut preview 3D rotating card */}
                <div className="bg-[#080b11] border-2 border-black rounded-lg p-2.5 flex items-center justify-center gap-4 relative overflow-hidden mt-3 shadow-inner h-[190px]">
                  {/* Decorative mesh vector grids */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(26,158,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(26,158,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
                  
                  {/* 3D Character Renderer */}
                  <div className="relative z-10 flex flex-col items-center justify-center min-h-[160px] pointer-events-none">
                    <ThreeCrewmate color={playerColor} hat={playerHat} size={150} />
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Status panel and launcher */}
            <div className="w-full bg-[#090d14] border-4 border-black p-4 rounded-xl mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Countdown panel */}
              <div className="flex-1 text-left w-full">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 font-bold mb-1">
                  <span className="tracking-wide uppercase">⚡ ARRIVING SHIP TERMINALS SYNCING...</span>
                  <span className="text-[#50F01E] font-bold">{progressCount}%</span>
                </div>
                
                {/* Visual loading bar */}
                <div className="w-full h-4 bg-slate-950 rounded border-2 border-slate-700 overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded transition-all duration-100" style={{ width: `${progressCount}%` }} />
                </div>

                {/* Counter timing indicator in seconds */}
                <div className="text-[9px] uppercase font-mono tracking-widest text-slate-400 mt-1 font-bold">
                  {progressCount < 100 ? (
                    <span>WARP CORES INITIALIZING... T-MINUS {Math.max(1, Math.ceil((100 - progressCount) / 10))}s</span>
                  ) : (
                    <span className="text-[#50F01E] animate-pulse">WARP CORES OPTIMIZED · ENGINE PREPARED TO IGNITE</span>
                  )}
                </div>
              </div>

              {/* Action buttons and audio */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {/* Audio block inside warning capsule */}
                <button 
                  onClick={() => { setSoundOn(!soundOn); synthSFX.enabled = !soundOn; }}
                  className="px-3 py-2 bg-[#121824] hover:bg-[#1f293d] border-2 border-black rounded-lg text-slate-400 hover:text-white cursor-pointer flex items-center gap-1.5 font-mono text-[9px]"
                >
                  {soundOn ? <Volume2 size={13} className="text-green-400 animate-pulse" /> : <VolumeX size={13} />}
                  <span>{soundOn ? 'SOUND ON' : 'MUTED'}</span>
                </button>

                <button
                  onClick={enterMissionShip}
                  disabled={progressCount < 100}
                  className={`py-3.5 px-6 text-[10px] md:text-xs font-black leading-none uppercase tracking-widest rounded-lg border cursor-pointer transform active:translate-y-0.5 transition-all w-full md:w-auto flex items-center justify-center gap-2 ${
                    progressCount === 100 
                      ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30 hover:border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:scale-[1.02]' 
                      : 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed shadow-none'
                  }`}
                  style={{ fontFamily: '"Press Start 2P"' }}
                >
                  <Rocket size={16} /> ENTER VEHICLE <Rocket size={16} />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </>
  );
}
