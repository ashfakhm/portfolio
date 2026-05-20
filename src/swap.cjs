const fs = require('fs');

const path = 'src/components/TaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const importsToAdd = `import WorkExperience from './portfolio/WorkExperience';
import Projects from './portfolio/Projects';
import DegreeCerts from './portfolio/DegreeCerts';
import Achievements from './portfolio/Achievements';
`;

if (!content.includes('WorkExperience')) {
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, endOfLastImport + 1) + importsToAdd + content.slice(endOfLastImport + 1);
}

const replaceSection = (roomStr, condStr, componentStr) => {
  const ctx = `{room === '${roomStr}' && (`;
  if (!content.includes(ctx)) return;
  const t1 = content.split(`room === '${roomStr}'`);
  let str = t1[1];
  
  const scanIndex = str.indexOf(condStr);
  if (scanIndex === -1) return;
  
  const elseIndex = str.indexOf(") : (", scanIndex);
  const endDiv = str.indexOf("</div>\n          )}", elseIndex);

  const block1 = str.substring(0, elseIndex + 5);
  const replacement = `\n                ${componentStr}\n              `;
  const block2 = str.substring(endDiv);

  t1[1] = block1 + replacement + block2;
  content = t1.join(`room === '${roomStr}'`);
};

// Undo previous partial attempt if any by reloading? No, let's just make it robust.
// medbay
replaceSection('medbay', "scanState !== 'completed' ? (", '<WorkExperience />');
// weapons
replaceSection('weapons', "asteroidsShot < 5 ? (", '<Projects />');
// comms
replaceSection('comms', "downloadState !== 'completed' ? (", '<DegreeCerts />');

// security
const secCtx = `{room === 'security' && (`;
if (content.includes(secCtx)) {
  const t1 = content.split("room === 'security'");
  let secStr = t1[1];
  
  const classIndex = secStr.indexOf('className="flex-1 flex flex-col gap-4"');
  if(classIndex > -1){
      const secEndDiv = secStr.indexOf("</div>\n          )}", classIndex);
      const block1 = secStr.substring(0, classIndex + 39);
      const replacement = `>\n              <Achievements />\n            `;
      const block2 = secStr.substring(secEndDiv);

      t1[1] = block1 + replacement + block2;
      content = t1.join("room === 'security'");
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Script completed');
