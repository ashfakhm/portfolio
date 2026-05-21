# 🚀 Impostor Protocol: Interactive Sci-Fi Portfolio

Welcome to my interactive, "Among Us" inspired portfolio. This isn't just a static resume—it's a fully gamified, immersive experience. Explore my skills, projects, and work experience by completing "tasks" around the spaceship.

## 🛸 The Story: Escape the Boogeyman!

You start in **Dropship Holding Bay 04**, where you and your co-pilots wait for clearance to enter the main vehicle.
As you sync your terminal, an alert triggers: The **Boogeyman** has infiltrated the ship.
Your mission: Navigate through the spaceship, check the Hologram Maps and Vent Logs, and complete vital vehicle system tasks (like checking the Reactor or calibrating Navigation) before the Boogeyman strikes!

## ✨ Features

- **Gamified Experience:** Discover my background by completing interactive mini-game tasks (Wiring, Reactor, Navigation, Medbay, etc.).
- **Cinematic Dropship Lobby:** Fully featured lobby screen to select your crewmate suit colors and hats with a live 3D preview.
- **3D Elements:** Features dynamic 3D elements powered by Three.js, including a customizable 3D astronaut and moving star backgrounds.
- **Sci-Fi UI/UX:** Built with modern glassmorphism, glowing accents, and terminal-style typography (`Press Start 2P`) to simulate a spaceship control panel.
- **Ship Systems & Maps:** Use the Holographic Map (M) or Vent Map (V) to navigate your way around. Keep track of logs via the built-in simulated Crew Logs Chat.
- **Immersive Audio:** Integrated synth sound effects for interactions, task completions, and ambient jumpscares.

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (with custom glassmorphism & glowing tokens)
- **3D Graphics:** Three.js
- **Animations:** Framer Motion
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
│   │   ├── portfolio/         # Resume data (Achievements, Projects, Experience)
│   │   │   ├── Achievements.tsx
│   │   │   ├── DegreeCerts.tsx
│   │   │   ├── Projects.tsx
│   │   │   └── WorkExperience.tsx
│   │   ├── tasks/             # Interactive mini-game tasks
│   │   │   ├── hooks/         # Custom hooks for task logic
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
│   │   ├── LobbyScreen.tsx    # Dropship holding bay and customizer
│   │   ├── TaskModal.tsx      # Modal orchestrator for tasks
│   │   ├── ThreeBackground.tsx# 3D starfield canvas
│   │   ├── ThreeCrewmate.tsx  # 3D Crewmate renderer
│   │   ├── TutorialModal.tsx  # Help instructions
│   │   └── VentMap.tsx        # Quick travel via vents
│   ├── utils/
│   │   ├── shipRenderer.ts    # 2D Canvas rendering logic
│   │   └── sound.ts           # Synthesizer audio engine
│   ├── App.tsx                # Main orchestrator & game loop
│   ├── gameConfig.ts          # Ship layouts, rooms, hitboxes
│   ├── index.css              # Global styles
│   └── main.tsx               # Entry point
├── package.json
└── README.md
```

## 🤝 Contributing

While this is a personal portfolio, feedback on code structure or UI/UX improvements is always welcome. Feel free to open an issue or submit a PR if you spot any bugs in the ship's systems!

---

_“There is 1 highly skilled developer among us.”_
