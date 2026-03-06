const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, 'js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && f !== 'global.js');

files.forEach(f => {
    const filePath = path.join(jsDir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace fetch('/api/...') with fetch(BACKEND_URL + '/api/...')
    content = content.replace(/fetch\('(\/api\/.*?)'/g, "fetch(BACKEND_URL + '$1'");
    // Replace fetch(`/api/...`) with fetch(BACKEND_URL + `/api/...`)
    content = content.replace(/fetch\(`(\/api\/.*?)`/g, "fetch(BACKEND_URL + `$1`");
    // Replace fetch("/api/...") with fetch(BACKEND_URL + "/api/...")
    content = content.replace(/fetch\("(\/api\/.*?)"/g, 'fetch(BACKEND_URL + "$1"');

    // Make sure we have the BACKEND_URL variable available in these scripts if it's not global.js
    // Actually, global.js is loaded first in all HTMLs so BACKEND_URL is globally available via window.

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${f}`);
    }
});
console.log('All frontend fetches updated to explicitly use BACKEND_URL.');
