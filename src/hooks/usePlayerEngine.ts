import { useEffect, useRef } from "react";
import {
  type Door,
  FLOATING_VENTS,
  GameConstants,
  isWalkable,
  type RoomConfig,
  SPACESHIP_ROOMS,
} from "../gameConfig";
import { useEngineStore } from "../store/useEngineStore";
import { useGameStore } from "../store/useGameStore";
import { synthSFX } from "../utils/sound";

interface UsePlayerEngineProps {
  showCinematic: boolean;
  openModalRoom: string | null;
  ventMapOpen: boolean;
  ventingStatus: "idle" | "diving" | "emerging";
  triggerModal: (roomId: string) => void;
  setShowHologramMap: (val: boolean) => void;
  setVentMapOpen: (val: boolean) => void;
}

function calculateWalkablePosition(
  currentPos: { x: number; y: number },
  moveX: number,
  moveY: number,
  doors: Door[],
): { x: number; y: number } {
  let nextX = currentPos.x;
  let nextY = currentPos.y;

  if (isWalkable(currentPos.x + moveX, currentPos.y, doors)) {
    nextX = currentPos.x + moveX;
  }
  if (isWalkable(currentPos.x, currentPos.y + moveY, doors)) {
    nextY = currentPos.y + moveY;
  }
  if (isWalkable(currentPos.x + moveX, currentPos.y + moveY, doors)) {
    nextX = currentPos.x + moveX;
    nextY = currentPos.y + moveY;
  }
  return { x: nextX, y: nextY };
}

// fallow-ignore-next-line complexity
function getKeyboardJoystickOffset(
  keysActive: Record<string, boolean>,
  joystickActive: boolean,
  joystickOffset: { x: number; y: number }
): { dx: number; dy: number } {
  let dx = 0;
  let dy = 0;
  if (keysActive.w || keysActive.arrowup) dy -= 1;
  if (keysActive.s || keysActive.arrowdown) dy += 1;
  if (keysActive.a || keysActive.arrowleft) dx -= 1;
  if (keysActive.d || keysActive.arrowright) dx += 1;

  if (joystickActive) {
    dx = joystickOffset.x * GameConstants.MOVEMENT.JOYSTICK_MULTIPLIER;
    dy = joystickOffset.y * GameConstants.MOVEMENT.JOYSTICK_MULTIPLIER;
  }
  return { dx, dy };
}

// fallow-ignore-next-line complexity
function handleTargetMovement(
  currentPos: { x: number; y: number },
  targetPos: { x: number; y: number },
  speed: number,
  doors: Door[],
  updateTargetPos: (pos: { x: number; y: number } | null) => void,
  updateTargetRoomPath: (path: string | null) => void,
  triggerModal: (roomId: string) => void,
  targetRoomPath: string | null,
  updateDirection: (dir: "left" | "right") => void
): { x: number; y: number; isMoving: boolean } {
  const distToTargetX = targetPos.x - currentPos.x;
  const distToTargetY = targetPos.y - currentPos.y;
  const totalDist = Math.sqrt(
    distToTargetX * distToTargetX + distToTargetY * distToTargetY,
  );

  if (totalDist > GameConstants.MOVEMENT.TARGET_REACH_DISTANCE) {
    const moveX = (distToTargetX / totalDist) * speed;
    const moveY = (distToTargetY / totalDist) * speed;

    const nextPos = calculateWalkablePosition(currentPos, moveX, moveY, doors);

    if (nextPos.x === currentPos.x && nextPos.y === currentPos.y) {
      updateTargetPos(null);
      updateTargetRoomPath(null);
      return { ...currentPos, isMoving: false };
    }

    if (distToTargetX < 0) updateDirection("left");
    else if (distToTargetX > 0) updateDirection("right");

    return { ...nextPos, isMoving: true };
  } else {
    updateTargetPos(null);
    if (targetRoomPath) {
      triggerModal(targetRoomPath);
      updateTargetRoomPath(null);
    }
    return { ...currentPos, isMoving: false };
  }
}

// fallow-ignore-next-line complexity
function updateNearestEntities(
  x: number,
  y: number,
  nearestRoom: RoomConfig | null,
  nearVent: { id: string; rx: string; x: number; y: number } | null,
  updateNearestRoom: (r: RoomConfig | null) => void,
  updateNearVent: (v: { id: string; rx: string; x: number; y: number } | null) => void
): void {
  let closestRoom: RoomConfig | null = null;
  let minDistance = 60;

  for (const room of Object.values(SPACESHIP_ROOMS)) {
    const rx = room.cx - x;
    const ry = room.cy - y;
    const dist = Math.sqrt(rx * rx + ry * ry);
    if (dist < minDistance) {
      minDistance = dist;
      closestRoom = room;
    }
  }

  if (nearestRoom?.id !== closestRoom?.id) {
    updateNearestRoom(closestRoom);
  }

  let nearestVent: (typeof FLOATING_VENTS)[number] | null = null;
  for (const vent of FLOATING_VENTS) {
    const vx = vent.x - x;
    const vy = vent.y - y;
    const vdist = Math.sqrt(vx * vx + vy * vy);
    if (vdist < GameConstants.VENTS.PROXIMITY_DISTANCE) {
      nearestVent = vent;
    }
  }
  if (nearVent?.id !== nearestVent?.id) {
    updateNearVent(nearestVent);
  }
}

export function usePlayerEngine({
  showCinematic,
  openModalRoom,
  ventMapOpen,
  ventingStatus,
  triggerModal,
  setShowHologramMap: toggleHologramMap,
  setVentMapOpen: toggleVentMapOpen,
}: UsePlayerEngineProps) {
  // Actions are stable and safe to read once from getState()
  const {
    setPlayerPos: updatePlayerPos,
    setDirection: updateDirection,
    setPlayerMoving: updatePlayerMoving,
    setTargetPos: updateTargetPos,
    setTargetRoomPath: updateTargetRoomPath,
    setDoors: updateDoors,
    setDoorProgress: updateDoorProgress,
    setNearestRoom: updateNearestRoom,
    setNearVent: updateNearVent,
  } = useEngineStore.getState();

  const frameIdRef = useRef<number>(0);
  const keysActiveRef = useRef<Record<string, boolean>>({});
  const lastStepTimeRef = useRef(0);
  const ventingStatusRef = useRef(ventingStatus);

  useEffect(() => {
    ventingStatusRef.current = ventingStatus;
  }, [ventingStatus]);

  useEffect(() => {
    if (showCinematic) return;

    const interval = setInterval(() => {
      updateDoors((prevDoors) => {
        let changed = false;
        const currentPos = useEngineStore.getState().playerPos;
        const nextDoors = prevDoors.map((door) => {
          const dx = door.x - currentPos.x;
          const dy = door.y - currentPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const shouldBeOpen = distance < GameConstants.DOORS.OPEN_DISTANCE;

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

      // fallow-ignore-next-line complexity
      updateDoorProgress((prev) => {
        const next = { ...prev };
        let changed = false;
        const currentDoors = useEngineStore.getState().doors;
        for (const door of currentDoors) {
          const target = door.isOpen ? 1 : 0;
          const current = prev[door.id] || 0;
          if (Math.abs(current - target) > 0.05) {
            changed = true;
            next[door.id] =
              current +
              (target - current) * GameConstants.DOORS.ANIMATION_SPRING;
          } else if (current !== target) {
            changed = true;
            next[door.id] = target;
          }
        }
        return changed ? next : prev;
      });
    }, GameConstants.DOORS.ANIMATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [showCinematic, updateDoorProgress, updateDoors]);

  useEffect(() => {
    if (showCinematic || openModalRoom || ventMapOpen) {
      keysActiveRef.current = {};
      updatePlayerMoving(false);
      return;
    }

    // fallow-ignore-next-line complexity
    const handleKeyDown = (e: KeyboardEvent) => {
      const walkKeys = [
        "w",
        "a",
        "s",
        "d",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
      ];
      if (walkKeys.includes(e.key.toLowerCase())) {
        keysActiveRef.current[e.key.toLowerCase()] = true;
        updateTargetPos(null);
        updateTargetRoomPath(null);
      }

      const engineState = useEngineStore.getState();
      if (
        (e.key === " " || e.key.toLowerCase() === "e") &&
        engineState.nearestRoom
      ) {
        e.preventDefault();
        triggerModal(engineState.nearestRoom.id);
      }

      if (
        e.key.toLowerCase() === "v" &&
        engineState.nearVent &&
        ventingStatusRef.current === "idle"
      ) {
        e.preventDefault();
        toggleVentMapOpen(true);
        synthSFX.playBeep();
      }

      if (e.key.toLowerCase() === "m" || e.key === "Tab") {
        e.preventDefault();
        toggleHologramMap(!useGameStore.getState().showHologramMap);
        synthSFX.playBeep();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keysActiveRef.current[e.key.toLowerCase()]) {
        delete keysActiveRef.current[e.key.toLowerCase()];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // fallow-ignore-next-line complexity
    const tickMovement = () => {
      const speed = GameConstants.MOVEMENT.SPEED;
      const engineState = useEngineStore.getState();

      const { dx, dy } = getKeyboardJoystickOffset(
        keysActiveRef.current,
        engineState.joystickActive,
        engineState.joystickOffset,
      );

      let isMovingWalk = false;
      let currentX = engineState.playerPos.x;
      let currentY = engineState.playerPos.y;

      if (dx !== 0 || dy !== 0) {
        isMovingWalk = true;
        const length = Math.sqrt(dx * dx + dy * dy);
        const moveX = (dx / length) * speed;
        const moveY = (dy / length) * speed;

        const nextPos = calculateWalkablePosition(
          engineState.playerPos,
          moveX,
          moveY,
          engineState.doors,
        );

        currentX = nextPos.x;
        currentY = nextPos.y;

        if (dx < 0) updateDirection("left");
        else if (dx > 0) updateDirection("right");
      } else if (engineState.targetPos) {
        const res = handleTargetMovement(
          engineState.playerPos,
          engineState.targetPos,
          speed,
          engineState.doors,
          updateTargetPos,
          updateTargetRoomPath,
          triggerModal,
          engineState.targetRoomPath,
          updateDirection,
        );
        currentX = res.x;
        currentY = res.y;
        isMovingWalk = res.isMoving;
      }

      if (isMovingWalk) {
        currentX = Math.max(
          GameConstants.MOVEMENT.BOUNDS.MIN_X,
          Math.min(GameConstants.MOVEMENT.BOUNDS.MAX_X, currentX),
        );
        currentY = Math.max(
          GameConstants.MOVEMENT.BOUNDS.MIN_Y,
          Math.min(GameConstants.MOVEMENT.BOUNDS.MAX_Y, currentY),
        );

        updatePlayerPos({ x: currentX, y: currentY });
        updatePlayerMoving(true);

        const nowTime = Date.now();
        if (
          nowTime - lastStepTimeRef.current >
          GameConstants.MOVEMENT.STEP_DELAY_MS
        ) {
          synthSFX.playFootstep();
          lastStepTimeRef.current = nowTime;
        }
      } else {
        updatePlayerMoving(false);
      }

      updateNearestEntities(
        currentX,
        currentY,
        engineState.nearestRoom,
        engineState.nearVent,
        updateNearestRoom,
        updateNearVent,
      );

      frameIdRef.current = requestAnimationFrame(tickMovement);
    };

    frameIdRef.current = requestAnimationFrame(tickMovement);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [
    showCinematic,
    openModalRoom,
    ventMapOpen,
    triggerModal,
    toggleHologramMap,
    toggleVentMapOpen,
    updateNearVent,
    updateTargetRoomPath,
    updateNearestRoom,
    updateTargetPos,
    updatePlayerPos,
    updatePlayerMoving,
    updateDirection,
  ]);

  return null;
}
