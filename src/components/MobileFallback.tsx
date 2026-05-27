export default function MobileFallback() {
	return (
		<div className="fixed inset-0 bg-[#07070F] z-[100] flex flex-col items-center justify-center p-8 text-center select-none animate-fadeIn">
			<div className="size-16 mb-6 rounded-full bg-slate-900 border-2 border-dashed border-sky-400 flex items-center justify-center text-3xl animate-pulse">
				📱
			</div>
			<h2 className="text-[#38FEDE] text-sm font-bold uppercase tracking-widest mb-3 font-mono">
				Desktop Recommended
			</h2>
			<p className="text-[10px] text-slate-400 max-w-xs leading-relaxed font-mono uppercase tracking-[0.1em]">
				I am currently working on the mobile responsive layout. For now, please
				use a desktop, laptop, or PC.
			</p>
		</div>
	);
}
