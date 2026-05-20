import React, { useState, useEffect, useRef } from 'react';
import { X, Send, BookOpen, User, Briefcase, Award, Zap, Code, Shield, KeyRound, Radio, ArrowRight, CornerDownLeft, Play, RefreshCw, Layers } from 'lucide-react';
import CrewmateSprite, { CrewmateColor } from './CrewmateSprite';
import { synthSFX } from '../utils/sound';

interface TaskModalProps {
  room: string; // 'cafeteria' | 'reactor' | 'admin' | 'comms' | 'medbay' | 'security' | 'emergency' | 'vents'
  onClose: (wasCompleted: boolean) => void;
  playerColor: CrewmateColor;
}

export default function TaskModal({ room, onClose, playerColor }: TaskModalProps) {
  // Common states
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Web Audio API Sound Synthesizer
  const playLocalSound = (freq: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth', duration: number, volume = 0.05) => {
    synthSFX.playTone(freq, type, duration, volume);
  };

  const playBeep = () => synthSFX.playBeep();
  const playLaser = () => synthSFX.playLaser();
  const playWireSpark = () => synthSFX.playTone(1000, 'triangle', 0.12, 0.08);
  const playShieldClick = () => synthSFX.playTone(520, 'sine', 0.12, 0.08);
  const playSuccessTune = () => {
    synthSFX.playTone(523.25, 'sine', 0.3, 0.04);
    setTimeout(() => synthSFX.playTone(659.25, 'sine', 0.3, 0.04), 100);
    setTimeout(() => synthSFX.playTone(783.99, 'sine', 0.5, 0.04), 200);
  };

  // Storage Refueling Specifics
  const [fuelLevel, setFuelLevel] = useState(0);
  const [refuelState, setRefuelState] = useState<'idle' | 'refueling' | 'completed'>('idle');
  const fuelTimerRef = useRef<any>(null);

  // Weapons Target Shooter Specifics
  const [asteroidsShot, setAsteroidsShot] = useState(0);
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; speedX: number; speedY: number; size: number }>>([]);
  
  // Electrical Wiring Specifics
  const [wireConnections, setWireConnections] = useState<Record<string, string>>({}); // maps left wire color to connected right wire color
  const [activeWireDrag, setActiveWireDrag] = useState<string | null>(null); // left color clicked
  const [rightWireColors, setRightWireColors] = useState<string[]>(['blue', 'pink', 'red', 'yellow']);

  // Navigation Alignment Specifics
  const [shipNavPos, setShipNavPos] = useState({ x: 0, y: 0 });
  const [navTargetPos] = useState({ x: 195, y: 115 });
  const [navAligned, setNavAligned] = useState(false);

  // Shields Specifics
  const [shieldsState, setShieldsState] = useState<boolean[]>([false, false, false, false, false, false]);

  // Card Swipe Specifics (Admin / Skills)
  const [swipeProgress, setSwipeProgress] = useState(0); // 0 to 100
  const [swipeStatus, setSwipeStatus] = useState<'idle' | 'swiping' | 'too-fast' | 'too-slow' | 'success'>('idle');
  const [cardGrabbed, setCardGrabbed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const swipeTrackRef = useRef<HTMLDivElement>(null);
  const swipeTimeStartRef = useRef<number>(0);

  // Download Data Specifics (Comms / Projects)
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed'>('idle');

  // MedBay Scan Specifics (MedBay / Education)
  const [scanProgress, setScanProgress] = useState(0);
  const [scanDiagnostics, setScanDiagnostics] = useState<string[]>([]);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'completed'>('idle');

  // Reactor Core Alignment Specifics (Reactor / About Me)
  const [reactorPower, setReactorPower] = useState(25); // Sliders 0-100, target is exactly 100
  const [stabilizeSuccess, setStabilizeSuccess] = useState(false);

  // Security Feeds Specifics (Security / Experience)
  const [activeCam, setActiveCam] = useState<number>(1);
  const [camStatic, setCamStatic] = useState(false);

  // Emergency Meeting / Contact Specifics
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [meetingSubmitted, setMeetingSubmitted] = useState(false);
  const [meetingEjectedText, setMeetingEjectedText] = useState('');
  const [isEjecting, setIsEjecting] = useState(false);

  // Reset task states when room changes
  useEffect(() => {
    setTaskCompleted(room === 'cafeteria' || room === 'security');
    setGameStarted(false);
    setSwipeStatus('idle');
    setSwipeProgress(0);
    setDownloadProgress(0);
    setDownloadState('idle');
    setScanProgress(0);
    setScanDiagnostics([]);
    setScanState('idle');
    setReactorPower(25);
    setStabilizeSuccess(false);

    // New task state resets
    setFuelLevel(0);
    setRefuelState('idle');
    if (fuelTimerRef.current) clearInterval(fuelTimerRef.current);

    setAsteroidsShot(0);
    const initialTargets = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: Math.random() * 400 + 40,
      y: Math.random() * 150 + 40,
      speedX: (Math.random() - 0.5) * 6,
      speedY: (Math.random() - 0.5) * 6,
      size: Math.random() * 20 + 25
    }));
    setTargets(initialTargets);

    setWireConnections({});
    setActiveWireDrag(null);
    const colors = ['red', 'blue', 'yellow', 'pink'];
    const shuffledRight = [...colors].sort(() => Math.random() - 0.5);
    setRightWireColors(shuffledRight);

    setShipNavPos({ x: 0, y: 0 });
    setNavAligned(false);

    // Guaranteed to start with at least 3 depleted cells, so it requires user play
    const initialShields = [false, false, false, false, false, false];
    const initialActiveCount = Math.floor(Math.random() * 3); // 0 to 2 charged initially
    for (let i = 0; i < initialActiveCount; i++) {
      initialShields[i] = true;
    }
    initialShields.sort(() => Math.random() - 0.5);
    setShieldsState(initialShields);
  }, [room]);

  // ====================================================
  // REFUELING HELPERS
  // ====================================================
  const startRefueling = () => {
    if (refuelState === 'completed') return;
    setRefuelState('refueling');
    fuelTimerRef.current = setInterval(() => {
      setFuelLevel((prev) => {
        if (prev >= 100) {
          clearInterval(fuelTimerRef.current);
          setRefuelState('completed');
          setTaskCompleted(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const stopRefueling = () => {
    if (refuelState === 'refueling') {
      setRefuelState('idle');
      if (fuelTimerRef.current) clearInterval(fuelTimerRef.current);
    }
  };

  // ====================================================
  // WEAPONS RADAR ASTEROIDS MOVEMENT
  // ====================================================
  useEffect(() => {
    if (room !== 'weapons' || taskCompleted) return;
    
    const interval = setInterval(() => {
      setTargets((prev) => 
        prev.map((t) => {
          let nextX = t.x + t.speedX;
          let nextY = t.y + t.speedY;
          let sx = t.speedX;
          let sy = t.speedY;
          
          // Width of weapons box max 512px, height 240px
          const maxX = 480 - t.size;
          const maxY = 220 - t.size;
          
          if (nextX <= 5) {
            nextX = 5;
            sx = Math.abs(sx);
          } else if (nextX >= maxX) {
            nextX = maxX;
            sx = -Math.abs(sx);
          }
          
          if (nextY <= 5) {
            nextY = 5;
            sy = Math.abs(sy);
          } else if (nextY >= maxY) {
            nextY = maxY;
            sy = -Math.abs(sy);
          }
          
          return {
            ...t,
            x: nextX,
            y: nextY,
            speedX: sx,
            speedY: sy
          };
        })
      );
    }, 40);
    
    return () => clearInterval(interval);
  }, [room, taskCompleted]);

  const shootTarget = (id: number) => {
    if (taskCompleted) return;
    setTargets(prev => prev.filter(t => t.id !== id));
    setAsteroidsShot(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setTaskCompleted(true);
        playSuccessTune();
      } else {
        // Spawn a replacement target soon after
        setTimeout(() => {
          setTargets(old => {
            if (old.length >= 3) return old;
            return [
              ...old,
              {
                id: Date.now() + Math.random(),
                x: Math.random() * 200 + 20,
                y: Math.random() * 100 + 20,
                speedX: (Math.random() - 0.5) * 4 - 1,
                speedY: (Math.random() - 0.5) * 4 + 1,
                size: Math.random() * 10 + 18
              }
            ];
          });
        }, 150);
      }
      return next;
    });
    playLocalSound(1200, 'square', 0.08, 0.06);
  };

  // ====================================================
  // WIRE JUNCTION CONNECTIVITY HELPERS
  // ====================================================
  const connectWire = (leftColor: string, rightColor: string) => {
    if (leftColor === rightColor) {
      setWireConnections((prev) => {
        const next = { ...prev, [leftColor]: rightColor };
        if (Object.keys(next).length === 4) {
          setTaskCompleted(true);
        }
        return next;
      });
      playWireSpark();
    }
  };

  // ====================================================
  // NAVIGATION RADAR CALIBRATION HELPERS
  // ====================================================
  const moveShipRadar = (x: number, y: number) => {
    setShipNavPos({ x, y });
    const dist = Math.hypot(x - navTargetPos.x, y - navTargetPos.y);
    if (dist < 15) {
      setShipNavPos(navTargetPos);
      setNavAligned(true);
      setTaskCompleted(true);
      playSuccessTune();
    } else {
      playLocalSound(440, 'triangle', 0.04, 0.03);
    }
  };

  // ====================================================
  // HELIX SHIELD ARRAY CELL MANIPULATION
  // ====================================================
  const clickShieldTile = (index: number) => {
    if (taskCompleted) return;
    setShieldsState(prev => {
      const next = [...prev];
      if (next[index]) return prev; // If already charged, don't allow un-charging in this task
      next[index] = true;
      if (next.every(tile => tile === true)) {
        setTaskCompleted(true);
        playSuccessTune();
      }
      return next;
    });
    playShieldClick();
  };

  // State for dragging timestamp
  const [swipeTimestamp, setSwipeTimestamp] = useState<number | null>(null);

  // Handle Card Swipe Physics
  const handleCardDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (swipeStatus === 'success') return;
    setCardGrabbed(true);
    setSwipeStatus('swiping');
    setSwipeTimestamp(Date.now());
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
      setTaskCompleted(true);
      playSuccessTune();
    }
  };

  const handleDragEnd = () => {
    if (cardGrabbed) {
      setCardGrabbed(false);
      if (swipeStatus === 'swiping') {
        setSwipeStatus('idle');
        setSwipeProgress(0);
      }
    }
  };

  // Comms Download data automation
  const startDownloading = () => {
    setDownloadState('downloading');
    setDownloadProgress(0);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (downloadState === 'downloading') {
      timer = setInterval(() => {
        setDownloadSpeed(Math.floor(Math.random() * 80) + 120); // 120-200 kB/s
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setDownloadState('completed');
            setTaskCompleted(true);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [downloadState]);

  // MedBay Scanning automation
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
          
          // Incremental text printout for authentic diagnostic log look
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
            setTaskCompleted(true);
            setScanDiagnostics((d) => [...d, 'SCAN RESULT: CANDIDATE CLEAR FOR LANDING! ✅']);
            return 100;
          }
          return next;
        });
      }, 80);
    }
    return () => clearInterval(timer);
  }, [scanState]);

  // Reactor lever/sliding feedback
  const handleReactorAlignment = (val: number) => {
    setReactorPower(val);
    if (val === 100) {
      setStabilizeSuccess(true);
      setTaskCompleted(true);
    }
  };

  // Security Feed camera noise
  useEffect(() => {
    setCamStatic(true);
    const delay = setTimeout(() => setCamStatic(false), 250);
    return () => clearTimeout(delay);
  }, [activeCam]);

  // Emergency Meeting / Message Submission
  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    // Send email using mailto
    const subject = encodeURIComponent(`Emergency Meeting Broadcast from ${contactName}`);
    const body = encodeURIComponent(
      `Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMessage}`
    );
    window.location.href = `mailto:ashfakhthedev@gmail.com?subject=${subject}&body=${body}`;

    // Trigger eject animation which holds stars moving
    setIsEjecting(true);
    setMeetingSubmitted(true);

    // Ashfakh M is NOT an Impostor!
    const cleanName = contactName.substring(0, 15);
    setMeetingEjectedText(`${cleanName} initiated Emergency Broadcast. Message successfully ejected to Ashfakh M.`);

    setTimeout(() => {
      // Safe timeout and close of game loop, triggers task complete
      setTaskCompleted(true);
      setIsEjecting(false);
      // Clear contact forms
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4500);
  };

  // Skip task to display skills/projects directly (Accessibility / Quick view)
  const forceCompleteTask = () => {
    setTaskCompleted(true);
    if (room === 'admin') setSwipeStatus('success');
    if (room === 'comms') setDownloadState('completed');
    if (room === 'medbay') {
      setScanState('completed');
      setScanProgress(100);
      setScanDiagnostics([
        'BYPASS CRITICAL DATA LOCK',
        'QUALIFICATIONS SHOWN'
      ]);
    }
    if (room === 'reactor') {
      setReactorPower(100);
      setStabilizeSuccess(true);
    }
    if (room === 'storage') {
      setFuelLevel(100);
      setRefuelState('completed');
    }
    if (room === 'weapons') {
      setAsteroidsShot(5);
      setTargets([]);
    }
    if (room === 'electrical') {
      const colors = ['red', 'blue', 'yellow', 'pink'];
      const connections: Record<string, string> = {};
      colors.forEach(c => {
        connections[c] = c;
      });
      setWireConnections(connections);
    }
    if (room === 'navigation') {
      setShipNavPos(navTargetPos);
      setNavAligned(true);
    }
    if (room === 'shields') {
      setShieldsState([true, true, true, true, true, true]);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
    >
      <div 
        id="task-inner-box"
        className="w-full max-w-4xl bg-[#09090f]/95 backdrop-blur-3xl border border-white/10 rounded-[32px] flex flex-col shadow-[0_0_80px_rgba(0,0,0,0.8)] relative select-none ring-1 ring-inset ring-white/5"
        style={{ height: 'min(90vh, 700px)' }}
      >
        {/* Simple red X close button (Among Us Style) */}
        <button 
          onClick={() => onClose(taskCompleted)} 
          className="absolute -top-4 -right-4 w-12 h-12 bg-red-600 border-2 border-red-400/50 rounded-full flex items-center justify-center text-white z-50 shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 cursor-pointer hover:bg-red-500 transition-all"
        >
          <div className="w-6 h-6 relative">
             <div className="absolute top-1/2 left-0 w-full h-1.5 bg-white -translate-y-1/2 rotate-45 rounded-sm" />
             <div className="absolute top-1/2 left-0 w-full h-1.5 bg-white -translate-y-1/2 -rotate-45 rounded-sm" />
          </div>
        </button>

        {/* Modal Inner Main area */}
        <div className="flex-1 overflow-y-auto flex flex-col font-mono relative bg-transparent rounded-[20px] m-4 overflow-hidden border border-white/5">
          
          {/* EJECTING SCREEN (Special Emergency contact animation) */}
          {isEjecting && (
            <div className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                {/* Simulated fast streaming stars */}
                <div className="absolute inset-0 animate-pulse bg-[radial-gradient(white_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>
              
              <div className="animate-bounce mb-8">
                <CrewmateSprite color={playerColor} hat="none" isMoving={true} direction="right" size={100} />
              </div>
              
              <p 
                className="text-sm md:text-lg text-red-500 font-bold uppercase tracking-widest leading-relaxed max-w-xl"
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

          {/* SKIP MINI-GAME BUTTON (If not completed to let users see credentials easily without being blocked by games) */}
          {!taskCompleted && room !== 'security' && room !== 'cafeteria' && (
            <button
              onClick={forceCompleteTask}
              className="absolute top-2 right-2 z-10 text-[10px] text-gray-400 hover:text-green-400 border border-[#3a3a5e] hover:border-green-500/50 bg-[#1a1a2e] px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Skip Task Game Quick-Unlock ⚡</span>
            </button>
          )}

          {/* ==================================================== */}
          {/* 1. CAFETERIA (Hero / Landing Entry Terminal) */}
          {/* ==================================================== */}
          {room === 'cafeteria' && (
            <div className="flex-1 flex flex-col md:flex-row gap-6 items-center justify-center p-2">
              <div className="flex flex-col items-center justify-center py-4 bg-[#1a1a2e] border-2 border-[#3a3a5e] p-6 rounded-lg w-full md:w-5/12 text-center relative overflow-hidden">
                <div className="absolute top-2 left-2 rotate-[5deg] bg-red-600 px-2 py-0.5 text-[8px] rounded font-bold animate-pulse">ASHFAKH M</div>
                <div className="mb-4">
                  <CrewmateSprite color="red" hat="plant" isMoving={true} direction="right" size={120} name="Ashfakh" />
                </div>
                <div className="space-y-1.5 w-full">
                  <div className="text-[10px] text-gray-400 uppercase">LOCATION</div>
                  <div className="text-xs font-semibold text-red-400">Malappuram, Kerala, India 🇮🇳</div>
                  <div className="text-[10px] text-gray-400 uppercase mt-2">CLASS</div>
                  <div className="text-xs text-white">Full Stack Crewmate</div>
                </div>
              </div>

              <div className="flex-1 space-y-4 max-w-md">
                <div className="bg-[#0D0D1A] p-4 rounded-lg border-2 border-[#1a9eff]/30 space-y-2">
                  <h3 className="text-xs text-[#1a9eff] font-bold tracking-widest uppercase">GREETINGS CREWMATE!</h3>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    Ashfakh M
                  </h1>
                  <p className="text-sm font-semibold text-green-400">
                    Full Stack Developer — Frontend Specialist
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed pt-2">
                    "I craft performance-tuned React architectures, responsive layouts, and rock-solid Node/FastAPI servers designed to sustain warp load speeds."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="border border-[#3a3a5e] p-2.5 rounded bg-[#10101a] flex flex-col">
                    <span className="text-gray-500 text-[10px]">ACADEMIC CLEARANCE</span>
                    <span className="text-white font-medium truncate mt-0.5">BSc Computer Science</span>
                    <span className="text-gray-400 text-[9px] mt-0.5">Farook College ('26)</span>
                  </div>
                  <div className="border border-[#3a3a5e] p-2.5 rounded bg-[#10101a] flex flex-col">
                    <span className="text-gray-500 text-[10px]">TRUST METRIC</span>
                    <span className="text-green-400 font-medium truncate mt-0.5">100 SEO Score</span>
                    <span className="text-gray-400 text-[9px] mt-0.5">Chrome Lighthouse Verified</span>
                  </div>
                </div>

                <div className="font-mono text-[9px] text-[#38FEDE]/70 text-center select-none pt-2 animate-pulse">
                  &lt;&lt; WALK INTO THE OTHER ROOMS TO DISCOVER DETAILS &gt;&gt;
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 2. REACTOR (About Me & Objectives) */}
          {/* ==================================================== */}
          {room === 'reactor' && (
            <div className="flex-1 flex flex-col">
              {!taskCompleted ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-full border-4 border-yellow-500 flex items-center justify-center bg-yellow-950/30 animate-pulse relative">
                    <div className="absolute inset-2 border-2 border-dashed border-yellow-500 rounded-full animate-spin" />
                    <Zap size={36} className="text-yellow-400" />
                  </div>
                  
                  <div className="max-w-md space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-yellow-400" style={{ fontFamily: '"Press Start 2P"' }}>STABILIZE REACTOR UNIT</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Core temperature is fluctuating! Slide the lever to 100% manual power output to lock in the "Who I Am" bio logs.
                    </p>
                  </div>

                  <div className="w-full max-w-sm space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-bold mb-1">
                      <span>REACTOR LEVEL: {reactorPower}%</span>
                      <span className={reactorPower === 100 ? 'text-green-400' : 'text-yellow-400'}>
                        {reactorPower === 100 ? 'STABLE' : 'ALIGNING...'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="100"
                      step="5"
                      value={reactorPower}
                      onChange={(e) => handleReactorAlignment(parseInt(e.target.value))}
                      className="w-full accent-yellow-400 h-3 bg-slate-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>25% MIN</span>
                      <span>100% COMPLETED</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
                  <div className="border-2 border-green-500/40 bg-[#122c1b]/30 p-3 rounded flex items-center gap-3">
                    <div className="p-1 px-2.5 bg-green-950 rounded text-green-400 text-xs font-bold border border-green-500">ONLINE</div>
                    <span className="text-xs font-mono text-green-400">REACTOR SYSTEMS STATUS: OPTIMAL COOLDOWN ACTIVE.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2 bg-[#1a1a2e] border-2 border-[#3a3a5e] p-4 rounded-lg flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="text-xs text-[#1a9eff] font-bold uppercase tracking-wider">CREWMATE DOSSIER</h4>
                        <div className="space-y-2.5 text-xs text-gray-300">
                          <div>
                            <span className="text-gray-500 block">DESIGNATION</span>
                            <span className="text-white font-medium">Ashfakh M</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">BASE HUB</span>
                            <span className="text-white font-medium">Malappuram, Kerala, India</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">ROLE ARCHETYPE</span>
                            <span className="text-yellow-400 font-medium">Solo Full Stack Innovator</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#3a3a5e] space-y-2 text-[10px]" style={{ fontFamily: '"Fira Code", monospace' }}>
                        <div className="text-slate-400">env_variables:</div>
                        <div className="text-green-400">⚡ NEXT_JS_EXPERTISE = 100/100</div>
                        <div className="text-[#38FEDE]">⚡ WEBHOOKS_IDEMPOTENT = true</div>
                        <div className="text-red-400">⚡ META_CERTIFIED = true</div>
                      </div>
                    </div>

                    <div className="md:col-span-3 bg-[#111122] border border-[#3a3a5e] p-5 rounded-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <User size={18} className="text-green-400" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide">Developer Bio & Missions</h4>
                      </div>
                      
                      <div className="text-xs text-slate-300 leading-relaxed space-y-3">
                        <p>
                          I'm Ashfakh, a Full Stack Developer located in Malappuram, Kerala. I specialize in building blazing fast React based web architectures and bulletproof backend models that don't crack under heavy volumes.
                        </p>
                        <p>
                          <strong>My Engineering Creed:</strong> I own products soup to nuts. I've engineered rich service-oriented web apps, school exam ecosystems, secured banking gates and automatic settlement timelines — single handedly.
                        </p>
                        <p>
                          Completed my BSc in Computer Science at Farook College (Class of 2026). I code every single hour of my day, keeping modern stack standards inside my head.
                        </p>
                      </div>

                      <div className="bg-[#1c1c38]/40 p-3 rounded border border-[#3a3a5e] text-[11px] text-[#38FEDE]">
                        🏆 "Committed to delivering pristine UI performance (100 SEO & 90+ Lighthouse Core Web Vitals) alongside optimal server latency."
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 3. ADMIN (Skills / Control Panel) */}
          {/* ==================================================== */}
          {room === 'admin' && (
            <div className="flex-1 flex flex-col">
              {swipeStatus !== 'success' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-2 space-y-6">
                  {/* Outer terminal */}
                  <div className="w-full max-w-[600px] h-full sm:h-auto min-h-[400px] bg-[#d3d3d3] border-[16px] border-[#9e9e9e] rounded-[30px] p-6 flex flex-col justify-between shadow-2xl relative">
                    
                    {/* Top Section: Screen & Indicator */}
                    <div className="flex justify-between items-start gap-4">
                      {/* Console Screen feedback */}
                      <div className="flex-1 h-24 bg-black border-[6px] border-[#6b6b6b] rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-center font-mono font-bold tracking-wider uppercase text-sm">
                          {swipeStatus === 'idle' && (
                            <span className="text-green-500 animate-pulse">PLEASE INSERT CARD.</span>
                          )}
                          {swipeStatus === 'swiping' && (
                            <span className="text-yellow-400">READING CARD...</span>
                          )}
                          {swipeStatus === 'too-fast' && (
                            <span className="text-red-500 animate-shake">TOO FAST. TRY AGAIN.</span>
                          )}
                          {swipeStatus === 'too-slow' && (
                            <span className="text-red-500 animate-shake">TOO SLOW. TRY AGAIN.</span>
                          )}
                          {swipeStatus === 'bad-read' && (
                            <span className="text-red-500 animate-shake">BAD READ. TRY AGAIN.</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Lights */}
                      <div className="flex flex-col gap-2 pt-2 pr-2">
                        <div className={`w-6 h-6 rounded-full border-4 border-slate-600 ${swipeStatus === 'too-fast' || swipeStatus === 'too-slow' || swipeStatus === 'bad-read' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-red-900'}`} />
                        <div className={`w-6 h-6 rounded-full border-4 border-slate-600 ${swipeStatus === 'success' ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-green-900'}`} />
                      </div>
                    </div>

                    <div className="w-full relative flex-1 flex flex-col justify-center my-6">
                      {/* Card Reader Slide Channel Background */}
                      <div className="w-full h-20 bg-black border-y-8 border-[#3f3f3f] flex items-center shadow-inner relative z-0">
                         {/* Card Reader Feed Arrows */}
                         <div className="absolute inset-x-0 w-full flex justify-around text-[#3f3f3f] text-2xl font-black select-none pointer-events-none">
                            <span>»</span><span>»</span><span>»</span><span>»</span><span>»</span>
                         </div>
                      </div>
                      
                      <div 
                        ref={swipeTrackRef}
                        onMouseMove={(e) => { if (cardGrabbed) handleCardDrag(e); }}
                        onTouchMove={(e) => { if (cardGrabbed) handleCardDrag(e); }}
                        className="absolute inset-x-0 inset-y-0 z-10 flex items-center min-h-[160px]"
                      >
                        {/* Interactive Draggable Card */}
                        <div
                          ref={cardRef}
                          onMouseDown={handleCardDragStart}
                          onTouchStart={handleCardDragStart}
                          onMouseMove={handleCardDrag}
                          onTouchMove={handleCardDrag}
                          className={`absolute cursor-grab active:cursor-grabbing w-[200px] h-[120px] bg-white border-2 border-gray-300 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.4)] flex flex-col p-3 transition-opacity ${swipeStatus === 'success' ? 'opacity-0 pointer-events-none' : ''}`}
                          style={{ 
                            left: `calc(2% + ${swipeProgress * 0.6}%)`,
                            top: '50%',
                            translate: '0 -50%',
                            transition: cardGrabbed ? 'none' : 'left 0.3s ease-out'
                          }}
                        >
                          <div className="w-full flex-1 flex gap-3">
                             {/* User Photo Box */}
                             <div className="w-16 h-20 bg-gray-200 border border-gray-400 rounded flex items-center justify-center text-3xl overflow-hidden shadow-inner">
                               👨‍💻
                             </div>
                             <div className="flex-1 flex flex-col pt-1">
                               <div className="w-full h-4 bg-red-600 mb-3 rounded-sm opacity-90 shadow-sm" />
                               <span className="text-[10px] font-black text-black uppercase mb-1">ASHFAKH M</span>
                               <span className="text-[8px] font-bold text-gray-500 uppercase">Engineer ID: #994</span>
                             </div>
                          </div>
                          
                          {/* Bottom barcode decoration */}
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
                    
                    {/* Instructions footer */}
                    <div className="text-center font-bold text-[#6b6b6b] text-xs uppercase tracking-widest bg-black/5 rounded p-2 border-2 border-black/10 mt-auto shadow-inner">
                      Click & drag ID card entirely to the right
                    </div>

                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    
                    {/* Left static intro panel */}
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
                        <div className="text-gray-500 uppercase">LIGHTHOUSE SUMMARY</div>
                        <div className="text-yellow-400">⭐ SEO: 100/100</div>
                        <div className="text-blue-400">⭐ PERSISTENCE: 100%</div>
                        <div className="text-green-400">⭐ STABILITY: IMMUNE</div>
                      </div>
                    </div>

                    {/* Right modular dashboard */}
                    <div className="md:col-span-3 space-y-4">
                      
                      {/* Station 1: Frontend */}
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

                      {/* Station 2: Backend */}
                      <div className="bg-[#10101f] border border-[#3a3a5e] p-3 rounded-lg">
                        <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider block mb-1.5 border-b border-dashed border-[#3a3a5e] pb-1 font-mono">STATION 2 — BACKEND PIPELINES</span>
                        <div className="flex flex-wrap gap-2">
                          {['FastAPI', 'Django', 'Node.js', 'RESTful APIs', 'Webhooks', 'Idempotent Logic'].map((skill, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] cursor-pointer bg-slate-900 border border-slate-700 hover:border-yellow-400 px-2 py-1 rounded text-white flex items-center gap-1.5 transition-all"
                              title="Fault tolerant, concurrency compliant"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Station 3: Databases & Languages */}
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

                      {/* Station 4: Devops & Development Utilities */}
                      <div className="bg-[#10101f] border border-[#3a3a5e] p-3 rounded-lg">
                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block mb-1.5 border-b border-dashed border-[#3a3a5e] pb-1">STATION 4 — TOOLKITS</span>
                        <div className="flex flex-wrap gap-1.5 text-[9px]">
                          {['Git', 'GitHub', 'Postman', 'Vercel', 'VS Code', 'Google Lighthouse'].map((tool, idx) => (
                            <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-[#3a3a5e] text-slate-300">
                              🛠️ {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 4. COMMS (Projects / Signal Transmissions) */}
          {/* ==================================================== */}
          {room === 'comms' && (
            <div className="flex-1 flex flex-col">
              {downloadState !== 'completed' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-2 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-900 border-2 border-[#1a9eff] rounded-lg flex items-center justify-center relative">
                    <Radio size={36} className={`text-[#1a9eff] ${downloadState === 'downloading' ? 'animate-bounce' : ''}`} />
                    {downloadState === 'downloading' && (
                      <span className="absolute -inset-2 border-2 border-[#1a9eff] rounded-lg animate-ping opacity-70" />
                    )}
                  </div>

                  <div className="max-w-md space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: '"Press Start 2P"' }}>
                      {downloadState === 'downloading' ? 'DOWNLOADING FILES' : 'INCOMING COMMS FREQUENCY'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      We have intercepted two massive files containing Ashfakh's complete production marketplaces, checkout pipelines, and testing metrics.
                    </p>
                  </div>

                  <div className="w-full max-w-xs space-y-2">
                    {downloadState === 'downloading' && (
                      <div className="flex justify-between text-[10px] text-[#38FEDE]">
                        <span>DOWNLOADING AT: {downloadSpeed} kB/s</span>
                        <span>{downloadProgress}%</span>
                      </div>
                    )}

                    <div className="w-full h-8 bg-black border-2 border-slate-700 rounded overflow-hidden p-1 flex items-center">
                      <div 
                        className="h-full bg-[#1a9eff] rounded-sm transition-all duration-150" 
                        style={{ width: `${downloadProgress}%` }} 
                      />
                    </div>

                    {downloadState === 'idle' ? (
                      <button 
                        onClick={startDownloading}
                        className="w-full p-2.5 bg-[#1a9eff] text-black hover:bg-[#38FEDE] font-bold text-xs uppercase tracking-wide rounded border-2 border-black active:translate-y-0.5 transition-all text-center cursor-pointer"
                        style={{ fontFamily: '"Press Start 2P"' }}
                      >
                        DOWNLOAD DATA 📥
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-500 block">DO NOT CLOSE TERMINAL...</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
                  
                  {/* Headline */}
                  <div className="border border-[#1a9eff]/30 bg-[#0c1825] p-3 rounded flex items-center justify-between text-xs text-[#1a9eff]">
                    <div className="flex items-center gap-2">
                      <Radio size={14} className="animate-pulse" />
                      <span>DECRYPTED DEPLOYMENTS INBOX: 2 ITEMS DETECTED</span>
                    </div>
                    <span className="font-mono text-[10px]">VERIFIED CLOUD REPOSITORIES</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Project 1 */}
                    <div className="bg-[#121224] border-2 border-[#1a9eff]/40 rounded-xl p-4 flex flex-col justify-between hover:border-[#1a9eff] transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-[#1a9eff]/20 text-[#1a9eff] font-bold px-2 py-0.5 rounded tracking-widest font-mono uppercase">PROJECT Alpha</span>
                          <span className="text-[9px] text-gray-500 font-mono">Nov 2025 – Mar 2026</span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight">LaundryEase</h3>
                        <p className="text-[11px] text-gray-400 leading-normal">
                          A fully functional web-based marketplace built for laundry services, complete with dispute protocols and transactional settlements.
                        </p>
                        
                        <div className="space-y-1 pt-1">
                          <span className="text-[9px] text-[#38FEDE] block uppercase tracking-wider">COMPLETED TASKS</span>
                          <div className="text-[10px] text-slate-300 space-y-1.5 font-mono">
                            <div>✅ Multi-role dashboard UI (Customer, Vendor, Admin)</div>
                            <div>✅ Idempotent Razorpay webhook architecture</div>
                            <div>✅ Escrow payment logs with automatic vendor settlements</div>
                            <div>✅ Rendered complete systems architecture DFDs & ERDs</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#3a3a5e] mt-4 space-y-3">
                        <div className="flex flex-wrap gap-1 text-[9px]">
                          {['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Razorpay', 'Tailwind'].map((t, i) => (
                            <span key={i} className="bg-slate-900 border border-[#3a3a5e] px-1.5 py-0.5 rounded text-neutral-400">{t}</span>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                          <a 
                            href="https://github.com/ashfakhm/laundry-ease" 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 px-2 border border-slate-700 bg-slate-900 text-center hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            VIEW CODE
                          </a>
                          <span className="p-1 px-2 border border-[#1a9eff] text-center text-[#1a9eff] bg-[#1a9eff]/10 rounded opacity-60">
                            PROD DEPLOYED
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Project 2 */}
                    <div className="bg-[#121224] border-2 border-[#50f01e]/30 rounded-xl p-4 flex flex-col justify-between hover:border-[#50f01e] transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-[#50f01e]/20 text-green-400 font-bold px-2 py-0.5 rounded tracking-widest font-mono uppercase">PROJECT Beta</span>
                          <span className="text-[9px] text-gray-500 font-mono">Dec 2025 – Jan 2026</span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight">E-Quiz Hub Platform</h3>
                        <p className="text-[11px] text-gray-400 leading-normal">
                          A real-time school study and examination engine supporting high-scale synchronous test taking.
                        </p>
                        
                        <div className="space-y-1 pt-1">
                          <span className="text-[9px] text-green-400 block uppercase tracking-wider">COMPLETED TASKS</span>
                          <div className="text-[10px] text-slate-300 space-y-1.5 font-mono">
                            <div>✅ Achieved strict [100 SEO Score] & [90+ Core Web Vitals]</div>
                            <div>✅ Optimized server side rendering & dynamic metadata tags</div>
                            <div>✅ Drafted randomized question delivery math vectors</div>
                            <div>✅ Programmed session-aware quiz states to avert test fraud</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#3a3a5e] mt-4 space-y-3">
                        <div className="flex flex-wrap gap-1 text-[9px]">
                          {['Next.js', 'React.js', 'TypeScript', 'MongoDB', 'Lighthouse Optimization'].map((t, i) => (
                            <span key={i} className="bg-slate-900 border border-[#3a3a5e] px-1.5 py-0.5 rounded text-neutral-400">{t}</span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                          <a 
                            href="https://github.com/ashfakhm/quiz-platform" 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 px-2 border border-slate-700 bg-slate-900 text-center hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            VIEW CODE
                          </a>
                          <span className="p-1 px-2 border border-green-500 text-center text-green-400 bg-green-500/10 rounded opacity-60">
                            PROD LIVE
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Academic Commits */}
                    <div className="bg-[#121224] border-2 border-yellow-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-yellow-500 transition-all md:col-span-2">
                       <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 font-bold px-2 py-0.5 rounded tracking-widest font-mono uppercase">ACADEMIC DATA</span>
                          <span className="text-[9px] text-gray-500 font-mono">BSc CS Sem 5 & 6</span>
                        </div>
                        <h3 className="text-base font-bold text-white tracking-tight">University Public Commits</h3>
                        <p className="text-[11px] text-gray-400 leading-normal">
                          A unique showcase of my academic transparency—my 5th and 6th semester college lab programs are publicly committed to GitHub, demonstrating consistent daily coding habits.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#3a3a5e] mt-4 space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold">
                          <a href="https://github.com/ashfakhm/Sem-6-Learning-Android-Studio" target="_blank" rel="noreferrer" className="p-2 border border-slate-700 bg-slate-900 text-center hover:text-white hover:border-yellow-500 hover:bg-slate-800 rounded transition-colors flex items-center justify-center">
                            📱 Android Studio (Sem 6)
                          </a>
                          <a href="https://github.com/ashfakhm/SEM-6-Learning_Shell_Scripting" target="_blank" rel="noreferrer" className="p-2 border border-slate-700 bg-slate-900 text-center hover:text-white hover:border-yellow-500 hover:bg-slate-800 rounded transition-colors flex items-center justify-center">
                            🐧 Shell Scripting (Sem 6)
                          </a>
                           <a href="https://github.com/ashfakhm/SEM-5-Learning_Html_And_Php" target="_blank" rel="noreferrer" className="p-2 border border-slate-700 bg-slate-900 text-center hover:text-white hover:border-yellow-500 hover:bg-slate-800 rounded transition-colors flex items-center justify-center">
                            🌐 HTML & PHP (Sem 5)
                          </a>
                          <a href="https://github.com/ashfakhm/SEM-5-Learning_JAVA" target="_blank" rel="noreferrer" className="p-2 border border-slate-700 bg-slate-900 text-center hover:text-white hover:border-yellow-500 hover:bg-slate-800 rounded transition-colors flex items-center justify-center">
                            ☕ Java (Sem 5)
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 5. MEDBAY (Education & Credentials Scan) */}
          {/* ==================================================== */}
          {room === 'medbay' && (
            <div className="flex-1 flex flex-col">
              {scanState !== 'completed' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-2 space-y-6">
                  
                  {/* Scan laser machine box */}
                  <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-700 rounded-lg p-4 flex flex-col items-center relative overflow-hidden">
                    
                    {/* Simulated vertical green laser brush */}
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
                        SUBMIT SCAN 🔬
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
                <div className="flex-1 bg-[#1a1a2e] rounded-lg border border-white/10 p-4 font-mono overflow-y-auto w-full">
                  <h3 className="text-[#38FEDE] text-lg font-bold border-b border-[#38FEDE]/30 pb-2 mb-4">DECK PROFILE / CAFETERIA</h3>
                  <div className="flex flex-col gap-3 text-sm text-slate-300">
                    <p><span className="text-blue-400 font-bold">CREWMATE:</span> ASHFAKH M</p>
                    <p><span className="text-blue-400 font-bold">STATUS:</span> ACTIVE ORBIT</p>
                    <p><span className="text-blue-400 font-bold">ROLE:</span> ENGINEER</p>
                    <p><span className="text-blue-400 font-bold">KEY SKILLS:</span> REACT INTERFACES, SPACESHIP MAINTENANCE</p>
                    <div className="border border-white/5 bg-black/30 p-2 mt-4 rounded">
                      <span className="text-xs text-slate-500">PROFILE SCANNED. RECORD LOGGED SECURELY IN ARCHIVE.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 6. SECURITY (CCTV Cameras experience timeline) */}
          {/* ==================================================== */}
          {room === 'security' && (
            <div className="flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 h-full w-full p-2">
                <div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
                  <div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]"><div className="w-2 h-2 rounded-full bg-red-500"></div> REC</div>
                  <div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">CAFETERIA CCTV</div>
                  <div className="w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>
                  <span className="text-slate-600 text-xs font-mono">No signal</span>
                </div>
                <div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
                  <div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]"><div className="w-2 h-2 rounded-full bg-red-500"></div> REC</div>
                  <div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">ADMIN CCTV</div>
                  <div className="w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>
                  <span className="text-slate-600 text-xs font-mono">No signal</span>
                </div>
                <div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
                  <div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]"><div className="w-2 h-2 rounded-full bg-red-500"></div> REC</div>
                  <div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">O2 CCTV</div>
                  <div className="w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>
                  <span className="text-slate-600 text-xs font-mono">No signal</span>
                </div>
                <div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
                  <div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]"><div className="w-2 h-2 rounded-full bg-red-500"></div> REC</div>
                  <div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">SECURITY CCTV</div>
                  <div className="w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>
                  <span className="text-slate-600 text-xs font-mono">No signal</span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* 7. EMERGENCY BUTTON (Contact Form / Hiring Meet) */}
          {/* ==================================================== */}
          {room === 'emergency' && (
            <div className="flex-1 flex flex-col justify-center">
              {!meetingSubmitted ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-2 items-center">
                  
                  {/* Left big blinking emergency button visual */}
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
                        {gameStarted ? 'TAP IN!' : 'REPORT INFO 🚨'}
                      </span>
                    </button>
                    
                    <div className="text-xs text-red-500 font-bold mt-10 uppercase tracking-widest leading-relaxed">
                      "IN EMERGENCY MEETING, REPORT CORRESPONDENCE FEED!"
                    </div>
                  </div>

                  {/* Right interactive form channel */}
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
                        🔴 CALL MEETING 🔴
                      </button>
                    </form>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fadeIn">
                  <div className="p-4 bg-green-950/20 border border-green-500/30 rounded-lg max-w-md">
                    <h3 className="text-sm font-bold text-green-400 mb-2">📥 COMS RECORDED SUCCESSFULLY</h3>
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
          )}

          {/* ==================================================== */}
          {/* 8. STORAGE (Social Links & Refueling) */}
          {/* ==================================================== */}
          {room === 'storage' && (
            <div className="flex-1 flex flex-col">
              {refuelState !== 'completed' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-2 space-y-6">
                  <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-700 rounded-lg p-5 flex flex-col items-center relative overflow-hidden">
                    <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">Refuel engine to establish communication paths</div>
                    
                    {/* Fuel Canister graphics */}
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
                        onMouseDown={() => {
                          if (refuelState === 'completed') return;
                          setRefuelState('refueling');
                          playBeep();
                          fuelTimerRef.current = setInterval(() => {
                            setFuelLevel((prev) => {
                              if (prev >= 100) {
                                clearInterval(fuelTimerRef.current);
                                fuelTimerRef.current = null;
                                setRefuelState('completed');
                                setTaskCompleted(true);
                                playSuccessTune();
                                return 100;
                              }
                              if (prev % 12 === 0) playLocalSound(300 + prev * 2, 'square', 0.08, 0.03);
                              return prev + 4;
                            });
                          }, 80);
                        }}
                        onMouseUp={() => {
                          if (refuelState === 'refueling') setRefuelState('idle');
                          if (fuelTimerRef.current) {
                            clearInterval(fuelTimerRef.current);
                            fuelTimerRef.current = null;
                          }
                        }}
                        onMouseLeave={() => {
                          if (refuelState === 'refueling') setRefuelState('idle');
                          if (fuelTimerRef.current) {
                            clearInterval(fuelTimerRef.current);
                            fuelTimerRef.current = null;
                          }
                        }}
                        onTouchStart={() => {
                          if (refuelState === 'completed') return;
                          setRefuelState('refueling');
                          playBeep();
                          fuelTimerRef.current = setInterval(() => {
                            setFuelLevel((prev) => {
                              if (prev >= 100) {
                                clearInterval(fuelTimerRef.current);
                                fuelTimerRef.current = null;
                                setRefuelState('completed');
                                setTaskCompleted(true);
                                playSuccessTune();
                                return 100;
                              }
                              if (prev % 12 === 0) playLocalSound(300 + prev * 2, 'square', 0.08, 0.03);
                              return prev + 4;
                            });
                          }, 80);
                        }}
                        onTouchEnd={() => {
                          if (refuelState === 'refueling') setRefuelState('idle');
                          if (fuelTimerRef.current) {
                            clearInterval(fuelTimerRef.current);
                            fuelTimerRef.current = null;
                          }
                        }}
                        className={`w-full py-3 bg-[#e67e22] hover:bg-[#d35400] text-black font-extrabold text-xs uppercase tracking-wider rounded border-2 border-black active:translate-y-0.5 cursor-pointer touch-none select-none text-center ${
                          refuelState === 'refueling' ? 'animate-pulse bg-yellow-500' : ''
                        }`}
                        style={{ fontFamily: '"Press Start 2P"' }}
                      >
                        {refuelState === 'refueling' ? 'FUELING... 🚨' : 'HOLD TO REFUEL ⛽'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
                  <div className="bg-amber-950/20 border-2 border-yellow-500/30 p-3 rounded-lg flex items-center justify-between text-xs text-yellow-500 font-mono">
                    <span className="font-bold">⚡ ESTABLISHED DIRECT CHANNELS TO ASHFAKH'S TRANSMISSIONS</span>
                    <span>LOCAL STATION CLOUD SECURED</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* LinkedIn / Github card */}
                    <div className="bg-[#1a1410] border-2 border-amber-600/35 rounded-xl p-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-white font-mono tracking-wide">DIGITAL ENCRYPTIONS OFFICE</h3>
                        <p className="text-xs text-slate-300 leading-normal">
                          Decrypted social vectors allow direct routing to Ashfakh's external mainframes. Use coordinates below to contact him.
                        </p>

                        <div className="space-y-2 pt-1">
                          <a 
                            href="https://github.com/ashfakhm" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 rounded hover:border-[#38FEDE] text-xs text-white group"
                          >
                            <span className="text-[#38FEDE]">💻</span>
                            <span className="font-mono">GitHub: <span className="underline select-all font-bold text-gray-300">github.com/ashfakhm</span></span>
                          </a>

                          <a 
                            href="https://linkedin.com/" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 rounded hover:border-[#1a9eff] text-xs text-white group"
                          >
                            <span className="text-[#1a9eff]">🔗</span>
                            <span className="font-mono">LinkedIn: <span className="underline select-all font-bold text-gray-300">Ashfakh M</span></span>
                          </a>
                        </div>
                      </div>
                      <div className="text-[9px] text-[#e67e22] mt-3 font-mono">⚡ ID_CHANNELS = ESTABLISHED</div>
                    </div>

                    {/* Email / Resume Card */}
                    <div className="bg-[#1a1410] border-2 border-amber-600/35 rounded-xl p-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h3 className="text-sm font-black text-white font-mono tracking-wide">TELEMETRY CORRESPONDENCE</h3>
                        <p className="text-xs text-slate-300 leading-normal">
                          For hiring sequences or contracts, mail or download his professional payload directly coordinates.
                        </p>

                        <div className="space-y-2 pt-1">
                          <a 
                            href="mailto:ashfakhthedev@gmail.com" 
                            className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 rounded hover:border-red-400 text-xs text-white group"
                          >
                            <span className="text-red-400">📧</span>
                            <span className="font-mono">Email: <span className="underline font-bold text-gray-300">ashfakhthedev@gmail.com</span></span>
                          </a>

                          <a 
                            href="https://github.com/ashfakhm" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-2.5 p-2 bg-slate-900 border border-slate-800 rounded hover:border-green-400 text-xs text-white group"
                          >
                            <span className="text-green-400">📄</span>
                            <span className="font-mono">Curriculum Vitae: <span className="underline font-bold text-gray-300 font-extrabold">Open CV Payload Link</span></span>
                          </a>
                        </div>
                      </div>
                      <div className="text-[9px] text-[#e67e22] mt-3 font-mono">⚡ DIRECT_MAIL = COMPLIANT</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 9. WEAPONS (Target Asteroid Shooter & Achievements) */}
          {/* ==================================================== */}
          {room === 'weapons' && (
            <div className="flex-1 flex flex-col">
              {asteroidsShot < 5 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
                    DESTROY 5 INCOMING METEORS (SHOT: {asteroidsShot}/5)
                  </div>
                  
                  {/* Shooting stage box */}
                  <div className="w-full max-w-lg h-[240px] bg-black border-4 border-slate-700 rounded-lg relative overflow-hidden select-none cursor-crosshair">
                    <div className="absolute inset-0 bg-[#0e1712]/30 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    
                    {/* Targeting reticle overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-dashed border-[#50F01E]/20 rounded-full pointer-events-none flex items-center justify-center">
                      <div className="w-12 h-12 border border-[#50F01E]/40 rounded-full" />
                      <div className="absolute w-full h-[1px] bg-[#50F01E]/15" />
                      <div className="absolute w-[1px] h-full bg-[#50F01E]/15" />
                    </div>

                    {/* Targets list */}
                    {targets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          playLaser();
                          setTargets((prev) => prev.filter((tar) => tar.id !== t.id));
                          setAsteroidsShot((prev) => {
                            const next = prev + 1;
                            if (next >= 5) {
                              setTaskCompleted(true);
                              playSuccessTune();
                            }
                            return next;
                          });
                          
                          // Spawn replacement
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
                        {/* Asteroid craters */}
                        <div className="w-[4px] h-[4px] bg-zinc-950 rounded-full absolute top-1 left-2 opacity-50" />
                        <div className="w-[6px] h-[6px] bg-zinc-950 rounded-full absolute bottom-1.5 right-2 opacity-50" />
                        <div className="w-[3px] h-[3px] bg-zinc-950 rounded-full absolute top-3 right-1.5 opacity-50" />
                        <div className="absolute -inset-1 border border-red-500/0 group-hover:border-red-500/50 rounded-full animate-ping" />
                      </button>
                    ))}
                    
                    {/* Live radar overlay details */}
                    <div className="absolute bottom-2 left-2 text-[8px] font-mono text-green-400">DEFLECTION SHIELD ENERGY: NOMINAL</div>
                    <div className="absolute bottom-2 right-2 text-[8px] font-mono text-green-400">AMMUNITION: UNLIMITED</div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-green-400 font-mono flex-col gap-4">
                  <div className="text-2xl font-bold tracking-widest text-[#38FEDE] animate-pulse">WEAPONS DEPLOYED</div>
                  <div className="text-xs text-white/50 text-center max-w-sm">
                    All targets successfully neutralized. Targeting systems are now offline pending next wave.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 10. ELECTRICAL (Wiring Matching Logic) */}
          {/* ==================================================== */}
          {room === 'electrical' && (
            <div className="flex-1 flex flex-col">
              {Object.keys(wireConnections).length < 4 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
                  <div className="text-[10px] text-gray-400 font-bold uppercase text-center tracking-wider">
                    CLICK A WIRE ON LEFT, THEN MATCH WITH IT'S COLOR ON RIGHT
                  </div>

                  <div className="w-full max-w-sm bg-neutral-950 border-4 border-slate-700 rounded-lg p-5 flex relative min-h-[220px]">
                    
                    {/* Colors indices */}
                    {/* Left Column: Fixed red, blue, yellow, pink */}
                    <div className="flex-1 flex flex-col justify-between items-start space-y-4">
                      {['red', 'blue', 'yellow', 'pink'].map((color, idx) => {
                        const isConnected = wireConnections[color] !== undefined;
                        const isSelected = activeWireDrag === color;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              playWireSpark();
                              setActiveWireDrag(color);
                            }}
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
                            <span>🔌 {color}</span>
                            {isConnected && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Interactive connecting lines */}
                    <div className="absolute inset-x-20 inset-y-0 pointer-events-none">
                      <svg className="w-full h-full">
                        {/* Render existing connected lines */}
                        {Object.entries(wireConnections).map(([leftColor, rightColor]) => {
                          const leftIdx = ['red', 'blue', 'yellow', 'pink'].indexOf(leftColor);
                          const rightIdx = rightWireColors.indexOf(rightColor);
                          
                          // Row coordinates
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

                    {/* Right Column: Shuffled order */}
                    <div className="flex-1 flex flex-col justify-between items-end space-y-4">
                      {rightWireColors.map((color, idx) => {
                        // Check if this right wire color is connected to anything
                        const isMatched = Object.values(wireConnections).includes(color);
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              if (!activeWireDrag) return;
                              // Attempt matching
                              if (activeWireDrag === color) {
                                setWireConnections(prev => {
                                  const next = { ...prev, [color]: color };
                                  if (Object.keys(next).length === 4) {
                                    setTaskCompleted(true);
                                    playSuccessTune();
                                  }
                                  return next;
                                });
                                playBeep();
                                setActiveWireDrag(null);
                              } else {
                                // Buzz incorrect click
                                playLocalSound(160, 'square', 0.2, 0.05);
                                setActiveWireDrag(null);
                              }
                            }}
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
                            <span>{color} 🔌</span>
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
                    <span className="font-bold">⚡ STACK SWITCHBOARD COMPLETED SYSTEM SHUNT</span>
                    <span>AUTOMATIC ELECTRICAL SWITCHING ONLINE</span>
                  </div>

                  {/* Tech stack details */}
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
          )}

          {/* ==================================================== */}
          {/* 11. NAVIGATION (Target Radar Course Alignment) */}
          {/* ==================================================== */}
          {room === 'navigation' && (
            <div className="flex-1 flex flex-col">
              {!navAligned ? (
                <div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
                  <div className="text-[12px] text-gray-400 font-bold uppercase text-center tracking-wider">
                    CHART COURSE
                  </div>

                  <div className="w-full max-w-lg bg-[#0e1726] border-4 border-[#1f2937] rounded-xl p-8 flex flex-col items-center relative min-h-[220px] justify-center">
                    <div className="absolute inset-0 bg-[#000000]/40 bg-[radial-gradient(circle,rgba(30,144,255,0.08)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />

                    <div className="w-full relative py-8 px-4">
                      {/* Visual Track Line */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 -translate-y-1/2 border-y border-white/5" />
                      
                      {/* Nodes */}
                      <div className="absolute top-1/2 left-0 w-3 h-3 bg-white rounded-full -translate-y-1/2 transform -translate-x-1.5" />
                      <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-white rounded-full -translate-y-1/2 transform -translate-x-1.5" />
                      <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-white rounded-full -translate-y-1/2 transform -translate-x-1.5" />
                      <div className="absolute top-1/2 right-0 w-3 h-3 bg-white rounded-full -translate-y-1/2 transform translate-x-1.5" />

                      {/* Hidden interactive slider taking full width */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={shipNavPos.x > 100 ? 100 : shipNavPos.x}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setShipNavPos(prev => ({ ...prev, x: val }));
                          playLocalSound(300 + val * 2, 'sine', 0.02, 0.02);
                          if (val >= 98) {
                            setNavAligned(true);
                            setTaskCompleted(true);
                            playSuccessTune();
                          }
                        }}
                        className="w-full h-8 absolute top-1/2 left-0 -translate-y-1/2 opacity-0 cursor-pointer z-20"
                      />

                      {/* Moving Spaceship Icon */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-10 h-10 -ml-5 bg-blue-500 border-[3px] border-white rounded-full flex items-center justify-center text-lg z-10 pointer-events-none shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                        style={{ left: `${shipNavPos.x > 100 ? 100 : shipNavPos.x}%` }}
                      >
                       🚀
                      </div>
                    </div>
                    
                    <div className="mt-8 text-[9px] font-mono text-cyan-500 bg-cyan-900/20 px-3 py-1 rounded">
                      DRAG SHIP RIGHT TO CHART COURSE
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
                  <div className="bg-blue-950/20 border-2 border-blue-500/30 p-2.5 rounded-lg flex items-center justify-between text-xs text-blue-400 font-mono">
                    <span className="font-bold">🗺️ COURSE LOCK CONFIRMED // RADAR TRACK LOCKED</span>
                    <span>BASE HUB TARGET: MALAPPURAM, KERALA</span>
                  </div>

                  <div className="bg-[#0b141d] border border-blue-500/20 p-4 rounded-xl space-y-2 text-xs font-mono">
                    <h4 className="text-white text-xs font-bold uppercase tracking-wide border-b border-dashed border-blue-500/20 pb-1 flex items-center gap-2">
                      <span>🛰️</span>
                      <span>LOCAL METADATA LOCK: KERALA coordinate</span>
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                      Target locked! Ashfakh operates natively from Kozhikode/Malappuram hub base inside Kerala (India), delivering remote software code globally with precise latency specs.
                    </p>
                    <div className="bg-[#0a0d14] p-2 rounded text-[10px] text-blue-400 border border-blue-950">
                      🛰️ GPS COORDINATES: 11.0510° N, 76.0711° E (Malappuram Dev Lab)
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 12. SHIELDS (Tile Hex Priming Grid) */}
          {/* ==================================================== */}
          {room === 'shields' && (
            <div className="flex-1 flex flex-col">
              {shieldsState.includes(false) ? (
                <div className="flex-1 flex flex-col items-center justify-center p-1 space-y-4">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
                    TAP RED PANELS TO PRIME AND ACTIVATE PROPULSION SHIELDS
                  </div>

                  <div className="w-full max-w-sm bg-neutral-950 border-4 border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center relative min-h-[220px]">
                    {/* Arrange 6 hexes in grid */}
                    <div className="grid grid-cols-3 gap-3.5 max-w-[240px]">
                      {shieldsState.map((active, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            playShieldClick();
                            setShieldsState(prev => {
                              const next = [...prev];
                              next[idx] = !next[idx]; // toggle shield
                              if (!next.includes(false)) {
                                setTaskCompleted(true);
                                playSuccessTune();
                              }
                              return next;
                            });
                          }}
                          className={`w-14 h-16 relative flex items-center justify-center cursor-pointer transition-transform duration-100 hover:scale-105 select-none ${
                            active ? 'text-[#3498db] filter drop-shadow-[0_0_8px_#3498db]' : 'text-red-600 filter drop-shadow-[0_0_4px_#ef4444]'
                          }`}
                        >
                          {/* Beautiful SVG Hex design */}
                          <svg viewBox="0 0 100 115" className="w-full h-full">
                            <polygon
                              points="50,2 97,30 97,85 50,113 3,85 3,30"
                              fill="currentColor"
                              stroke="black"
                              strokeWidth="8"
                            />
                            <polygon
                              points="50,10 90,34 90,81 50,105 10,81 10,34"
                              fill={active ? 'rgba(52, 152, 219, 0.25)' : 'rgba(239, 68, 68, 0.2)'}
                              stroke={active ? '#34e7e4' : '#ff5e57'}
                              strokeWidth="4"
                            />
                          </svg>
                          <span className="absolute text-[8px] font-black text-white font-mono uppercase">
                            {active ? 'OK' : 'OFF'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
                  <div className="bg-[#0e2118] border-2 border-emerald-500/30 p-2.5 rounded-lg flex items-center justify-between text-xs text-emerald-400 font-mono">
                    <span className="font-bold">🛡️ SHIELD CELL ENERGETICS COMPLIANT [100% SECURE]</span>
                    <span>LIGHTHOUSE AUDIT MATRIX VERIFIED</span>
                  </div>

                  {/* High fidelity chrome lighthouse table readout */}
                  <div className="bg-[#0b1712] border border-emerald-500/20 p-4 rounded-xl space-y-3 font-mono">
                    <h4 className="text-white text-xs font-bold uppercase tracking-wide border-b border-dashed border-emerald-500/20 pb-1 flex items-center gap-2">
                      <span>🚀</span>
                      <span>LIGHTHOUSE SYSTEM PROFILE // CORE PERFORMANCE LOCK</span>
                    </h4>
                    
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-neutral-900 border border-zinc-800 p-2 rounded">
                        <span className="block text-emerald-400 font-black text-sm">100</span>
                        <span className="text-[8px] text-zinc-500 uppercase block mt-1">SEO SCORE</span>
                      </div>
                      <div className="bg-neutral-900 border border-zinc-800 p-2 rounded">
                        <span className="block text-emerald-500 font-bold text-sm">94+</span>
                        <span className="text-[8px] text-zinc-500 uppercase block mt-1">PERFORMANCE</span>
                      </div>
                      <div className="bg-neutral-900 border border-zinc-800 p-2 rounded">
                        <span className="block text-emerald-500 font-bold text-sm">95</span>
                        <span className="text-[8px] text-zinc-500 uppercase block mt-1">ACCESS</span>
                      </div>
                      <div className="bg-neutral-900 border border-zinc-800 p-2 rounded">
                        <span className="block text-emerald-400 font-black text-sm">100</span>
                        <span className="text-[8px] text-zinc-500 uppercase block mt-1">PRACTICES</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal italic text-center pt-1.5">
                      "I write performant, clean-rendered responsive elements certified for standard network limits."
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Foot Bar Status */}
        <div className="bg-[#0f0f1c] border-t-4 border-[#3a3a5e] px-4 py-2 flex items-center justify-between text-[9px] text-[#3e3e5c] font-mono">
          <span>PORTFOLIO_ENGINE: SHIELD_RESERVE_OK</span>
          <span>© 2026 ASHFAKH M</span>
        </div>
      </div>
    </div>
  );
}
