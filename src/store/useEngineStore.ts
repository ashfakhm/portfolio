import { create } from "zustand";
import { INITIAL_DOORS, type RoomConfig } from "../gameConfig";

interface EngineState {
	// Player Position
	playerPos: { x: number; y: number };
	setPlayerPos: (pos: { x: number; y: number }) => void;
	direction: "left" | "right";
	setDirection: (dir: "left" | "right") => void;
	playerMoving: boolean;
	setPlayerMoving: (moving: boolean) => void;

	// Navigation
	targetPos: { x: number; y: number } | null;
	setTargetPos: (pos: { x: number; y: number } | null) => void;
	targetRoomPath: string | null;
	setTargetRoomPath: (path: string | null) => void;

	// Environment
	doors: typeof INITIAL_DOORS;
	setDoors: (
		doors:
			| typeof INITIAL_DOORS
			| ((prev: typeof INITIAL_DOORS) => typeof INITIAL_DOORS),
	) => void;
	doorProgress: Record<string, number>;
	setDoorProgress: (
		progress:
			| Record<string, number>
			| ((prev: Record<string, number>) => Record<string, number>),
	) => void;
	nearestRoom: RoomConfig | null;
	setNearestRoom: (room: RoomConfig | null) => void;
	nearVent: { id: string; rx: string; x: number; y: number } | null;
	setNearVent: (
		vent: { id: string; rx: string; x: number; y: number } | null,
	) => void;

	// Joystick
	joystickActive: boolean;
	setJoystickActive: (active: boolean) => void;
	joystickOffset: { x: number; y: number };
	setJoystickOffset: (offset: { x: number; y: number }) => void;
	joystickCenter: { x: number; y: number } | null;
	setJoystickCenter: (center: { x: number; y: number } | null) => void;
	joystickCurrent: { x: number; y: number } | null;
	setJoystickCurrent: (current: { x: number; y: number } | null) => void;
}

const getInitialPlayerPos = () => {
	const saved = sessionStorage.getItem("playerPos");
	if (saved) {
		try {
			return JSON.parse(saved);
		} catch (_e) {}
	}
	return { x: 450, y: 100 };
};

export const useEngineStore = create<EngineState>((set) => ({
	// Player Position
	playerPos: getInitialPlayerPos(),
	setPlayerPos: (pos) => {
		sessionStorage.setItem("playerPos", JSON.stringify(pos));
		set({ playerPos: pos });
	},
	direction: "right",
	setDirection: (dir) => set({ direction: dir }),
	playerMoving: false,
	setPlayerMoving: (moving) => set({ playerMoving: moving }),

	// Navigation
	targetPos: null,
	setTargetPos: (pos) => set({ targetPos: pos }),
	targetRoomPath: null,
	setTargetRoomPath: (path) => set({ targetRoomPath: path }),

	// Environment
	doors: INITIAL_DOORS,
	setDoors: (updater) =>
		set((state) => ({
			doors: typeof updater === "function" ? updater(state.doors) : updater,
		})),
	doorProgress: {
		door1: 0,
		door2: 0,
		door3: 0,
		door4: 0,
		door5: 0,
		door6: 0,
	},
	setDoorProgress: (updater) =>
		set((state) => ({
			doorProgress:
				typeof updater === "function" ? updater(state.doorProgress) : updater,
		})),
	nearestRoom: null,
	setNearestRoom: (room) => set({ nearestRoom: room }),
	nearVent: null,
	setNearVent: (vent) => set({ nearVent: vent }),

	// Joystick
	joystickActive: false,
	setJoystickActive: (active) => set({ joystickActive: active }),
	joystickOffset: { x: 0, y: 0 },
	setJoystickOffset: (offset) => set({ joystickOffset: offset }),
	joystickCenter: null,
	setJoystickCenter: (center) => set({ joystickCenter: center }),
	joystickCurrent: null,
	setJoystickCurrent: (current) => set({ joystickCurrent: current }),
}));
