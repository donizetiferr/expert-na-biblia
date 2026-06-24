/**
 * generate_canonicos_v9.ts
 *
 * V9 — batch M2.7 (Minimax M2.7) para gerar:
 *   - resposta_canonica (substitui "[GERAR] {id}")
 *   - 3 distrators plausiveis para popular quiz_alternatives
 *
 * Fontes:
 *   - 4345 perguntas em data/db.sqlite (todas com resposta_canonica = "[GERAR] {id}")
 *   - Token Plan M2.7 em Tokens API e acessos/minimax/credentials.env
 *
 * Estrategia (1 chamada por pergunta, baixa temperatura):
 *   - max_tokens=400 (resposta_curta + 3 distrators JSON)
 *   - paralelismo: 5 em flight (medido empiricamente em pre-flight: 2.9s/req ~ 100 RPM)
 *   - checkpoint a cada 100 em data/checkpoint_v9.json
 *   - m3_usage tracking na tabela m3_usage
 *   - transacao SQLite por pergunta (idempotente — pode retomar de onde parou)
 *
 * Estimativa: 4345 / 100 RPM = ~43 min sequencial; com 5 paralelos = ~9 min ideal.
 * Real (com retries de rate limit + latencia variavel): ~20-30 min.
 *
 * Uso: npx tsx scripts/generate_canonicos_v9.ts [--limit N] [--resume] [--concurrency N]
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';

// ---------- CONFIG ----------

const M2_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';
const M2_MODEL = 'MiniMax-M2.7';
const THINK_REGEX = /<think[^>]*>.*?<\/think>/gs;
const SYSTEM_PROMPT = `Voce gera a resposta canonica e 3 distrators para perguntas biblicas em portugues brasileiro.
REGRAS:
1. resposta canonica: ate 80 caracteres, terminologia biblica padrao (Almeida Revista e Corrigida), sem markdown.
2. 3 distrators: plausiveis e relacionados ao tema, mas CLARAMENTE incorretos. Mesmo tamanho da resposta canonica.
3. Se nao souber a resposta, responda {"r": "NAO SEI", "d1": "...", "d2": "...", "d3": "..."}.
4. Responda APENAS JSON estrito: {"r":"...","d1":"...","d2":"...","d3":"..."}. Sem texto antes/depois.`;

const CHECKPOINT_PATH = path.join(process.cwd(), 'data', 'checkpoint_v9.json');
const DB_PATH = path.join(process.cwd(), 'data', 'db.sqlite');

// ---------- CLI ----------

function getCliFlag(name: string, fallback?: string): string | undefined {
  const idx = process.argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (idx === -1) return fallback;
  const arg = process.argv[idx];
  if (arg.includes('=')) return arg.split('=')[1];
  return process.argv[idx + 1];
}

const LIMIT = parseInt(getCliFlag('limit', '999999') || '999999', 10);
const RESUME = process.argv.includes('--resume');
const CONCURRENCY = parseInt(getCliFlag('concurrency', '5') || '5', 10);

// ---------- TOKEN ----------

function loadToken(): string {
  const envPath = path.join(
    process.env.USERPROFILE || 'C:\\Users\\Donizeti',
    'Downloads',
    'Projetos_VSCode',
    'Tokens API e acessos',
    'minimax',
    'credentials.env',
  );
  const txt = fs.readFileSync(envPath, 'utf8');
  const m = txt.match(/MINIMAX_AUTH_TOKEN="([^"]+)"/);
  if (!m) throw new Error('MINIMAX_AUTH_TOKEN nao encontrado em credentials.env');
  return m[1];
}

// ---------- TYPES ----------

interface QuestaoRow {
  id: string;
  licao_id: string;
  texto: string;
  resposta_canonica: string;
}

interface Resultado {
  id: string;
  r: string;
  d1: string;
  d2: string;
  d3: string;
  tokens_in: number;
  tokens_out: number;
  ok: boolean;
  err?: string;
}

// ---------- API ----------

async function callM2(pergunta: string, token: string): Promise<Resultado> {
  const body = {
    model: M2_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Pergunta: ${pergunta}` },
    ],
    temperature: 0.2,
    max_tokens: 300,
  };

  const res = await fetch(M2_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    return { id: '', r: '', d1: '', d2: '', d3: '', tokens_in: 0, tokens_out: 0, ok: false, err: `HTTP ${res.status}: ${txt.slice(0, 200)}` };
  }

  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '';
  const limpo = raw.replace(THINK_REGEX, '').trim();

  // parse JSON
  const jsonMatch = limpo.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { id: '', r: '', d1: '', d2: '', d3: '', tokens_in: data.usage?.prompt_tokens || 0, tokens_out: data.usage?.completion_tokens || 0, ok: false, err: 'JSON nao encontrado em: ' + limpo.slice(0, 100) };
  }
  let parsed: { r?: string; d1?: string; d2?: string; d3?: string };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    return { id: '', r: '', d1: '', d2: '', d3: '', tokens_in: 0, tokens_out: 0, ok: false, err: 'JSON parse falhou: ' + limpo.slice(0, 100) };
  }

  return {
    id: '',
    r: parsed.r || '',
    d1: parsed.d1 || '',
    d2: parsed.d2 || '',
    d3: parsed.d3 || '',
    tokens_in: data.usage?.prompt_tokens || 0,
    tokens_out: data.usage?.completion_tokens || 0,
    ok: !!parsed.r && !!parsed.d1,
  };
}

// ---------- WORKER POOL ----------

async function processAll(questoes: QuestaoRow[], token: string): Promise<Resultado[]> {
  const results: Resultado[] = [];
  const queue = [...questoes];
  const inflight: Promise<void>[] = [];
  let processed = 0;
  let okCount = 0;
  let errCount = 0;

  async function worker(id: number) {
    while (queue.length > 0) {
      const q = queue.shift();
      if (!q) break;
      let res: Resultado;
      try {
        res = await callM2(q.texto, token);
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        res = { id: q.id, r: '', d1: '', d2: '', d3: '', tokens_in: 0, tokens_out: 0, ok: false, err: errMsg };
      }
      res.id = q.id;
      results.push(res);
      processed++;
      if (res.ok) okCount++;
      else errCount++;

      if (processed % 20 === 0 || processed === questoes.length) {
        console.log(
          `[worker ${id}] ${processed}/${questoes.length} (ok=${okCount}, err=${errCount}, last=${q.id})`,
        );
      }
    }
  }

  for (let i = 0; i < CONCURRENCY; i++) {
    inflight.push(worker(i));
  }
  await Promise.all(inflight);

  return results;
}

// ---------- CHECKPOINT ----------

function loadCheckpoint(): Set<string> {
  if (!fs.existsSync(CHECKPOINT_PATH)) return new Set();
  try {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
    return new Set(data.ids_ok || []);
  } catch {
    return new Set();
  }
}

function saveCheckpoint(processedIds: string[]) {
  const dataDir = path.dirname(CHECKPOINT_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    CHECKPOINT_PATH,
    JSON.stringify({ ids_ok: processedIds, saved_at: new Date().toISOString() }, null, 2),
  );
}

// ---------- DB ----------

interface DBUpdate {
  id: string;
  resposta_canonica: string;
  correta: string;
  d1: string;
  d2: string;
  d3: string;
}

function applyToDb(db: Database.Database, updates: DBUpdate[]) {
  const updStmt = db.prepare(
    `UPDATE perguntas SET resposta_canonica = ? WHERE id = ?`,
  );
  const insAlt = db.prepare(
    `INSERT INTO quiz_alternatives (pergunta_id, correta, distrator1, distrator2, distrator3)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(pergunta_id) DO UPDATE SET
       correta = excluded.correta,
       distrator1 = excluded.distrator1,
       distrator2 = excluded.distrator2,
       distrator3 = excluded.distrator3`,
  );

  const tx = db.transaction((rows: DBUpdate[]) => {
    for (const u of rows) {
      updStmt.run(u.resposta_canonica, u.id);
      insAlt.run(u.id, u.correta, u.d1, u.d2, u.d3);
    }
  });
  tx(updates);

  // m3_usage tracking
  const today = new Date().toISOString().slice(0, 10);
  const updUsage = db.prepare(
    `INSERT INTO m3_usage (data, chamadas, tokens_estimados) VALUES (?, ?, ?)
     ON CONFLICT(data) DO UPDATE SET
       chamadas = chamadas + excluded.chamadas,
       tokens_estimados = tokens_estimados + excluded.tokens_estimados`,
  );
  const totalTokens = updates.length * 250; // ~250 tokens/req (prompt+completion) heuristica
  updUsage.run(today, updates.length, totalTokens);
}

// ---------- MAIN ----------

async function main() {
  console.log('[generate_canonicos_v9] Iniciando...');
  console.log(`[generate_canonicos_v9] config: limit=${LIMIT}, resume=${RESUME}, concurrency=${CONCURRENCY}`);
  const token = loadToken();
  console.log('[generate_canonicos_v9] token carregado (prefix):', token.slice(0, 12) + '...');

  // DB connection (writable — vamos fazer UPDATE/INSERT)
  const db = new Database(DB_PATH);

  // Carregar perguntas com [GERAR] ou todas (para retomar)
  const todas: QuestaoRow[] = db
    .prepare(`SELECT id, licao_id, texto, resposta_canonica FROM perguntas ORDER BY id`)
    .all() as QuestaoRow[];

  console.log(`[generate_canonicos_v9] ${todas.length} perguntas totais no DB`);

  // Filtrar: pular as que ja tem resposta canonica real (sem [GERAR])
  let alvo = todas.filter((q) => q.resposta_canonica.includes('[GERAR]'));
  console.log(`[generate_canonicos_v9] ${alvo.length} perguntas com [GERAR] para processar`);

  // Resume support
  if (RESUME) {
    const done = loadCheckpoint();
    const before = alvo.length;
    alvo = alvo.filter((q) => !done.has(q.id));
    console.log(`[generate_canonicos_v9] resume: pulando ${before - alvo.length} ja processadas`);
  }

  // Limit
  if (alvo.length > LIMIT) {
    console.log(`[generate_canonicos_v9] limit: processando primeiros ${LIMIT} de ${alvo.length}`);
    alvo = alvo.slice(0, LIMIT);
  }

  if (alvo.length === 0) {
    console.log('[generate_canonicos_v9] nada a processar. Saindo.');
    db.close();
    return;
  }

  const t0 = Date.now();
  const results = await processAll(alvo, token);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  // Aplicar ao DB
  const okResults = results.filter((r) => r.ok);
  const updates: DBUpdate[] = okResults.map((r) => ({
    id: r.id,
    resposta_canonica: r.r,
    correta: r.r,
    d1: r.d1,
    d2: r.d2,
    d3: r.d3,
  }));

  if (updates.length > 0) {
    applyToDb(db, updates);
  }

  // Salvar checkpoint
  const okIds = okResults.map((r) => r.id);
  saveCheckpoint(okIds);

  // Relatorio final
  const errResults = results.filter((r) => !r.ok);
  console.log(`\n[generate_canonicos_v9] ====== RELATORIO ======`);
  console.log(`[generate_canonicos_v9] processados: ${results.length}`);
  console.log(`[generate_canonicos_v9] sucesso: ${okResults.length}`);
  console.log(`[generate_canonicos_v9] falha: ${errResults.length}`);
  console.log(`[generate_canonicos_v9] elapsed: ${elapsed}s`);

  // Salvar relatorio de falhas para revisao
  const failReport = {
    generated_at: new Date().toISOString(),
    elapsed_s: parseFloat(elapsed),
    total: results.length,
    ok: okResults.length,
    err: errResults.length,
    failures: errResults.slice(0, 50).map((r) => ({ id: r.id, err: r.err })),
  };
  fs.writeFileSync(
    path.join(process.cwd(), 'data', 'm2_failures_v9.json'),
    JSON.stringify(failReport, null, 2),
  );

  // Sample dos primeiros sucessos
  console.log(`\n[generate_canonicos_v9] Primeiras 5 respostas geradas:`);
  for (const r of okResults.slice(0, 5)) {
    console.log(`  ${r.id}: ${r.r} | d1=${r.d1} | d2=${r.d2} | d3=${r.d3}`);
  }

  db.close();
  console.log('[generate_canonicos_v9] Concluido.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[generate_canonicos_v9] ERRO FATAL:', err);
    process.exit(1);
  });
}
