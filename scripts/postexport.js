const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');

// Create .nojekyll to disable Jekyll on GitHub Pages
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('✅ Created dist/.nojekyll');
