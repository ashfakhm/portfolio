const fs = require('fs');

const path = './src/components/TaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const importsToAdd = `import WorkExperience from './portfolio/WorkExperience';
import Projects from './portfolio/Projects';
import DegreeCerts from './portfolio/DegreeCerts';
import Achievements from './portfolio/Achievements';
`;

// Add imports
if (!content.includes('WorkExperience')) {
  // Find the last import
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\\n', lastImportIndex);
  content = content.slice(0, endOfLastImport + 1) + importsToAdd + content.slice(endOfLastImport + 1);
}

// 1. Replace Medbay's Degree & Certs with WorkExperience
// Between `) : (` and `</div>` for Medbay
const medbayStartContext = `{room === 'medbay' && (`;
if (content.includes(medbayStartContext)) {
  const t1 = content.split("room === 'medbay'");
  let medbayStr = t1[1];
  
  const scanIndex = medbayStr.indexOf("scanState !== 'completed' ? (");
  const elseIndex = medbayStr.indexOf(") : (", scanIndex);
  const medbayEndDiv = medbayStr.indexOf("</div>\\n          )}", elseIndex);

  const block1 = medbayStr.substring(0, elseIndex + 5);
  const replacement = `\\n                <WorkExperience />\\n              `;
  const block2 = medbayStr.substring(medbayEndDiv);

  t1[1] = block1 + replacement + block2;
  content = t1.join("room === 'medbay'");
}

// 2. Replace Weapons' Achievements with Projects
const weaponsStartContext = `{room === 'weapons' && (`;
if (content.includes(weaponsStartContext)) {
  const t1 = content.split("room === 'weapons'");
  let weaponsStr = t1[1];
  
  const astIndex = weaponsStr.indexOf("asteroidsShot < 5 ? (");
  const elseIndex = weaponsStr.indexOf(") : (", astIndex);
  const weaponsEndDiv = weaponsStr.indexOf("</div>\\n          )}", elseIndex);

  const block1 = weaponsStr.substring(0, elseIndex + 5);
  const replacement = `\\n                <Projects />\\n              `;
  const block2 = weaponsStr.substring(weaponsEndDiv);

  t1[1] = block1 + replacement + block2;
  content = t1.join("room === 'weapons'");
}

// 3. Replace Comms' Projects with DegreeCerts
const commsStartContext = `{room === 'comms' && (`;
if (content.includes(commsStartContext)) {
  const t1 = content.split("room === 'comms'");
  let commsStr = t1[1];
  
  const downIndex = commsStr.indexOf("downloadState !== 'completed' ? (");
  const elseIndex = commsStr.indexOf(") : (", downIndex);
  const commsEndDiv = commsStr.indexOf("</div>\\n          )}", elseIndex);

  const block1 = commsStr.substring(0, elseIndex + 5);
  const replacement = `\\n                <DegreeCerts />\\n              `;
  const block2 = commsStr.substring(commsEndDiv);

  t1[1] = block1 + replacement + block2;
  content = t1.join("room === 'comms'");
}

// 4. Replace Security's CCTV with Achievements
const securityStartContext = `{room === 'security' && (`;
if (content.includes(securityStartContext)) {
  const t1 = content.split("room === 'security'");
  let secStr = t1[1];
  
  const classIndex = secStr.indexOf('className="flex-1 flex flex-col gap-4"');
  const secEndDiv = secStr.indexOf("</div>\\n          )}", classIndex);

  const block1 = secStr.substring(0, classIndex + 39);
  const replacement = `>\\n              <Achievements />\\n            `;
  const block2 = secStr.substring(secEndDiv);

  t1[1] = block1 + replacement + block2;
  content = t1.join("room === 'security'");
}

fs.writeFileSync(path, content, 'utf8');

// Update gameConfig.js
let config = fs.readFileSync('./src/gameConfig.ts', 'utf8');
// To be safe, manual replace in gameConfig.ts instead of regex.
config = config.replace("section: 'Project Cards',\\n    cx: 605, // Comms", "section: 'Degree & Certs',\\n    cx: 605,");
config = config.replace("section: 'Degree & Certs',\\n    cx: 240, // Medbay", "section: 'Work Experience',\\n    cx: 240,");
config = config.replace("section: 'Target Shooter',\\n    cx: 690, // Weapons", "section: 'Project Cards',\\n    cx: 690,");
config = config.replace("section: 'Work Experience',\\n    cx: 220, // Security", "section: 'Achievements',\\n    cx: 220,");

fs.writeFileSync('./src/gameConfig.ts', config, 'utf8');

console.log("Done");
