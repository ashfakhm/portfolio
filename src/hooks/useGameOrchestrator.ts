import { useState } from "react";
import { FLOATING_VENTS, SPACESHIP_ROOMS } from "../gameConfig";
import { useEngineStore } from "../store/useEngineStore";
import { useGameStore } from "../store/useGameStore";
import { synthSFX } from "../utils/sound";

export function useGameOrchestrator() {
	const [impostorClickCount, setImpostorClickCount] = useState(0);

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
	} = useGameStore();

	const triggerModal = (roomId: string) => {
		setOpenModalRoom(roomId);
		synthSFX.playBeep();
	};

	const handleModalClose = (wasProductive = false) => {
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
	};

	const handleCrewClick = () => {
		const nextCount = impostorClickCount + 1;
		setImpostorClickCount(nextCount);
		if (nextCount >= 5) {
			setImpostorClickCount(0);
			setShowImpostorAlert(true);
			synthSFX.playImpostorJumpscare();
		} else {
			synthSFX.playBeep();
		}
	};

	const triggerVentTravel = (targetRoomId: string) => {
		const targetRoom = SPACESHIP_ROOMS[targetRoomId];
		if (!targetRoom || ventingStatus !== "idle") return;

		setVentMapOpen(false);
		synthSFX.playVentWhoosh();
		setVentingStatus("diving");
		const { setTargetPos, setPlayerPos } = useEngineStore.getState();
		setTargetPos(null);

		setTimeout(() => {
			const associatedVent = FLOATING_VENTS.find((v) => v.rx === targetRoomId);
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
	};

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
