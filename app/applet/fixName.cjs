const fs = require('fs');

const path = 'src/components/TaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace ASHFAKF M with ASHFAKH M
content = content.replace(/ASHFAKF M/g, 'ASHFAKH M');

// Replace FULL NAME with ASHFAKH M
content = content.replace(/CREWMATE:<\/span> FULL NAME/g, 'CREWMATE:</span> ASHFAKH M');

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed name in TaskModal.tsx");
