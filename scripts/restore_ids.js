// restore_ids.js — restaurar IDs 1.1 a 4.7 nos items marcados [x] sem prefixo
const fs = require('fs');
const p = 'evolution_plan.md';
let txt = fs.readFileSync(p, 'utf8');
const ids = ['1.1', '1.2', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '3.1', '3.2', '3.3', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7'];

const lines = txt.split('\n');
let nextIdx = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/^- \[x\] \*\*\d/.test(line)) continue;
  if (/^- \[x\] \*\*/.test(line) && nextIdx < ids.length) {
    const newLine = line.replace(/- \[x\] \*\*/, `- [x] ${ids[nextIdx]} **`);
    lines[i] = newLine;
    nextIdx++;
  }
}
fs.writeFileSync(p, lines.join('\n'));
console.log('IDs inseridos:', nextIdx);
console.log('restantes sem ID:', (txt.match(/^- \[x\] \*\*(?!\d)/gm) || []).length);
