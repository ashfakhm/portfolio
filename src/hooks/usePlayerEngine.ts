import { useEffect, useRef } from "react";
import {
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

      updateDoorProgress((prev) => {
        const next = { ...prev };
        let changed = false;
        const currentDoors = useEngineStore.getState().doors;
        currentDoors.forEach((door) => {
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
        });
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

    const tickMovement = () => {
      let dx = 0;
      let dy = 0;
      const speed = GameConstants.MOVEMENT.SPEED;

      if (keysActiveRef.current.w || keysActiveRef.current.arrowup) dy -= 1;
      if (keysActiveRef.current.s || keysActiveRef.current.arrowdown) dy += 1;
      if (keysActiveRef.current.a || keysActiveRef.current.arrowleft) dx -= 1;
      if (keysActiveRef.current.d || keysActiveRef.current.arrowright) dx += 1;

      const engineState = useEngineStore.getState();

      if (engineState.joystickActive) {
        dx =
          engineState.joystickOffset.x *
          GameConstants.MOVEMENT.JOYSTICK_MULTIPLIER;
        dy =
          engineState.joystickOffset.y *
          GameConstants.MOVEMENT.JOYSTICK_MULTIPLIER;
      }

      let isMovingWalk = false;
      let currentX = engineState.playerPos.x;
      let currentY = engineState.playerPos.y;

      if (dx !== 0 || dy !== 0) {
        isMovingWalk = true;
        const length = Math.sqrt(dx * dx + dy * dy);
        const moveX = (dx / length) * speed;
        const moveY = (dy / length) * speed;

        let nextX = engineState.playerPos.x;
        let nextY = engineState.playerPos.y;

        if (
          isWalkable(
            engineState.playerPos.x + moveX,
            engineState.playerPos.y,
            engineState.doors,
          )
        ) {
          nextX = engineState.playerPos.x + moveX;
        }
        if (
          isWalkable(
            engineState.playerPos.x,
            engineState.playerPos.y + moveY,
            engineState.doors,
          )
        ) {
          nextY = engineState.playerPos.y + moveY;
        }
        if (
          isWalkable(
            engineState.playerPos.x + moveX,
            engineState.playerPos.y + moveY,
            engineState.doors,
          )
        ) {
          nextX = engineState.playerPos.x + moveX;
          nextY = engineState.playerPos.y + moveY;
        }

        currentX = nextX;
        currentY = nextY;

        if (dx < 0) updateDirection("left");
        else if (dx > 0) updateDirection("right");
      } else if (engineState.targetPos) {
        const distToTargetX = engineState.targetPos.x - engineState.playerPos.x;
        const distToTargetY = engineState.targetPos.y - engineState.playerPos.y;
        const totalDist = Math.sqrt(
          distToTargetX * distToTargetX + distToTargetY * distToTargetY,
        );

        if (totalDist > GameConstants.MOVEMENT.TARGET_REACH_DISTANCE) {
          isMovingWalk = true;
          const moveX = (distToTargetX / totalDist) * speed;
          const moveY = (distToTargetY / totalDist) * speed;

          let nextX = engineState.playerPos.x;
          let nextY = engineState.playerPos.y;

          if (
            isWalkable(
              engineState.playerPos.x + moveX,
              engineState.playerPos.y,
              engineState.doors,
            )
          ) {
            nextX = engineState.playerPos.x + moveX;
          }
          if (
            isWalkable(
              engineState.playerPos.x,
              engineState.playerPos.y + moveY,
              engineState.doors,
            )
          ) {
            nextY = engineState.playerPos.y + moveY;
          }
          if (
            isWalkable(
              engineState.playerPos.x + moveX,
              engineState.playerPos.y + moveY,
              engineState.doors,
            )
          ) {
            nextX = engineState.playerPos.x + moveX;
            nextY = engineState.playerPos.y + moveY;
          }

          if (
            nextX === engineState.playerPos.x &&
            nextY === engineState.playerPos.y
          ) {
            updateTargetPos(null);
            updateTargetRoomPath(null);
          } else {
            currentX = nextX;
            currentY = nextY;
          }

          if (distToTargetX < 0) updateDirection("left");
          else updateDirection("right");
        } else {
          updateTargetPos(null);
          if (engineState.targetRoomPath) {
            triggerModal(engineState.targetRoomPath);
            updateTargetRoomPath(null);
          }
        }
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

      let closestRoom: RoomConfig | null = null;
      let minDistance = 60;

      for (const room of Object.values(SPACESHIP_ROOMS)) {
        const rx = room.cx - currentX;
        const ry = room.cy - currentY;
        const dist = Math.sqrt(rx * rx + ry * ry);
        if (dist < minDistance) {
          minDistance = dist;
          closestRoom = room;
        }
      }

      if (engineState.nearestRoom?.id !== closestRoom?.id) {
        updateNearestRoom(closestRoom);
      }

      let nearestVent: (typeof FLOATING_VENTS)[number] | null = null;
      for (const vent of FLOATING_VENTS) {
        const vx = vent.x - currentX;
        const vy = vent.y - currentY;
        const vdist = Math.sqrt(vx * vx + vy * vy);
        if (vdist < GameConstants.VENTS.PROXIMITY_DISTANCE) {
          nearestVent = vent;
        }
      }
      if (engineState.nearVent?.id !== nearestVent?.id) {
        updateNearVent(nearestVent);
      }

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
