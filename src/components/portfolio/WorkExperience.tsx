import React from 'react';

export default function WorkExperience() {
  return (
    <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
      <div className="bg-[#1c1c2e] border-2 border-indigo-500/30 p-4 rounded-xl shadow-lg border-l-4 border-l-indigo-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
          <span className="font-bold text-indigo-400 font-mono tracking-widest text-sm">WORK EXPERIENCE PIPELINE</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">100% SECURE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mt-2">
        {[
          {
            id: 1,
            label: 'EXP 1',
            title: 'HIGH-EFFICIENCY VELOCITY',
            desc: 'Ashfakh regularly tests client loads. Implemented a Next.js App Router core engine scoring a perfect 100 SEO value on Chrome Lighthouse audit logs.',
            highlight: '🎯 Engineered Core Web Vitals (CWV) above 90+ threshold.',
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10 border-indigo-500/30'
          },
          {
            id: 2,
            label: 'EXP 2',
            title: 'BULLETPROOF PAYMENT SYSTEMS',
            desc: 'Constructed robust payment pipeline integrations (using Razorpay API blocks) supporting multi-layered checkout logic.',
            highlight: '🛡️ Forged highly idempotent webhook controllers.',
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10 border-yellow-400/30'
          },
          {
            id: 3,
            label: 'EXP 3',
            title: 'ARCHITECTURE INDEPENDENT',
            desc: 'Ashfakh works solo to formulate concept briefs into live, operational web platforms. Controls entire lifecycles under local parameters.',
            highlight: '📦 Shipped functional products solo successfully.',
            color: 'text-blue-400',
            bg: 'bg-blue-400/10 border-blue-400/30'
          },
          {
            id: 4,
            label: 'EXP 4',
            title: 'STRUCTURAL BLUEPRINTS',
            desc: 'Pre-structures files, draws logical schemas, and models databases efficiently. Prioritizes engineering safety from start to execution.',
            highlight: '📐 Pre-builds blueprints with thorough DFDs & ERDs.',
            color: 'text-[#38FEDE]',
            bg: 'bg-[#1a9eff]/10 border-[#1a9eff]/20'
          }
        ].map((cam, idx) => (
          <div key={cam.id} className="bg-[#12121e]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-indigo-500/40 hover:bg-[#1a1a2e] transition-all duration-300 group shadow-lg shadow-indigo-900/10">
            <div className="flex justify-between items-start text-[10px] text-gray-500 mb-3 font-bold tracking-widest uppercase pb-2 border-b border-white/5">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-50 group-hover:animate-ping group-hover:opacity-100" />
                {cam.label}
              </span>
              <span>2026</span>
            </div>

            <div className="flex-1 flex flex-col space-y-2 mt-2">
              <h4 className={`text-[13px] md:text-sm font-bold tracking-widest font-mono ${cam.color}`}>
                {cam.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                {cam.desc}
              </p>
              <div className={`mt-4 text-[10px] sm:text-[11px] p-2.5 rounded-md border font-mono ${cam.color} ${cam.bg} font-semibold shadow-sm w-fit`}>
                {cam.highlight}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
