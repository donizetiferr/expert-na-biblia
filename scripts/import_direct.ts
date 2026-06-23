/**
 * Importa 4.345 perguntas das planilhas para SQLite embarcado.
 * Cria o db que vai junto no APK.
 */
import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';

const PLANILHAS = [
  'whatsapp_media/spreadsheets/1_a_10.xlsx',
  'whatsapp_media/spreadsheets/11_a_20.xlsx',
  'whatsapp_media/spreadsheets/21_a_30.xlsx',
  'whatsapp_media/spreadsheets/31_a_40.xlsx',
];

function parseXlsx(path: string): any[][] {
  // Reuso do extrator do projeto
  const { execSync } = require('child_process');
  const script = `
import openpyxl
wb = openpyxl.load_workbook(r'${path.replace(/\/g, '\\')}', data_only=True)
ws = wb['Perguntas']
import json
rows = []
for row in ws.iter_rows(values_only=True):
  if any(cell is not None for cell in row):
    rows.append(list(row))
print(json.dumps(rows, ensure_ascii=False, default=str))
`;
  const result = execSync(`python -c "${script.replace(/\n/g, '; ')}"`, { encoding: 'utf-8' });
  return JSON.parse(result);
}

async function main() {
  console.log('[import_direct] Criando SQLite...');
  const dbPath = path.join(process.cwd(), 'data', 'db.sqlite');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE modulos (
      id TEXT PRIMARY KEY,
      area TEXT NOT NULL,
      ordem INTEGER NOT NULL,
      nome TEXT NOT NULL
    );
    CREATE TABLE licoes (
      id TEXT PRIMARY KEY,
      modulo_id TEXT NOT NULL,
      ordem INTEGER NOT NULL,
      nome TEXT NOT NULL,
      FOREIGN KEY (modulo_id) REFERENCES modulos(id)
    );
    CREATE TABLE perguntas (
      id TEXT PRIMARY KEY,
      licao_id TEXT NOT NULL,
      ordem INTEGER NOT NULL,
      texto TEXT NOT NULL,
      FOREIGN KEY (licao_id) REFERENCES licoes(id)
    );
    CREATE TABLE respostas_canonicas (
      pergunta_id TEXT PRIMARY KEY,
      resposta TEXT NOT NULL,
      score_confianca REAL,
      criado_em TEXT,
      FOREIGN KEY (pergunta_id) REFERENCES perguntas(id)
    );
    CREATE INDEX idx_perguntas_licao ON perguntas(licao_id);
    CREATE INDEX idx_licoes_modulo ON licoes(modulo_id);
  `);

  let total = 0;
  for (const planilha of PLANILHAS) {
    if (!fs.existsSync(planilha)) {
      console.log(`[import_direct] AVISO: ${planilha} nao encontrado`);
      continue;
    }
    console.log(`[import_direct] Lendo ${planilha}...`);
    const rows = parseXlsx(planilha);
    if (rows.length < 2) continue;
    const header = rows[0];
    console.log(`[import_direct] Header: ${header.join(', ')}`);

    const insertModulo = db.prepare(`INSERT OR IGNORE INTO modulos (id, area, ordem, nome) VALUES (?, ?, ?, ?)`);
    const insertLicao = db.prepare(`INSERT OR IGNORE INTO licoes (id, modulo_id, ordem, nome) VALUES (?, ?, ?, ?)`);
    const insertPerg = db.prepare(`INSERT OR IGNORE INTO perguntas (id, licao_id, ordem, texto) VALUES (?, ?, ?, ?)`);

    const txn = db.transaction((dataRows: any[][]) => {
      for (const row of dataRows) {
        const area = row[0];
        const modOrdem = row[1];
        const modId = row[2];
        const modNome = row[3];
        const licOrdem = row[4];
        const licId = row[5];
        const licNome = row[6];
        const pergOrdem = row[7];
        const pergId = row[8];
        const pergTexto = row[9];

        insertModulo.run(modId, area, modOrdem, modNome);
        insertLicao.run(licId, modId, licOrdem, licNome);
        insertPerg.run(pergId, licId, pergOrdem, pergTexto);
      }
    });
    txn(rows.slice(1));
    total += rows.length - 1;
    console.log(`[import_direct] ${rows.length - 1} perguntas importadas`);
  }

  // Verificar
  const countPerg = db.prepare('SELECT COUNT(*) as c FROM perguntas').get() as any;
  const countMod = db.prepare('SELECT COUNT(*) as c FROM modulos').get() as any;
  const countLic = db.prepare('SELECT COUNT(*) as c FROM licoes').get() as any;
  console.log(`[import_direct] TOTAL: ${countMod.c} modulos, ${countLic.c} licoes, ${countPerg.c} perguntas`);

  db.close();
  console.log(`[import_direct] OK: ${dbPath}`);
}

main().catch(e => {
  console.error('[import_direct] ERRO:', e);
  process.exit(1);
});
