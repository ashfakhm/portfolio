import { useEffect, useRef, useState } from "react";
import { synthSFX } from "../utils/sound";
import privacyPolicyMd from "../../privacy-policy.md?raw";
import termsOfServiceMd from "../../terms-of-service.md?raw";

interface LegalModalProps {
	isOpen: boolean;
	onClose: () => void;
	initialTab?: "privacy" | "terms";
}

interface ParsedLine {
	type: "h1" | "h2" | "h3" | "li" | "p" | "empty";
	text: string;
}

interface FormattedTextProps {
	text: string;
}

function FormattedText({ text }: FormattedTextProps) {
	const parts = text.split(/\*\*(.*?)\*\*/g);
	return (
		<>
			{parts.map((part, chunkId) => {
				if (chunkId % 2 === 1) {
					return (
						<strong key={`bold-${part.slice(0, 10)}-${chunkId}`} className="text-white font-extrabold">
							{part}
						</strong>
					);
				}
				return part;
			})}
		</>
	);
}

// fallow-ignore-next-line complexity
function classifyLine(line: string): ParsedLine {
	const trimmed = line.trim();
	if (trimmed === "") return { type: "empty", text: "" };
	if (trimmed.startsWith("# ")) return { type: "h1", text: trimmed.slice(2) };
	if (trimmed.startsWith("## ")) return { type: "h2", text: trimmed.slice(3) };
	if (trimmed.startsWith("### ")) return { type: "h3", text: trimmed.slice(4) };
	if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
		return { type: "li", text: trimmed.slice(2) };
	}
	return { type: "p", text: trimmed };
}

// fallow-ignore-next-line complexity
function renderLine(line: ParsedLine, key: string): React.ReactNode {
	switch (line.type) {
		case "h1":
			return (
				<h1 key={key} className="text-base md:text-lg font-bold font-sans text-brand-gold uppercase tracking-wider mt-6 mb-4 pb-2 border-b border-white/10">
					<FormattedText text={line.text} />
				</h1>
			);
		case "h2":
			return (
				<h2 key={key} className="text-xs md:text-sm font-bold font-sans text-[#38FEDE] uppercase tracking-wider mt-6 mb-3">
					<FormattedText text={line.text} />
				</h2>
			);
		case "h3":
			return (
				<h3 key={key} className="text-[10px] md:text-xs font-bold font-sans text-[#38FEDE]/80 uppercase mt-4 mb-2">
					<FormattedText text={line.text} />
				</h3>
			);
		case "p":
			return (
				<p key={key} className="text-[10px] md:text-[11px] text-slate-300 leading-relaxed mb-3.5">
					<FormattedText text={line.text} />
				</p>
			);
		default:
			return null;
	}
}

function parseMarkdown(md: string): React.ReactNode[] {
	const lines = md.split("\n").map(classifyLine);
	const elements: React.ReactNode[] = [];
	let listBuffer: ParsedLine[] = [];
	let keyCounter = 0;

	const flushListBuffer = () => {
		if (listBuffer.length === 0) return;
		elements.push(
			<ul key={`list-${keyCounter++}`} className="list-inside list-disc pl-4 space-y-2 mb-4">
				{listBuffer.map((item, itemId) => (
					<li key={`li-${item.text.slice(0, 16)}-${itemId}`} className="text-[10px] md:text-[11px] text-slate-300 leading-relaxed pl-1">
						<FormattedText text={item.text} />
					</li>
				))}
			</ul>
		);
		listBuffer = [];
	};

	for (const line of lines) {
		if (line.type === "li") {
			listBuffer.push(line);
		} else {
			flushListBuffer();
			const rendered = renderLine(line, `el-${keyCounter++}`);
			if (rendered) elements.push(rendered);
		}
	}
	flushListBuffer();
	return elements;
}

// fallow-ignore-next-line complexity
export default function LegalModal({ isOpen, onClose, initialTab = "privacy" }: LegalModalProps) {
	const [activeTab, setActiveTab] = useState<"privacy" | "terms">(initialTab);

	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onCloseRef.current();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	if (!isOpen) return null;

	const markdownContent = activeTab === "privacy" ? privacyPolicyMd : termsOfServiceMd;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
			<div
				className="w-full max-w-2xl h-[80vh] bg-[#09090f]/90 backdrop-blur-3xl border border-white/10 rounded-[24px] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.6)] relative overflow-hidden ring-1 ring-inset ring-white/5"
				style={{ textShadow: "none" }}
			>
				{/* Circular red X close button (Among Us Style matching TaskModal) */}
				<button
					type="button"
					onClick={() => {
						onClose();
						synthSFX.playBeep();
					}}
					aria-label="Close legal documents modal"
					className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-9 h-9 md:w-11 md:h-11 bg-red-600 border-2 border-red-400/50 rounded-full flex items-center justify-center text-white z-50 shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 cursor-pointer hover:bg-red-500 transition-all"
				>
					<div className="size-5 relative">
						<div className="absolute top-1/2 left-0 w-full h-1 bg-white -translate-y-1/2 rotate-45 rounded-sm" />
						<div className="absolute top-1/2 left-0 w-full h-1 bg-white -translate-y-1/2 -rotate-45 rounded-sm" />
					</div>
				</button>

				{/* Header Tabs */}
				<div className="flex items-center px-6 py-3.5 bg-slate-950/40 border-b border-white/5 pr-14 select-none">
					<div className="flex gap-5">
						<button
							type="button"
							onClick={() => {
								setActiveTab("privacy");
								synthSFX.playBeep();
							}}
							className={`text-[8px] md:text-[9px] font-black uppercase tracking-wider py-1 border-b-2 transition-all ${
								activeTab === "privacy"
									? "text-[#38FEDE] border-[#38FEDE]"
									: "text-slate-400 border-transparent hover:text-slate-200"
							}`}
							style={{ fontFamily: '"Press Start 2P"' }}
						>
							PRIVACY POLICY
						</button>
						<button
							type="button"
							onClick={() => {
								setActiveTab("terms");
								synthSFX.playBeep();
							}}
							className={`text-[8px] md:text-[9px] font-black uppercase tracking-wider py-1 border-b-2 transition-all ${
								activeTab === "terms"
									? "text-[#38FEDE] border-[#38FEDE]"
									: "text-slate-400 border-transparent hover:text-slate-200"
							}`}
							style={{ fontFamily: '"Press Start 2P"' }}
						>
							TERMS OF SERVICE
						</button>
					</div>
				</div>

				{/* Document Content */}
				<div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-left select-text">
					<div className="max-w-none">
						{parseMarkdown(markdownContent)}
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-3 bg-slate-950/60 border-t border-white/5 flex items-center justify-between text-[8px] text-slate-500 font-mono select-none">
					<span>SECURE SHIELD v1.0 // ACTIVE</span>
					<span>PRESS ESC TO CLOSE</span>
				</div>
			</div>
		</div>
	);
}
