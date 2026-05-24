import { ChevronRight, Send, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { ChatMessage } from "../gameConfig";
import { useGameStore } from "../store/useGameStore";
import { synthSFX } from "../utils/sound";
import { CREWMATE_COLORS, type CrewmateColor } from "./CrewmateSprite";

const chatPresets = [
	{ text: "Who is the Boogeyman?", q: "impostor" },
	{ text: "Am I safe?", q: "safe" },
	{ text: "Show skills pass!", q: "skills" },
	{ text: "Any live code?", q: "code" },
];

export default function ChatSystem() {
	const {
		chatOpen,
		setChatOpen,
		showCinematic,
		playerColor,
		chatMessages,
		setChatMessages,
	} = useGameStore();

	const [customMessage, setCustomMessage] = useState("");

	const handleSendPreset = (preset: { text: string; q: string }) => {
		synthSFX.playBeep();
		const newUserMsg: ChatMessage = {
			id: String(Date.now()),
			senderName: "You",
			senderColor: playerColor,
			message: preset.text,
		};
		setChatMessages((prev) => [...prev, newUserMsg]);

		setTimeout(() => {
			let reply = "Unsure coordinate.";
			let responderName = "Lieutenant Lime";
			let responderColor: CrewmateColor = "lime";

			if (preset.q === "impostor") {
				reply =
					"There is 1 Boogeyman, but you are safe. You are doing Next.js tasks!";
				responderName = "Orange Buddy";
				responderColor = "orange";
			} else if (preset.q === "safe") {
				reply =
					"Saw you in Medbay scanner. BSc CS Farook College Class of '26 validated!";
				responderName = "Captain Blue";
				responderColor = "blue";
			} else if (preset.q === "skills") {
				reply =
					"Go check Admin. Cards show full Next.js, FastAPI, Prisma, PostgreSQL!";
				responderName = "Pink Lady";
				responderColor = "pink";
			} else if (preset.q === "code") {
				reply =
					"Check Comms dish! Decrypted download lists LaundryEase & E-Quiz platforms.";
				responderName = "Yellow Ace";
				responderColor = "yellow";
			}

			setChatMessages((prev) => [
				...prev,
				{
					id: String(Date.now() + 1),
					senderName: responderName,
					senderColor: responderColor,
					message: reply,
				},
			]);
		}, 900);
	};

	const handleSendCustomMessage = (e: React.FormEvent) => {
		e.preventDefault();
		if (!customMessage.trim()) return;

		const msgText = customMessage;
		setCustomMessage("");
		synthSFX.playBeep();

		const newUserMsg: ChatMessage = {
			id: String(Date.now()),
			senderName: "You",
			senderColor: playerColor,
			message: msgText,
		};
		setChatMessages((prev) => [...prev, newUserMsg]);

		setTimeout(() => {
			const answers = [
				"Sounds good! Complete your tasks to unlock all portfolio sections.",
				"Red is definitely clean! I saw him coding all day.",
				"Your Lighthouse performance is literally meta.",
				"Yes! Let's clear the cafeteria terminal. Tap Emergency to contact him!",
			];
			const names: { n: string; c: CrewmateColor }[] = [
				{ n: "Orange Buddy", c: "orange" },
				{ n: "Captain Blue", c: "blue" },
				{ n: "Yellow Ace", c: "yellow" },
				{ n: "Pink Lady", c: "pink" },
			];
			const pick = Math.floor(Math.random() * answers.length);

			setChatMessages((prev) => [
				...prev,
				{
					id: String(Date.now() + 1),
					senderName: names[pick].n,
					senderColor: names[pick].c,
					message: answers[pick],
				},
			]);
		}, 1000);
	};

	if (!chatOpen || showCinematic) return null;

	return (
		<div className="absolute top-16 right-3 bottom-20 sm:top-24 sm:right-4 sm:bottom-28 w-64 sm:w-80 bg-hud-bg/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden z-20 font-mono transition-all ring-1 ring-inset ring-white/10">
			<div className="bg-white/[0.03] px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs font-bold">
				<span className="text-brand-cyan flex items-center gap-1">
					💬 COCKPIT CREW LOGS
				</span>
				<button
					onClick={() => setChatOpen(false)}
					className="text-gray-400 hover:text-white"
				>
					<X size={16} />
				</button>
			</div>

			<div className="flex-1 p-4 overflow-y-auto space-y-3 text-[11px] h-0">
				{chatMessages.map((msg) => (
					<div
						key={msg.id}
						className={`p-2 rounded max-w-[90%] ${
							msg.isSystem
								? "bg-neutral-900/60 border border-dashed border-slate-800 text-brand-cyan mx-auto text-center"
								: msg.senderName === "You"
									? "bg-brand-blue/20 border border-brand-blue/30 shadow-brand-blue/10 shadow-sm ml-auto backdrop-blur-md rounded-2xl rounded-tr-sm px-3 py-2.5"
									: "bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm"
						}`}
					>
						{!msg.isSystem && (
							<div className="flex items-center gap-1 font-bold mb-0.5">
								<span
									className="w-1.5 h-1.5 rounded-full"
									style={{
										backgroundColor:
											CREWMATE_COLORS[msg.senderColor]?.fill || "#FFF",
									}}
								/>
								<span
									style={{
										color: CREWMATE_COLORS[msg.senderColor]?.fill || "#FFF",
									}}
								>
									{msg.senderName}
								</span>
							</div>
						)}
						<p className="text-gray-200 font-mono leading-normal">
							{msg.message}
						</p>
					</div>
				))}
			</div>

			<div className="p-3 border-t border-white/10 space-y-1.5 bg-black/40">
				<span className="text-[8px] text-slate-500 uppercase font-black block pl-1">
					Preset Crew Messages:
				</span>
				<div className="grid grid-cols-2 gap-1 text-[9px]">
					{chatPresets.map((p, idx) => (
						<button
							key={idx}
							onClick={() => handleSendPreset(p)}
							className="p-1.5 border border-white/5 hover:border-brand-blue/50 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 text-left truncate cursor-pointer transition-all hover:text-white flex items-center gap-1"
						>
							<ChevronRight size={10} className="text-brand-blue" /> {p.text}
						</button>
					))}
				</div>
			</div>

			<form
				onSubmit={handleSendCustomMessage}
				className="p-3 bg-white/[0.02] border-t border-white/10 flex gap-2"
			>
				<input
					type="text"
					value={customMessage}
					onChange={(e) => setCustomMessage(e.target.value)}
					placeholder="Send coordinate log..."
					className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-blue focus:bg-white/5 transition-colors"
				/>
				<button
					type="submit"
					className="p-2 rounded-lg bg-brand-blue/80 hover:bg-brand-cyan text-white hover:text-black transition-all border border-brand-blue/50 hover:border-transparent flex items-center justify-center"
				>
					<Send size={14} />
				</button>
			</form>
		</div>
	);
}
