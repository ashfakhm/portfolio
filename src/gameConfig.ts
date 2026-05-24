import type { CrewmateColor } from "./components/CrewmateSprite";

export interface RoomConfig {
	id: string;
	name: string;
	section: string;
	cx: number; // Console Terminal X coord
	cy: number; // Console Terminal Y coord
	color: string;
	icon: string;
	bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export const SPACESHIP_ROOMS: Record<string, RoomConfig> = {
	cafeteria: {
		id: "cafeteria",
		name: "Cafeteria",
		section: "Landing Terminal",
		cx: 450,
		cy: 160,
		color: "#ff3f3f",
		icon: "🚪",
		bounds: { minX: 330, maxX: 570, minY: 75, maxY: 250 },
	},
	reactor: {
		id: "reactor",
		name: "Reactor Core",
		section: "About Me",
		cx: 90,
		cy: 360,
		color: "#FFD700",
		icon: "🔧",
		bounds: { minX: 30, maxX: 140, minY: 280, maxY: 440 },
	},
	admin: {
		id: "admin",
		name: "Admin Desk",
		section: "Technical Skills",
		cx: 580,
		cy: 420,
		color: "#1A9EFF",
		icon: "🔐",
		bounds: { minX: 510, maxX: 660, minY: 340, maxY: 480 },
	},
	comms: {
		id: "comms",
		name: "Comms Dish",
		section: "Degree & Certs",
		cx: 605,
		cy: 660,
		color: "#BDC3C7",
		icon: "📡",
		bounds: { minX: 530, maxX: 680, minY: 590, maxY: 735 },
	},
	medbay: {
		id: "medbay",
		name: "MedBay Lab",
		section: "Work Experience",
		cx: 240,
		cy: 180,
		color: "#4CAF50",
		icon: "🔬",
		bounds: { minX: 160, maxX: 300, minY: 95, maxY: 240 },
	},
	security: {
		id: "security",
		name: "Security Monitors",
		section: "Achievements",
		cx: 220,
		cy: 340,
		color: "#ED54BA",
		icon: "🛡️",
		bounds: { minX: 170, maxX: 280, minY: 280, maxY: 400 },
	},
	storage: {
		id: "storage",
		name: "Storage Area",
		section: "Social Links",
		cx: 450,
		cy: 560,
		color: "#D2691E",
		icon: "📦",
		bounds: { minX: 340, maxX: 560, minY: 470, maxY: 660 },
	},
	weapons: {
		id: "weapons",
		name: "Weapons Desk",
		section: "Project Cards",
		cx: 690,
		cy: 150,
		color: "#FF4500",
		icon: "🔫",
		bounds: { minX: 610, maxX: 770, minY: 80, maxY: 210 },
	},
	electrical: {
		id: "electrical",
		name: "Electrical Node",
		section: "Wiring Grid",
		cx: 250,
		cy: 490,
		color: "#ADFF2F",
		icon: "⚡",
		bounds: { minX: 180, maxX: 310, minY: 430, maxY: 570 },
	},
	navigation: {
		id: "navigation",
		name: "Navigation Console",
		section: "Location Radar",
		cx: 820,
		cy: 360,
		color: "#1E90FF",
		icon: "🗺️",
		bounds: { minX: 740, maxX: 870, minY: 280, maxY: 440 },
	},
	shields: {
		id: "shields",
		name: "Shield Controls",
		section: "Performance Locker",
		cx: 690,
		cy: 530,
		color: "#FF69B4",
		icon: "🛡️",
		bounds: { minX: 610, maxX: 770, minY: 450, maxY: 590 },
	},
};

// Floor vents coordinates for speed-vent crawling
export const FLOATING_VENTS = [
	{ id: "vent1", label: "Cafeteria Passage", rx: "cafeteria", x: 440, y: 100 },
	{ id: "vent2", label: "Reactor Passage", rx: "reactor", x: 60, y: 310 },
	{ id: "vent3", label: "Admin Passage", rx: "admin", x: 530, y: 360 },
	{ id: "vent4", label: "Security Passage", rx: "security", x: 190, y: 310 },
];

export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
	name?: string;
}

export const WALKABLE_REGIONS: Rect[] = [
	// 1. Rooms
	{ x: 330, y: 75, w: 240, h: 175, name: "cafeteria" },
	{ x: 610, y: 80, w: 160, h: 130, name: "weapons" },
	{ x: 160, y: 95, w: 140, h: 145, name: "medbay" },
	{ x: 40, y: 95, w: 100, h: 135, name: "upper_engine" },
	{ x: 30, y: 280, w: 110, h: 160, name: "reactor" },
	{ x: 170, y: 280, w: 110, h: 120, name: "security" },
	{ x: 40, y: 480, w: 100, h: 135, name: "lower_engine" },
	{ x: 180, y: 430, w: 130, h: 140, name: "electrical" },
	{ x: 340, y: 470, w: 220, h: 190, name: "storage" },
	{ x: 510, y: 340, w: 150, h: 140, name: "admin" },
	{ x: 620, y: 250, w: 120, h: 120, name: "o2" },
	{ x: 740, y: 280, w: 130, h: 160, name: "navigation" },
	{ x: 610, y: 450, w: 160, h: 140, name: "shields" },
	{ x: 530, y: 590, w: 150, h: 145, name: "comms" },

	// 2. Connecting Hallways (Corridors)
	// Cafeteria -> Medbay -> Upper Engine
	{ x: 280, y: 135, w: 70, h: 45 }, // Cafeteria to Medbay
	{ x: 130, y: 135, w: 45, h: 45 }, // Medbay to Upper Engine

	// Upper Engine -> Reactor -> Lower Engine
	{ x: 70, y: 215, w: 40, h: 75 }, // Upper Engine to Reactor
	{ x: 70, y: 425, w: 40, h: 65 }, // Reactor to Lower Engine

	// Reactor -> Security
	{ x: 130, y: 315, w: 50, h: 45 }, // Reactor to Security

	// Lower Engine -> Electrical -> Storage corridor
	{ x: 130, y: 515, w: 60, h: 45 }, // Lower Engine to Electrical
	{ x: 295, y: 490, w: 60, h: 45 }, // Electrical to Storage

	// Cafeteria down to Storage (Center hallway)
	{ x: 410, y: 235, w: 80, h: 255 }, // Cafeteria to Storage

	// Storage to Admin
	{ x: 460, y: 420, w: 65, h: 45 }, // Storage to Admin
	{ x: 570, y: 465, w: 45, h: 145 }, // Admin down to Comms
	{ x: 500, y: 610, w: 40, h: 45 }, // Comms connection

	// Cafeteria -> Weapons -> O2 -> Navigation -> Shields
	{ x: 555, y: 115, w: 70, h: 45 }, // Cafeteria to Weapons
	{ x: 650, y: 195, w: 45, h: 70 }, // Weapons to O2
	{ x: 715, y: 285, w: 45, h: 45 }, // O2 to Navigation
	{ x: 755, y: 425, w: 45, h: 55 }, // Navigation to Shields
	{ x: 555, y: 500, w: 70, h: 45 }, // Storage to Shields
];

export interface Obstacle {
	x: number;
	y: number;
	w?: number;
	h?: number;
	r?: number;
	type: "rect" | "circle";
}

export const STATIC_OBSTACLES: Obstacle[] = [
	// Cafeteria center table
	{ type: "circle", x: 450, y: 150, r: 26 },
	// Cafeteria other tables
	{ type: "circle", x: 390, y: 110, r: 18 },
	{ type: "circle", x: 510, y: 110, r: 18 },
	{ type: "circle", x: 390, y: 210, r: 18 },
	{ type: "circle", x: 510, y: 210, r: 18 },

	// Storage crates
	{ type: "rect", x: 422, y: 532, w: 56, h: 56 },
	// Reactor Core
	{ type: "rect", x: 65, y: 335, w: 50, h: 50 },
	// Medbay beds
	{ type: "rect", x: 180, y: 110, w: 25, h: 45 },
	{ type: "rect", x: 235, y: 110, w: 25, h: 45 },
	// Security desk
	{ type: "rect", x: 200, y: 310, w: 50, h: 25 },
	// Admin desk
	{ type: "rect", x: 550, y: 390, w: 60, h: 30 },
];

export interface Door {
	id: string;
	x: number;
	y: number;
	label: string;
	isOpen: boolean;
	w: number;
	h: number;
	horizontal: boolean;
}

export const INITIAL_DOORS: Door[] = [
	{
		id: "door1",
		x: 315,
		y: 155,
		label: "Medbay Gate",
		isOpen: false,
		w: 12,
		h: 45,
		horizontal: false,
	},
	{
		id: "door2",
		x: 585,
		y: 135,
		label: "Weapons Gate",
		isOpen: false,
		w: 12,
		h: 45,
		horizontal: false,
	},
	{
		id: "door3",
		x: 150,
		y: 155,
		label: "Upper Engine Gate",
		isOpen: false,
		w: 12,
		h: 45,
		horizontal: false,
	},
	{
		id: "door4",
		x: 155,
		y: 335,
		label: "Security Gate",
		isOpen: false,
		w: 12,
		h: 45,
		horizontal: false,
	},
	{
		id: "door5",
		x: 325,
		y: 512,
		label: "Electrical Gate",
		isOpen: false,
		w: 12,
		h: 45,
		horizontal: false,
	},
	{
		id: "door6",
		x: 590,
		y: 520,
		label: "Comms Gate",
		isOpen: false,
		w: 12,
		h: 45,
		horizontal: false,
	},
];

export const isWalkable = (
	x: number,
	y: number,
	doorsArray: Door[] = [],
): boolean => {
	// 1. Must be inside at least one walkable region
	let inWalkable = false;
	for (const reg of WALKABLE_REGIONS) {
		if (x >= reg.x && x <= reg.x + reg.w && y >= reg.y && y <= reg.y + reg.h) {
			inWalkable = true;
			break;
		}
	}
	if (!inWalkable) return false;

	// 2. Must NOT be inside any static obstacles
	for (const obs of STATIC_OBSTACLES) {
		if (obs.type === "rect" && obs.w && obs.h) {
			if (
				x >= obs.x &&
				x <= obs.x + obs.w &&
				y >= obs.y &&
				y <= obs.y + obs.h
			) {
				return false;
			}
		} else if (obs.type === "circle" && obs.r) {
			const dx = x - obs.x;
			const dy = y - obs.y;
			if (Math.sqrt(dx * dx + dy * dy) <= obs.r) {
				return false;
			}
		}
	}

	// 3. Must NOT be inside any closed doors
	for (const door of doorsArray) {
		if (!door.isOpen) {
			if (door.horizontal) {
				const hw = 22;
				const hh = 10;
				if (
					x >= door.x - hw &&
					x <= door.x + hw &&
					y >= door.y - hh &&
					y <= door.y + hh
				) {
					return false;
				}
			} else {
				const hw = 10;
				const hh = 22;
				if (
					x >= door.x - hw &&
					x <= door.x + hw &&
					y >= door.y - hh &&
					y <= door.y + hh
				) {
					return false;
				}
			}
		}
	}

	return true;
};

export interface ChatMessage {
	id: string;
	senderName: string;
	senderColor: CrewmateColor;
	message: string;
	isSystem?: boolean;
}

export const GameConstants = {
	MOVEMENT: {
		SPEED: 5.5,
		JOYSTICK_MULTIPLIER: 1.5,
		TARGET_REACH_DISTANCE: 6,
		STEP_DELAY_MS: 240,
		BOUNDS: { MIN_X: 35, MAX_X: 850, MIN_Y: 55, MAX_Y: 760 },
	},
	DOORS: {
		OPEN_DISTANCE: 65,
		ANIMATION_SPRING: 0.22,
		ANIMATION_INTERVAL_MS: 45,
	},
	VENTS: {
		PROXIMITY_DISTANCE: 40,
		DIVE_DELAY_MS: 500,
		EMERGE_DELAY_MS: 500,
		OFFSET_Y: 30,
	},
	TIMINGS: {
		CINEMATIC_SHH_DURATION: 1700,
		CINEMATIC_TOTAL_DURATION: 4500,
		BANNER_DISPLAY_MS: 3000,
		LOBBY_TICK_MS: 80,
	},
	UI: {
		MOBILE_BREAKPOINT: 1024,
		JOYSTICK_DISTANCE_THRESHOLD: 45,
	},
};
