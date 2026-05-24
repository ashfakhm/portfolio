import { useCallback } from "react";
import { CheckSquare } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import ChatSystem from "./components/ChatSystem";
import CinematicSplash from "./components/CinematicSplash";
import HologramMap from "./components/HologramMap";
import BottomActionControls from "./components/hud/BottomActionControls";
import ChecklistHUD from "./components/hud/ChecklistHUD";
import GameViewport from "./components/hud/GameViewport";
import MobileJoystickHUD from "./components/hud/MobileJoystickHUD";
import RightActionWidgets from "./components/hud/RightActionWidgets";
import TopStatusHUD from "./components/hud/TopStatusHUD";
import VictoryScreen from "./components/hud/VictoryScreen";
import MobileFallback from "./components/MobileFallback";
import TaskModal from "./components/TaskModal";
import ThreeBackground from "./components/ThreeBackground";
import TutorialModal from "./components/TutorialModal";
import VentMap from "./components/VentMap";
import { SPACESHIP_ROOMS } from "./gameConfig";
import { useGameOrchestrator } from "./hooks/useGameOrchestrator";
import { useGameState } from "./hooks/useGameState";
import { useIsMobile } from "./hooks/useIsMobile";
import { usePlayerEngine } from "./hooks/usePlayerEngine";
import { useEngineStore } from "./store/useEngineStore";
import { useGameStore } from "./store/useGameStore";
import { synthSFX } from "./utils/sound";

export default function App() {
  const isMobile = useIsMobile();

  const {
    showCinematic,
    showTutorial,
    setShowTutorial,
    showVictory,
    playerColor,
    playerHat,
    openModalRoom,
    ventMapOpen,
    ventingStatus,
    showTaskCompletedBanner,
    setShowHologramMap,
    setVentMapOpen,
    showHologramMap,
    chatOpen,
  } = useGameStore(
    useShallow((state) => ({
      showCinematic: state.showCinematic,
      showTutorial: state.showTutorial,
      setShowTutorial: state.setShowTutorial,
      showVictory: state.showVictory,
      playerColor: state.playerColor,
      playerHat: state.playerHat,
      openModalRoom: state.openModalRoom,
      ventMapOpen: state.ventMapOpen,
      ventingStatus: state.ventingStatus,
      showTaskCompletedBanner: state.showTaskCompletedBanner,
      setShowHologramMap: state.setShowHologramMap,
      setVentMapOpen: state.setVentMapOpen,
      showHologramMap: state.showHologramMap,
      chatOpen: state.chatOpen,
    })),
  );

  const {
    playerMoving,
    direction,
    setTargetPos,
    setTargetRoomPath,
    nearestRoom,
  } = useEngineStore(
    useShallow((state) => ({
      playerMoving: state.playerMoving,
      direction: state.direction,
      setTargetPos: state.setTargetPos,
      setTargetRoomPath: state.setTargetRoomPath,
      nearestRoom: state.nearestRoom,
    })),
  );

  useGameState(); // Mounts side-effects

  const { triggerModal, handleModalClose, handleCrewClick, triggerVentTravel } =
    useGameOrchestrator();

  usePlayerEngine({
    showCinematic,
    openModalRoom,
    ventMapOpen,
    ventingStatus,
    triggerModal,
    setShowHologramMap,
    setVentMapOpen,
  });

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (openModalRoom || ventMapOpen) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    if (!rect) return;
    const clickX = ((e.clientX - rect.left) / rect.width) * 900;
    const clickY = ((e.clientY - rect.top) / rect.height) * 800;
    setTargetPos({ x: clickX, y: clickY });
    setTargetRoomPath(null);
    synthSFX.playBeep();
  }, [openModalRoom, ventMapOpen, setTargetPos, setTargetRoomPath]);

  const initiateAutoWalkToRoom = useCallback((roomId: string) => {
    const targetRoom = SPACESHIP_ROOMS[roomId];
    if (!targetRoom) return;
    setShowHologramMap(false);
    setTargetPos({ x: targetRoom.cx, y: targetRoom.cy });
    setTargetRoomPath(roomId);
    synthSFX.playBeep();
  }, [setShowHologramMap, setTargetPos, setTargetRoomPath]);

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-app-bg text-text-main select-none text-sans">
      {isMobile && <MobileFallback />}

      <ThreeBackground
        playerMoving={playerMoving}
        playerDirection={{
          x: direction === "left" ? -1 : 1,
          y: playerMoving ? 1 : 0,
        }}
      />

      <CinematicSplash />

      {!showCinematic && (
        <div className="absolute inset-x-0 inset-y-0 z-10 pointer-events-none flex flex-col justify-between p-3 select-none">
          <TopStatusHUD />

          <ChecklistHUD onAutoWalk={initiateAutoWalkToRoom} />

          <RightActionWidgets />

          <BottomActionControls
            onCrewClick={handleCrewClick}
            onVentClick={() => {
              setVentMapOpen(true);
              synthSFX.playBeep();
            }}
            onEmergencyClick={() => triggerModal("emergency")}
            onUseClick={() => {
              if (nearestRoom) triggerModal(nearestRoom.id);
            }}
          />
        </div>
      )}

      {!showCinematic && (
        <GameViewport
          isMobile={isMobile}
          onMapClick={handleMapClick}
          onEmergencyClick={() => triggerModal("emergency")}
          onRoomClick={initiateAutoWalkToRoom}
        />
      )}

      {chatOpen && !showCinematic && <ChatSystem />}

      {showHologramMap && !showCinematic && (
        <HologramMap initiateAutoWalkToRoom={initiateAutoWalkToRoom} />
      )}

      {ventMapOpen && (
        <VentMap triggerVentTravel={(roomId) => triggerVentTravel(roomId)} />
      )}

      {!showCinematic && !openModalRoom && <MobileJoystickHUD />}

      {showTaskCompletedBanner && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-brand-success border-y-4 border-black w-full text-center py-4 text-white uppercase font-extrabold tracking-widest shadow-2xl skew-x-3 max-w-2xl animate-task-completed">
          <div className="flex items-center justify-center gap-3">
            <CheckSquare className="text-brand-gold animate-bounce" size={24} />
            <span
              className="text-sm md:text-base tracking-[0.25em]"
              style={{
                fontFamily: '"Press Start 2P"',
                textShadow: "2px 2px 0px #000",
              }}
            >
              TASK COMPLETED!
            </span>
          </div>
          <div className="text-[10px] font-mono text-green-100 font-bold uppercase mt-1">
            STABILIZED CORE NODE FOR {showTaskCompletedBanner} OVERRIDE
          </div>
        </div>
      )}

      {openModalRoom && (
        <TaskModal
          key={openModalRoom}
          room={openModalRoom}
          playerColor={playerColor}
          onClose={handleModalClose}
        />
      )}

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />

      {showVictory && (
        <VictoryScreen
          playerColor={playerColor}
          playerHat={playerHat}
          onPlayAgain={() => {
            sessionStorage.clear();
            window.location.reload();
          }}
        />
      )}

      {!showCinematic && (
        <div className="w-full bg-term-bg border-t-2 border-border-dark px-4 py-1.5 flex items-center justify-between text-[6px] sm:text-[8px] text-[#3a3a5c] md:text-[9px] font-mono z-10 relative">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-success animate-pulse" />
            <span>PORT 3000 // CO-PILOT TERMINAL STABLE</span>
          </div>
          <span>DEVELOPER PORTFOLIO : YOU</span>
        </div>
      )}
    </div>
  );
}
