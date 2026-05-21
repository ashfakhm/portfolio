import React, { useEffect, useRef, useState } from 'react';
import ThreeBackground from './components/ThreeBackground';
import CrewmateSprite, { CrewmateColor, CrewmateHat, CREWMATE_COLORS, CREWMATE_HATS } from './components/CrewmateSprite';
import ThreeCrewmate from './components/ThreeCrewmate';
import TaskModal from './components/TaskModal';
import TutorialModal from './components/TutorialModal';
import HologramMap from './components/HologramMap';
import VentMap from './components/VentMap';
import { 
  Compass, Shield, Radio, KeyRound, User, BookOpen, AlertCircle, Play, Sparkles, Navigation2, Zap, 
  Tv, Volume2, VolumeX, Smartphone, Trophy, Flame, HelpCircle, MessageSquare, Send, Map, X, CheckSquare,
  Rocket, ChevronRight, ShieldCheck, CheckCircle2, AlertTriangle, Wind
} from 'lucide-react';

import { synthSFX } from './utils/sound';
import { 
  RoomConfig, SPACESHIP_ROOMS, FLOATING_VENTS, WALKABLE_REGIONS, INITIAL_DOORS, isWalkable, ChatMessage, Door 
} from './gameConfig';

export default function App() {
  // Global View/Lobby state
  const [inLobby, setInLobby] = useState(false);
  const [progressCount, setProgressCount] = useState(100);

  // Cinematic Splash states
  const [showCinematic, setShowCinematic] = useState(true);
  const [cinematicText, setCinematicText] = useState('CREWMATE');
  const [cinematicSubtext, setCinematicSubtext] = useState('There is 1 Impostor among us');

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
  const [minimapMaximized, setMinimapMaximized] = useState(false);
  const [showHologramMap, setShowHologramMap] = useState(false);
  const [cinematicPhase, setCinematicPhase] = useState<'shh' | 'reveal'>('shh');
  const [showTaskCompletedBanner, setShowTaskCompletedBanner] = useState<string | null>(null);
  const [lobbyTab, setLobbyTab] = useState<'color' | 'hat'>('color');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  // Chat System
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', senderName: 'Captain Blue', senderColor: 'blue', message: 'Welcome crewmates, make sure to read Ashfakh\'s files!' },
    { id: '2', senderName: 'Pink', senderColor: 'pink', message: 'I saw Red (Ashfakh) doing medical scans. Highly qualified!' },
    { id: '3', senderName: 'Lime Tech', senderColor: 'lime', message: 'Projects in Comms download are fully solid! Razorpay hook tested.' }
  ]);
  const [customMessage, setCustomMessage] = useState('');

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

  // Predefined Chat options
  const chatPresets = [
    { text: 'Who is the Impostor?', q: 'impostor' },
    { text: 'Is Ashfakh safe?', q: 'safe' },
    { text: 'Show skills pass!', q: 'skills' },
    { text: 'Any live code?', q: 'code' }
  ];

  const handleSendPreset = (preset: { text: string, q: string }) => {
    synthSFX.playBeep();
    const newUserMsg: ChatMessage = {
      id: String(Date.now()),
      senderName: 'You',
      senderColor: playerColor,
      message: preset.text
    };
    setChatMessages(prev => [...prev, newUserMsg]);

    // Simulate reactive Crewmates logic responses
    setTimeout(() => {
      let reply = 'Unsure coordinate.';
      let responderName = 'Lieutenant Lime';
      let responderColor: CrewmateColor = 'lime';

      if (preset.q === 'impostor') {
        reply = 'There is 1 Impostor, but Red is safe. Ashfakh is doing Next.js tasks!';
        responderName = 'Orange Buddy';
        responderColor = 'orange';
      } else if (preset.q === 'safe') {
        reply = 'Saw Ashfakh in Medbay scanner. BSc CS Farook College Class of \'26 validated!';
        responderName = 'Captain Blue';
        responderColor = 'blue';
      } else if (preset.q === 'skills') {
        reply = 'Go check Admin. Cards show full Next.js, FastAPI, Prisma, PostgreSQL!';
        responderName = 'Pink Lady';
        responderColor = 'pink';
      } else if (preset.q === 'code') {
        reply = 'Check Comms dish! Decrypted download lists LaundryEase & E-Quiz platforms.';
        responderName = 'Yellow Ace';
        responderColor = 'yellow';
      }

      setChatMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        senderName: responderName,
        senderColor: responderColor,
        message: reply
      }]);
    }, 900);
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    const msgText = customMessage;
    setCustomMessage('');
    synthSFX.playBeep();

    const newUserMsg: ChatMessage = {
      id: String(Date.now()),
      senderName: 'You',
      senderColor: playerColor,
      message: msgText
    };
    setChatMessages(prev => [...prev, newUserMsg]);

    setTimeout(() => {
      const answers = [
        "Sounds good! Complete your tasks to unlock all portfolio sections.",
        "Red is definitely clean! I saw him coding all day.",
        "Ashfakh's Lighthouse performance is literally meta.",
        "Yes! Let's clear the cafeteria terminal. Tap Emergency to contact him!"
      ];
      const names: { n: string, c: CrewmateColor }[] = [
        { n: 'Orange Buddy', c: 'orange' },
        { n: 'Captain Blue', c: 'blue' },
        { n: 'Yellow Ace', c: 'yellow' },
        { n: 'Pink Lady', c: 'pink' }
      ];
      const pick = Math.floor(Math.random() * answers.length);

      setChatMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        senderName: names[pick].n,
        senderColor: names[pick].c,
        message: answers[pick]
      }]);
    }, 1000);
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
  }, [inLobby, showCinematic, openModalRoom, targetPos, joystickActive, joystickOffset, targetRoomPath, ventMapOpen, doors, nearestRoom]);

  // Redraw Ship Layout Canvas Details with high fidelity graphics!
  useEffect(() => {
    if (inLobby || showCinematic || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Clear canvas and draw cartoon cosmic starfield
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic tiny stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 45; i++) {
      const starX = (i * 269 + 53) % canvas.width;
      const starY = (i * 181 + 79) % canvas.height;
      const radius = ((i % 4) === 0) ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(starX, starY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw outer thick cartoon black silhouette boundary to frame the ship layout
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    
    WALKABLE_REGIONS.forEach((reg) => {
      ctx.beginPath();
      ctx.rect(reg.x - 6, reg.y - 6, reg.w + 12, reg.h + 12);
      ctx.fill();
      ctx.stroke();
    });

    // 2.5 Draw inner slate-grey cartoon trim border
    ctx.strokeStyle = '#3e414c';
    ctx.lineWidth = 4;
    WALKABLE_REGIONS.forEach((reg) => {
      ctx.strokeRect(reg.x - 2, reg.y - 2, reg.w + 4, reg.h + 4);
    });

    // 3. Draw corridors/connecting hallways with authentic industrial metal panels
    WALKABLE_REGIONS.forEach((reg) => {
      if (!reg.name) {
        // High fidelity steel-grey hallway flooring
        ctx.fillStyle = '#7a8e9e'; 
        ctx.fillRect(reg.x, reg.y, reg.w, reg.h);

        // Cartoon metal plate dividers
        ctx.strokeStyle = '#5a6d7c';
        ctx.lineWidth = 2;
        for (let lx = reg.x + 20; lx < reg.x + reg.w; lx += 24) {
          ctx.beginPath(); ctx.moveTo(lx, reg.y); ctx.lineTo(lx, reg.y + reg.h); ctx.stroke();
        }
        for (let ly = reg.y + 20; ly < reg.y + reg.h; ly += 24) {
          ctx.beginPath(); ctx.moveTo(reg.x, ly); ctx.lineTo(reg.x + reg.w, ly); ctx.stroke();
        }

        // Classic yellow safety edge markings
        ctx.fillStyle = '#ebaf17';
        if (reg.w > reg.h) {
          ctx.fillRect(reg.x, reg.y, reg.w, 3);
          ctx.fillRect(reg.x, reg.y + reg.h - 3, reg.w, 3);
        } else {
          ctx.fillRect(reg.x, reg.y, 3, reg.h);
          ctx.fillRect(reg.x + reg.w - 3, reg.y, 3, reg.h);
        }
      }
    });

    // Stenciled directions on the hall floors (Reactor, Security)
    ctx.fillStyle = '#546675';
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('REACTOR', 150, 335);
    ctx.fillText('SECURITY', 150, 345);
    ctx.fillText('CORRIDOR', 450, 350);

    // 4. Draw rooms with highly authentic Skeld thematic flat-shaded styles
    Object.values(SPACESHIP_ROOMS).forEach((room) => {
      const { minX, maxX, minY, maxY } = room.bounds;
      const width = maxX - minX;
      const height = maxY - minY;

      ctx.save();
      
      // Choose real Skeld background styled floors
      if (room.id === 'cafeteria') {
        // Cream & teal diamond checkered tiles
        ctx.fillStyle = '#e5decd';
        ctx.fillRect(minX, minY, width, height);

        ctx.fillStyle = '#b6c8cc';
        const tSize = 18;
        for (let x = minX; x < maxX; x += tSize * 2) {
          for (let y = minY; y < maxY; y += tSize * 2) {
            ctx.fillRect(x, y, tSize, tSize);
            ctx.fillRect(x + tSize, y + tSize, tSize, tSize);
          }
        }
      } else if (room.id === 'medbay') {
        // Sterile light-teal floor tiles
        ctx.fillStyle = '#9bdcd1';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#e0f7f3';
        ctx.lineWidth = 1.5;
        for (let x = minX + 24; x < maxX; x += 24) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
        for (let y = minY + 24; y < maxY; y += 24) {
          ctx.beginPath(); ctx.moveTo(minX, y); ctx.lineTo(maxX, y); ctx.stroke();
        }
      } else if (room.id === 'reactor') {
        // Deep purple atomic engine tiles
        ctx.fillStyle = '#31283c';
        ctx.fillRect(minX, minY, width, height);

        ctx.strokeStyle = '#1d1726';
        ctx.lineWidth = 2;
        for (let x = minX + 25; x < maxX; x += 25) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
        // Cyber orange electrical conduit pipelines trailing down
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(minX, minY + height - 10, width, 5);
      } else if (room.id === 'admin') {
        // Corporate forest teal/navy panels
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1.5;
        for (let x = minX + 35; x < maxX; x += 35) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
      } else if (room.id === 'weapons') {
        // Gunmetal slate with diagonal gridlines
        ctx.fillStyle = '#3a3d45';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#2c2e36';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = minX; x < maxX; x += 40) {
          ctx.moveTo(x, minY); ctx.lineTo(x + width, maxY);
        }
        ctx.stroke();
      } else if (room.id === 'security') {
        // Sage camera monitors green
        ctx.fillStyle = '#5c7d6c';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#435e51';
        ctx.strokeRect(minX + 5, minY + 5, width - 10, height - 10);
      } else if (room.id === 'storage') {
        // Dusty cargo brown plates
        ctx.fillStyle = '#5c4d3f';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#3e342b';
        ctx.lineWidth = 2;
        for (let y = minY + 30; y < maxY; y += 30) {
          ctx.beginPath(); ctx.moveTo(minX, y); ctx.lineTo(maxX, y); ctx.stroke();
        }
      } else if (room.id === 'electrical') {
        // Distressed amber iron plating
        ctx.fillStyle = '#4c4a41';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#2d2c27';
        ctx.lineWidth = 1.5;
        for (let x = minX + 20; x < maxX; x += 20) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
      } else if (room.id === 'comms') {
        // Space communications cobalt panels
        ctx.fillStyle = '#293542';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 1.5;
        for (let y = minY + 20; y < maxY; y += 20) {
          ctx.beginPath(); ctx.moveTo(minX, y); ctx.lineTo(maxX, y); ctx.stroke();
        }
      } else if (room.id === 'navigation') {
        // High cockpit deep indigo
        ctx.fillStyle = '#1c2833';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#17202a';
        ctx.lineWidth = 1;
        ctx.strokeRect(minX + 6, minY + 6, width - 12, height - 12);
      } else if (room.id === 'shields') {
        // Metallic mesh cobalt floor
        ctx.fillStyle = '#3a4959';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.fillStyle = '#455566';
        ctx.fillRect(minX + 10, minY + 10, width - 20, height - 20);
      } else if (room.id === 'o2') {
        // Soft white cream tiling
        ctx.fillStyle = '#dee5e5';
        ctx.fillRect(minX, minY, width, height);
        
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 1;
        for (let x = minX + 20; x < maxX; x += 20) {
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
      } else {
        // Standard metal plating
        ctx.fillStyle = '#505a69';
        ctx.fillRect(minX, minY, width, height);
      }

      // Draw thick black outline contour directly on individual room walls to simulate actual hand-drawn asset limits
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(minX, minY, width, height);

      // Flash green frame when tasks in room are cleared completely (beautiful visual cue)
      const isCompleted = completedTasks[room.id] !== undefined ? completedTasks[room.id] : true;
      if (isCompleted) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(minX + 2, minY + 2, width - 4, height - 4);
      }

      // Large faded Room backdrop name label (cartoony block styled)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.font = '900 13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(room.name.toUpperCase(), minX + width / 2, minY + height / 2 + 4);

      // --- Room Furniture Props (High visual fidelity flat cartoon design) ---
      if (room.id === 'cafeteria') {
        // 1. Primary Emergency Meeting round platform
        const epX = 450;
        const epY = 150;

        // Base grey trim
        ctx.fillStyle = '#4c5e5c';
        ctx.beginPath(); ctx.arc(epX, epY, 34, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Safety yellow outer border
        ctx.fillStyle = '#ebaf17';
        ctx.beginPath(); ctx.arc(epX, epY, 26, 0, Math.PI * 2); ctx.fill();
        ctx.stroke();

        // Center glass dome
        ctx.fillStyle = 'rgba(92, 242, 242, 0.55)';
        ctx.beginPath(); ctx.arc(epX, epY, 15, 0, Math.PI * 2); ctx.fill();
        ctx.stroke();

        // Red emergency button
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(epX - 6, epY - 6, 12, 12);
        ctx.strokeRect(epX - 6, epY - 6, 12, 12);

        // Stools around meeting table
        const stoolsList = [
          { x: 412, y: 150 }, { x: 488, y: 150 }, 
          { x: 450, y: 112 }, { x: 450, y: 188 },
          { x: 425, y: 125 }, { x: 475, y: 125 },
          { x: 425, y: 175 }, { x: 475, y: 175 }
        ];
        ctx.fillStyle = '#2c3e50';
        stoolsList.forEach(st => {
          ctx.beginPath(); ctx.arc(st.x, st.y, 6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeRect(st.x - 6, st.y - 6, 12, 12); // Square base
        });

        // 2. Extra Dining Counters (Long horizontal tables)
        const tablesList = [{ x: 350, y: 100 }, { x: 550, y: 100 }, { x: 350, y: 200 }, { x: 550, y: 200 }];
        tablesList.forEach(tb => {
          const tWidth = 60;
          const tHeight = 24;
          // Table rim
          ctx.fillStyle = '#415b70';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(tb.x - tWidth/2, tb.y - tHeight/2, tWidth, tHeight, 10) : ctx.rect(tb.x - tWidth/2, tb.y - tHeight/2, tWidth, tHeight);
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Table top surface
          ctx.fillStyle = '#5dade2';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(tb.x - tWidth/2 + 2, tb.y - tHeight/2 + 2, tWidth - 4, tHeight - 4, 8) : ctx.rect(tb.x - tWidth/2 + 2, tb.y - tHeight/2 + 2, tWidth - 4, tHeight - 4);
          ctx.fill();

          // Draw tiny yellow pizza slice triangle on dining table!
          ctx.fillStyle = '#faeb70';
          ctx.beginPath();
          ctx.moveTo(tb.x - 10, tb.y - 3);
          ctx.lineTo(tb.x - 1, tb.y - 5);
          ctx.lineTo(tb.x - 6, tb.y + 6);
          ctx.closePath();
          ctx.fill();
          // Pizza crust and pepperonis
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(tb.x - 6, tb.y - 2, 2, 2);
          
          // Drink cup
          ctx.fillStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(tb.x + 10, tb.y, 4, 0, Math.PI * 2); ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#3498db';
          ctx.beginPath(); ctx.arc(tb.x + 10, tb.y, 2, 0, Math.PI * 2); ctx.fill();
          
          // Draw small stools around this long table
          ctx.fillStyle = '#2c3e50';
          [-20, 0, 20].forEach(ox => {
            // Top stools
            ctx.beginPath(); ctx.arc(tb.x + ox, tb.y - tHeight/2 - 8, 5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeRect(tb.x + ox - 5, tb.y - tHeight/2 - 13, 10, 10);
            // Bottom stools
            ctx.beginPath(); ctx.arc(tb.x + ox, tb.y + tHeight/2 + 8, 5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeRect(tb.x + ox - 5, tb.y + tHeight/2 + 3, 10, 10);
          });
        });
      } else if (room.id === 'medbay') {
        // Biometric Scanning Pad with nice rotating scanner beam!
        const padX = 240;
        const padY = 180;
        const scanPulse = Math.abs(Math.sin(Date.now() / 250));

        // Scanning Ring
        ctx.fillStyle = 'rgba(56, 211, 159, 0.15)';
        ctx.beginPath(); ctx.ellipse(padX, padY, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#38d39f';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(padX, padY, 18, 12, 0, 0, Math.PI * 2); ctx.stroke();

        // Biometric beam sweeps
        ctx.strokeStyle = `rgba(56, 211, 159, ${0.4 + scanPulse * 0.5})`;
        ctx.lineWidth = 1.5;
        const sweepAngle = (Date.now() / 400) % (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(padX, padY);
        ctx.lineTo(padX + Math.cos(sweepAngle) * 18, padY + Math.sin(sweepAngle) * 12);
        ctx.stroke();

        // Medbay Beds
        const bedsList = [{ x: 180, y: 105 }, { x: 232, y: 105 }];
        bedsList.forEach(bd => {
          ctx.fillStyle = '#eaeaea';
          ctx.fillRect(bd.x, bd.y, 22, 40);
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(bd.x, bd.y, 22, 40);

          // Pillow
          ctx.fillStyle = '#a9c4cc';
          ctx.fillRect(bd.x + 2, bd.y + 2, 18, 9);
          ctx.strokeRect(bd.x + 2, bd.y + 2, 18, 9);

          // Blue bed sheet
          ctx.fillStyle = '#4fa8e2';
          ctx.fillRect(bd.x + 1, bd.y + 14, 20, 25);
          ctx.strokeRect(bd.x + 1, bd.y + 14, 20, 25);
        });
      } else if (room.id === 'reactor') {
        // Pulsing atomic fission core pillar
        const coreX = 90;
        const coreY = 360;
        const pLevel = Math.abs(Math.sin(Date.now() / 280));

        // Core containment base
        ctx.fillStyle = '#1c1c24';
        ctx.fillRect(coreX - 25, coreY - 25, 50, 50);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(coreX - 25, coreY - 25, 50, 50);

        // Pulsing glowing center beam of plasma!
        ctx.fillStyle = `rgba(41, 128, 185, ${0.2 + pLevel * 0.4})`;
        ctx.fillRect(coreX - 20, coreY - 20, 40, 40);

        ctx.fillStyle = '#3498db';
        ctx.fillRect(coreX - 4, coreY - 20, 8, 40);

        // Core glass housing reflections
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(coreX - 18, coreY - 18);
        ctx.lineTo(coreX - 12, coreY + 18);
        ctx.stroke();
      } else if (room.id === 'security') {
        // Monitoring Desk
        ctx.fillStyle = '#2c2e36';
        ctx.fillRect(200, 310, 50, 24);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(200, 310, 50, 24);

        // Monitors display with glowing grid sweep
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(204, 314, 18, 16);
        ctx.fillRect(228, 314, 18, 16);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(204, 314, 18, 16);
        ctx.strokeRect(228, 314, 18, 16);

        // Live oscilloscope scan lines
        ctx.strokeStyle = '#2ecc71';
        ctx.beginPath();
        for (let ix = 0; ix < 18; ix++) {
          const cy = 322 + Math.cos(ix * 0.6 + Date.now() / 120) * 3;
          if (ix === 0) ctx.moveTo(204 + ix, cy);
          else ctx.lineTo(204 + ix, cy);
        }
        ctx.stroke();
      } else if (room.id === 'admin') {
        // Grand Central Admin Map Table
        ctx.fillStyle = '#4c5e5c';
        ctx.beginPath(); ctx.ellipse(585, 405, 50, 35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = '#2980b9'; // Glowing map screen on table
        ctx.beginPath(); ctx.ellipse(585, 405, 42, 28, 0, 0, Math.PI * 2); ctx.fill();

        // Holographic grid on admin table
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = -30; i <= 30; i+= 15) {
           ctx.beginPath(); ctx.moveTo(585 + i, 380); ctx.lineTo(585 + i, 430); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(545, 405 + i/1.5); ctx.lineTo(625, 405 + i/1.5); ctx.stroke();
        }

        // Little blinking marker on map
        ctx.fillStyle = '#f1c40f';
        const b = Math.sin(Date.now() / 200) > 0;
        if(b) ctx.fillRect(595, 400, 5, 5);

      } else if (room.id === 'storage') {
        // Main Storage Table/Crate Block in Center
        ctx.fillStyle = '#5c4d3f';
        ctx.fillRect(room.cx - 25, room.cy - 20, 50, 40);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(room.cx - 25, room.cy - 20, 50, 40);

        // Warning wire tape across boxes
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(room.cx - 25, room.cy - 20); ctx.lineTo(room.cx + 25, room.cy + 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(room.cx - 25, room.cy); ctx.lineTo(room.cx + 10, room.cy + 20); ctx.stroke();
        
        // Mini Map/Checklist document on storage crate
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(room.cx + 5, room.cy - 10, 14, 18);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(room.cx + 7, room.cy - 8, 10, 3);
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(room.cx + 7, room.cy - 3, 10, 2);
        ctx.fillRect(room.cx + 7, room.cy + 1, 10, 2);

        // Round green cargo barrels stacked on the side
        const barrelsList = [{ x: room.bounds.maxX - 15, y: room.bounds.maxY - 15 }, { x: room.bounds.maxX - 15, y: room.bounds.maxY - 35 }, { x: room.bounds.maxX - 30, y: room.bounds.maxY - 25 }];
        barrelsList.forEach(br => {
          ctx.fillStyle = '#27ae60';
          ctx.beginPath(); ctx.ellipse(br.x, br.y, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(br.x, br.y, 8, 10, 0, 0, Math.PI * 2); ctx.stroke();
        });
      } else if (room.id === 'electrical') {
        const topY = room.bounds.minY;
        
        // Electrical box attached to top wall
        ctx.fillStyle = '#4c4a41'; 
        ctx.fillRect(room.cx - 15, topY, 30, 15);
        
        ctx.fillStyle = '#f1c40f'; // Yellow top box
        ctx.fillRect(room.cx - 12, topY + 2, 24, 12);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(room.cx - 12, topY + 2, 24, 12);
        
        // Wire down to the console
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(room.cx, topY + 14);
        ctx.lineTo(room.cx, room.cy - 15);
        ctx.stroke();

        // The console under the button (like the screenshot)
        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(room.cx - 20, room.cy - 20, 40, 40);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(room.cx - 20, room.cy - 20, 40, 40);

      } else if (room.id === 'navigation') {
        // Navigation console square underneath the orb
        ctx.fillStyle = '#1a1d24';
        ctx.fillRect(room.cx - 25, room.cy - 20, 50, 40);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(room.cx - 25, room.cy - 20, 50, 40);
        
        // A little screen element in the console
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(room.cx - 15, room.cy - 12, 30, 24);

      } else if (room.id === 'comms') {
        // Servers stack bays containing twinkling LEDs on top wall
        const minX = room.bounds.minX;
        const topY = room.bounds.minY;
        
        for (let ix = 0; ix < 2; ix++) {
          const sx = minX + 25 + ix * 22;
          ctx.fillStyle = '#34495e';
          ctx.fillRect(sx, topY, 16, 35);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(sx, topY, 16, 35);

          // twinkle multi-lights
          const sT = Math.sin(Date.now() / 200 + ix);
          ctx.fillStyle = sT > 0.4 ? '#2ecc71' : (sT > -0.4 ? '#f1c40f' : '#e74c3c');
          ctx.fillRect(sx + 3, topY + 5, 10, 6);
          ctx.fillStyle = sT < 0.2 ? '#2ecc71' : '#e74c3c';
          ctx.fillRect(sx + 3, topY + 15, 10, 6);
          ctx.fillStyle = '#3498db';
          ctx.fillRect(sx + 3, topY + 25, 10, 6);
        }

        // Space dish base near console
        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(room.cx - 22, room.cy - 22, 44, 44);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(room.cx - 22, room.cy - 22, 44, 44);
        
      } else if (room.id === 'shields') {
        // Shield console block under button
        ctx.fillStyle = '#111';
        ctx.fillRect(room.cx - 20, room.cy - 20, 40, 40);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(room.cx - 20, room.cy - 20, 40, 40);

        // A small cyan strip on the block
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(room.cx - 10, room.cy - 12, 20, 6);

      } else if (room.id === 'weapons') {
        
        // Artillery Seating / Desk Console near center
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(room.cx - 24, room.cy - 15, 48, 30);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(room.cx - 24, room.cy - 15, 48, 30);

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.arc(room.cx, room.cy, 10, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(room.cx, room.cy, 10, 0, Math.PI * 2); ctx.stroke();
        
        // Gunner Operator Chair
        const minX = room.bounds.minX;
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath(); ctx.ellipse(room.cx - 35, room.cy, 12, 18, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
      } else if (room.id === 'o2') {
        // Biological leaf plant cylinders
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(660, 270, 35, 30);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(660, 270, 35, 30);

        // Translucent bio sphere with tiny leaf icons inside
        ctx.fillStyle = 'rgba(46, 204, 113, 0.35)';
        ctx.fillRect(663, 273, 29, 24);
        // Draw green flower leaves
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath(); ctx.arc(672, 285, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(682, 282, 5, 0, Math.PI * 2); ctx.fill();
      }

      // 5. Drawing active clickable console coordinate indicators (yellow glossy spheres)
      const isCompletedRoom = completedTasks[room.id] !== undefined ? completedTasks[room.id] : true;
      const isNear = nearestRoom?.id === room.id;
      
      ctx.beginPath();
      ctx.arc(room.cx, room.cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = isNear ? '#f1c40f' : (isCompletedRoom ? '#2ecc71' : '#e67e22');
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Mirror reflection glass overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath(); ctx.arc(room.cx - 3, room.cy - 3, 3, 0, Math.PI * 2); ctx.fill();

      // Bouncing WARNING Exclamation badge above console
      if (completedTasks[room.id] === false) {
        const bounceAmount = Math.sin(Date.now() / 150) * 4;
        ctx.fillStyle = '#ebaf17';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.font = 'bold 15px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText('!', room.cx, room.cy - 16 + bounceAmount);
      }

      ctx.restore();
    });

    // 5.5 Draw high fidelity mechanical sliding gates!
    doors.forEach((door) => {
      ctx.save();
      ctx.translate(door.x, door.y);

      const isVert = !door.horizontal;

      // Outer track frame in black
      ctx.fillStyle = '#111218';
      ctx.fillRect(-door.w / 2, -door.h / 2, door.w, door.h);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(-door.w / 2, -door.h / 2, door.w, door.h);

      // Slide amount progress (0 to 1) helper
      const openPct = doorProgress[door.id] || 0;
      ctx.fillStyle = '#566573'; // steel door plate
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;

      if (isVert) {
        const hHeight = door.h / 2;
        const slideShift = hHeight * openPct;
        
        // draw top sliding slab panel
        ctx.fillRect(-door.w / 2 + 1, -hHeight, door.w - 2, hHeight - slideShift);
        ctx.strokeRect(-door.w / 2 + 1, -hHeight, door.w - 2, hHeight - slideShift);

        // draw bottom sliding slab panel
        ctx.fillRect(-door.w / 2 + 1, slideShift, door.w - 2, hHeight - slideShift);
        ctx.strokeRect(-door.w / 2 + 1, slideShift, door.w - 2, hHeight - slideShift);
      } else {
        const hWidth = door.w / 2;
        const slideShift = hWidth * openPct;

        // draw left sliding slab panel
        ctx.fillRect(-hWidth, -door.h / 2 + 1, hWidth - slideShift, door.h - 2);
        ctx.strokeRect(-hWidth, -door.h / 2 + 1, hWidth - slideShift, door.h - 2);

        // draw right sliding slab panel
        ctx.fillRect(slideShift, -door.h / 2 + 1, hWidth - slideShift, door.h - 2);
        ctx.strokeRect(slideShift, -door.h / 2 + 1, hWidth - slideShift, door.h - 2);
      }

      // Central indicator LED (Red when shut, green when open)
      ctx.fillStyle = door.isOpen ? '#2ecc71' : '#e74c3c';
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    });

    // 6. Draw floor Vents grates outline (heavy iron styled with red rivets)
    FLOATING_VENTS.forEach((vent) => {
      // Carbon vent base
      ctx.fillStyle = '#151515';
      ctx.fillRect(vent.x - 14, vent.y - 10, 28, 20);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(vent.x - 14, vent.y - 10, 28, 20);
      
      // Slats inside
      ctx.fillStyle = '#2d3e50';
      ctx.fillRect(vent.x - 10, vent.y - 6, 4, 12);
      ctx.fillRect(vent.x - 2, vent.y - 6, 4, 12);
      ctx.fillRect(vent.x + 6, vent.y - 6, 4, 12);

      // Red active vent outline indicators
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 1;
      ctx.strokeRect(vent.x - 11, vent.y - 7, 22, 14);
    });

    // 6.5 Draw real-time dramatic Sight Spotlight Darkness Mask following player
    ctx.save();
    const px = playerPos.x;
    const py = playerPos.y;
    
    // Smooth translucent gradient to solid deep space dark shadow
    const innerRadius = 130;
    const outerRadius = 250;
    const shadowGrad = ctx.createRadialGradient(px, py, innerRadius, px, py, outerRadius);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.1)');
    shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.72)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.94)');
    
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 7. Draw guidance yellow autopilot arrow if target position is set
    if (targetPos) {
      ctx.strokeStyle = '#ebaf17';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.moveTo(playerPos.x, playerPos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

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
            message: `★ Red (Ashfakh) stabilized node: ${completedRoomInfo.name}`,
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
      {/* 1. LOBBY COUNTDOWN AND WELCOME DECK */}
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
                        <span>ASHFAKH M</span>
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

      {/* ==================================================== */}
      {/* 2. CHROME CINEMATIC "SHH! CREWMATE" SPLASH INTRO */}
      {/* ==================================================== */}
      {showCinematic && (
        <div className="absolute inset-0 z-50 bg-[#000] flex flex-col items-center justify-center text-center p-6 select-none transition-all overflow-hidden">
          
          {cinematicPhase === 'shh' ? (
            /* STAGE 1: THE ACCLAIMED "SHH!" RED SCREEN WITH GLOW CIRCLE */
            <div className="flex flex-col items-center justify-center space-y-6 max-w-xl animate-scaleIn">

              <div className="text-[#ff1c1c] text-6xl md:text-8xl font-black uppercase tracking-widest animate-shake-big" style={{ fontFamily: '"Press Start 2P"', textShadow: '0 8px 0 #4a0404' }}>
                SHH!
              </div>

              {/* Crewmate putting a white gloved finger in front of visor outline */}
              <div className="my-10 relative flex items-center justify-center transform scale-125 drop-shadow-[0_0_22px_rgba(239,68,68,0.7)]">
                {/* Spotlight background glow circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full bg-slate-400/20 blur-xl z-0"></div>
                
                <div className="relative z-10">
                  <CrewmateSprite color="red" hat="none" isMoving={false} direction="left" size={105} />
                  
                  {/* Glove/Hand doing SHH! Overlay */}
                  <div className="absolute top-[42%] left-[30%] w-12 h-16 z-20 transform -translate-x-1/2 -translate-y-1/2 scale-x-[-1]">
                    <svg viewBox="-2 -10 25 50" className="w-full h-full drop-shadow-md pointer-events-none">
                      <path d="M0,32 Q10,29 14,27 Q15,22 14,18 Q5,21 0,23 Z" fill="#7A0808" stroke="#000" strokeWidth="2.5" />
                      <path d="M0,30 Q10,27 13,25 Q14,20 13,16 Q5,19 0,21 Z" fill="#C51111" />
                      <circle cx="15" cy="14" r="5.5" fill="#FFF" stroke="#000" strokeWidth="2.5" />
                      <rect x="12" y="-5" width="5.5" height="16" rx="2.5" fill="#FFF" stroke="#000" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>
              </div>

              <div 
                className="text-red-500 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em]"
                style={{ fontFamily: '"Press Start 2P"' }}
              >
                There is 1 Impostor among us
              </div>
            </div>
          ) : (
            /* STAGE 2: THE IMMERSIVE "CREWMATE" TEAM ALLIANCES ALIGNMENT SCREEN */
            <div className="space-y-6 flex flex-col items-center justify-center animate-fadeIn max-w-4xl">
              
              {/* Crewmate Cyan Header block */}
              <h1 
                className="text-[#38FEDE] text-5xl md:text-7xl font-black uppercase tracking-widest animate-[fadeIn_0.5s_ease-out]"
                style={{ fontFamily: '"Press Start 2P"', textShadow: '0 8px 0 #0b4b5a', letterSpacing: '0.12em' }}
              >
                CREWMATE
              </h1>

              {/* Teammates Alliance alignment panel list */}
              <div className="my-8 flex items-center justify-center gap-6 sm:gap-10 py-5">
                
                {/* Bot 1: Purple Pizza */}
                <div className="flex flex-col items-center space-y-2 opacity-85 transform -rotate-[4deg] scale-95 translate-y-2">
                  <div className="transform scale-95">
                    <CrewmateSprite color="purple" hat="crown" isMoving={false} direction="right" size={90} />
                  </div>
                  <span className="font-mono text-[9px] text-[#A29BFE] font-bold uppercase tracking-wider bg-black/55 px-1.5 py-0.5 rounded">Pizza</span>
                </div>

                {/* Main Centered Player (YOU!) */}
                <div className="flex flex-col items-center space-y-2 transform scale-125 z-10 filter drop-shadow-[0_0_15px_rgba(56,254,222,0.3)]">
                  <div className="transform rotate-[6deg]">
                    <CrewmateSprite color={playerColor} hat={playerHat} isMoving={false} direction="right" size={105} />
                  </div>
                  <span className="font-sans text-[10px] text-white font-extrabold uppercase tracking-widest bg-emerald-600/90 border border-emerald-400 px-2.5 py-0.5 rounded flex items-center gap-1 leading-none shadow-md">
                    You
                  </span>
                </div>

                {/* Bot 3: Lime Tech */}
                <div className="flex flex-col items-center space-y-2 opacity-85 transform rotate-[4deg] scale-95 translate-y-2">
                  <div className="transform scale-95">
                    <CrewmateSprite color="lime" hat="plant" isMoving={false} direction="right" size={90} />
                  </div>
                  <span className="font-mono text-[9px] text-[#55E6C1] font-bold uppercase tracking-wider bg-black/55 px-1.5 py-0.5 rounded">LimeTech</span>
                </div>

              </div>

              <p 
                className="text-[10px] md:text-xs font-bold tracking-[0.2em] max-w-xl leading-relaxed uppercase"
                style={{ fontFamily: '"Press Start 2P"' }}
              >
                {completedCount === totalTasks ? (
                  <span className="text-yellow-400">ALL VEHICLE SYSTEMS SHIELD STABILIZED</span>
                ) : (
                  <span className="text-white">There is <span className="text-red-500">1 Impostor</span> among us</span>
                )}
              </p>

              <div className="bg-[#121926]/80 backdrop-blur-md border border-slate-700/50 px-5 py-3 rounded-xl text-[9px] font-mono text-slate-400 max-w-lg mt-3 uppercase tracking-wider flex items-center gap-2 shadow-lg">
                <ShieldCheck size={14} className="text-[#38FEDE]" /> GOAL: REPAIR WIRE NODES · CALIBRATE CORES · VENT SENSOR CHECKS
              </div>
            </div>
          )}

        </div>
      )}

      {/* ==================================================== */}
      {/* 3. IMPOSTOR RED JUMPSCARE ALERTER */}
      {/* ==================================================== */}
      {showImpostorAlert && (
        <div 
          onClick={() => setShowImpostorAlert(false)}
          className="absolute inset-0 z-50 bg-[#c51111ee] animate-pulse flex flex-col items-center justify-center text-center cursor-pointer p-4 transition-all"
        >
          <div className="space-y-5 flex flex-col items-center justify-center animate-bounce">
            <AlertTriangle className="text-white mx-auto drop-shadow-lg" size={56} />
            <h1 
              className="text-white text-3xl sm:text-5xl font-black uppercase tracking-widest max-w-xl leading-tight"
              style={{ fontFamily: '"Press Start 2P"', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
            >
              ASHFAKH IS IMPOSTOR!
            </h1>
            <p className="font-mono text-xs tracking-widest text-red-200 uppercase pt-2 bg-black/40 px-4 py-2 rounded-lg border border-red-500/30 backdrop-blur-sm">
              He has infiltrated national computer structures solo. Tap to resume!
            </p>
          </div>
        </div>
      )}

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
                  <Rocket size={10} className="mr-2" /> ALL SYSTEMS STABILIZED BY ASHFAKH! <Trophy size={10} className="ml-2 text-yellow-300" />
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
                { id: 'reactor', label: 'Reactor: About Ashfakh' },
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
                  <Wind size={16} className="sm:w-3 sm:h-3" /> <span className="hidden sm:inline">VENT</span>
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
                  name="Ashfakh" 
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
      {chatOpen && !inLobby && !showCinematic && (
        <div className="absolute top-16 right-3 bottom-20 sm:top-24 sm:right-4 sm:bottom-28 w-64 sm:w-80 bg-[#0b0b14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden z-20 font-mono transition-all ring-1 ring-inset ring-white/10">
          <div className="bg-white/[0.03] px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs font-bold">
            <span className="text-[#38FEDE] flex items-center gap-1">💬 COCKPIT CREW LOGS</span>
            <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Messages lists */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-[11px] h-0">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-2 rounded max-w-[90%] ${
                  msg.isSystem 
                    ? 'bg-neutral-900/60 border border-dashed border-slate-800 text-[#38FEDE] mx-auto text-center'
                    : msg.senderName === 'You' 
                      ? 'bg-[#1a9eff]/20 border border-[#1a9eff]/30 shadow-[#1a9eff]/10 shadow-sm ml-auto backdrop-blur-md rounded-2xl rounded-tr-sm px-3 py-2.5' 
                      : 'bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm'
                }`}
              >
                {!msg.isSystem && (
                  <div className="flex items-center gap-1 font-bold mb-0.5">
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: CREWMATE_COLORS[msg.senderColor]?.fill || '#FFF' }}
                    />
                    <span style={{ color: CREWMATE_COLORS[msg.senderColor]?.fill || '#FFF' }}>{msg.senderName}</span>
                  </div>
                )}
                <p className="text-gray-200 font-mono leading-normal">{msg.message}</p>
              </div>
            ))}
          </div>

          {/* Quick presets selectors */}
          <div className="p-3 border-t border-white/10 space-y-1.5 bg-black/40">
            <span className="text-[8px] text-slate-500 uppercase font-black block pl-1">Preset Crew Messages:</span>
            <div className="grid grid-cols-2 gap-1 text-[9px]">
              {chatPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPreset(p)}
                  className="p-1.5 border border-white/5 hover:border-[#1a9eff]/50 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 text-left truncate cursor-pointer transition-all hover:text-white flex items-center gap-1"
                >
                  <ChevronRight size={10} className="text-[#1a9eff]" /> {p.text}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendCustomMessage} className="p-3 bg-white/[0.02] border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Send coordinate log..."
              className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#1a9eff] focus:bg-white/5 transition-colors"
            />
            <button 
              type="submit" 
              className="p-2 rounded-lg bg-[#1a9eff]/80 hover:bg-[#38FEDE] text-white hover:text-black transition-all border border-[#1a9eff]/50 hover:border-transparent flex items-center justify-center"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}

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
            <CrewmateSprite color={playerColor} hat={playerHat} isMoving={false} size={105} direction="right" name="Ashfakh" />
          </div>
          <div className="bg-[#1a1a2e]/80 border-2 border-[#38FEDE] p-4 md:p-6 rounded-lg text-center shadow-[0_0_30px_rgba(56,254,222,0.2)] mb-8 max-w-sm w-full z-10 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#38FEDE] opacity-50"></div>
            <p className="font-mono text-[#38FEDE] font-bold text-base md:text-lg">ALL TASKS COMPLETED</p>
            <p className="text-gray-300 text-xs mt-2 font-mono">Impostors have been eliminated. The system is secure.</p>
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
          <span>DEVELOPER PORTFOLIO : ASHFAKH M</span>
        </div>
      )}

    </div>
  );
}
