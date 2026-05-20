const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('const [showVictory, setShowVictory]')) {
  content = content.replace(
    /const \[showTutorial, setShowTutorial\] = useState\(false\);/,
    "const [showTutorial, setShowTutorial] = useState(false);\n  const [showVictory, setShowVictory] = useState(false);"
  );
}

const victoryEffectCode = `
  // Victory condition check
  useEffect(() => {
    const todos = Object.values(completedTasks);
    if (todos.length > 0 && todos.every(Boolean) && !inLobby && !showCinematic) {
      if (!showVictory) {
        setShowVictory(true);
        synthSFX.playSuccess();
      }
    }
  }, [completedTasks, inLobby, showCinematic, showVictory]);
`;
if (!content.includes('// Victory condition check')) {
  content = content.replace(
    /const completedCount = Object\.values\(completedTasks\)\.filter\(Boolean\)\.length;/,
    victoryEffectCode + '\n  const completedCount = Object.values(completedTasks).filter(Boolean).length;'
  );
}

const victoryUICode = `
      {/* ==================================================== */}
      {/* 12. VICTORY CREWMATE OVERLAY */}
      {/* ==================================================== */}
      {showVictory && (
        <div className="fixed inset-0 z-[100] bg-[#000000e6] flex flex-col items-center justify-center animate-fadeIn select-none backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #1a9eff 0%, transparent 70%)' }}></div>
          <div className="text-[#38FEDE] text-4xl md:text-7xl font-black uppercase tracking-[0.1em] drop-shadow-[0_0_40px_rgba(56,254,222,0.8)] mb-8 z-10 animate-pulse" style={{ fontFamily: '"Press Start 2P"', textShadow: '4px 4px 0px #0b5030' }}>
            VICTORY
          </div>
          <div className="flex gap-4 mb-8 z-10">
            <CrewmateSprite color={playerColor} hat={playerHat} isMoving={false} size={120} direction="right" name="Ashfakh" />
          </div>
          <div className="bg-[#1a1a2e]/80 border-2 border-[#38FEDE] p-6 rounded-lg text-center shadow-[0_0_30px_rgba(56,254,222,0.2)] mb-8 max-w-sm z-10 backdrop-blur-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-[#38FEDE] opacity-50"></div>
            <p className="font-mono text-[#38FEDE] font-bold text-lg">ALL TASKS COMPLETED</p>
            <p className="text-gray-300 text-xs mt-2 font-mono">Impostors have been eliminated. The system is secure.</p>
          </div>
          <button 
            onClick={() => setShowVictory(false)}
            className="px-8 py-4 bg-[#1a9eff] text-white font-bold rounded-xl hover:bg-[#38FEDE] hover:text-black hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_#0d4d80] active:shadow-[0_2px_0_#0d4d80] active:translate-y-1 z-10 border-2 border-black tracking-widest uppercase text-[10px]"
            style={{ fontFamily: '"Press Start 2P"' }}
          >
            PLAY CONTINUOUSLY
          </button>
        </div>
      )}
`;
if (!content.includes('VICTORY CREWMATE OVERLAY')) {
  content = content.replace(
    /\{\/\* MAIN SYSTEM FOOTER STATUS \*\/\}/,
    victoryUICode + '\n      {/* MAIN SYSTEM FOOTER STATUS */}'
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log("Victory overlay added");
