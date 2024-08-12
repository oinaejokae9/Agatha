import fs from 'fs';
import path from 'path';
const csvPath = path.join(process.cwd(), 'github_accounts.csv');
const content = fs.readFileSync(csvPath, 'utf8');
function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  lines.shift();
  const rows = [];
  for (const line of lines) {
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cells.push(cur); cur=''; } else { cur += ch; }
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}
const rows = parseCSV(content);
const owner = rows.find(r => r[0] === 'oinaejokae9');
if (!owner) { console.error('Owner not found'); process.exit(1); }
const token = owner[4];
if (!token) { console.error('Token missing'); process.exit(1); }
process.stdout.write(token.trim());
