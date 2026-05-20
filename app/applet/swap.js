const fs = require('fs');

const path = './src/components/TaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// The goal is to swap the 'post task' JSX content logic 
// We will replace the room conditions in the JSX.
// Medbay -> Work Experience
// Weapons -> Projects
// Security -> Certs
// Comms -> Achievements (Target shooter post)

content = content.replace(/room === 'medbay'/g, "room === 'TEMP_MEDBAY'");
content = content.replace(/room === 'security'/g, "room === 'medbay'"); // Experience goes to medbay
content = content.replace(/room === 'weapons'/g, "room === 'TEMP_WEAPONS'");
content = content.replace(/room === 'comms'/g, "room === 'weapons'"); // Projects go to weapons
content = content.replace(/room === 'TEMP_MEDBAY'/g, "room === 'security'"); // Certs go to security
content = content.replace(/room === 'TEMP_WEAPONS'/g, "room === 'comms'"); // Asteroids go to comms

fs.writeFileSync(path, content, 'utf8');

let config = fs.readFileSync('./src/gameConfig.ts', 'utf8');
// update sections
config = config.replace(/section: 'Work Experience',(\s*)cx: 220,(\s*)cy: 340,/g, `section: 'Degree & Certs',\n    cx: 220,\n    cy: 340,`);
config = config.replace(/section: 'Degree & Certs',(\s*)cx: 240,(\s*)cy: 180,/g, `section: 'Work Experience',\n    cx: 240,\n    cy: 180,`);
config = config.replace(/section: 'Project Cards',(\s*)cx: 605,(\s*)cy: 660,/g, `section: 'Target Shooter',\n    cx: 605,\n    cy: 660,`);
config = config.replace(/section: 'Target Shooter',(\s*)cx: 690,(\s*)cy: 150,/g, `section: 'Project Cards',\n    cx: 690,\n    cy: 150,`);
fs.writeFileSync('./src/gameConfig.ts', config, 'utf8');

console.log("Replaced!");
