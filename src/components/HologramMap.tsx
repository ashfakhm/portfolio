import {
  FLOATING_VENTS,
  SPACESHIP_ROOMS,
  WALKABLE_REGIONS,
} from "../gameConfig";
import { useShallow } from "zustand/react/shallow";
import { useEngineStore } from "../store/useEngineStore";
import { useGameStore } from "../store/useGameStore";
import { synthSFX } from "../utils/sound";
import CrewmateSprite from "./CrewmateSprite";

interface HologramMapProps {
  playerPos: { x: number; y: number };
  playerMoving: boolean;
  direction: "left" | "right";
  initiateAutoWalkToRoom: (roomId: string) => void;
  setTargetPos: (pos: { x: number; y: number }) => void;
  setTargetRoomPath: (roomId: string | null) => void;
}

export function HologramMapView({
  playerPos,
  playerMoving,
  direction,
  initiateAutoWalkToRoom,
  setTargetPos,
  setTargetRoomPath,
}: HologramMapProps) {
  const {
    showHologramMap,
    setShowHologramMap,
    showCinematic,
    playerColor,
    playerHat,
    completedTasks,
  } = useGameStore(
    useShallow((state) => ({
      showHologramMap: state.showHologramMap,
      setShowHologramMap: state.setShowHologramMap,
      showCinematic: state.showCinematic,
      playerColor: state.playerColor,
      playerHat: state.playerHat,
      completedTasks: state.completedTasks,
    })),
  );

  const isOpen = showHologramMap && !showCinematic;

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm select-none animate-fadeIn">
      <div
        className="w-full max-w-5xl bg-[#141926] border-[12px] border-[#303d52] rounded-[32px] p-5 shadow-2xl font-mono flex flex-col justify-between relative"
        style={{ height: "88vh" }}
      >
        {/* Signature Red Exit Button */}
        <button
          onClick={() => {
            setShowHologramMap(false);
            synthSFX.playBeep();
          }}
          className="absolute -top-3 -right-3 w-12 h-12 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-full border-4 border-black flex items-center justify-center font-black text-xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-none z-50 text-center select-none animate-bounce"
          style={{ fontFamily: '"Press Start 2P"' }}
        >
          X
        </button>

        {/* Header branding */}
        <div className="w-full flex items-center justify-between border-b-4 border-black pb-2.5 mb-1.5 bg-[#0e121d] px-4 py-2 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-green-500 animate-pulse border-2 border-black" />
            <h3
              className="text-[10px] md:text-xs font-extrabold text-[#e2e8f0] tracking-widest uppercase"
              style={{ fontFamily: '"Press Start 2P"' }}
            >
              MAP: THE SKELD
            </h3>
          </div>
          <div className="text-[9px] text-[#cbd5e1] font-bold hidden sm:block tracking-wider uppercase">
            COCKPIT COGNITIVE REPAIR NAV-GRID
          </div>
        </div>

        {/* Main Interactive Map Board (SVG) */}
        <div className="w-full flex-1 bg-[#0b0e17] border-[6px] border-black rounded-2xl relative overflow-hidden flex items-center justify-center p-2">
          {/* Tactical overlay raster lines */}
          <div className="absolute inset-0 bg-[#0b0e17] [background-image:radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b]/10 to-[#020617]/50 pointer-events-none" />

          {/* Responsive container for SVG map */}
          <div className="relative w-full h-full max-w-[840px] max-h-[560px] flex items-center justify-center">
            <svg
              viewBox="0 0 920 780"
              className="w-full h-full select-none"
              style={{ imageRendering: "pixelated" }}
            >
              {/* Style definition for neat interactive highlight */}
              <defs>
                <style>{`
                  .map-room-rect {
                    transition: fill 0.15s ease, filter 0.15s ease;
                  }
                  .map-room-group:hover .map-room-rect {
                    fill: #4c6282 !important;
                    filter: drop-shadow(0px 0px 8px rgba(56, 254, 222, 0.35));
                  }
                `}</style>
              </defs>

              {/* 1. DRAW COUMMUNICATION HALWAYS / CORRIDORS FIRST */}
              {WALKABLE_REGIONS.filter((region) => !region.name).map(
                (hall, idx) => (
                  <rect
                    key={`hall-${idx}`}
                    x={hall.x}
                    y={hall.y}
                    width={hall.w}
                    height={hall.h}
                    fill="#202a3d"
                    stroke="#000000"
                    strokeWidth={5}
                    strokeLinejoin="round"
                  />
                ),
              )}

              {/* 2. DRAW ROOM CHAMBERS ON TOP */}
              {WALKABLE_REGIONS.filter((region) => region.name).map((room) => {
                const roomId = room.name!;
                const isTaskRoom = completedTasks[roomId] !== undefined;
                const isDone = isTaskRoom ? completedTasks[roomId] : true;

                // Style rooms based on their completion status
                let roomFill = "#2d3a52"; // default iron grey
                if (isTaskRoom) {
                  roomFill = isDone ? "#1c2b1e" : "#2d3a52"; // Green hue if done
                }

                return (
                  <g
                    key={`room-group-${roomId}`}
                    className="map-room-group cursor-pointer"
                    onClick={() => {
                      if (SPACESHIP_ROOMS[roomId]) {
                        initiateAutoWalkToRoom(roomId);
                      } else {
                        // Dynamic midpoint auto walk for custom sections
                        const cx = Math.floor(room.x + room.w / 2);
                        const cy = Math.floor(room.y + room.h / 2);
                        setTargetPos({ x: cx, y: cy });
                        setTargetRoomPath(roomId);
                        setShowHologramMap(false);
                        synthSFX.playBeep();
                      }
                    }}
                  >
                    {/* Shadow base room card */}
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.w}
                      height={room.h}
                      rx={10}
                      ry={10}
                      fill="#000000"
                    />
                    {/* Core room block */}
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.w}
                      height={room.h}
                      rx={8}
                      ry={8}
                      className="map-room-rect"
                      fill={roomFill}
                      stroke="#000000"
                      strokeWidth={5}
                      strokeLinejoin="round"
                    />
                    {/* Metallic gloss highlight inside card */}
                    <rect
                      x={room.x + 4}
                      y={room.y + 4}
                      width={room.w - 8}
                      height={room.h - 8}
                      rx={6}
                      ry={6}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth={1.5}
                    />

                    {/* Interactive glow hint on hover */}
                    <text
                      x={room.x + room.w - 18}
                      y={room.y + 18}
                      className="opacity-0 group-hover:opacity-100 fill-[#38FEDE] text-[8px] font-bold"
                      textAnchor="end"
                      dominantBaseline="central"
                    >
                      ✦
                    </text>
                  </g>
                );
              })}

              {/* 3. DRAW EXPLICIT LOCATION LABELS INSIDE ROOMS */}
              {Object.entries({
                cafeteria: { x: 450, y: 162.5, name: "CAFETERIA" },
                weapons: { x: 690, y: 145, name: "WEAPONS" },
                medbay: { x: 230, y: 167.5, name: "MEDBAY" },
                upper_engine: { x: 90, y: 162.5, name: "UPPER ENGINE" },
                reactor: { x: 85, y: 360, name: "REACTOR" },
                security: { x: 225, y: 340, name: "SECURITY" },
                lower_engine: { x: 90, y: 547.5, name: "LOWER ENGINE" },
                electrical: { x: 245, y: 500, name: "ELECTRICAL" },
                storage: { x: 450, y: 565, name: "STORAGE" },
                admin: { x: 585, y: 410, name: "ADMIN" },
                o2: { x: 680, y: 310, name: "O2" },
                navigation: { x: 805, y: 360, name: "NAVIGATION" },
                shields: { x: 690, y: 520, name: "SHIELDS" },
                comms: { x: 605, y: 665, name: "COMMUNICATIONS" },
              }).map(([roomId, label]) => {
                const roomInfo = WALKABLE_REGIONS.find(
                  (r) => r.name === roomId,
                );
                if (!roomInfo) return null;

                return (
                  <g
                    key={`label-${roomId}`}
                    className="pointer-events-none select-none"
                  >
                    {/* Drop shadow label */}
                    <text
                      x={label.x}
                      y={label.y + 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-[#05070c] font-sans font-black tracking-widest text-[11px] md:text-[13px] uppercase opacity-90"
                      style={{ letterSpacing: "0.14em" }}
                    >
                      {label.name}
                    </text>
                    {/* Main White Label */}
                    <text
                      x={label.x}
                      y={label.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-[#f1f5f9] font-sans font-black tracking-widest text-[11px] md:text-[13px] uppercase"
                      style={{ letterSpacing: "0.14em" }}
                    >
                      {label.name}
                    </text>
                  </g>
                );
              })}

              {/* 4. VISUAL DECORATION: FLIGHT VENTS GRATES */}
              {FLOATING_VENTS.map((v) => (
                <g
                  key={`map-vent-${v.id}`}
                  transform={`translate(${v.x}, ${v.y})`}
                  className="pointer-events-none opacity-40 select-none"
                >
                  {/* Vent Base Grille Frame */}
                  <rect
                    x={-8}
                    y={-8}
                    width={16}
                    height={16}
                    fill="#4b5563"
                    stroke="#000000"
                    strokeWidth={2.5}
                    rx={2}
                  />
                  <line
                    x1={-5}
                    y1={-4}
                    x2={5}
                    y2={-4}
                    stroke="#000000"
                    strokeWidth={2}
                  />
                  <line
                    x1={-5}
                    y1={0}
                    x2={5}
                    y2={0}
                    stroke="#000000"
                    strokeWidth={2}
                  />
                  <line
                    x1={-5}
                    y1={4}
                    x2={5}
                    y2={4}
                    stroke="#000000"
                    strokeWidth={2}
                  />
                </g>
              ))}

              {/* 5. SECTOR-ACTIVE ALERT EXCLAMATIONS BEACONS FOR PENDING TASKS */}
              {Object.entries(completedTasks).map(([roomId, isDone]) => {
                if (isDone) return null;
                const config = SPACESHIP_ROOMS[roomId];
                if (!config) return null;

                return (
                  <g
                    key={`map-beacon-${roomId}`}
                    transform={`translate(${config.cx}, ${config.cy})`}
                    className="pointer-events-none select-none hover:scale-105 transition-transform"
                  >
                    {/* Large pulsing ripple aura */}
                    <circle
                      r={22}
                      className="fill-yellow-500/10 stroke-yellow-500/25 animate-ping"
                    />
                    {/* Solid black outline circle */}
                    <circle r={13} fill="#000000" />
                    {/* Orange base warning circle */}
                    <circle r={11} fill="#ea580c" />
                    {/* Yellow blinking center inside warning circle */}
                    <circle r={8} fill="#facc15" className="animate-pulse" />
                    {/* Bold exclamation mark */}
                    <text
                      y={3.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-black font-sans font-black text-[12px]"
                    >
                      !
                    </text>
                  </g>
                );
              })}

              {/* 6. CHARACTER POSITIONING: INTUITIVE REAL-TIME CREWMATE PIN */}
              <g className="transition-all duration-150">
                {/* Glowing coordinate pointer ring underneath */}
                <circle
                  cx={playerPos.x}
                  cy={playerPos.y}
                  r={24}
                  className="fill-green-500/10 stroke-[#22c55e] animate-pulse"
                  strokeWidth={2}
                  strokeDasharray="4,4"
                />
                <circle
                  cx={playerPos.x}
                  cy={playerPos.y}
                  r={6}
                  className="fill-[#22c55e] stroke-black"
                  strokeWidth={2}
                />

                {/* Miniature actual animated player character overlay */}
                <foreignObject
                  x={playerPos.x - 18}
                  y={playerPos.y - 34}
                  width={38}
                  height={46}
                  className="overflow-visible pointer-events-none select-none"
                >
                  <CrewmateSprite
                    color={playerColor}
                    hat={playerHat || "none"}
                    isMoving={playerMoving}
                    direction={direction}
                    size={32}
                  />
                </foreignObject>
              </g>
            </svg>
          </div>

          {/* Dynamic feedback panel overlay */}
          <div className="absolute bottom-4 left-4 bg-black/85 border-2 border-slate-700/80 px-3.5 py-2 rounded-xl text-[9px] text-[#22c55e] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span>
              Nav GPS: Real-time Coordinates Tracking ({playerPos.x},{" "}
              {playerPos.y})
            </span>
          </div>
        </div>

        {/* Bottom guide tag */}
        <div className="text-center text-[9px] md:text-[10px] text-slate-400 font-bold bg-[#0e121d] py-2.5 rounded-xl border-t-2 border-black tracking-wide uppercase">
          ⚡ CLICK ANY WORK ROOM ON THE MONITOR TO AUTOMATICALLY ENGAGE
          INTUITIVE AUTOPILOT NAVIGATION ⚡
        </div>
      </div>
    </div>
  );
}

interface HologramMapContainerProps {
  initiateAutoWalkToRoom: (roomId: string) => void;
}

export default function HologramMap({
  initiateAutoWalkToRoom,
}: HologramMapContainerProps) {
  const {
    playerPos,
    playerMoving,
    direction,
    setTargetPos,
    setTargetRoomPath,
  } = useEngineStore(
    useShallow((state) => ({
      playerPos: state.playerPos,
      playerMoving: state.playerMoving,
      direction: state.direction,
      setTargetPos: state.setTargetPos,
      setTargetRoomPath: state.setTargetRoomPath,
    })),
  );

  return (
    <HologramMapView
      playerPos={playerPos}
      playerMoving={playerMoving}
      direction={direction}
      initiateAutoWalkToRoom={initiateAutoWalkToRoom}
      setTargetPos={setTargetPos}
      setTargetRoomPath={setTargetRoomPath}
    />
  );
}
