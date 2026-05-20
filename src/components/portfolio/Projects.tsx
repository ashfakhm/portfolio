import React from 'react';

export default function Projects() {
  return (
    <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
      <div className="bg-rose-500/5 backdrop-blur-md border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)] p-4 rounded-xl shadow-lg border-l-4 border-l-rose-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-bold text-rose-400 font-mono tracking-widest text-sm">PROJECT CATALOG</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">ENCRYPTED</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mt-2">
        {/* Project 1 */}
        <div className="bg-[#12121e]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-rose-500/40 hover:bg-[#1a1a2e] transition-all duration-300 group shadow-lg shadow-rose-900/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start text-[10px] text-gray-500 mb-3 font-bold tracking-widest uppercase pb-2 border-b border-white/5">
              <span>PROJECT_ALPHA</span>
              <span>LIVE</span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono tracking-wider group-hover:text-rose-400 transition-colors">E-Quiz Platform</h3>
            <p className="text-xs text-slate-400 leading-relaxed min-h-[60px]">
              A complete online examination ecosystem built with Next.js App Router and Django Rest Framework. Included secure user sessions, robust timer states, and anti-cheat tracking.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2.5 py-1 bg-white/10 text-slate-100 rounded-md font-mono border border-white/20 shadow-sm">Next.js</span>
              <span className="px-2 py-1 bg-blue-500/10 rounded text-blue-400 border border-blue-500/20">Django DRF</span>
              <span className="px-2 py-1 bg-green-500/10 rounded text-green-400 border border-green-500/20">PostgreSQL</span>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-rose-500/10 flex justify-between font-mono text-[10px] items-center">
            <span className="text-rose-400">STATUS: DEPLOYED</span>
            <a href="#" className="hover:text-white text-slate-500 transition-colors flex items-center gap-1 group-hover:underline">
              View Node ↗
            </a>
          </div>
        </div>

        {/* Project 2 */}
        <div className="bg-[#12121e]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-orange-500/40 hover:bg-[#1a1a2e] transition-all duration-300 group shadow-lg shadow-orange-900/10 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start text-[10px] text-gray-500 mb-3 font-bold tracking-widest uppercase pb-2 border-b border-white/5">
              <span>PROJECT_BETA</span>
              <span>LIVE</span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono tracking-wider group-hover:text-orange-400 transition-colors">LaundryEase SaaS</h3>
            <p className="text-xs text-slate-400 leading-relaxed min-h-[60px]">
              Digital transformation for physical laundry shops. Full POS system, order tracking, SMS alerts, and deep Razorpay integration for fast physical/online checkout syncing.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2.5 py-1 bg-white/10 text-slate-100 rounded-md font-mono border border-white/20 shadow-sm">React</span>
              <span className="px-2 py-1 bg-yellow-500/10 rounded text-yellow-400 border border-yellow-500/20">Razorpay API</span>
              <span className="px-2 py-1 bg-[#38FEDE]/10 rounded text-[#38FEDE] border border-[#38FEDE]/20">FastAPI</span>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-orange-500/10 flex justify-between font-mono text-[10px] items-center">
             <span className="text-orange-400">STATUS: SECURED</span>
             <a href="#" className="hover:text-white text-slate-500 transition-colors flex items-center gap-1 group-hover:underline">
              View Node ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
