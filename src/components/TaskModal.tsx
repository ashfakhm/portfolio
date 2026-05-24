import { useEffect, useState } from "react";
import type { CrewmateColor } from "./CrewmateSprite";
import AdminTask from "./tasks/AdminTask";
import CafeteriaTask from "./tasks/CafeteriaTask";
import CommsTask from "./tasks/CommsTask";
import ElectricalTask from "./tasks/ElectricalTask";
import EmergencyTask from "./tasks/EmergencyTask";
import MedbayTask from "./tasks/MedbayTask";
import NavigationTask from "./tasks/NavigationTask";
import ReactorTask from "./tasks/ReactorTask";
import SecurityTask from "./tasks/SecurityTask";
import ShieldsTask from "./tasks/ShieldsTask";
import StorageTask from "./tasks/StorageTask";
import WeaponsTask from "./tasks/WeaponsTask";

interface TaskModalProps {
	room: string;
	onClose: (wasCompleted: boolean) => void;
	playerColor: CrewmateColor;
}

export default function TaskModal({
	room,
	onClose,
	playerColor,
}: TaskModalProps) {
	const [taskCompleted, setTaskCompleted] = useState(
		room === "cafeteria" || room === "security",
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose(taskCompleted);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose, taskCompleted]);

	const forceCompleteTask = () => {
		setTaskCompleted(true);
	};

	const getTaskContent = () => {
		switch (room) {
			case "cafeteria":
				return (
					<CafeteriaTask
						onComplete={() => setTaskCompleted(true)}
						playerColor={playerColor}
					/>
				);
			case "reactor":
				return (
					<ReactorTask
						onComplete={() => setTaskCompleted(true)}
						isCompleted={taskCompleted}
					/>
				);
			case "admin":
				return (
					<AdminTask
						onComplete={() => setTaskCompleted(true)}
						isCompleted={taskCompleted}
					/>
				);
			case "comms":
				return (
					<CommsTask
						onComplete={() => setTaskCompleted(true)}
						isCompleted={taskCompleted}
					/>
				);
			case "medbay":
				return (
					<MedbayTask
						onComplete={() => setTaskCompleted(true)}
						isCompleted={taskCompleted}
						playerColor={playerColor}
					/>
				);
			case "security":
				return <SecurityTask onComplete={() => setTaskCompleted(true)} />;
			case "emergency":
				return (
					<EmergencyTask
						onComplete={() => setTaskCompleted(true)}
						playerColor={playerColor}
					/>
				);
			case "storage":
				return (
					<StorageTask
						onComplete={() => setTaskCompleted(true)}
						isCompleted={taskCompleted}
					/>
				);
			case "weapons":
				return (
					<WeaponsTask
						onComplete={() => setTaskCompleted(true)}
						isCompleted={taskCompleted}
					/>
				);
			case "electrical":
				return (
					<ElectricalTask
						onComplete={() => setTaskCompleted(true)}
						isCompleted={taskCompleted}
					/>
				);
			case "navigation":
				return (
					<NavigationTask
						onComplete={() => setTaskCompleted(true)}
						isCompleted={taskCompleted}
					/>
				);
			case "shields":
				return (
					<ShieldsTask
						onComplete={() => setTaskCompleted(true)}
						isCompleted={taskCompleted}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
			<div
				id="task-inner-box"
				className="w-full max-w-4xl bg-[#09090f]/80 backdrop-blur-3xl border border-white/10 rounded-[20px] md:rounded-[32px] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] relative select-none ring-1 ring-inset ring-white/5"
				style={{ height: "min(90vh, 700px)" }}
			>
				{/* Simple red X close button (Among Us Style) */}
				<button
					onClick={() => onClose(taskCompleted)}
					className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 bg-red-600 border-2 border-red-400/50 rounded-full flex items-center justify-center text-white z-50 shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 cursor-pointer hover:bg-red-500 transition-all"
				>
					<div className="w-6 h-6 relative">
						<div className="absolute top-1/2 left-0 w-full h-1.5 bg-white -translate-y-1/2 rotate-45 rounded-sm" />
						<div className="absolute top-1/2 left-0 w-full h-1.5 bg-white -translate-y-1/2 -rotate-45 rounded-sm" />
					</div>
				</button>

				{/* Modal Inner Main area */}
				<div className="flex-1 overflow-y-auto flex flex-col font-mono relative bg-transparent rounded-[20px] m-4 overflow-hidden border border-white/5">
					{/* SKIP MINI-GAME BUTTON */}
					{!taskCompleted &&
						room !== "security" &&
						room !== "cafeteria" &&
						room !== "emergency" && (
							<button
								onClick={forceCompleteTask}
								className="absolute top-2 right-2 z-10 text-[10px] text-gray-400 hover:text-green-400 border border-[#3a3a5e] hover:border-green-500/50 bg-[#1a1a2e] px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1"
							>
								<span>Skip Task Game Quick-Unlock</span>
							</button>
						)}

					{getTaskContent()}
				</div>
			</div>
		</div>
	);
}
