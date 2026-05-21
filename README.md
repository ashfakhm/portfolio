# 🚀 Impostor Protocol: Interactive Sci-Fi Portfolio

Welcome to my interactive, "Among Us" inspired portfolio. This isn't just a static resume—it's a fully gamified, immersive experience. Explore my skills, projects, and work experience by completing "tasks" around the spaceship.

## 🛸 Features

- **Gamified Experience:** Discover my background by completing interactive mini-game tasks (Wiring, Reactor, Navigation, etc.).
- **3D Elements:** Features dynamic 3D elements powered by Three.js, including a floating astronaut and interactive environments.
- **Sci-Fi UI/UX:** Built with modern glassmorphism, glowing accents, and terminal-style typography to simulate a spaceship control panel.
- **Micro-Animations:** Fluid transitions and component animations powered by Framer Motion.
- **Immersive Audio:** Integrated sound effects for interactions, task completions, and ambient spaceship noise.

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

1. **Clone the repository** (if you haven't already):
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

- `src/components/portfolio/`: Contains the core resume components (Projects, Work Experience, Achievements, etc.).
- `src/components/tasks/`: Contains the interactive mini-games (Electrical Wiring, Medbay Scan, Reactor, etc.).
- `src/utils/`: Utility functions, including the sound engine (`sound.ts`).
- `src/App.tsx`: The main application hub that orchestrates the UI, tasks, and state management.

## 🤝 Contributing
While this is a personal portfolio, feedback on code structure or UI/UX improvements is always welcome. Feel free to open an issue or submit a PR if you spot any bugs in the ship's systems!

---

*“There is 1 highly skilled developer among us.”*
