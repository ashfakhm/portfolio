import { useEffect, useRef, useState } from 'react';
import ThreeBackground from './components/ThreeBackground';
import CrewmateSprite, { CrewmateColor, CrewmateHat, CREWMATE_COLORS, CREWMATE_HATS } from './components/CrewmateSprite';
import TaskModal from './components/TaskModal';
import TutorialModal from './components/TutorialModal';
import HologramMap from './components/HologramMap';
import VentMap from './components/VentMap';
import ChatSystem from "./components/ChatSystem";
import LobbyScreen from "./components/LobbyScreen";
import CinematicSplash from "./components/CinematicSplash";
import { 
  Compass, Volume2, VolumeX, Trophy, HelpCircle, MessageSquare, CheckSquare,
  Rocket, CheckCircle2, AlertTriangle, Wind
} from 'lucide-react';

import { synthSFX } from './utils/sound';
import { 
  RoomConfig, SPACESHIP_ROOMS, FLOATING_VENTS, WALKABLE_REGIONS, INITIAL_DOORS, isWalkable, ChatMessage 
} from './gameConfig';

export default function App() {
  // Global View/Lobby state
  const [inLobby, setInLobby] = useState(false);
  const [progressCount, setProgressCount] = useState(100);

  // Cinematic Splash states
  const [showCinematic, setShowCinematic] = useState(true);

  // Player custom states
  const [playerColor, setPlayerColor] = useState<CrewmateColor>('red');
  const [playerHat, setPlayerHat] = useState<CrewmateHat>('plant');
  const [impostorClickCount, setImpostorClickCount] = useState(0);
  const [showImpostorAlert, setShowImpostorAlert] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Player Real-time coordinate states
  const [playerPos, setPlayerPos] = useState(() => {
    const saved = sessionStorage.getItem('playerPos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { x: 450, y: 100 };
  });
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [playerMoving, setPlayerMoving] = useState(false);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [targetRoomPath, setTargetRoomPath] = useState<string | null>(null);

  // Minimap control layout
  const [, setMinimapMaximized] = useState(false);
  const [showHologramMap, setShowHologramMap] = useState(false);
  const [cinematicPhase, setCinematicPhase] = useState<'shh' | 'reveal'>('shh');
  const [showTaskCompletedBanner, setShowTaskCompletedBanner] = useState<string | null>(null);
  const [lobbyTab, setLobbyTab] = useState<'color' | 'hat'>('color');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", senderName: "Captain Blue", senderColor: "blue", message: "Welcome crewmates, make sure to read my files!" },
    { id: "2", senderName: "Pink", senderColor: "pink", message: "I saw you doing medical scans. Highly qualified!" },
    { id: "3", senderName: "Lime Tech", senderColor: "lime", message: "Projects in Comms download are fully solid! Razorpay hook tested." }
  ]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  // Game Tasks completion trackers
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    const saved = sessionStorage.getItem('completedTasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      cafeteria: false,
      reactor: false,
      admin: false,
      comms: false,
      medbay: false,
      security: false,
      storage: false,
      weapons: false,
      electrical: false,
      navigation: false,
      shields: false,
    };
  });

  useEffect(() => {
    sessionStorage.setItem('playerPos', JSON.stringify(playerPos));
  }, [playerPos]);

  useEffect(() => {
    sessionStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  // Proximity sliding doors
  const [doors, setDoors] = useState(INITIAL_DOORS);
  const [doorProgress, setDoorProgress] = useState<Record<string, number>>({
    door1: 0, door2: 0, door3: 0, door4: 0, door5: 0, door6: 0
  });

  // Hot interaction indicators
  const [nearestRoom, setNearestRoom] = useState<RoomConfig | null>(null);
  const [openModalRoom, setOpenModalRoom] = useState<string | null>(null);
  const [nearVent, setNearVent] = useState<{ id: string; rx: string; x: number; y: number } | null>(null);
  const [ventMapOpen, setVentMapOpen] = useState(false);
  const [ventingStatus, setVentingStatus] = useState<'idle' | 'diving' | 'emerging'>('idle');

  // Core canvas sizes and bounding elements
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIdRef = useRef<number>(0);
  const keysActiveRef = useRef<Record<string, boolean>>({});
  const playerPosRef = useRef(playerPos);
  const lastStepTimeRef = useRef(0);

  // Keep playerPosRef in sync with state changes
  useEffect(() => {
    playerPosRef.current = playerPos;
  }, [playerPos]);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickOffset, setJoystickOffset] = useState({ x: 0, y: 0 });
  const [joystickCenter, setJoystickCenter] = useState<{ x: number; y: number } | null>(null);
  const [joystickCurrent, setJoystickCurrent] = useState<{ x: number; y: number } | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  // Monitor screen orientation to prompt mobile landscape rotations
  useEffect(() => {
    const checkOrientation = () => {
      const portraitCheck = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
      setIsPortrait(portraitCheck);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Auto-play the cinematic on mount to start directly in the game
  useEffect(() => {
    synthSFX.enabled = soundOn;
    // Play dramatic jumpscare tone
    synthSFX.playImpostorJumpscare();

    // Run custom duration targeting ONLY the Shh screen, bypassing the secondary teammate reveal as requested
    const endCinematicTimer = setTimeout(() => {
      setShowCinematic(false);
      setShowTutorial(true);
      synthSFX.playSuccess();
    }, 3500);

    return () => clearTimeout(endCinematicTimer);
  }, []);

  // Handle lobby counter timer simulation
  useEffect(() => {
    if (!inLobby) return;
    
    // Simulate loading/joining countdown logs
    const interval = setInterval(() => {
      setProgressCount((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [inLobby]);

  // Doors proximity scanning and opening animations helper loop
  useEffect(() => {
    if (inLobby || showCinematic) return;

    const interval = setInterval(() => {
      // Check proximity and update door open conditions
      setDoors((prevDoors) => {
        let changed = false;
        const nextDoors = prevDoors.map((door) => {
          const dx = door.x - playerPos.x;
          const dy = door.y - playerPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const shouldBeOpen = distance < 65;

          if (door.isOpen !== shouldBeOpen) {
            changed = true;
            if (shouldBeOpen) {
              synthSFX.playDoorWhoosh();
            } else {
              synthSFX.playBeep();
            }
            return { ...door, isOpen: shouldBeOpen };
          }
          return door;
        });
        return changed ? nextDoors : prevDoors;
      });

      // Animate progress smoothly towards target
      setDoorProgress((prev) => {
        const next = { ...prev };
        let changed = false;
        doors.forEach((door) => {
          const target = door.isOpen ? 1 : 0;
          const current = prev[door.id] || 0;
          if (Math.abs(current - target) > 0.05) {
            changed = true;
            next[door.id] = current + (target - current) * 0.22; // smooth spring
          } else if (current !== target) {
            changed = true;
            next[door.id] = target;
          }
        });
        return changed ? next : prev;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [inLobby, showCinematic, playerPos, doors]);

  // Initial trigger for sound configurations & Cinematic Intro
  const enterMissionShip = () => {
    synthSFX.enabled = soundOn;
    setInLobby(false);
    setShowCinematic(true);
    setCinematicPhase('shh');
    
    // Play dramatic warning buzzy tone for SHH phase
    synthSFX.playImpostorJumpscare();

    // After 1.7s, transition to the crewmate reveal phase
    setTimeout(() => {
      setCinematicPhase('reveal');
      synthSFX.playCinematicSplash();
    }, 1700);

    // End cinematic after 4.2s
    setTimeout(() => {
      setShowCinematic(false);
      setShowTutorial(true);
      synthSFX.playSuccess();
    }, 4500);
  };

  // Keyboard controls listener (WASD / Arrows)
  useEffect(() => {
    if (inLobby || showCinematic || openModalRoom || ventMapOpen) {
      keysActiveRef.current = {};
      setPlayerMoving(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const walkKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
      if (walkKeys.includes(e.key.toLowerCase())) {
        keysActiveRef.current[e.key.toLowerCase()] = true;
        setTargetPos(null);
        setTargetRoomPath(null);
      }

      // SPACEBAR or E triggers closest console task trigger
      if ((e.key === ' ' || e.key.toLowerCase() === 'e') && nearestRoom) {
        e.preventDefault();
        triggerModal(nearestRoom.id);
      }

      // 'V' hotkey triggers Vent Map
      if (e.key.toLowerCase() === 'v' && nearVent && ventingStatus === 'idle') {
        e.preventDefault();
        setVentMapOpen(true);
        synthSFX.playBeep();
      }

      // 'M' or 'TAB' hotkey triggers Holographic Map
      if (e.key.toLowerCase() === 'm' || e.key === 'Tab') {
        e.preventDefault();
        setShowHologramMap(prev => !prev);
        synthSFX.playBeep();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keysActiveRef.current[e.key.toLowerCase()]) {
        delete keysActiveRef.current[e.key.toLowerCase()];
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Coordinate position ticking engine inside frames (60fps)
    const tickMovement = () => {
      let dx = 0;
      let dy = 0;
      const speed = 5.5;

      if (keysActiveRef.current['w'] || keysActiveRef.current['arrowup']) dy -= 1;
      if (keysActiveRef.current['s'] || keysActiveRef.current['arrowdown']) dy += 1;
      if (keysActiveRef.current['a'] || keysActiveRef.current['arrowleft']) dx -= 1;
      if (keysActiveRef.current['d'] || keysActiveRef.current['arrowright']) dx += 1;

      if (joystickActive) {
        dx = joystickOffset.x * 1.5;
        dy = joystickOffset.y * 1.5;
      }

      let isMovingWalk = false;
      let currentX = playerPosRef.current.x;
      let currentY = playerPosRef.current.y;

      if (dx !== 0 || dy !== 0) {
        isMovingWalk = true;
        const length = Math.sqrt(dx * dx + dy * dy);
        const moveX = (dx / length) * speed;
        const moveY = (dy / length) * speed;

        let nextX = playerPosRef.current.x;
        let nextY = playerPosRef.current.y;

        // Verify side slide on X matching boundary segments
        if (isWalkable(playerPosRef.current.x + moveX, playerPosRef.current.y, doors)) {
          nextX = playerPosRef.current.x + moveX;
        }
        // Verify side slide on Y matching boundary segments
        if (isWalkable(playerPosRef.current.x, playerPosRef.current.y + moveY, doors)) {
          nextY = playerPosRef.current.y + moveY;
        }
        // General combined coordinates
        if (isWalkable(playerPosRef.current.x + moveX, playerPosRef.current.y + moveY, doors)) {
          nextX = playerPosRef.current.x + moveX;
          nextY = playerPosRef.current.y + moveY;
        }

        currentX = nextX;
        currentY = nextY;

        if (dx < 0) setDirection('left');
        else if (dx > 0) setDirection('right');
      } else if (targetPos) {
        const distToTargetX = targetPos.x - playerPosRef.current.x;
        const distToTargetY = targetPos.y - playerPosRef.current.y;
        const totalDist = Math.sqrt(distToTargetX * distToTargetX + distToTargetY * distToTargetY);

        if (totalDist > 6) {
          isMovingWalk = true;
          const moveX = (distToTargetX / totalDist) * speed;
          const moveY = (distToTargetY / totalDist) * speed;

          let nextX = playerPosRef.current.x;
          let nextY = playerPosRef.current.y;

          if (isWalkable(playerPosRef.current.x + moveX, playerPosRef.current.y, doors)) {
            nextX = playerPosRef.current.x + moveX;
          }
          if (isWalkable(playerPosRef.current.x, playerPosRef.current.y + moveY, doors)) {
            nextY = playerPosRef.current.y + moveY;
          }
          if (isWalkable(playerPosRef.current.x + moveX, playerPosRef.current.y + moveY, doors)) {
            nextX = playerPosRef.current.x + moveX;
            nextY = playerPosRef.current.y + moveY;
          }

          // Force stop click-to-walk paths if we run straight into a hard wall boundary
          if (nextX === playerPosRef.current.x && nextY === playerPosRef.current.y) {
            setTargetPos(null);
            setTargetRoomPath(null);
          } else {
            currentX = nextX;
            currentY = nextY;
          }

          if (distToTargetX < 0) setDirection('left');
          else setDirection('right');
        } else {
          setTargetPos(null);
          if (targetRoomPath) {
            triggerModal(targetRoomPath);
            setTargetRoomPath(null);
          }
        }
      }

      if (isMovingWalk) {
        // Enforce physical extreme coordinates boundaries just in case
        currentX = Math.max(35, Math.min(850, currentX));
        currentY = Math.max(55, Math.min(760, currentY));

        setPlayerPos({ x: currentX, y: currentY });
        setPlayerMoving(true);

        const nowTime = Date.now();
        if (nowTime - lastStepTimeRef.current > 240) {
          synthSFX.playFootstep();
          lastStepTimeRef.current = nowTime;
        }
      } else {
        setPlayerMoving(false);
      }

      let closestRoom: RoomConfig | null = null;
      let minDistance = 60;

      Object.values(SPACESHIP_ROOMS).forEach((room) => {
        const rx = room.cx - currentX;
        const ry = room.cy - currentY;
        const dist = Math.sqrt(rx * rx + ry * ry);
        if (dist < minDistance) {
          minDistance = dist;
          closestRoom = room;
        }
      });

      setNearestRoom(closestRoom);

      let nearestVent = null;
      FLOATING_VENTS.forEach((vent) => {
        const vx = vent.x - currentX;
        const vy = vent.y - currentY;
        const vdist = Math.sqrt(vx * vx + vy * vy);
        if (vdist < 40) nearestVent = vent;
      });
      setNearVent(nearestVent);

      frameIdRef.current = requestAnimationFrame(tickMovement);
    };

    frameIdRef.current = requestAnimationFrame(tickMovement);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [inLobby, showCinematic, openModalRoom, targetPos, joystickActive, joystickOffset, targetRoomPath, ventMapOpen, doors, nearestRoom, nearVent, ventingStatus]);

  // Redraw Ship Layout Canvas Details with high fidelity graphics!
  useEffect(() => {
    if (inLobby || showCinematic || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    import("./utils/shipRenderer").then(({ drawShip }) => {
      drawShip(canvas, ctx, {
        WALKABLE_REGIONS,
        SPACESHIP_ROOMS,
        completedTasks,
        doors,
        doorProgress,
        FLOATING_VENTS,
        nearestRoom,
        playerPos,
        targetPos
      });
    });
  }, [inLobby, showCinematic, nearestRoom, completedTasks, targetPos, playerPos, doors, doorProgress]);

  // Click-to-walk navigation click handler
  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (openModalRoom || ventMapOpen) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Scale exact mouse position matching virtual coordinates inside 900x800
    const clickX = ((e.clientX - rect.left) / rect.width) * 900;
    const clickY = ((e.clientY - rect.top) / rect.height) * 800;

    setTargetPos({ x: clickX, y: clickY });
    setTargetRoomPath(null);
    synthSFX.playBeep();
  };

  // Pilot crewmate auto walker directly to targeted sector console
  const initiateAutoWalkToRoom = (roomId: string) => {
    const targetRoom = SPACESHIP_ROOMS[roomId];
    if (!targetRoom) return;

    setMinimapMaximized(false);
    setShowHologramMap(false);
    setTargetPos({ x: targetRoom.cx, y: targetRoom.cy });
    setTargetRoomPath(roomId); // Store room to open when arrived
    synthSFX.playBeep();
  };

  // Interact Console modal trigger
  const triggerModal = (roomId: string) => {
    setOpenModalRoom(roomId);
    synthSFX.playBeep();
  };

  // Close console modal and sync task completes
  const handleModalClose = (wasProductive = false) => {
    if (openModalRoom) {
      if (wasProductive) {
        setCompletedTasks(prev => ({ ...prev, [openModalRoom]: true }));
        synthSFX.playSuccess();

        // Broadcast completed task to simulated chat log
        const completedRoomInfo = SPACESHIP_ROOMS[openModalRoom];
        if (completedRoomInfo) {
          // Trigger sliding green TASK COMPLETED banner
          setShowTaskCompletedBanner(completedRoomInfo.name);
          setTimeout(() => {
            setShowTaskCompletedBanner(null);
          }, 3000);

          setChatMessages(prev => [...prev, {
            id: String(Date.now()),
            senderName: 'SYSTEM LOG',
            senderColor: 'white',
            message: `★ You stabilized node: ${completedRoomInfo.name}`,
            isSystem: true
          }]);
        }
      }
    }
    setOpenModalRoom(null);
  };

  // Impostor Click Easter egg
  const handleCrewClick = () => {
    const nextCount = impostorClickCount + 1;
    setImpostorClickCount(nextCount);
    
    if (nextCount >= 5) {
      setImpostorClickCount(0);
      setShowImpostorAlert(true);
      synthSFX.playImpostorJumpscare();
    } else {
      synthSFX.playBeep();
    }
  };

  // Mobile virtual PUBG-like joystick tracker (with dynamic center selection inside the touch pad)
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const pos = { x: touch.clientX, y: touch.clientY };
    setJoystickCenter(pos);
    setJoystickCurrent(pos);
    setJoystickActive(true);
    setJoystickOffset({ x: 0, y: 0 });
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickActive || !joystickCenter) return;
    const touch = e.touches[0];
    setJoystickCurrent({ x: touch.clientX, y: touch.clientY });

    const dx = touch.clientX - joystickCenter.x;
    const dy = touch.clientY - joystickCenter.y;
    const distanceThreshold = 45;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length > 0) {
      const angle = Math.atan2(dy, dx);
      const intensity = Math.min(length, distanceThreshold) / distanceThreshold;
      
      setJoystickOffset({
        x: Math.cos(angle) * intensity * 2,
        y: Math.sin(angle) * intensity * 2
      });
    } else {
      setJoystickOffset({ x: 0, y: 0 });
    }
  };

  const handleJoystickTouchEnd = () => {
    setJoystickActive(false);
    setJoystickCenter(null);
    setJoystickCurrent(null);
    setJoystickOffset({ x: 0, y: 0 });
  };

  // Speed-Vent travel teleportation trigger
  const triggerVentTravel = (targetRoomId: string) => {
    const targetRoom = SPACESHIP_ROOMS[targetRoomId];
    if (!targetRoom || ventingStatus !== 'idle') return;

    setVentMapOpen(false);
    synthSFX.playVentWhoosh();
    setVentingStatus('diving');
    setPlayerMoving(false);
    setTargetPos(null);

    setTimeout(() => {
      // Teleport precisely to the associated vent coordinate, or construct a safe walkable placement offset if not a venting room
      const associatedVent = FLOATING_VENTS.find(v => v.rx === targetRoomId);
      if (associatedVent) {
        setPlayerPos({ x: associatedVent.x, y: associatedVent.y });
      } else {
        setPlayerPos({ x: targetRoom.cx, y: targetRoom.cy + 30 });
      }
      setVentingStatus('emerging');

      setTimeout(() => {
        setVentingStatus('idle');
      }, 500);

      // Alert system log in chat
      setChatMessages(prev => [...prev, {
        id: String(Date.now()),
        senderName: 'SENSOR LOG',
        senderColor: 'white',
        message: `⚠ Ventilation activity detected near ${targetRoom.name}`,
        isSystem: true
      }]);
    }, 500);
  };

  // Calculate task accomplishment progression
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = Object.keys(completedTasks).length;

  // Victory condition check
  useEffect(() => {
    if (totalTasks > 0 && completedCount === totalTasks && !inLobby && !showCinematic) {
      if (!showVictory) {
        setShowVictory(true);
        synthSFX.playSuccess();
      }
    }
  }, [completedCount, totalTasks, inLobby, showCinematic, showVictory]);
  const progressPercent = Math.min(100, Math.floor((completedCount / totalTasks) * 100));

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-[#070712] text-[#E8E8FF] select-none text-sans">
      
      {/* 0. MOBILE PORTRAIT ORIENTATION FALLBACK ENFORCER */}
      {isPortrait && (
        <div className="fixed inset-0 bg-[#07070F] z-[100] flex flex-col items-center justify-center p-8 text-center select-none animate-fadeIn">
          <div className="w-16 h-16 mb-6 rounded-full bg-slate-900 border-2 border-dashed border-sky-400 flex items-center justify-center text-3xl animate-bounce">
            📱
          </div>
          <h2 className="text-[#38FEDE] text-sm font-bold uppercase tracking-widest mb-3 font-mono">
            Rotate Your Phone to Start
          </h2>
          <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed font-mono uppercase tracking-[0.1em]">
            Please rotate your phone to Landscape Mode to align ship panels and explore the spaceship crew mission!
          </p>
        </div>
      )}
      
      {/* 3D Moving stars canvas background */}
      <ThreeBackground playerMoving={playerMoving} playerDirection={{ x: direction === 'left' ? -1 : 1, y: playerMoving ? 1 : 0 }} />

      {/* ==================================================== */}
      {/* 1. LOBBY SCREEN */}
      <LobbyScreen
        inLobby={inLobby}
        progressCount={progressCount}
        lobbyTab={lobbyTab}
        setLobbyTab={setLobbyTab}
        playerColor={playerColor}
        setPlayerColor={setPlayerColor}
        playerHat={playerHat}
        setPlayerHat={setPlayerHat}
        enterMissionShip={enterMissionShip}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
      />

      {/* 2. CINEMATIC SPLASH */}
      <CinematicSplash
        showCinematic={showCinematic}
        cinematicPhase={cinematicPhase}
        playerColor={playerColor}
        playerHat={playerHat}
        completedCount={completedCount}
        totalTasks={totalTasks}
        showImpostorAlert={showImpostorAlert}
        setShowImpostorAlert={setShowImpostorAlert}
      />

      {/* ==================================================== */}
      {/* 4. HEADS-UP DISPLAY (HUD) IN-GAME CONTROLS */}
      {/* ==================================================== */}
      {!inLobby && !showCinematic && (
        <div className="absolute inset-x-0 inset-y-0 z-10 pointer-events-none flex flex-col justify-between p-3 select-none">
          
          {/* Top HUD bar with Task completion bar */}
          <div className="w-full max-w-2xl mx-auto pointer-events-auto bg-[#0b0b14]/90 backdrop-blur-md border border-white/10 p-2 sm:p-2.5 rounded-2xl flex flex-col space-y-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/5">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-green-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={12} /> <span className="hidden sm:inline">TOTAL SHIP TASKS STATUS:</span><span className="sm:hidden">TASKS:</span></span>
              <div className="flex items-center gap-3">
                <span>{progressPercent}% <span className="hidden sm:inline">COMPLETED ({completedCount}/{totalTasks})</span></span>
                <button
                  onClick={() => {
                    setShowTutorial(true);
                    synthSFX.playBeep();
                  }}
                  className="bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-[9px] font-semibold text-sky-300 p-1.5 sm:px-2.5 sm:py-1 rounded-md cursor-pointer uppercase transition-all tracking-wider font-mono hover:scale-105 active:scale-95 leading-none flex items-center gap-1"
                >
                  <HelpCircle size={12} /> <span className="hidden sm:inline">Help</span>
                </button>
              </div>
            </div>
            
            <div className="w-full h-3.5 bg-black border border-slate-700 rounded overflow-hidden p-0.5 relative">
              <div 
                className="h-full bg-green-500 rounded-sm transition-all duration-300 shadow-[0_0_10px_#4caf50]" 
                style={{ width: `${progressPercent}%` }} 
              />
              {progressPercent === 100 ? (
                <div 
                  className="absolute inset-x-0 inset-y-0 text-[8px] font-black tracking-widest text-white leading-none flex items-center justify-center animate-bounce uppercase drop-shadow-md"
                  style={{ fontFamily: '"Press Start 2P"' }}
                >
                  <Rocket size={10} className="mr-2" /> ALL SYSTEMS STABILIZED! <Trophy size={10} className="ml-2 text-yellow-300" />
                </div>
              ) : null}
            </div>
          </div>

          {/* Left HUD Checklist EXACT AMONG US MAP OUTLINE */}
          <div className="absolute left-3 top-20 pointer-events-auto flex flex-col space-y-2.5 max-w-[220px] hidden md:flex">
            <div className="bg-[#0b0b14]/90 backdrop-blur-md border border-white/10 p-3.5 rounded-xl flex flex-col space-y-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] font-mono text-xs relative overflow-hidden ring-1 ring-inset ring-white/5">
              <div className="absolute top-0 right-0 w-8 h-8 opacity-5 font-bold text-3xl">🗂</div>
              <div className="text-[#38FEDE] font-black tracking-widest uppercase border-b flex items-center justify-between border-dashed border-white/10 pb-2 font-mono text-[10px]">
                MISSIONS LIST:
              </div>
              
              {[
                { id: 'cafeteria', label: 'Cafeteria: Deck Profile' },
                { id: 'reactor', label: 'Reactor: About Me' },
                { id: 'admin', label: 'Admin Desk: Swipe Pass' },
                { id: 'comms', label: 'Comms Dish: Decrypt Data' },
                { id: 'medbay', label: 'MedBay Lab: Submit Scan' },
                { id: 'security', label: 'Security: Camera monitors' },
                { id: 'storage', label: 'Storage Area: Fuel Cells' },
                { id: 'weapons', label: 'Weapons: Debris Shooting' },
                { id: 'electrical', label: 'Electrical: Wiring Grid' },
                { id: 'navigation', label: 'Navigation: Course Alignment' },
                { id: 'shields', label: 'Shield Controls: Hex Priming' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => initiateAutoWalkToRoom(m.id)}
                  className="text-left group flex items-start gap-1.5 cursor-pointer leading-tight transition-all hover:text-[#38FEDE]"
                >
                  <span className={completedTasks[m.id] ? 'text-green-500 font-bold' : 'text-gray-500'}>
                    {completedTasks[m.id] ? '☑' : '☐'}
                  </span>
                  <span className={`${completedTasks[m.id] ? 'line-through text-slate-500 font-normal' : 'text-slate-300 font-semibold text-[11px]'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-[#0b0b1ccf] border border-[#3a3a5e] p-2 rounded text-[9px] text-slate-400 font-mono leading-relaxed shadow flex flex-col">
              <span className="font-extrabold uppercase text-[#FFD700] text-[9px] mb-0.5">AUTO-WALK CLIENT:</span>
              <span>Click mission above to auto-pilot. Tap Space / USE to run!</span>
            </div>
          </div>

          {/* Right HUD minimized collage widgets + Hologram map button */}
          <div className="absolute right-3 top-16 sm:right-4 sm:top-24 pointer-events-auto flex flex-col items-end space-y-2 sm:space-y-3">
            
            {/* Hologram blueprint panel toggle */}
            <button 
              onClick={() => { setShowHologramMap(true); synthSFX.playBeep(); }}
              className="p-2.5 sm:px-4 sm:py-2 bg-[#0b0b14]/90 backdrop-blur-md border border-[#1a9eff]/40 hover:border-[#38FEDE] hover:bg-[#1a9eff]/10 text-white hover:text-[#38FEDE] flex items-center justify-center gap-2 rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 ring-1 ring-inset ring-[#1a9eff]/20"
            >
              <Compass size={20} className="animate-spin-slow text-[#1a9eff]" />
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-mono font-bold">Holographic Map (M)</span>
            </button>

            {/* Chat Cockpit Panel toggle */}
            <button 
              onClick={() => { setChatOpen(prev => !prev); synthSFX.playBeep(); }}
              className={`hidden md:flex p-2.5 sm:px-4 sm:py-2 bg-[#0b0b14]/90 backdrop-blur-md items-center justify-center gap-2 rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 ${
                chatOpen ? 'border-2 border-green-500/50 text-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border border-white/10 hover:border-white/30 text-white hover:bg-white/5 ring-1 ring-inset ring-white/5'
              }`}
            >
              <MessageSquare size={18} />
              <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-mono font-bold">Crew Logs Chat</span>
            </button>

            {/* Quick sound switch trigger */}
            <button
              onClick={() => { setSoundOn(!soundOn); synthSFX.enabled = !soundOn; }}
              className="p-2.5 sm:px-3 sm:py-2 bg-[#0b0b14]/80 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-300 rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 text-[10px] font-mono tracking-wider ring-1 ring-inset ring-white/5"
            >
              {soundOn ? <Volume2 size={16} className="text-green-400" /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">{soundOn ? 'SOUND ON' : 'MUTED'}</span>
            </button>
          </div>

          {/* Bottom HUD Bar Wardrobe customizations */}
          <div className="w-full py-1 pointer-events-auto flex justify-end md:justify-between items-end gap-3">
            
            {/* Live customizer indicators */}
            <div className="bg-[#0b0b14]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/5 max-w-sm hidden lg:flex">
              <div onClick={handleCrewClick} className="cursor-pointer group relative">
                <CrewmateSprite color={playerColor} hat={playerHat} isMoving={playerMoving} direction={direction} size={50} />
                <div className="absolute inset-0 bg-black/60 rounded opacity-0 group-hover:opacity-100 flex items-center justify-center text-[7px] font-bold text-red-500 font-mono text-center">TAP 5X!</div>
              </div>
              <div className="flex flex-col space-y-1 font-mono text-xs">
                <div className="font-bold text-white flex items-center gap-1">
                  <span>Suit Designator</span>
                </div>
                <div className="flex gap-1">
                  {['red', 'lime', 'cyan', 'pink', 'yellow'].map((col) => (
                    <button
                      key={col}
                      onClick={() => setPlayerColor(col as CrewmateColor)}
                      className={`w-4 h-4 rounded-full border cursor-pointer hover:scale-110 active:scale-95 transition-all`}
                      style={{ 
                        backgroundColor: CREWMATE_COLORS[col as CrewmateColor].fill,
                        borderColor: playerColor === col ? '#FFF' : '#222'
                      }}
                    />
                  ))}
                  <span className="text-[10px] text-slate-500 pl-1.5">Hats:</span>
                  {['none', 'plant', 'egg', 'crown'].map((h) => (
                    <button
                      key={h}
                      onClick={() => setPlayerHat(h as CrewmateHat)}
                      className={`text-[9px] px-1 py-0.5 rounded border leading-none bg-slate-900 ${playerHat === h ? 'border-[#38FEDE]' : 'border-slate-800'}`}
                    >
                      {CREWMATE_HATS[h as CrewmateHat].emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons Desk */}
            <div className="flex items-center gap-2 sm:gap-3">
              {nearVent && (
                <button
                  onClick={() => { setVentMapOpen(true); synthSFX.playBeep(); }}
                  className="p-3 sm:px-4 sm:py-3 bg-[#4e5564]/80 backdrop-blur-sm hover:bg-[#5f697c]/90 border border-slate-400/50 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 transition-all text-center font-bold text-[9px] tracking-widest uppercase text-[#38FEDE] flex items-center gap-1.5"
                  style={{ fontFamily: '"Press Start 2P"' }}
                >
                  <Wind size={16} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">PASSAGE</span>
                </button>
              )}

              <button
                onClick={() => triggerModal('emergency')}
                className="p-3 sm:px-5 sm:py-4 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-2xl border border-red-500/50 text-center shadow-[0_0_20px_rgba(220,38,38,0.2)] active:scale-95 transition-all w-16 sm:w-[120px] flex flex-col items-center justify-center backdrop-blur-md"
                style={{ fontFamily: '"Press Start 2P"' }}
              >
                <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                  <AlertTriangle size={18} className="text-red-400 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:block text-red-300 text-[7px] tracking-[0.2em] mb-0 font-bold leading-none select-none opacity-80">EMERGENCY</span>
                  <span className="font-bold text-[7px] sm:text-[9px] md:text-xs tracking-widest uppercase leading-none select-none text-white drop-shadow-md">REPORT</span>
                </div>
              </button>

              <button
                onClick={() => { if (nearestRoom) triggerModal(nearestRoom.id); }}
                disabled={!nearestRoom}
                className={`p-3 sm:py-4 sm:px-6 md:py-4 md:px-8 rounded-2xl border text-center cursor-pointer font-bold uppercase transition-all flex flex-col items-center justify-center relative overflow-hidden w-16 sm:w-[140px] backdrop-blur-md ${
                  nearestRoom 
                    ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95' 
                    : 'bg-slate-800/30 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-80 shadow-none'
                }`}
              >
                <span className="text-[9px] sm:text-[11px] font-black tracking-widest block drop-shadow-md text-white" style={{ fontFamily: '"Press Start 2P"' }}>USE</span>
                {nearestRoom && <span className="hidden sm:block text-[7px] font-mono mt-1 tracking-wider uppercase font-extrabold text-yellow-200/80">{nearestRoom.name}</span>}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* 5. MAIN GRAPHICAL WEB-SANDBOX SPACE STATION VIEWPORTS */}
      {/* ==================================================== */}
      {!inLobby && !showCinematic && (
        <div 
          id="game-viewport-sandbox"
          className="absolute inset-0 w-full h-full overflow-hidden bg-black z-0"
        >
          {/* Virtual spaceship floor structure layout matching Skeld style */}
          <div 
            className="absolute bg-[#090918] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)] cursor-crosshair overflow-hidden"
            style={{ 
              width: '900px', 
              height: '800px', 
              transform: `translate(calc(50vw - ${playerPos.x}px), calc(50vh - ${playerPos.y}px)) scale(${isPortrait ? 0.9 : 1.6})`,
              transformOrigin: `${playerPos.x}px ${playerPos.y}px`
            }}
          >
            {/* Drawing core station layout canvas graphics */}
            <canvas
              ref={canvasRef}
              width={900}
              height={800}
              onClick={handleMapClick}
              className="absolute inset-0 z-0 bg-transparent"
            />

            {/* Render walking user physical crewmate exactly on coordinates */}
            <div
              className={`absolute z-10 select-none ${ventingStatus === 'idle' ? '' : ''}`}
              style={{
                left: `${playerPos.x - 28}px`,
                top: `${playerPos.y - 65}px`,
                pointerEvents: 'none',
              }}
            >
              <div 
                className={`transition-all duration-500 ease-in-out ${
                  ventingStatus === 'diving' ? 'scale-0 opacity-0 translate-y-12' :
                  ventingStatus === 'emerging' ? 'scale-100 opacity-100 translate-y-0' :
                  'scale-100 opacity-100 translate-y-0'
                }`}
              >
                <CrewmateSprite 
                  color={playerColor} 
                  hat={playerHat} 
                  isMoving={playerMoving} 
                  direction={direction} 
                  size={55}
                  name="You" 
                />
              </div>
            </div>

            {/* Emergency Button Cafeteria trigger desk */}
            <div 
              onClick={() => triggerModal('emergency')}
              className="absolute pointer-events-auto bg-[#c5111115] border-2 border-red-500/20 rounded-full cursor-pointer flex items-center justify-center hover:bg-red-500/20 transition-all z-0"
              style={{ left: '432px', top: '132px', width: '36px', height: '36px' }}
              title="Click Emergency Table!"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-black animate-pulse" />
            </div>

            {/* Virtual room navigation cards overlaying the graphical rooms */}
            {Object.values(SPACESHIP_ROOMS).map((room) => {
              const rectWidth = room.bounds.maxX - room.bounds.minX;
              return (
                <div
                  key={room.id}
                  onClick={() => initiateAutoWalkToRoom(room.id)}
                  className="absolute pointer-events-auto text-[8px] bg-slate-900/90 border border-slate-700 hover:border-[#38FEDE] text-slate-300 px-1.5 py-0.5 rounded tracking-wide font-mono flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all select-none cursor-pointer"
                  style={{ 
                    left: `${room.bounds.minX + rectWidth/2 - 40}px`, 
                    top: `${room.bounds.minY + 12}px` 
                  }}
                >
                  <span>{room.icon}</span>
                  <span className="font-extrabold text-[8px] uppercase">{room.name}</span>
                </div>
              );
            })}

          </div>

          {/* Vision Line of Sight Overlay (Among Us shadow radius) */}
          <div 
            className="absolute inset-0 pointer-events-none z-[15]"
            style={{
              background: 'radial-gradient(circle at 50vw 50vh, transparent 180px, rgba(0,0,0,0.4) 300px, rgba(0,0,0,0.85) 450px, rgba(0,0,0,1) 600px)'
            }}
          />
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. COCKPIT CREWLOGS CHAT CHANNEL OVERLAY */}
      {/* ==================================================== */}
      <ChatSystem 
        chatOpen={chatOpen}
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        setChatOpen={setChatOpen}
        inLobby={inLobby}
        showCinematic={showCinematic}
        playerColor={playerColor}
      />

      {/* ==================================================== */}
      {/* 7. RADAR HOLOGRAM BLUEPRINT FULL SCREEN OVERLAY */}
      {/* ==================================================== */}
      <HologramMap
        isOpen={showHologramMap && !inLobby && !showCinematic}
        onClose={() => setShowHologramMap(false)}
        playerPos={playerPos}
        playerColor={playerColor}
        playerHat={playerHat}
        playerMoving={playerMoving}
        direction={direction}
        completedTasks={completedTasks}
        initiateAutoWalkToRoom={initiateAutoWalkToRoom}
        setTargetPos={setTargetPos}
        setTargetRoomPath={setTargetRoomPath}
        setShowHologramMap={setShowHologramMap}
      />

      {/* ==================================================== */}
      {/* 8. SPEED-VENT FAST TRAVEL MAP OVERLAY */}
      {/* ==================================================== */}
      <VentMap
        isOpen={ventMapOpen}
        onClose={() => setVentMapOpen(false)}
        triggerVentTravel={triggerVentTravel}
      />

      {/* ==================================================== */}
      {/* 9. MOBILE ON-SCREEN PUBG-LIKE DYNAMIC JOYSTICK CONTROLS */}
      {/* ==================================================== */}
      {!inLobby && !showCinematic && !openModalRoom && (
        <div className="absolute bottom-6 left-6 pointer-events-auto z-30 md:hidden flex flex-col items-center justify-center select-none">
          {/* Touch tracking pad area */}
          <div 
            onTouchStart={handleJoystickTouchStart}
            onTouchMove={handleJoystickTouchMove}
            onTouchEnd={handleJoystickTouchEnd}
            className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-[#10102633] border-2 border-dashed border-slate-600/30 flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
          >
            {joystickActive && joystickCenter && joystickCurrent ? (
              <div 
                className="w-20 h-20 rounded-full bg-slate-900/60 border-2 border-sky-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                style={{
                  position: 'fixed',
                  left: joystickCenter.x - 40,
                  top: joystickCenter.y - 40,
                }}
              >
                {(() => {
                  const dx = joystickCurrent.x - joystickCenter.x;
                  const dy = joystickCurrent.y - joystickCenter.y;
                  const distanceThreshold = 45;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx);
                  const intensity = length > 0 ? Math.min(length, distanceThreshold) / distanceThreshold : 0;
                  
                  const thumbX = Math.cos(angle) * intensity * 20;
                  const thumbY = Math.sin(angle) * intensity * 20;

                  return (
                    <div 
                      className="w-8 h-8 rounded-full bg-sky-500 border border-white flex items-center justify-center shadow shadow-sky-400 pointer-events-none select-none"
                      style={{
                        transform: `translate(${thumbX}px, ${thumbY}px)`,
                      }}
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="text-[8px] text-slate-500 font-mono text-center uppercase pointer-events-none select-none flex flex-col items-center">
                <span className="text-sm mb-1 opacity-60">🕹️</span>
                <span>DRAG PAD</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 9. DYNAMIC "TASK COMPLETED!" HUD BANNER SLIDEOUT */}
      {/* ==================================================== */}
      {showTaskCompletedBanner && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-[#1cbd57] border-y-4 border-black w-full text-center py-4 text-white uppercase font-extrabold tracking-widest shadow-2xl skew-x-3 max-w-2xl animate-task-completed">
          <div className="flex items-center justify-center gap-3">
            <CheckSquare className="text-yellow-300 animate-bounce" size={24} />
            <span className="text-sm md:text-base tracking-[0.25em]" style={{ fontFamily: '"Press Start 2P"', textShadow: '2px 2px 0px #000' }}>
              TASK COMPLETED!
            </span>
          </div>
          <div className="text-[10px] font-mono text-green-100 font-bold uppercase mt-1">
            STABILIZED CORE NODE FOR {showTaskCompletedBanner} OVERRIDE
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 10. SECURE INTERACTION ROOM TASK MODAL */}
      {/* ==================================================== */}
      {openModalRoom && (
        <TaskModal 
          room={openModalRoom} 
          playerColor={playerColor}
          onClose={(wasProductive) => handleModalClose(wasProductive)} 
        />
      )}

      {/* ==================================================== */}
      {/* 11. HOW TO PLAY TUTORIAL DIALOG */}
      {/* ==================================================== */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      {/* ==================================================== */}
      {/* 12. VICTORY CREWMATE OVERLAY */}
      {/* ==================================================== */}
      {showVictory && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-fadeIn select-none backdrop-blur-md p-4">
          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #1a9eff 0%, transparent 70%)' }}></div>
          <div className="text-[#38FEDE] text-5xl md:text-8xl font-black uppercase tracking-[0.1em] drop-shadow-[0_0_40px_rgba(56,254,222,0.8)] mb-8 z-10 text-center w-full max-w-lg" style={{ fontFamily: '"Press Start 2P"', textShadow: '4px 4px 0px #0b5030, -2px -2px 0px #fff' }}>
            VICTORY
          </div>
          <div className="flex gap-4 mb-8 z-10 transform scale-125">
            <CrewmateSprite color={playerColor} hat={playerHat} isMoving={false} size={105} direction="right" name="You" />
          </div>
          <div className="bg-[#1a1a2e]/80 border-2 border-[#38FEDE] p-4 md:p-6 rounded-lg text-center shadow-[0_0_30px_rgba(56,254,222,0.2)] mb-8 max-w-sm w-full z-10 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#38FEDE] opacity-50"></div>
            <p className="font-mono text-[#38FEDE] font-bold text-base md:text-lg">ALL TASKS COMPLETED</p>
            <p className="text-gray-300 text-xs mt-2 font-mono">The Boogeyman has been defeated. The system is secure.</p>
          </div>
          <button 
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
            className="px-8 py-4 bg-[#1a9eff] text-white font-bold rounded-xl hover:bg-[#38FEDE] hover:text-black hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_#0d4d80] active:shadow-[0_2px_0_#0d4d80] active:translate-y-1 z-10 border-2 border-black tracking-widest uppercase text-xs"
            style={{ fontFamily: '"Press Start 2P"' }}
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* MAIN SYSTEM FOOTER STATUS */}
      {!inLobby && !showCinematic && (
        <div className="w-full bg-[#06060f] border-t-2 border-[#1c1c38] px-4 py-1.5 flex items-center justify-between text-[6px] sm:text-[8px] text-[#3a3a5c] md:text-[9px] font-mono z-10 relative">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
            <span>PORT 3000 // CO-PILOT TERMINAL STABLE</span>
          </div>
          <span>DEVELOPER PORTFOLIO : YOU</span>
        </div>
      )}

    </div>
  );
}
