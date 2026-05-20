const fs = require('fs');
const path = require('path');

const improveStyling = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log("File not found: " + filePath);
    return;
  }
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
    /bg-\[#0b0b14\] border border-\[#2a2a40\] rounded-xl p-5 hover:border-([a-z]+)-500\/50 hover:bg-\[#121224\] transition-all group shadow-md shadow-([a-z]+)-900\/10/g,
    'bg-[#12121e]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-$1-500/40 hover:bg-[#1a1a2e] transition-all duration-300 group shadow-lg shadow-$2-900/5'
  );

  content = content.replace(
    /className="bg-\[#0b0b14\] border border-\[#2a2a40\]/g,
    'className="bg-[#12121e]/90 backdrop-blur-xl border border-white/5'
  );
  // Remove duplicate hover:bg-[#121224] logic from the individual classes
  content = content.replace(/hover:bg-\[#121224\]/g, 'hover:bg-[#1a1a2e] hover:border-white/10');
  
  // Tag enhancements
  // Make tags look way more premium
  content = content.replace(
    /px-2 py-1 bg-white\/5 rounded text-white border border-white\/10/g,
    'px-2.5 py-1 bg-white/10 text-slate-100 rounded-md font-mono border border-white/20 shadow-sm'
  );
  
  fs.writeFileSync(filePath, content);
  console.log("Updated: " + filePath);
};

improveStyling(path.join(__dirname, 'components/portfolio/WorkExperience.tsx'));
improveStyling(path.join(__dirname, 'components/portfolio/Projects.tsx'));
improveStyling(path.join(__dirname, 'components/portfolio/DegreeCerts.tsx'));
improveStyling(path.join(__dirname, 'components/portfolio/Achievements.tsx'));
