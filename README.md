# 🚀 Impostor Protocol: Interactive Sci-Fi Portfolio

Welcome to my interactive, "Among Us" inspired portfolio. This isn't just a static resume—it's a fully gamified, immersive experience. Explore my skills, projects, and work experience by completing "tasks" around the spaceship.

## 🛸 The Story: Escape the Boogeyman!

The **Boogeyman** is a mythical creature often used by mothers to frighten children into doing their chores and tasks. In this interactive experience, someone is coming to get you—so you must finish your tasks! (Actually, there is no Boogeyman... but play along and complete your mission!)

Your mission is to finish all your tasks before this imaginary character arrives. If you successfully complete your tasks, you win. Otherwise, the Boogeyman wins!

## ✨ Features

- **Gamified Experience:** Discover my background by completing interactive mini-game tasks (Wiring, Reactor, Navigation, Medbay, etc.).
- **Live Customizer Panel:** Built into the HUD controls to dynamically select crewmate suit colors and hats with live previews.
- **3D Elements:** Features dynamic 3D elements powered by Three.js, including a customizable 3D astronaut and moving star backgrounds.
- **Sci-Fi UI/UX:** Built with modern glassmorphism, glowing accents, and terminal-style typography (`Press Start 2P`) to simulate a spaceship control panel.
- **Ship Systems & Maps:** Use the Holographic Map (M) or Vent Map (V) to navigate your way around. Keep track of logs via the built-in simulated Crew Logs Chat.
- **Immersive Audio:** Integrated synth sound effects for interactions, task completions, and ambient jumpscares.

## ⚡ Performance & Architectural Highlights

The codebase is engineered to follow professional standards, featuring clean, robust, and optimized React 19 architecture:

- **Zero Re-render Loops & Optimized Zustand Subscriptions:** All Zustand subscriptions use `useShallow` selectors or individual selectors to prevent unnecessary re-renders of HUD components. Re-render frequency drops from 60fps to 0fps when the crewmate is idle.
- **Condition-based Overlay Rendering:** Interactive overlays (such as `HologramMap`, `VentMap`, and `ChatSystem`) are conditionally mounted inside `App.tsx` instead of constantly being rendered and hidden, minimizing active state listeners and reducing memory footprint.
- **Interactive SVG Map Memoization:** The `HologramMapView` interactive SVG component is wrapped in `React.memo` and coordinates auto-walk callbacks referentially through stable dependencies, minimizing SVG DOM mutations during walking.
- **WebGL Resource Lifecycle & Material Reuse:** Solved WebGL and GPU memory leaks in `ThreeCrewmate.tsx` by updating material properties on existing meshes rather than instantiating new material buffers on crewmate suit color changes.
- **Proper Memory Cleanup:** Modularized 3D hat rendering logic in `ThreeCrewmate.tsx` with proper cleanup to dispose of geometries and materials on unmount/re-render.
- **Effect-Free React Architecture:** Avoided fragile `useEffect` state syncing bugs by using derived states (e.g., in Shields and Weapons tasks) to ensure a robust, side-effect-free, and predictable user experience.

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite v6
- **Styling:** Tailwind CSS v4 (with custom glassmorphism & glowing tokens via the `@tailwindcss/vite` plugin)
- **State Management:** Zustand v5 (utilizing shallow selectors for high-performance React binding)
- **3D Graphics:** Three.js v0.184
- **Animations:** Motion (Framer Motion v12)
- **Icons:** Lucide React

## 📦 Running Locally

To run the spaceship's systems on your local machine:

**Prerequisites:**

- Node.js (v18+ recommended)

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd portfolio
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Boot up the server:**

   ```bash
   npm run dev
   ```

4. **Access the terminal:**
   Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).

## 🗂️ Project Structure

```text
portfolio/
├── public/
│   └── favicon.png
├── src/
│   ├── components/
│   │   ├── hud/               # HUD panels and action controls
│   │   │   ├── BottomActionControls.tsx
│   │   │   ├── ChecklistHUD.tsx
│   │   │   ├── GameViewport.tsx
│   │   │   ├── MobileJoystickHUD.tsx
│   │   │   ├── RightActionWidgets.tsx
│   │   │   ├── TopStatusHUD.tsx
│   │   │   └── VictoryScreen.tsx
│   │   ├── portfolio/         # Resume data sections
│   │   │   ├── Achievements.tsx
│   │   │   ├── DegreeCerts.tsx
│   │   │   ├── Projects.tsx
│   │   │   └── WorkExperience.tsx
│   │   ├── tasks/             # Interactive mini-game tasks
│   │   │   ├── hooks/         # Custom hooks for tasks logic (e.g., useWeaponsTask, useShieldsTask)
│   │   │   ├── AdminTask.tsx
│   │   │   ├── CafeteriaTask.tsx
│   │   │   ├── CommsTask.tsx
│   │   │   ├── ElectricalTask.tsx
│   │   │   ├── EmergencyTask.tsx
│   │   │   ├── MedbayTask.tsx
│   │   │   ├── NavigationTask.tsx
│   │   │   ├── ReactorTask.tsx
│   │   │   ├── SecurityTask.tsx
│   │   │   ├── ShieldsTask.tsx
│   │   │   ├── StorageTask.tsx
│   │   │   └── WeaponsTask.tsx
│   │   ├── ChatSystem.tsx     # Simulated crew logs chat
│   │   ├── CinematicSplash.tsx# Splash screens and Boogeyman alerts
│   │   ├── CrewmateSprite.tsx # 2D Pixel sprites
│   │   ├── HologramMap.tsx    # Blueprint map view
│   │   ├── MobileFallback.tsx # Mobile fallback screen
│   │   ├── TaskModal.tsx      # Modal orchestrator for tasks
│   │   ├── ThreeBackground.tsx# 3D starfield canvas
│   │   ├── ThreeCrewmate.tsx  # 3D Crewmate renderer
│   │   ├── TutorialModal.tsx  # Help instructions
│   │   └── VentMap.tsx        # Quick travel via vents
│   ├── hooks/                 # Core engine and orchestrator hooks
│   │   ├── useGameOrchestrator.ts
│   │   ├── useGameState.ts
│   │   ├── useIsMobile.ts
│   │   ├── useMobileJoystick.ts
│   │   └── usePlayerEngine.ts
│   ├── store/                 # Zustand state stores
│   │   ├── useEngineStore.ts  # Coordinates and movement state
│   │   └── useGameStore.ts    # Game flags, tasks, customizer state
│   ├── utils/
│   │   ├── shipRenderer.ts    # 2D Canvas rendering logic
│   │   └── sound.ts           # Synthesizer audio engine
│   ├── App.tsx                # Main orchestrator & game loop
│   ├── gameConfig.ts          # Ship layouts, rooms, hitboxes
│   ├── index.css              # Global styles
│   └── main.tsx               # Entry point
├── index.html
├── metadata.json
├── package-lock.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🤝 Contributing

While this is a personal portfolio, feedback on code structure or UI/UX improvements is always welcome. Feel free to open an issue or submit a PR if you spot any bugs in the ship's systems!

---

_“There is 1 highly skilled developer among us.”_
