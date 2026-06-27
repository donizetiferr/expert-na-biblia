/**
 * gen_seed_d.mjs (V23.5)
 * Le data/conteudo_licoes.json (D.1/D.4) e data/completar_versiculos.json (D.3) e
 * gera os arquivos de seed bundled:
 *   - src/db/seed-conteudo.ts   (licao_conteudo)
 *   - src/db/seed-completar.ts  (completar_versiculo)
 * INSERT OR IGNORE => idempotente e seguro no upgrade (nao reseta progresso).
 */
import * as fs from 'fs';
import * as path from 'path';

const root = process.cwd();
const conteudoJson = path.join(root, 'data', 'conteudo_licoes.json');
const completarJson = path.join(root, 'data', 'completar_versiculos.json');

function esc(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' ').trim();
}

// ---- seed-conteudo.ts (D.1 + D.4) ----
const conteudo = fs.existsSync(conteudoJson) ? JSON.parse(fs.readFileSync(conteudoJson, 'utf8')) : {};
const conteudoEntries = Object.entries(conteudo)
  .filter(([, v]) => v && v.explicacao)
  .map(([id, v]) => `  ['${esc(id)}', '${esc(v.explicacao)}', '${esc(v.versiculo)}'],`)
  .join('\n');
const conteudoTs = `/**
 * seed-conteudo.ts — GERADO por scripts/gen_seed_d.mjs (V23.5, D.1 + D.4).
 * Mini-ensino didatico + versiculo-chave por licao. NAO editar a mao.
 * Total: ${Object.keys(conteudo).length} licoes.
 */
import type { SQLiteDatabase } from 'expo-sqlite';

// [licao_id, explicacao, versiculo_chave]
export const CONTEUDO_LICOES: Array<[string, string, string]> = [
${conteudoEntries}
];

export function applySeedConteudo(db: SQLiteDatabase): void {
  db.withTransactionSync(() => {
    for (const [id, exp, vers] of CONTEUDO_LICOES) {
      db.runSync(
        'INSERT OR IGNORE INTO licao_conteudo (licao_id, explicacao, versiculo_chave) VALUES (?, ?, ?)',
        [id, exp, vers || null],
      );
    }
  });
}
`;
fs.writeFileSync(path.join(root, 'src', 'db', 'seed-conteudo.ts'), conteudoTs);

// ---- seed-completar.ts (D.3) ----
const completar = fs.existsSync(completarJson) ? JSON.parse(fs.readFileSync(completarJson, 'utf8')) : [];
const completarEntries = completar
  .filter((it) => it && it.texto_com_lacuna && it.resposta && Array.isArray(it.distratores) && it.distratores.length >= 3)
  .map((it, i) => {
    const id = `CV${String(i + 1).padStart(3, '0')}`;
    const distr = JSON.stringify(it.distratores.slice(0, 3));
    return `  ['${id}', '${esc(it.referencia)}', '${esc(it.texto_com_lacuna)}', '${esc(it.resposta)}', '${esc(distr)}'],`;
  })
  .join('\n');
const completarTs = `/**
 * seed-completar.ts — GERADO por scripts/gen_seed_d.mjs (V23.5, D.3).
 * Itens do formato "completar versiculo". NAO editar a mao.
 */
import type { SQLiteDatabase } from 'expo-sqlite';

// [id, referencia, texto_com_lacuna, resposta, distratores(JSON)]
export const COMPLETAR_VERSICULOS: Array<[string, string, string, string, string]> = [
${completarEntries}
];

export function applySeedCompletar(db: SQLiteDatabase): void {
  db.withTransactionSync(() => {
    for (const [id, ref, texto, resp, distr] of COMPLETAR_VERSICULOS) {
      db.runSync(
        'INSERT OR IGNORE INTO completar_versiculo (id, referencia, texto_com_lacuna, resposta, distratores) VALUES (?, ?, ?, ?, ?)',
        [id, ref, texto, resp, distr],
      );
    }
  });
}
`;
fs.writeFileSync(path.join(root, 'src', 'db', 'seed-completar.ts'), completarTs);

console.log(`[gen_seed_d] conteudo=${Object.keys(conteudo).length} licoes, completar=${completar.length} itens`);
