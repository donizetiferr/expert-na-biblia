// Generate seed-{modulos-licoes,perguntas,quiz}.ts from data/db.sqlite
// V9.2.1: use template literal (backtick) so SQL strings can contain quotes
const fs = require('fs');
const Database = require('better-sqlite3');
const db = new Database('data/db.sqlite');

function esc(s) {
  if (s === null || s === undefined) return 'NULL';
  // SQL usa aspas SIMPLES para strings. Duplas sao reservadas para identificadores.
  return "'" + String(s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")  // escape aspas simples dobrando
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    + "'";
}

// MODULOS + LICOES
const modulos = db.prepare('SELECT * FROM modulos').all();
const licoes = db.prepare('SELECT * FROM licoes').all();
const m1 = ['// AUTO-GERADO. Modulos e licoes V9.2.1.'];
m1.push("import type { SQLiteDatabase } from 'expo-sqlite';");
m1.push('');
m1.push('export function applySeedModulosLicoes(db: SQLiteDatabase): void {');
m1.push('  db.execSync("BEGIN;");');
for (const m of modulos) {
  m1.push('  db.execSync(`INSERT OR REPLACE INTO modulos (id,ordem,area,nome,descricao,concluido) VALUES (' +
    esc(m.id) + ',' + m.ordem + ',' + esc(m.area) + ',' + esc(m.nome) + ',' + esc(m.descricao) + ',' + (m.concluido || 0) + ')`);');
}
for (const l of licoes) {
  m1.push('  db.execSync(`INSERT OR REPLACE INTO licoes (id,modulo_id,ordem,nome,total_perguntas,concluida,score_max) VALUES (' +
    esc(l.id) + ',' + esc(l.modulo_id) + ',' + l.ordem + ',' + esc(l.nome) + ',' + (l.total_perguntas || 0) + ',' + (l.concluida || 0) + ',' + (l.score_max || 0) + ')`);');
}
m1.push('  db.execSync("COMMIT;");');
m1.push('}');
fs.writeFileSync('src/db/seed-modulos-licoes.ts', m1.join('\n'));
console.log('modulos:', modulos.length, 'licoes:', licoes.length);

// PERGUNTAS
const perguntas = db.prepare('SELECT * FROM perguntas').all();
const m2 = ['// AUTO-GERADO. Perguntas V9.2.1 (4345).'];
m2.push("import type { SQLiteDatabase } from 'expo-sqlite';");
m2.push('');
m2.push('export function applySeedPerguntas(db: SQLiteDatabase): void {');
m2.push('  db.execSync("BEGIN;");');
const CHUNK = 100;
for (let i = 0; i < perguntas.length; i += CHUNK) {
  const slice = perguntas.slice(i, i + CHUNK);
  const vals = slice.map(p => '(' +
    esc(p.id) + ',' + esc(p.licao_id) + ',' + p.ordem + ',' + esc(p.texto) + ',' + esc(p.resposta_canonica) + ',' +
    esc(p.referencias_biblicas) + ',' + esc(p.tipo) + ',' + esc(p.dificuldade) + ')'
  ).join(',');
  m2.push('  db.execSync(`INSERT OR REPLACE INTO perguntas (id,licao_id,ordem,texto,resposta_canonica,referencias_biblicas,tipo,dificuldade) VALUES ' + vals + '`);');
}
m2.push('  db.execSync("COMMIT;");');
m2.push('}');
fs.writeFileSync('src/db/seed-perguntas.ts', m2.join('\n'));
console.log('perguntas:', perguntas.length, 'chunks:', Math.ceil(perguntas.length / CHUNK));

// QUIZ
const quiz = db.prepare('SELECT * FROM quiz_alternatives').all();
const m3 = ['// AUTO-GERADO. Quiz alternatives V9.2.1 (4341).'];
m3.push("import type { SQLiteDatabase } from 'expo-sqlite';");
m3.push('');
m3.push('export function applySeedQuiz(db: SQLiteDatabase): void {');
m3.push('  db.execSync("BEGIN;");');
for (let i = 0; i < quiz.length; i += CHUNK) {
  const slice = quiz.slice(i, i + CHUNK);
  const vals = slice.map(q => '(' +
    esc(q.pergunta_id) + ',' + esc(q.correta) + ',' + esc(q.distrator1) + ',' + esc(q.distrator2) + ',' + esc(q.distrator3) + ')'
  ).join(',');
  m3.push('  db.execSync(`INSERT OR REPLACE INTO quiz_alternatives (pergunta_id,correta,distrator1,distrator2,distrator3) VALUES ' + vals + '`);');
}
m3.push('  db.execSync("COMMIT;");');
m3.push('}');
fs.writeFileSync('src/db/seed-quiz.ts', m3.join('\n'));
console.log('quiz_alternatives:', quiz.length, 'chunks:', Math.ceil(quiz.length / CHUNK));
