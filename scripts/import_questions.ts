/**
 * Script: import_questions.ts
 * Importa `docs/questions_clean.json` (4345 perguntas reais das planilhas)
 * para `data/db.sqlite` (modulos, licoes, perguntas).
 *
 * Esquema esperado por migrations/001_initial.sql.
 *
 * Fontes:
 * - docs/questions_clean.json (1.3MB, 4 planilhas: 1_a_10, 11_a_20, 21_a_30, 31_a_40)
 * - Estrutura: top-level key = nome da planilha; value.Perguntas = array de linhas CSV
 *   (linha 0 = header; linhas seguintes = registros)
 * - Colunas: area, modulo_ordem, modulo_id, modulo, licao_ordem, licao_id, licao,
 *   pergunta_ordem, pergunta_id, pergunta
 * - resposta_canonica: nao disponivel no JSON (placeholder ate V3 gerar via M3)
 *
 * M0.1 — V8-RETOMADA.
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';

const DOCS_JSON = path.join(process.cwd(), 'docs', 'questions_clean.json');
const DB_PATH = path.join(process.cwd(), 'data', 'db.sqlite');
const MIGRATION_PATH = path.join(process.cwd(), 'migrations', '001_initial.sql');

const AREA_MAP: Record<string, string> = {
  'Fundamentos Bíblicos': 'FB',
  'Antigo Testamento': 'AT',
  'Novo Testamento': 'NT',
  'Teologia': 'TE',
};

interface PerguntaRow {
  area: string;
  modulo_ordem: number;
  modulo_id: string;
  modulo: string;
  licao_ordem: number;
  licao_id: string;
  licao: string;
  pergunta_ordem: number;
  pergunta_id: string;
  pergunta: string;
}

function parseJson(): { planilha: string; rows: PerguntaRow[] }[] {
  const raw = JSON.parse(fs.readFileSync(DOCS_JSON, 'utf-8'));
  const result: { planilha: string; rows: PerguntaRow[] }[] = [];
  for (const [planilha, payload] of Object.entries(raw) as [string, any][]) {
    const rawRows: any[][] = payload.Perguntas;
    const header: string[] = rawRows[0];
    const idx = Object.fromEntries(header.map((h, i) => [h, i]));
    const rows: PerguntaRow[] = [];
    for (let i = 1; i < rawRows.length; i++) {
      const r = rawRows[i];
      rows.push({
        area: r[idx['area']],
        modulo_ordem: Number(r[idx['modulo_ordem']]),
        modulo_id: r[idx['modulo_id']],
        modulo: r[idx['modulo']],
        licao_ordem: Number(r[idx['licao_ordem']]),
        licao_id: r[idx['licao_id']],
        licao: r[idx['licao']],
        pergunta_ordem: Number(r[idx['pergunta_ordem']]),
        pergunta_id: r[idx['pergunta_id']],
        pergunta: r[idx['pergunta']],
      });
    }
    result.push({ planilha, rows });
  }
  return result;
}

function main() {
  console.log('[import_questions] Iniciando importacao de questions_clean.json -> data/db.sqlite');

  if (!fs.existsSync(DOCS_JSON)) {
    console.error('[import_questions] ERRO: docs/questions_clean.json nao encontrado');
    process.exit(1);
  }

  const planilhas = parseJson();
  const totalRows = planilhas.reduce((s, p) => s + p.rows.length, 0);
  console.log(`[import_questions] Planilhas: ${planilhas.length}, Total perguntas: ${totalRows}`);

  // Garantir que data/ existe
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Abrir/criar SQLite
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Rodar migration
  if (!fs.existsSync(MIGRATION_PATH)) {
    console.error(`[import_questions] ERRO: migration nao encontrada em ${MIGRATION_PATH}`);
    process.exit(1);
  }
  const migrationSql = fs.readFileSync(MIGRATION_PATH, 'utf-8');
  db.exec(migrationSql);
  console.log('[import_questions] Migration aplicada');

  // Coletar modulos e licoes unicos
  const modulosMap = new Map<string, { ordem: number; area: string; nome: string; descricao: string }>();
  const licoesMap = new Map<string, { modulo_id: string; ordem: number; nome: string; total_perguntas: number }>();
  const perguntas: PerguntaRow[] = [];

  for (const { rows } of planilhas) {
    for (const r of rows) {
      const areaCode = AREA_MAP[r.area] || 'FB';
      if (!modulosMap.has(r.modulo_id)) {
        modulosMap.set(r.modulo_id, {
          ordem: r.modulo_ordem,
          area: areaCode,
          nome: r.modulo,
          descricao: `${r.area} - Modulo ${r.modulo_ordem}`,
        });
      }
      if (!licoesMap.has(r.licao_id)) {
        licoesMap.set(r.licao_id, {
          modulo_id: r.modulo_id,
          ordem: r.licao_ordem,
          nome: r.licao,
          total_perguntas: 0,
        });
      }
      licoesMap.get(r.licao_id)!.total_perguntas++;
      perguntas.push(r);
    }
  }

  console.log(`[import_questions] Modulos unicos: ${modulosMap.size}`);
  console.log(`[import_questions] Licoes unicas: ${licoesMap.size}`);

  // Limpar tabelas (import idempotente) - ordem importa (FK cascade)
  db.exec(`
    DROP TABLE IF EXISTS respostas_canonicas_cache;
    DROP TABLE IF EXISTS quiz_alternatives;
    DROP TABLE IF EXISTS perguntas;
    DROP TABLE IF EXISTS licoes;
    DROP TABLE IF EXISTS modulos;
  `);
  // Reaplicar schema apos drop
  db.exec(migrationSql);

  // Inserir modulos
  const insertModulo = db.prepare(
    'INSERT OR REPLACE INTO modulos (id, ordem, area, nome, descricao, concluido) VALUES (?, ?, ?, ?, ?, 0)'
  );
  const insertLicao = db.prepare(
    'INSERT OR REPLACE INTO licoes (id, modulo_id, ordem, nome, total_perguntas, concluida, score_max) VALUES (?, ?, ?, ?, ?, 0, 0)'
  );
  const insertPergunta = db.prepare(
    "INSERT OR REPLACE INTO perguntas (id, licao_id, ordem, texto, resposta_canonica, referencias_biblicas, tipo, dificuldade) VALUES (?, ?, ?, ?, ?, NULL, 'ABERTA', 'MEDIO')"
  );

  const txn = db.transaction(() => {
    for (const [id, m] of modulosMap) {
      insertModulo.run(id, m.ordem, m.area, m.nome, m.descricao);
    }
    for (const [id, l] of licoesMap) {
      insertLicao.run(id, l.modulo_id, l.ordem, l.nome, l.total_perguntas);
    }
    for (const p of perguntas) {
      // resposta_canonica placeholder (V3 vai gerar via M3)
      insertPergunta.run(
        p.pergunta_id,
        p.licao_id,
        p.pergunta_ordem,
        p.pergunta,
        `[GERAR] ${p.pergunta_id}`
      );
    }
  });
  txn();

  // Validar
  const modCount = (db.prepare('SELECT COUNT(*) as c FROM modulos').get() as any).c;
  const licCount = (db.prepare('SELECT COUNT(*) as c FROM licoes').get() as any).c;
  const pergCount = (db.prepare('SELECT COUNT(*) as c FROM perguntas').get() as any).c;
  console.log(`[import_questions] VALIDACAO FINAL: modulos=${modCount}, licoes=${licCount}, perguntas=${pergCount}`);

  // Detalhe por area
  const byArea = db.prepare('SELECT area, COUNT(*) as c FROM modulos GROUP BY area ORDER BY area').all() as any[];
  console.log('[import_questions] Modulos por area:', JSON.stringify(byArea));

  db.close();
  console.log('[import_questions] OK');
}

if (require.main === module) {
  main();
}
