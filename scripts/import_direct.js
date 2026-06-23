const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Database = require('better-sqlite3');

const PLANILHAS = [
  'whatsapp_media/spreadsheets/1_a_10.xlsx',
  'whatsapp_media/spreadsheets/11_a_20.xlsx',
  'whatsapp_media/spreadsheets/21_a_30.xlsx',
  'whatsapp_media/spreadsheets/31_a_40.xlsx',
];

function parseXlsx(xlsxPath) {
  // Escrever arquivo .py temporario e executar
  const pyScript = `
import openpyxl, json, sys
xlsx = sys.argv[1]
wb = openpyxl.load_workbook(xlsx, data_only=True)
ws = wb['Perguntas']
rows = []
for row in ws.iter_rows(values_only=True):
    if any(cell is not None for cell in row):
        rows.append(list(row))
print(json.dumps(rows, ensure_ascii=False, default=str))
`;
  const tmpPy = path.join(process.cwd(), 'data', '_parse_tmp.py');
  fs.writeFileSync(tmpPy, pyScript, 'utf-8');
  try {
    const result = execSync(`python "${tmpPy}" "${xlsxPath.replace(/\/g, '\\')}"`, { encoding: 'utf-8', maxBuffer: 50*1024*1024 });
    return JSON.parse(result);
  } finally {
    fs.unlinkSync(tmpPy);
  }
}

console.log('[import] Criando SQLite...');
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

const insertModulo = db.prepare(`INSERT OR IGNORE INTO modulos (id, area, ordem, nome) VALUES (?, ?, ?, ?)`);
const insertLicao = db.prepare(`INSERT OR IGNORE INTO licoes (id, modulo_id, ordem, nome) VALUES (?, ?, ?, ?)`);
const insertPerg = db.prepare(`INSERT OR IGNORE INTO perguntas (id, licao_id, ordem, texto) VALUES (?, ?, ?, ?)`);

let total = 0;
for (const planilha of PLANILHAS) {
  if (!fs.existsSync(planilha)) {
    console.log(`[import] AVISO: ${planilha} nao encontrado`);
    continue;
  }
  console.log(`[import] Lendo ${planilha}...`);
  const rows = parseXlsx(planilha);
  if (rows.length < 2) continue;
  
  const insertRow = db.transaction((dataRows) => {
    for (const row of dataRows) {
      insertModulo.run([row[2], row[0], row[1], row[3]]);
      insertLicao.run([row[5], row[2], row[4], row[6]]);
      insertPerg.run([row[8], row[5], row[7], row[9]]);
    }
  });
  insertRow(rows.slice(1));
  total += rows.length - 1;
  console.log(`[import] ${rows.length - 1} perguntas importadas de ${planilha}`);
}

const countPerg = db.prepare('SELECT COUNT(*) as c FROM perguntas').get();
const countMod = db.prepare('SELECT COUNT(*) as c FROM modulos').get();
const countLic = db.prepare('SELECT COUNT(*) as c FROM licoes').get();
console.log(`[import] TOTAL: ${countMod.c} modulos, ${countLic.c} licoes, ${countPerg.c} perguntas`);

db.close();
console.log(`[import] OK: ${dbPath}`);
