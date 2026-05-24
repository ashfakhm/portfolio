import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CrewmateColor, CrewmateHat } from "../components/CrewmateSprite";
import {
	type ChatMessage,
	createInitialCompletedTasks,
	INITIAL_COMPLETED_TASKS,
	SPACESHIP_ROOMS,
} from "../gameConfig";
import { synthSFX } from "../utils/sound";

interface GameState {
	// Cinematic State
	showCinematic: boolean;
	setShowCinematic: (val: boolean) => void;
	showImpostorAlert: boolean;
	setShowImpostorAlert: (val: boolean) => void;

	// Orchestrator State
	openModalRoom: string | null;
	setOpenModalRoom: (val: string | null) => void;
	ventMapOpen: boolean;
	setVentMapOpen: (val: boolean) => void;
	ventingStatus: "idle" | "diving" | "emerging";
	setVentingStatus: (val: "idle" | "diving" | "emerging") => void;
	showTaskCompletedBanner: string | null;
	setShowTaskCompletedBanner: (val: string | null) => void;

	// Modals & Overlays
	showTutorial: boolean;
	setShowTutorial: (val: boolean) => void;
	showVictory: boolean;
	setShowVictory: (val: boolean) => void;
	showHologramMap: boolean;
	setShowHologramMap: (val: boolean) => void;
	soundOn: boolean;
	setSoundOn: (val: boolean) => void;

	// Player Attributes
	playerColor: CrewmateColor;
	setPlayerColor: (val: CrewmateColor) => void;
	playerHat: CrewmateHat;
	setPlayerHat: (val: CrewmateHat) => void;

	// Chat
	chatOpen: boolean;
	setChatOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
	chatMessages: ChatMessage[];
	setChatMessages: (
		updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
	) => void;

	// Gameplay Tasks
	completedTasks: Record<string, boolean>;
	setCompletedTasks: (
		updater:
			| Record<string, boolean>
			| ((prev: Record<string, boolean>) => Record<string, boolean>),
	) => void;
	completedCount: number;
	totalTasks: number;

	startIntroSequence: () => void;
	resetGameProgress: () => void;
}

export const useGameStore = create<GameState>()(
	persist(
		(set) => ({
			// Cinematic State
			showCinematic: true,
			setShowCinematic: (val) => set({ showCinematic: val }),
			showImpostorAlert: false,
			setShowImpostorAlert: (val) => set({ showImpostorAlert: val }),

			// Orchestrator State
			openModalRoom: null,
			setOpenModalRoom: (val) => set({ openModalRoom: val }),
			ventMapOpen: false,
			setVentMapOpen: (val) => set({ ventMapOpen: val }),
			ventingStatus: "idle",
			setVentingStatus: (val) => set({ ventingStatus: val }),
			showTaskCompletedBanner: null,
			setShowTaskCompletedBanner: (val) => set({ showTaskCompletedBanner: val }),

			// Modals & Overlays
			showTutorial: false,
			setShowTutorial: (val) => set({ showTutorial: val }),
			showVictory: false,
			setShowVictory: (val) => set({ showVictory: val }),
			showHologramMap: false,
			setShowHologramMap: (val) => set({ showHologramMap: val }),
			soundOn: true,
			setSoundOn: (val) => {
				synthSFX.enabled = val;
				set({ soundOn: val });
			},

			// Player Attributes
			playerColor: "red",
			setPlayerColor: (val) => set({ playerColor: val }),
			playerHat: "plant",
			setPlayerHat: (val) => set({ playerHat: val }),

			// Chat
			chatOpen: false,
			setChatOpen: (val) =>
				set((state) => ({
					chatOpen: typeof val === "function" ? val(state.chatOpen) : val,
				})),
			chatMessages: [
				{
					id: "1",
					senderName: "Captain Blue",
					senderColor: "blue",
					message: "Welcome crewmates, make sure to read my files!",
				},
				{
					id: "2",
					senderName: "Pink",
					senderColor: "pink",
					message: "I saw you doing medical scans. Highly qualified!",
				},
				{
					id: "3",
					senderName: "Lime Tech",
					senderColor: "lime",
					message:
						"Projects in Comms download are fully solid! Razorpay hook tested.",
				},
			],
			setChatMessages: (updater) =>
				set((state) => ({
					chatMessages:
						typeof updater === "function" ? updater(state.chatMessages) : updater,
				})),

			// Gameplay Tasks
			completedTasks: createInitialCompletedTasks(),
			setCompletedTasks: (updater) =>
				set((state) => {
					const nextTasks =
						typeof updater === "function" ? updater(state.completedTasks) : updater;
					const completedCount =
						Object.values(nextTasks).filter(Boolean).length;
					const totalTasks = Object.keys(SPACESHIP_ROOMS).length;

					// Check victory condition
					if (completedCount === totalTasks && !state.showVictory) {
						setTimeout(() => set({ showVictory: true }), 1500);
					}

					return { completedTasks: nextTasks, completedCount, totalTasks };
				}),
			completedCount: 0,
			totalTasks: Object.keys(SPACESHIP_ROOMS).length,

			resetGameProgress: () =>
				set({
					completedTasks: createInitialCompletedTasks(),
					completedCount: 0,
					showVictory: false,
					showTaskCompletedBanner: null,
					openModalRoom: null,
					chatOpen: false,
				}),

			startIntroSequence: () => {
				set({ showCinematic: true });
				synthSFX.playSuccess();

				setTimeout(() => {
					set({ showCinematic: false, showTutorial: true });
				}, 2500);
			},
		}),
		{
			name: "game-completed-tasks",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				completedTasks: state.completedTasks,
				completedCount: state.completedCount,
				totalTasks: state.totalTasks,
			}),
			merge: (persisted, current) => {
				const saved = persisted as Partial<GameState> | undefined;
				const mergedTasks = {
					...INITIAL_COMPLETED_TASKS,
					...(saved?.completedTasks ?? {}),
				};
				const completedCount =
					Object.values(mergedTasks).filter(Boolean).length;
				return {
					...current,
					...saved,
					completedTasks: mergedTasks,
					completedCount,
					totalTasks: Object.keys(SPACESHIP_ROOMS).length,
				};
			},
		},
	),
);
