const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const modify = (searchStr, replaceStr) => {
  if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
  } else {
    console.log("NOT FOUND:\n" + searchStr.substring(0, 50));
  }
}

// 1. MISSIONS LIST UI
modify(
  `<div className="bg-[#10102dcf] border-2 border-[#3a3a5e] p-3 rounded flex flex-col space-y-2 shadow-2xl font-mono text-xs relative overflow-hidden">`,
  `<div className="bg-[#0b0b14]/90 backdrop-blur-md border border-white/10 p-3.5 rounded-xl flex flex-col space-y-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] font-mono text-xs relative overflow-hidden ring-1 ring-inset ring-white/5">`
);

modify(
  `<div className="text-[#38FEDE] font-black tracking-wider uppercase border-b border-dashed border-[#3a3a5e] pb-1 font-mono text-[10px]">`,
  `<div className="text-[#38FEDE] font-black tracking-widest uppercase border-b flex items-center justify-between border-dashed border-white/10 pb-2 font-mono text-[10px]">`
);

// 2. HUD Buttons (Map, Chat, Sound)
// Top HUD icons container:
modify(
  `className="absolute top-2 right-3 pointer-events-auto flex flex-col items-end space-y-2"`,
  `className="absolute top-4 right-4 pointer-events-auto flex flex-col items-end space-y-3"`
);

// Holographic Map Button
modify(
  `className="p-2.5 bg-[#101026cf] border-2 border-[#1a9eff] hover:border-[#38FEDE] text-white hover:text-[#38FEDE] flex items-center justify-center gap-1.5 rounded-lg shadow-xl cursor-pointer transition-all active:scale-95"`,
  `className="px-4 py-2 bg-[#0b0b14]/90 backdrop-blur-md border border-[#1a9eff]/40 hover:border-[#38FEDE] hover:bg-[#1a9eff]/10 text-white hover:text-[#38FEDE] flex items-center justify-center gap-2 rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 ring-1 ring-inset ring-[#1a9eff]/20"`
);

// Chat Toggle Button
modify(
  `className={\`p-2.5 bg-[#101026cf] border-2 flex items-center justify-center gap-1.5 rounded-lg shadow-xl cursor-pointer transition-all active:scale-95 \${
                chatOpen ? 'border-green-500 text-green-400' : 'border-[#3a3a5e] hover:border-[#38FEDE]'
              }\`}`,
  `className={\`px-4 py-2 bg-[#0b0b14]/90 backdrop-blur-md flex items-center justify-center gap-2 rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 backdrop-blur-md \${
                chatOpen ? 'border-2 border-green-500/50 text-green-400 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border border-white/10 hover:border-white/30 text-white hover:bg-white/5 ring-1 ring-inset ring-white/5'
              }\`}`
);

// Sound Toggle Button
modify(
  `className="p-2 bg-[#101026cf] border-2 border-[#3a3a5e] hover:border-slate-500 text-slate-300 rounded shadow-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1 opacity-80 hover:opacity-100"`,
  `className="px-3 py-1.5 bg-[#0b0b14]/80 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/5 text-slate-300 rounded-lg shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 opacity-80 hover:opacity-100 text-[10px] font-mono tracking-wider"`
);

// Action Buttons: REPORT
modify(
  `className="px-3.5 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full border-4 border-black text-center font-bold text-[8px] tracking-widest uppercase shadow-[0_5px_0_#9a0a0a] active:translate-y-1"`,
  `className="p-3 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white rounded-2xl border-2 border-red-400/50 text-center shadow-[0_8px_0_#7f1d1d,auto_auto_30px_rgba(220,38,38,0.4)] active:shadow-[0_2px_0_#7f1d1d] active:translate-y-1.5 transition-all w-[100px] md:w-[120px] flex items-center justify-center relative"`
);

modify(
  `🚨 REPORT 🚨`,
  `<div className="flex flex-col items-center gap-1"><span className="text-red-200 text-[8px] tracking-[0.2em] mb-0 font-bold leading-none select-none">EMERGENCY</span><span className="font-bold text-[10px] md:text-sm tracking-widest uppercase leading-none select-none">REPORT</span></div>`
);

// Action Button: USE
modify(
  `className={\`py-4 px-6 md:py-4 md:px-8 rounded-full border-4 shadow-xl text-center cursor-pointer font-bold uppercase transition-all flex flex-col items-center justify-center \${
                  nearestRoom 
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-500 shadow-[0_6px_0_#b38b00] active:translate-y-1' 
                    : 'bg-zinc-800/60 text-zinc-600 border-zinc-700 cursor-not-allowed shadow-none'
                }\`}`,
  `className={\`p-4 rounded-2xl border-2 shadow-xl text-center cursor-pointer font-bold uppercase transition-all flex flex-col items-center justify-center relative overflow-hidden w-[120px] md:w-[140px] \${
                  nearestRoom 
                    ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 hover:from-yellow-200 hover:to-yellow-400 text-yellow-950 border-yellow-200 shadow-[0_8px_0_#b45309,auto_auto_30px_rgba(234,179,8,0.4)] active:shadow-[0_2px_0_#b45309] active:translate-y-1.5' 
                    : 'bg-[#1a1a24] text-slate-500 border-slate-700 cursor-not-allowed opacity-80 shadow-none'
                }\`}`
);
modify(`style={{ minWidth: '110px' }}`, ``);

// Task Progress Bar - sleek glow
modify(
  `className="w-full max-w-2xl mx-auto pointer-events-auto bg-[#101026df] border-2 border-[#3a3a5e] p-2 sm:p-2.5 rounded-lg flex flex-col space-y-1.5 shadow-xl"`,
  `className="w-full max-w-2xl mx-auto pointer-events-auto bg-[#0b0b14]/90 backdrop-blur-md border border-white/10 p-2 sm:p-2.5 rounded-2xl flex flex-col space-y-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/5"`
);

// Suit Designator Panel
modify(
  `className="bg-[#10102dcf] border-2 border-[#3a3a5e] p-3 rounded-lg flex items-center justify-between shadow-2xl transition-all"`,
  `className="bg-[#0b0b14]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-inset ring-white/5 transition-all"`
);

// Chat Modal
modify(
  `className="absolute top-20 right-3 bottom-28 w-80 bg-[#101026df] border-2 border-[#3a3a5e] rounded-xl shadow-2xl flex flex-col overflow-hidden z-20 font-mono transition-all"`,
  `className="absolute top-24 right-4 bottom-28 w-80 bg-[#0b0b14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden z-20 font-mono transition-all ring-1 ring-inset ring-white/10"`
);
modify(
  `className="bg-[#1c1c38] px-3 py-2 border-b border-[#3a3a5e] flex items-center justify-between text-xs font-bold"`,
  `className="bg-white/[0.03] px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs font-bold"`
);
modify(
  `className="flex-1 p-3 overflow-y-auto space-y-2 text-[11px] h-0"`,
  `className="flex-1 p-4 overflow-y-auto space-y-3 text-[11px] h-0"`
);
modify(
  `className="p-2 border-t border-[#3a3a5e] space-y-1 bg-[#090918]"`,
  `className="p-3 border-t border-white/10 space-y-1.5 bg-black/40"`
);
modify(
  `className="w-full bg-[#101026] text-white p-2 rounded border border-[#3a3a5e] focus:outline-none focus:border-[#1a9eff] transition-colors pr-8"`,
  `className="w-full bg-black/50 text-white p-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-[#1a9eff] transition-colors pr-10"`
);
modify(`? 'bg-[#1a9eff]/15 border border-[#1a9eff]/20 ml-auto' 
                      : 'bg-[#15152a] border border-[#3a3a5e]'`,
`? 'bg-[#1a9eff]/20 border border-[#1a9eff]/30 shadow-[#1a9eff]/10 shadow-sm ml-auto backdrop-blur-md rounded-2xl rounded-tr-sm px-3 py-2.5' 
                      : 'bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm'`);

fs.writeFileSync(path, content, 'utf8');
console.log("App.tsx modified");
