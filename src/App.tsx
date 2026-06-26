import CinematicSplash from "./components/CinematicSplash";
import MobileFallback from "./components/MobileFallback";
import GameWorld from "./components/GameWorld";
import { useGameState } from "./hooks/useGameState";
import { useIsMobile } from "./hooks/useIsMobile";
import { useGameStore } from "./store/useGameStore";

export default function App() {
	const isMobile = useIsMobile();
	const showCinematic = useGameStore((state) => state.showCinematic);

	useGameState(); // Mounts side-effects

	if (isMobile) return <MobileFallback />;

	return (
		<div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-app-bg text-text-main select-none text-sans">
			{showCinematic ? <CinematicSplash /> : <GameWorld isMobile={isMobile} />}
		</div>
	);
}
