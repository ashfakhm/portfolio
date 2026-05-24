import { useCallback, useState } from "react";
import { FLOATING_VENTS, SPACESHIP_ROOMS } from "../gameConfig";
import { useShallow } from "zustand/react/shallow";
import { useEngineStore } from "../store/useEngineStore";
import { useGameStore } from "../store/useGameStore";
import { synthSFX } from "../utils/sound";

export function useGameOrchestrator() {
  const [, setImpostorClickCount] = useState(0);

  const {
    openModalRoom,
    setOpenModalRoom,
    ventMapOpen,
    setVentMapOpen,
    ventingStatus,
    setVentingStatus,
    showTaskCompletedBanner,
    setShowTaskCompletedBanner,
    setCompletedTasks,
    setShowImpostorAlert,
    setChatMessages,
  } = useGameStore(
    useShallow((state) => ({
      openModalRoom: state.openModalRoom,
      setOpenModalRoom: state.setOpenModalRoom,
      ventMapOpen: state.ventMapOpen,
      setVentMapOpen: state.setVentMapOpen,
      ventingStatus: state.ventingStatus,
      setVentingStatus: state.setVentingStatus,
      showTaskCompletedBanner: state.showTaskCompletedBanner,
      setShowTaskCompletedBanner: state.setShowTaskCompletedBanner,
      setCompletedTasks: state.setCompletedTasks,
      setShowImpostorAlert: state.setShowImpostorAlert,
      setChatMessages: state.setChatMessages,
    })),
  );

  const triggerModal = useCallback(
    (roomId: string) => {
      setOpenModalRoom(roomId);
      synthSFX.playBeep();
    },
    [setOpenModalRoom],
  );

  const handleModalClose = useCallback(
    (wasProductive = false) => {
      if (openModalRoom) {
        if (wasProductive) {
          setCompletedTasks((prev) => ({ ...prev, [openModalRoom]: true }));
          synthSFX.playSuccess();
          const completedRoomInfo = SPACESHIP_ROOMS[openModalRoom];
          if (completedRoomInfo) {
            setShowTaskCompletedBanner(completedRoomInfo.name);
            setTimeout(() => {
              setShowTaskCompletedBanner(null);
            }, 3000);

            setChatMessages((prev) => [
              ...prev,
              {
                id: String(Date.now()),
                senderName: "SYSTEM LOG",
                senderColor: "white",
                message: `★ You stabilized node: ${completedRoomInfo.name}`,
                isSystem: true,
              },
            ]);
          }
        }
      }
      setOpenModalRoom(null);
    },
    [
      openModalRoom,
      setCompletedTasks,
      setShowTaskCompletedBanner,
      setChatMessages,
      setOpenModalRoom,
    ],
  );

  const handleCrewClick = useCallback(() => {
    setImpostorClickCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= 5) {
        setShowImpostorAlert(true);
        synthSFX.playImpostorJumpscare();
        return 0;
      } else {
        synthSFX.playBeep();
        return nextCount;
      }
    });
  }, [setShowImpostorAlert]);

  const triggerVentTravel = useCallback(
    (targetRoomId: string) => {
      const targetRoom = SPACESHIP_ROOMS[targetRoomId];
      if (!targetRoom || ventingStatus !== "idle") return;

      setVentMapOpen(false);
      synthSFX.playVentWhoosh();
      setVentingStatus("diving");
      const { setTargetPos, setPlayerPos } = useEngineStore.getState();
      setTargetPos(null);

      setTimeout(() => {
        const associatedVent = FLOATING_VENTS.find(
          (v) => v.rx === targetRoomId,
        );
        if (associatedVent) {
          setPlayerPos({ x: associatedVent.x, y: associatedVent.y });
        } else {
          setPlayerPos({ x: targetRoom.cx, y: targetRoom.cy + 30 });
        }
        setVentingStatus("emerging");

        setTimeout(() => {
          setVentingStatus("idle");
        }, 500);

        setChatMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            senderName: "SENSOR LOG",
            senderColor: "white",
            message: `⚠ Ventilation activity detected near ${targetRoom.name}`,
            isSystem: true,
          },
        ]);
      }, 500);
    },
    [ventingStatus, setVentMapOpen, setVentingStatus, setChatMessages],
  );

  return {
    openModalRoom,
    setOpenModalRoom,
    ventMapOpen,
    setVentMapOpen,
    ventingStatus,
    setVentingStatus,
    showTaskCompletedBanner,
    setShowTaskCompletedBanner,
    triggerModal,
    handleModalClose,
    handleCrewClick,
    triggerVentTravel,
  };
}
