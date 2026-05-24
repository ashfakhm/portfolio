export default function Achievements() {
	return (
		<div className="flex-1 flex flex-col gap-4 animate-fadeIn">
			<div className="bg-amber-500/5 backdrop-blur-md border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] p-4 rounded-xl shadow-lg border-l-4 border-l-amber-500 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
					<span className="font-bold text-amber-400 font-mono tracking-widest text-sm">
						ARCHIVE RECORDS OPENED
					</span>
				</div>
				<span className="text-xs text-slate-400 font-mono">100% UNLOCKED</span>
			</div>

			<div className="grid grid-cols-1 gap-4 flex-1 mt-2">
				{/* Achievements Item 1 */}
				<div className="bg-[#12121e]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-amber-500/40 hover:bg-[#1a1a2e] transition-all duration-300 group shadow-lg shadow-amber-900/10 flex flex-col justify-between">
					<div className="space-y-4">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-2xl transform group-hover:scale-110 transition-transform">
								⚙️
							</span>
							<h4 className="text-sm font-black text-amber-400 uppercase tracking-widest font-mono">
								Performance Optimization
							</h4>
						</div>
						<p className="text-xs text-slate-300 leading-relaxed font-sans max-w-3xl">
							Achieved a perfect 100 SEO score and 90+ Core Web Vitals (verified
							via Chrome DevTools) for the Quiz Platform by leveraging Next.js
							Server-Side Rendering (SSR) and fine-tuning metadata.
						</p>
						<div className="flex flex-wrap gap-2 text-[10px] font-mono mt-4">
							<span className="px-2.5 py-1 bg-white/10 text-slate-100 rounded-md font-mono border border-white/20 shadow-sm">
								Next.js
							</span>
							<span className="px-2.5 py-1 bg-white/10 text-slate-100 rounded-md font-mono border border-white/20 shadow-sm">
								SEO
							</span>
							<span className="px-2 py-1 bg-amber-500/10 rounded text-amber-400 border border-amber-500/20">
								Web Vitals
							</span>
						</div>
					</div>
					<div className="mt-6 pt-3 border-t border-amber-500/10 flex justify-between font-mono text-[10px] items-center">
						<span className="text-amber-400">STATUS: RECOGNIZED</span>
					</div>
				</div>

				{/* Achievements Item 2 */}
				<a
					href="https://www.coursera.org/account/accomplishments/specialization/1NT0M98IZUEU"
					target="_blank"
					rel="noopener noreferrer"
					className="bg-[#12121e]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-cyan-500/40 hover:bg-[#1a1a2e] transition-all duration-300 group shadow-lg shadow-cyan-900/10 flex flex-col justify-between cursor-pointer block"
				>
					<div className="space-y-4">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-2xl transform group-hover:scale-110 transition-transform">
								📜
							</span>
							<h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest font-mono">
								META FRONT-END BADGE
							</h4>
						</div>
						<p className="text-xs text-slate-300 leading-relaxed font-sans max-w-3xl">
							Earned official certification after rigorous testing parameters.
							Covers modern viewport states, UI design principles, responsive
							flex grid structures, and accessibility mandates.
						</p>
						<div className="flex flex-wrap gap-2 text-[10px] font-mono mt-4">
							<span className="px-2.5 py-1 bg-white/10 text-slate-100 rounded-md font-mono border border-white/20 shadow-sm">
								React
							</span>
							<span className="px-2.5 py-1 bg-white/10 text-slate-100 rounded-md font-mono border border-white/20 shadow-sm">
								UI/UX
							</span>
							<span className="px-2 py-1 bg-cyan-500/10 rounded text-cyan-400 border border-cyan-500/20">
								Verify 1NT0M98IZUEU ↗
							</span>
						</div>
					</div>
					<div className="mt-6 pt-3 border-t border-cyan-500/10 flex justify-between font-mono text-[10px] items-center">
						<span className="text-cyan-400">STATUS: SECURE</span>
					</div>
				</a>
			</div>
		</div>
	);
}
