const fs = require('fs');

// Replace in gameConfig.ts
let config = fs.readFileSync('./src/gameConfig.ts', 'utf8');

// Comms -> Degree & Certs
config = config.replace(
/section: 'Project Cards',\s*cx: 605/g, 
"section: 'Degree & Certs',\n    cx: 605"
);

// Medbay -> Work Experience
config = config.replace(
/section: 'Degree & Certs',\s*cx: 240/g, 
"section: 'Work Experience',\n    cx: 240"
);

// Weapons -> Project Cards
config = config.replace(
/section: 'Target Shooter',\s*cx: 690/g, 
"section: 'Project Cards',\n    cx: 690"
);

// Security -> Achievements
config = config.replace(
/section: 'Work Experience',\s*cx: 220/g, 
"section: 'Target Shooter',\n    cx: 220"
);

fs.writeFileSync('./src/gameConfig.ts', config, 'utf8');
console.log("Config updated.");
