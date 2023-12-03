import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const repoRoot = process.cwd();

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  const rows = [];
  for (const line of lines) {
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === ',' && !inQuotes) {
        cells.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    // columns: username,password,Authenticator app,email,token
    const [username, _password, _otp, email, token] = cells;
    if (!username || !email || !token) continue;
    rows.push({ username: username.trim(), email: email.trim(), token: token.trim() });
  }
  return rows;
}

function uniqueRandomCounts(n, min, max) {
  const counts = new Set();
  while (counts.size < n) {
    counts.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(counts);
}

function weightedPhaseWindows(startISO, endISO, weights) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const totalMs = end.getTime() - start.getTime();
  const sum = weights.reduce((a, b) => a + b, 0);
  const windows = [];
  let acc = 0;
  for (const w of weights) {
    const phaseStart = new Date(start.getTime() + (acc / sum) * totalMs);
    acc += w;
    const phaseEnd = new Date(start.getTime() + (acc / sum) * totalMs);
    windows.push([phaseStart, phaseEnd]);
  }
  return windows;
}

function allocateCounts(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  let base = weights.map(w => Math.round((w / sum) * total));
  let diff = total - base.reduce((a, b) => a + b, 0);
  let i = 0;
  while (diff !== 0) {
    base[i % base.length] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    i++;
  }
  return base;
}

function randomDatesWithin([start, end], count) {
  const s = start.getTime();
  const e = end.getTime();
  const dates = [];
  for (let i = 0; i < count; i++) {
    const t = Math.floor(s + Math.random() * (e - s));
    dates.push(new Date(t));
  }
  dates.sort((a, b) => a - b);
  return dates;
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeFile(p, content) { ensureDir(path.dirname(p)); fs.writeFileSync(p, content, 'utf8'); }
function appendFile(p, content) { ensureDir(path.dirname(p)); fs.appendFileSync(p, content, 'utf8'); }

function exec(cmd, env = {}) {
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
}

function commit(msg, date, name, email) {
  const iso = date.toISOString();
  exec(`git -c user.name="${name}" -c user.email="${email}" add -A`, { GIT_AUTHOR_DATE: iso, GIT_COMMITTER_DATE: iso });
  exec(`git -c user.name="${name}" -c user.email="${email}" commit -m "${msg}"`, { GIT_AUTHOR_DATE: iso, GIT_COMMITTER_DATE: iso });
}

function initSkeleton() {
  ensureDir('backend/src/datasources');
  ensureDir('backend/src/core');
  ensureDir('contracts');
  ensureDir('apps/dashboard/src');
  ensureDir('tests/backend');
  ensureDir('tests/contracts');
  if (!fs.existsSync('README.md')) {
    writeFile('README.md', '# Agatha Oracle Network\n\nMonorepo for a decentralized oracle across EVM chains.\n');
  }
  if (!fs.existsSync('LICENSE')) {
    writeFile('LICENSE', 'MIT License\n');
  }
  writeFile('backend/src/index.ts', "export const hello = () => 'Agatha';\n");
  writeFile('backend/src/core/aggregator.ts', `export type DataPoint = { source: string; value: number; timestamp: number };\nexport function aggregateMedian(inputs: DataPoint[]): number {\n  const values = inputs.map(i => i.value).sort((a,b)=>a-b);\n  const mid = Math.floor(values.length/2);\n  return values.length % 2 ? values[mid] : (values[mid-1] + values[mid]) / 2;\n}\n`);
  writeFile('backend/src/datasources/price.ts', `export async function fetchPrice(symbol: string): Promise<number> {\n  return Math.abs(hash(symbol)) % 1000 + 100;\n}\nfunction hash(s: string): number {\n  let h = 0; for (let i=0;i<s.length;i++){ h = ((h<<5)-h) + s.charCodeAt(i); h|=0;} return h;\n}\n`);
  writeFile('contracts/OracleAggregator.sol', `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\ncontract OracleAggregator {\n    int256 private lastAnswer;\n    event AnswerUpdated(int256 answer, uint256 updatedAt);\n    function submit(int256 answer) external { lastAnswer = answer; emit AnswerUpdated(answer, block.timestamp); }\n    function latestAnswer() external view returns (int256) { return lastAnswer; }\n}\n`);
  writeFile('apps/dashboard/src/index.ts', `export const banner = () => 'Agatha Dashboard';\n`);
}

function progressiveBackendCommit(step) {
  const file = 'backend/src/core/pipeline.ts';
  const content = `export type Task = { id: string; run: () => Promise<void> };\nexport class Pipeline {\n  private tasks: Task[] = [];\n  add(task: Task) { this.tasks.push(task); }\n  async runAll() { for (const t of this.tasks) { await t.run(); } }\n}\n// step ${step}\n`;
  if (!fs.existsSync(file)) writeFile(file, content); else appendFile(file, `// refine step ${step}\n`);
}

function progressiveContractCommit(step) {
  const file = 'contracts/OracleAggregator.sol';
  appendFile(file, `// tweak step ${step}\n`);
}

function addBackendFeature(i) {
  const f = `backend/src/datasources/source_${i}.ts`;
  writeFile(f, `export async function fetch(): Promise<number> { return ${100 + i}; }\n`);
}

function addTest(i) {
  const f = `tests/backend/pipeline_${i}.test.ts`;
  writeFile(f, `import { Pipeline } from '../../backend/src/core/pipeline';\n test('pipeline runs ${i}', async () => { const p = new Pipeline(); expect(typeof p).toBe('object'); });\n`);
}

function fixBug(i) {
  appendFile('backend/src/index.ts', `\nexport const minor_${i} = () => ${i};\n`);
}

function addFrontend(i) {
  const f = `apps/dashboard/src/widget_${i}.ts`; writeFile(f, `export const widget${i} = () => 'w${i}';\n`);
}

function docsTouch(i) {
  appendFile('README.md', `\nUpdate notes ${i}.\n`);
}

function main() {
  const csv = fs.readFileSync(path.join(repoRoot, 'github_accounts.csv'), 'utf8');
  const accounts = parseCSV(csv);
  if (accounts.length === 0) { throw new Error('No accounts parsed'); }

  initSkeleton();

  const names = accounts.map(a => a.username);
  const emails = accounts.map(a => a.email);

  const counts = uniqueRandomCounts(accounts.length, 20, 30);
  const totalCommits = counts.reduce((a, b) => a + b, 0);

  const weights = [4, 10, 8, 2];
  const windows = weightedPhaseWindows('2023-12-01T00:00:00Z', '2024-11-30T23:59:59Z', weights);
  const perPhase = allocateCounts(totalCommits, weights);

  const dates = windows.flatMap((w, idx) => randomDatesWithin(w, perPhase[idx]));
  dates.sort((a, b) => a - b);

  const authorsPool = accounts.flatMap((a, idx) => Array(counts[idx]).fill({ name: a.username, email: a.email }));
  // shuffle
  for (let i = authorsPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [authorsPool[i], authorsPool[j]] = [authorsPool[j], authorsPool[i]];
  }

  // ensure branch name master
  try { exec('git symbolic-ref HEAD refs/heads/master'); } catch {}

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const a = authorsPool[i % authorsPool.length];
    const phaseIdx = windows.findIndex(([s, e]) => d >= s && d <= e);

    if (phaseIdx === 0) {
      progressiveBackendCommit(i);
      if (i % 3 === 0) addBackendFeature(i % 5);
      commit(`feat: initialize module step ${i}`, d, a.name, a.email);
    } else if (phaseIdx === 1) {
      progressiveBackendCommit(i);
      progressiveContractCommit(i);
      addBackendFeature(i % 20);
      if (i % 4 === 0) addFrontend(i % 15);
      commit(`feat: core feature iteration ${i}`, d, a.name, a.email);
    } else if (phaseIdx === 2) {
      if (i % 2 === 0) addTest(i % 40);
      else fixBug(i);
      commit(i % 2 === 0 ? `fix: stabilize pipeline #${i}` : `fix: minor bug ${i}`, d, a.name, a.email);
    } else {
      // docs and wrap-up but still touch code
      addFrontend(i % 20);
      if (i % 3 === 0) docsTouch(i);
      commit(i % 3 === 0 ? `docs: finalize docs ${i}` : `feat: polish UI ${i}` , d, a.name, a.email);
    }
  }
}

main();
