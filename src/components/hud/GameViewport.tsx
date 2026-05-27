import { useEffect, useRef } from "react";
import {
  FLOATING_VENTS,
  type RoomConfig,
  SPACESHIP_ROOMS,
  WALKABLE_REGIONS,
} from "../../gameConfig";
import { useShallow } from "zustand/react/shallow";
import { useEngineStore } from "../../store/useEngineStore";
import { useGameStore } from "../../store/useGameStore";
import CrewmateSprite, {
  type CrewmateColor,
  type CrewmateHat,
} from "../CrewmateSprite";

interface GameViewportProps {
  isMobile: boolean;
  playerPos: { x: number; y: number };
  targetPos: { x: number; y: number } | null;
  playerColor: CrewmateColor;
  playerHat: CrewmateHat;
  playerMoving: boolean;
  direction: "left" | "right";
  ventingStatus: "idle" | "diving" | "emerging";
  spaceshipRooms: Record<string, RoomConfig>;
  nearestRoom: RoomConfig | null;
  doors: any;
  doorProgress: any;
  onMapClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onEmergencyClick: () => void;
  onRoomClick: (roomId: string) => void;
  showCinematic: boolean;
  completedTasks: Record<string, boolean>;
}

function GameViewportView({
  isMobile,
  playerPos,
  targetPos,
  playerColor,
  playerHat,
  playerMoving,
  direction,
  ventingStatus,
  spaceshipRooms,
  nearestRoom,
  doors,
  doorProgress,
  onMapClick,
  onEmergencyClick,
  onRoomClick,
  showCinematic,
  completedTasks,
}: GameViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showCinematic || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    import("../../utils/shipRenderer").then(({ drawShip }) => {
      drawShip(canvas, ctx, {
        WALKABLE_REGIONS,
        SPACESHIP_ROOMS,
        completedTasks,
        doors,
        doorProgress,
        FLOATING_VENTS,
        nearestRoom,
        playerPos,
        targetPos,
      });
    });
  }, [
    showCinematic,
    nearestRoom,
    completedTasks,
    targetPos,
    playerPos,
    doors,
    doorProgress,
  ]);

  return (
    <div
      id="game-viewport-sandbox"
      className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-950 z-0"
    >
      <div
        className="absolute bg-viewport-bg rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)] cursor-crosshair overflow-hidden"
        style={{
          width: "900px",
          height: "800px",
          transform: `translate(calc(50vw - ${playerPos.x}px), calc(50vh - ${playerPos.y}px)) scale(${isMobile ? 0.9 : 1.6})`,
          transformOrigin: `${playerPos.x}px ${playerPos.y}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={800}
          onClick={onMapClick}
          className="absolute inset-0 z-0 bg-transparent"
        />
        <div
          className="absolute z-10 select-none"
          style={{
            left: `${playerPos.x - 28}px`,
            top: `${playerPos.y - 65}px`,
            pointerEvents: "none",
          }}
        >
          <div
            className={`transition-all duration-500 ease-in-out ${
              ventingStatus === "diving"
                ? "scale-0 opacity-0 translate-y-12"
                : "scale-100 opacity-100 translate-y-0"
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

        <button
          type="button"
          onClick={onEmergencyClick}
          aria-label="Trigger Emergency Meeting"
          className="absolute pointer-events-auto bg-[#c5111115] border-2 border-red-500/20 rounded-full cursor-pointer flex items-center justify-center hover:bg-red-500/20 transition-all z-0"
          style={{
            left: "432px",
            top: "132px",
            width: "36px",
            height: "36px",
          }}
          title="Click Emergency Table!"
        >
          <div className="size-3.5 rounded-full bg-red-600 border border-black animate-pulse" />
        </button>

        {Object.values(spaceshipRooms).map((room) => {
          const rectWidth = room.bounds.maxX - room.bounds.minX;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onRoomClick(room.id)}
              aria-label={`Go to ${room.name}`}
              className="absolute pointer-events-auto text-[8px] bg-slate-900/90 border border-slate-700 hover:border-brand-cyan text-slate-300 px-1.5 py-0.5 rounded tracking-wide font-mono flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all select-none cursor-pointer"
              style={{
                left: `${room.bounds.minX + rectWidth / 2 - 40}px`,
                top: ["electrical", "comms", "shields", "storage"].includes(room.id)
                  ? `${room.bounds.maxY - 28}px`
                  : `${room.bounds.minY + 12}px`,
              }}
            >
              <span>{room.icon}</span>
              <span className="font-extrabold text-[8px] uppercase">
                {room.name}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="absolute inset-0 pointer-events-none z-[15]"
        style={{
          background:
            "radial-gradient(circle at 50vw 50vh, transparent 180px, rgba(0,0,0,0.4) 300px, rgba(0,0,0,0.85) 450px, rgba(0,0,0,1) 600px)",
        }}
      />
    </div>
  );
}

interface GameViewportContainerProps {
  isMobile: boolean;
  onMapClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onEmergencyClick: () => void;
  onRoomClick: (roomId: string) => void;
}

export default function GameViewport(props: GameViewportContainerProps) {
  const {
    playerPos,
    targetPos,
    playerMoving,
    direction,
    nearestRoom,
    doors,
    doorProgress,
  } = useEngineStore(
    useShallow((state) => ({
      playerPos: state.playerPos,
      targetPos: state.targetPos,
      playerMoving: state.playerMoving,
      direction: state.direction,
      nearestRoom: state.nearestRoom,
      doors: state.doors,
      doorProgress: state.doorProgress,
    })),
  );

  const {
    playerColor,
    playerHat,
    ventingStatus,
    showCinematic,
    completedTasks,
  } = useGameStore(
    useShallow((state) => ({
      playerColor: state.playerColor,
      playerHat: state.playerHat,
      ventingStatus: state.ventingStatus,
      showCinematic: state.showCinematic,
      completedTasks: state.completedTasks,
    })),
  );

  return (
    <GameViewportView
      {...props}
      playerPos={playerPos}
      targetPos={targetPos}
      playerColor={playerColor}
      playerHat={playerHat}
      playerMoving={playerMoving}
      direction={direction}
      ventingStatus={ventingStatus}
      spaceshipRooms={SPACESHIP_ROOMS}
      nearestRoom={nearestRoom}
      doors={doors}
      doorProgress={doorProgress}
      showCinematic={showCinematic}
      completedTasks={completedTasks}
    />
  );
}
