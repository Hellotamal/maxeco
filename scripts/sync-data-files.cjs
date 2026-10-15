const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'database.json');
const initialDataPath = path.join(__dirname, '..', 'src', 'data', 'initial-data.js');
const erpDataPath = path.join(__dirname, '..', 'public', 'erp', 'data', 'database.json');

if (!fs.existsSync(dbPath)) {
  console.error('data/database.json not found!');
  process.exit(1);
}

const rawDb = fs.readFileSync(dbPath, 'utf8');
const parsed = JSON.parse(rawDb);

// Copy to public/erp/data/database.json
fs.writeFileSync(erpDataPath, JSON.stringify(parsed, null, 2), 'utf8');

// Update src/data/initial-data.js
const initialDataContent = `// Canonical initial dataset for MaxEco Business Operating System
// Synced from data/database.json for repository persistence & Cloudflare Pages edge hosting

const initialSeedData = ${JSON.stringify(parsed, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = initialSeedData;
}
if (typeof window !== 'undefined') {
  window.initialSeedData = initialSeedData;
}
`;

fs.writeFileSync(initialDataPath, initialDataContent, 'utf8');

// Also sync to public/erp/data/initial-data.js
const erpInitialDataPath = path.join(__dirname, '..', 'public', 'erp', 'data', 'initial-data.js');
fs.writeFileSync(erpInitialDataPath, initialDataContent, 'utf8');

console.log('✅ Synchronized data/database.json with initial-data.js across source and public/erp!');
