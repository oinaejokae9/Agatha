import fs from 'fs';
import path from 'path';

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
    const [username, _pw, _otp, email, token] = cells;
    if (!username) continue;
    rows.push({ username: username.trim(), email: (email||'').trim(), token: (token||'').trim() });
  }
  return rows;
}

async function checkToken(account) {
  const headers = { 'Authorization': `token ${account.token}`, 'User-Agent': 'token-check-script', 'Accept': 'application/vnd.github+json' };
  const res = await fetch('https://api.github.com/user', { headers });
  const ok = res.status === 200;
  const scopes = res.headers.get('x-oauth-scopes') || '';
  const tokenType = res.headers.get('x-accepted-oauth-scopes') || '';
  let admin = false;
  if (ok) {
    const repoRes = await fetch('https://api.github.com/repos/oinaejokae9/Agatha', { headers });
    if (repoRes.status === 200) {
      const data = await repoRes.json();
      if (data && data.permissions && typeof data.permissions.admin === 'boolean') {
        admin = !!data.permissions.admin;
      }
    }
  }
  return { username: account.username, email: account.email, valid: ok, scopes, tokenType, admin };
}

async function main() {
  const content = fs.readFileSync(path.join(process.cwd(), 'github_accounts.csv'), 'utf8');
  const accounts = parseCSV(content);
  const results = [];
  for (const acc of accounts) {
    if (!acc.token) { results.push({ username: acc.username, email: acc.email, valid: false, scopes: '', tokenType: '', admin: false }); continue; }
    try {
      const r = await checkToken(acc);
      results.push(r);
    } catch (e) {
      results.push({ username: acc.username, email: acc.email, valid: false, scopes: '', tokenType: '', admin: false, error: String(e) });
    }
  }
  // Print in a compact table-like format
  for (const r of results) {
    const status = r.valid ? 'VALID' : 'INVALID';
    const admin = r.admin ? 'admin' : 'no-admin';
    console.log(`${r.username}\t${status}\t${admin}\t${r.scopes}`);
  }
}

main();
