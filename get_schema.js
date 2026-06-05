const fs = require('fs');
const content = fs.readFileSync('src/HR layout/Recruitment/PostJobModal.jsx', 'utf8');
const match = content.match(/const newJob = \{([\s\S]*?)\};/);
if (match) console.log(match[1]);
