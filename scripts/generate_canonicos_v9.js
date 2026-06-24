// generate_canonicos_v9.js
// V9 — batch M2.7 para popular resposta_canonica + quiz_alternatives
// CommonJS puro (sem TS types) para rodar com node direto.

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

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

// CLI
function getCliFlag(name, fallback) {
  const idx = process.argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (idx === -1) return fallback;
  const arg = process.argv[idx];
  if (arg && arg.includes('=')) return arg.split('=')[1];
  return process.argv[idx + 1];
}

const LIMIT = parseInt(getCliFlag('limit', '999999') || '999999', 10);
const RESUME = process.argv.includes('--resume');
const CONCURRENCY = parseInt(getCliFlag('concurrency', '5') || '5', 10);

function loadToken() {
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

async function callM2(pergunta, token) {
  const body = {
    model: M2_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Pergunta: ${pergunta}` },
    ],
    temperature: 0.2,
    max_tokens: 1000,
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
    return { ok: false, err: `HTTP ${res.status}: ${txt.slice(0, 200)}`, tokens_in: 0, tokens_out: 0 };
  }

  const data = await res.json();
  const raw = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  // NOTA: o M2.7 muitas vezes devolve TUDO dentro de uma tag  THINK aberta e nunca fechada (max_tokens estoura antes do JSON).
  // Estrategia: achar o ULTIMO { ... } na string, seja dentro de think ou fora.
  const jsonMatches = [...raw.matchAll(/\{[\s\S]*?\}/g)];
  if (jsonMatches.length === 0) {
    return { ok: false, err: 'JSON nao encontrado: ' + raw.slice(0, 100), tokens_in: 0, tokens_out: 0, raw };
  }
  // Tentar cada match do ultimo para o primeiro ate achar um que parse
  let parsed = null;
  let parseErr = null;
  for (let i = jsonMatches.length - 1; i >= 0; i--) {
    const candidate = jsonMatches[i][0];
    try {
      const obj = JSON.parse(candidate);
      if (obj && typeof obj.r === 'string') {
        parsed = obj;
        break;
      }
    } catch (e) {
      parseErr = e;
    }
  }
  if (!parsed) {
    return { ok: false, err: 'Nenhum JSON com campo "r" parseavel (ultimo err: ' + (parseErr ? parseErr.message : '?') + ')', tokens_in: 0, tokens_out: 0, raw: raw.slice(0, 200) };
  }

  return {
    ok: !!parsed.r && !!parsed.d1,
    r: parsed.r || '',
    d1: parsed.d1 || '',
    d2: parsed.d2 || '',
    d3: parsed.d3 || '',
    tokens_in: (data.usage && data.usage.prompt_tokens) || 0,
    tokens_out: (data.usage && data.usage.completion_tokens) || 0,
    err: null,
  };
}

async function processAll(questoes, token, db) {
  const results = [];
  const queue = [...questoes];
  let processed = 0;
  let okCount = 0;
  let errCount = 0;
  const startTime = Date.now();
  let lastCheckpoint = 0;

  async function worker(id) {
    while (queue.length > 0) {
      const q = queue.shift();
      if (!q) break;
      let res;
      try {
        res = await callM2(q.texto, token);
      } catch (e) {
        res = { ok: false, err: String(e), tokens_in: 0, tokens_out: 0 };
      }
      const item = { id: q.id, ...res, _texto: q.texto };
      results.push(item);
      processed++;
      if (res.ok) okCount++;
      else errCount++;

      // Persistir no DB e checkpoint a cada 100 processados
      if (processed - lastCheckpoint >= 100) {
        lastCheckpoint = processed;
        const oks = results.filter((r) => r.ok && r.id).slice(-100);
        const updates = oks.map((r) => ({
          id: r.id,
          resposta_canonica: r.r,
          correta: r.r,
          d1: r.d1,
          d2: r.d2,
          d3: r.d3,
        }));
        if (updates.length > 0) {
          try { applyToDb(db, updates); } catch (e) { console.error('[v9] applyToDb mid:', e.message); }
          try { saveCheckpoint(oks.map((r) => r.id)); } catch (e) { console.error('[v9] saveCheckpoint mid:', e.message); }
          console.log(`[v9] ** CHECKPOINT ** persistido ${updates.length} updates, total_processed=${processed}, ok=${okCount}`);
        }
      }

      if (processed % 20 === 0 || processed === questoes.length) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        const rpm = elapsed > 0 ? ((processed / elapsed) * 60).toFixed(1) : '?';
        console.log(
          `[w${id}] ${processed}/${questoes.length} ok=${okCount} err=${errCount} elapsed=${elapsed}s rpm=${rpm} last=${q.id}`,
        );
      }
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker(i));
  await Promise.all(workers);

  return results;
}

function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_PATH)) return new Set();
  try {
    const data = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
    return new Set(data.ids_ok || []);
  } catch {
    return new Set();
  }
}

function saveCheckpoint(processedIds) {
  const dataDir = path.dirname(CHECKPOINT_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    CHECKPOINT_PATH,
    JSON.stringify({ ids_ok: processedIds, saved_at: new Date().toISOString() }, null, 2),
  );
}

function applyToDb(db, updates) {
  const updStmt = db.prepare('UPDATE perguntas SET resposta_canonica = ? WHERE id = ?');
  const insAlt = db.prepare(
    `INSERT INTO quiz_alternatives (pergunta_id, correta, distrator1, distrator2, distrator3)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(pergunta_id) DO UPDATE SET
       correta = excluded.correta,
       distrator1 = excluded.distrator1,
       distrator2 = excluded.distrator2,
       distrator3 = excluded.distrator3`,
  );

  const tx = db.transaction((rows) => {
    for (const u of rows) {
      updStmt.run(u.resposta_canonica, u.id);
      insAlt.run(u.id, u.correta, u.d1, u.d2, u.d3);
    }
  });
  tx(updates);

  const today = new Date().toISOString().slice(0, 10);
  const updUsage = db.prepare(
    `INSERT INTO m3_usage (data, chamadas, tokens_estimados) VALUES (?, ?, ?)
     ON CONFLICT(data) DO UPDATE SET
       chamadas = chamadas + excluded.chamadas,
       tokens_estimados = tokens_estimados + excluded.tokens_estimados`,
  );
  const totalTokens = updates.length * 250;
  updUsage.run(today, updates.length, totalTokens);
}

async function main() {
  console.log('[v9] Iniciando...');
  console.log(`[v9] config: limit=${LIMIT}, resume=${RESUME}, concurrency=${CONCURRENCY}`);
  const token = loadToken();
  console.log('[v9] token:', token.slice(0, 12) + '...');

  const db = new Database(DB_PATH);

  const todas = db
    .prepare('SELECT id, licao_id, texto, resposta_canonica FROM perguntas ORDER BY id')
    .all();
  console.log(`[v9] total perguntas: ${todas.length}`);

  let alvo = todas.filter((q) => q.resposta_canonica.includes('[GERAR]'));
  console.log(`[v9] com [GERAR]: ${alvo.length}`);

  if (RESUME) {
    const done = loadCheckpoint();
    const before = alvo.length;
    alvo = alvo.filter((q) => !done.has(q.id));
    console.log(`[v9] resume: pulando ${before - alvo.length}, processar ${alvo.length}`);
  }

  if (alvo.length > LIMIT) {
    alvo = alvo.slice(0, LIMIT);
    console.log(`[v9] limit: processando primeiros ${LIMIT}`);
  }

  if (alvo.length === 0) {
    console.log('[v9] nada a processar.');
    db.close();
    return;
  }

  const t0 = Date.now();
  const results = await processAll(alvo, token, db);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  const okResults = results.filter((r) => r.ok);
  const updates = okResults.map((r) => ({
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

  const okIds = okResults.map((r) => r.id);
  saveCheckpoint(okIds);

  const errResults = results.filter((r) => !r.ok);
  console.log(`\n[v9] ====== RELATORIO ======`);
  console.log(`[v9] processados: ${results.length}`);
  console.log(`[v9] sucesso:     ${okResults.length}`);
  console.log(`[v9] falha:       ${errResults.length}`);
  console.log(`[v9] elapsed:     ${elapsed}s`);

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

  console.log(`\n[v9] Primeiras 5 respostas:`);
  for (const r of okResults.slice(0, 5)) {
    console.log(`  ${r.id}: r="${r.r}" | d1="${r.d1}" | d2="${r.d2}" | d3="${r.d3}"`);
  }

  console.log(`\n[v9] Primeiras 3 falhas (se houver):`);
  for (const r of errResults.slice(0, 3)) {
    console.log(`  ${r.id}: err=${r.err}`);
  }

  db.close();
  console.log('[v9] Concluido.');
}

main().catch((err) => {
  console.error('[v9] ERRO FATAL:', err);
  process.exit(1);
});
