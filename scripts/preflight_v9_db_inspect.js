// Pre-flight V9 — schema OK, agora contagem correta via JOIN
const Database = require('better-sqlite3');
const db = new Database('data/db.sqlite', { readonly: true });

console.log('=== FB01 distribuicao por licao ===');
const fb01Licoes = db
  .prepare(
    `SELECT l.id AS licao_id, l.ordem, l.total_perguntas,
            COUNT(p.id) AS perguntas_reais
     FROM licoes l
     LEFT JOIN perguntas p ON p.licao_id = l.id
     WHERE l.modulo_id = 'FB01'
     GROUP BY l.id
     ORDER BY l.ordem`,
  )
  .all();
console.log(JSON.stringify(fb01Licoes, null, 2));

console.log('\n=== perguntas placeholder [GERAR] ===');
const placeholder = db
  .prepare("SELECT COUNT(*) AS n FROM perguntas WHERE resposta_canonica LIKE '%[GERAR]%'")
  .get();
console.log('perguntas com [GERAR] em resposta_canonica:', placeholder.n);

console.log('\n=== perguntas reais (não [GERAR]) ===');
const reais = db
  .prepare("SELECT COUNT(*) AS n FROM perguntas WHERE resposta_canonica NOT LIKE '%[GERAR]%'")
  .get();
console.log('perguntas reais:', reais.n);

console.log('\n=== 5 primeiras perguntas reais (amostra) ===');
const sample = db
  .prepare(
    "SELECT id, licao_id, texto, resposta_canonica FROM perguntas WHERE resposta_canonica NOT LIKE '%[GERAR]%' LIMIT 5",
  )
  .all();
console.log(JSON.stringify(sample, null, 2));

console.log('\n=== modulos por area ===');
const modulosPorArea = db
  .prepare('SELECT area, COUNT(*) AS n FROM modulos GROUP BY area ORDER BY area')
  .all();
console.log(JSON.stringify(modulosPorArea, null, 2));

console.log('\n=== sample perguntas FB01-L01 (top 3) ===');
const fb1l1 = db
  .prepare(
    "SELECT id, licao_id, texto, resposta_canonica FROM perguntas WHERE licao_id = 'FB01-L01' LIMIT 3",
  )
  .all();
console.log(JSON.stringify(fb1l1, null, 2));
