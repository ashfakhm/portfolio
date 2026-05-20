const fs = require('fs');

const path = 'src/components/TaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove imports
content = content.replace(/import DegreeCerts from '\.\/portfolio\/DegreeCerts';\n/, '');
content = content.replace(/import WorkExperience from '\.\/portfolio\/WorkExperience';\n/, '');
content = content.replace(/import Projects from '\.\/portfolio\/Projects';\n/, '');
content = content.replace(/import Achievements from '\.\/portfolio\/Achievements';\n/, '');

// Add auto-completion effect inside TaskModal
// Find `const [gameStarted, setGameStarted] = useState(false);`
const autoCompleteCode = `
  useEffect(() => {
    if (room === 'security' || room === 'cafeteria') {
      setTaskCompleted(true);
    }
  }, [room]);
`;
content = content.replace(
  /const \[gameStarted\, setGameStarted\] \= useState\(false\);/,
  `const [gameStarted, setGameStarted] = useState(false);\n${autoCompleteCode}`
);

// Replace <Achievements /> with Security Cameras Mockup
const securityCamerasCode = `
<div className="grid grid-cols-2 gap-2 h-full w-full p-2">
  <div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
    <div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]"><div className="w-2 h-2 rounded-full bg-red-500"></div> REC</div>
    <div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">CAFETERIA CCTV</div>
    <div className="w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>
    <span className="text-slate-600 text-xs font-mono">No signal</span>
  </div>
  <div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
    <div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]"><div className="w-2 h-2 rounded-full bg-red-500"></div> REC</div>
    <div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">ADMIN CCTV</div>
    <div className="w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>
    <span className="text-slate-600 text-xs font-mono">No signal</span>
  </div>
  <div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
    <div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]"><div className="w-2 h-2 rounded-full bg-red-500"></div> REC</div>
    <div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">O2 CCTV</div>
    <div className="w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>
    <span className="text-slate-600 text-xs font-mono">No signal</span>
  </div>
  <div className="bg-black border-2 border-slate-700 relative flex items-center justify-center overflow-hidden rounded">
    <div className="absolute top-2 left-2 text-red-500 animate-pulse font-mono flex items-center gap-1 text-[10px]"><div className="w-2 h-2 rounded-full bg-red-500"></div> REC</div>
    <div className="absolute bottom-2 left-2 text-white font-mono text-[10px]">SECURITY CCTV</div>
    <div className="w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)' }}></div>
    <span className="text-slate-600 text-xs font-mono">No signal</span>
  </div>
</div>
`;
content = content.replace(/<Achievements \/>/g, securityCamerasCode);

// Replace <Projects /> with Weapons screen Mockup
const projectsCode = `
<div className="flex-1 flex items-center justify-center text-green-400 font-mono flex-col gap-4">
  <div className="text-2xl font-bold tracking-widest text-[#38FEDE] animate-pulse">WEAPONS DEPLOYED</div>
  <div className="text-xs text-white/50 text-center max-w-sm">
    All targets successfully neutralized. Targeting systems are now offline pending next wave.
  </div>
</div>
`;
content = content.replace(/<Projects \/>/g, projectsCode);

// Replace <WorkExperience /> with Cafeteria Layout
const cafeteriaCode = `
<div className="flex-1 bg-[#1a1a2e] rounded-lg border border-white/10 p-4 font-mono overflow-y-auto w-full">
  <h3 className="text-[#38FEDE] text-lg font-bold border-b border-[#38FEDE]/30 pb-2 mb-4">DECK PROFILE / CAFETERIA</h3>
  <div className="flex flex-col gap-3 text-sm text-slate-300">
    <p><span className="text-blue-400 font-bold">CREWMATE:</span> FULL NAME</p>
    <p><span className="text-blue-400 font-bold">STATUS:</span> ACTIVE ORBIT</p>
    <p><span className="text-blue-400 font-bold">ROLE:</span> ENGINEER</p>
    <p><span className="text-blue-400 font-bold">KEY SKILLS:</span> REACT INTERFACES, SPACESHIP MAINTENANCE</p>
    <div className="border border-white/5 bg-black/30 p-2 mt-4 rounded">
      <span className="text-xs text-slate-500">PROFILE SCANNED. RECORD LOGGED SECURELY IN ARCHIVE.</span>
    </div>
  </div>
</div>
`;
content = content.replace(/<WorkExperience \/>/g, cafeteriaCode);
content = content.replace(/<DegreeCerts \/>/g, '');


fs.writeFileSync(path, content, 'utf8');
console.log("TaskModal updated");
