#!/usr/bin/env node
// Har bir masala yechimini kompilyatsiya qilib, misollarda sinaydi.
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const dir = path.join(__dirname, '.java');
const only = process.argv[2];
let pass = 0, fail = 0;

function isSubseq(a, b) {
  let i = 0;
  for (const ch of b) if (i < a.length && a[i] === ch) i++;
  return i === a.length;
}

for (const id of fs.readdirSync(dir).sort()) {
  if (only && id !== only) continue;
  const d = path.join(dir, id);
  const meta = JSON.parse(fs.readFileSync(path.join(d, 'meta.json'), 'utf8'));
  try {
    execFileSync('javac', ['-nowarn', '-Xlint:none', 'Main.java'], { cwd: d, stdio: 'pipe' });
  } catch (e) {
    console.log(`✗ ${id}: COMPILE\n${e.stderr}`);
    fail++;
    continue;
  }
  meta.examples.forEach((ex, k) => {
    const t0 = Date.now();
    const r = spawnSync('java', ['-Xss64m', '-Xmx1500m', 'Main'], { cwd: d, input: ex.input + '\n', encoding: 'utf8', timeout: 20000 });
    const got = (r.stdout || '').trim();
    const exp = ex.output.trim();
    let ok;
    if (meta.check === 'float') ok = Math.abs(parseFloat(got) - parseFloat(exp)) <= 1e-6;
    else if (meta.check === 'lcs') {
      const [s, t] = ex.input.trim().split(/\s+/);
      ok = got.length === exp.length && isSubseq(got, s) && isSubseq(got, t);
    } else ok = got.split(/\s+/).join(' ') === exp.split(/\s+/).join(' ');
    const ms = Date.now() - t0;
    if (ok) pass++;
    else {
      fail++;
      console.log(`✗ ${id} #${k + 1}: kutilgan [${exp}] olindi [${got}] ${r.stderr ? '\n' + r.stderr.slice(0, 400) : ''}`);
    }
    if (ok && process.env.V) console.log(`✓ ${id} #${k + 1} ${ms}ms -> ${got}`);
  });
}
console.log(`\n${pass} o'tdi, ${fail} xato`);
process.exit(fail ? 1 : 0);
