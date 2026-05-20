import fs from 'fs';

const improveStyling = (filePath: string) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace default flat dark background with glassmorphism + glow effects
  content = content.replace(
    /className="bg-\[#1c1c2e\] border-2 border-amber-500\/30/g,
    'className="bg-amber-500/5 backdrop-blur-md border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
  );
  content = content.replace(
    /className="bg-\[#1c1c2e\] border-2 border-emerald-500\/30/g,
    'className="bg-emerald-500/5 backdrop-blur-md border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
  );
  content = content.replace(
    /className="bg-\[#1c1c2e\] border-2 border-rose-500\/30/g,
    'className="bg-rose-500/5 backdrop-blur-md border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
  );
  content = content.replace(
    /className="bg-\[#1c1c2e\] border-2 border-purple-500\/30/g,
    'className="bg-purple-500/5 backdrop-blur-md border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
  );

  // General Card Replacements
  content = content.replace(
    /bg-\[#0b0b14\] border border-\[#2a2a40\] p-5 rounded-xl/g,
    'bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:bg-white/[0.04]'
  );

  // WorkExp:
  content = content.replace(
    /className="bg-\[#0b0b14\] border border-\[#2a2a40\]/g,
    'className="bg-white/[0.02] backdrop-blur-xl border border-white/10'
  );
  // Remove duplicate hover:bg-[#121224] logic from the individual classes
  content = content.replace(/hover:bg-\[#121224\]/g, 'hover:bg-white/[0.04] hover:border-white/20');
  
  // Tag enhancements
  // Make tags look way more premium
  content = content.replace(
    /px-2 py-1 bg-\[#2a2a40\] text-slate-300 rounded font-mono border border-\[#3a3a5e\]/g,
    'px-2.5 py-1 bg-white/5 text-slate-200 rounded-md font-mono border border-white/10 shadow-sm'
  );
  
  fs.writeFileSync(filePath, content);
};

improveStyling('src/components/portfolio/WorkExperience.tsx');
improveStyling('src/components/portfolio/Projects.tsx');
improveStyling('src/components/portfolio/DegreeCerts.tsx');
improveStyling('src/components/portfolio/Achievements.tsx');

// TaskModal updates for glassmorphism
let tmContent = fs.readFileSync('src/components/TaskModal.tsx', 'utf8');

// The main TaskModal window padding and BG:
tmContent = tmContent.replace(
  `className="bg-[#101026] text-white rounded-lg shadow-2xl relative w-[95%] max-w-5xl h-[90vh] md:h-[80vh] flex flex-col border border-[#3a3a5e]"`,
  `className="bg-[#05050A]/90 backdrop-blur-xl text-white rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] relative w-[95%] max-w-5xl h-[90vh] md:h-[80vh] flex flex-col border border-white/10 ring-1 ring-white/5"`
);

// Header bar
tmContent = tmContent.replace(
  `className="bg-[#1a1a36] px-4 py-3 flex items-center justify-between border-b border-[#3a3a5e] shrink-0"`,
  `className="bg-white/[0.03] px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0"`
);

// Middle content area
tmContent = tmContent.replace(
  `className="bg-[#0d0d1a] border-y border-[#3a3a5e] mb-2 relative"`,
  `className="bg-black/40 border-y border-white/5 mb-4 relative overflow-hidden"`
);

// Close button
tmContent = tmContent.replace(
  `className="p-1 hover:bg-[#2a2a4a] rounded text-slate-400 hover:text-white transition-colors cursor-pointer"`,
  `className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors cursor-pointer"`
);

// Scan bar
tmContent = tmContent.replace(
  `className="h-full bg-[#1a9eff] shadow-[0_0_15px_#1a9eff]"`,
  `className="h-full bg-emerald-400 shadow-[0_0_20px_#34d399] transition-all"`
);
// Make scanner look premium
tmContent = tmContent.replace(
  `className="bg-[#101026] border border-[#3a3a5e] p-6 lg:p-10 text-center flex flex-col items-center justify-center space-y-6"`,
  `className="bg-white/[0.01] border border-white/5 p-6 lg:p-10 text-center flex flex-col items-center justify-center space-y-8 rounded-2xl backdrop-blur-md"`
);
tmContent = tmContent.replace(
  `className="w-full max-w-sm h-4 bg-[#1a1a36] rounded-full overflow-hidden border border-[#3a3a5e]"`,
  `className="w-full max-w-md h-3 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner"`
);

fs.writeFileSync('src/components/TaskModal.tsx', tmContent);
console.log('TaskModal and Portfolios UI updated to glassmorphism');
