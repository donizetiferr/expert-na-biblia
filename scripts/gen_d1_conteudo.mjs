/**
 * gen_d1_conteudo.mjs (V23.5 / D.1 + D.4)
 *
 * Batch M2.7 (MiniMax-M2.7) para gerar, por LICAO:
 *   - explicacao: mini-ensino didatico de 2-4 frases (PT-BR, tom de fe, acessivel)
 *   - versiculo_chave: 1 referencia "Livro C:V" (usada tambem como referencia no feedback, D.4)
 *
 * Fontes: data/db.sqlite (754 licoes em 40 modulos) + Token Plan M2.7.
 * Saida: data/conteudo_licoes.json  (map licao_id -> { explicacao, versiculo })
 * Checkpoint/resume: o proprio JSON de saida (le o que ja existe e pula).
 *
 * Uso:
 *   node --experimental-sqlite scripts/gen_d1_conteudo.mjs [--limit N] [--concurrency N] [--only PREFIX]
 *   (--only FB filtra so licoes cujo modulo comeca com FB; util p/ preflight)
 */
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseSync } from 'node:sqlite';

const M2_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';
const M2_MODEL = 'MiniMax-M2.7';
const THINK_REGEX = /<think[^>]*>[\s\S]*?<\/think>/g;
const DB_PATH = path.join(process.cwd(), 'data', 'db.sqlite');
const OUT_PATH = path.join(process.cwd(), 'data', 'conteudo_licoes.json');

const SYSTEM_PROMPT = `Voce e um professor de Biblia escrevendo um mini-ensino para um app de estudo biblico em portugues brasileiro.
Para a LICAO informada, escreva:
1. "explicacao": um mini-ensino DIDATICO de 2 a 4 frases que prepara o aluno ANTES de responder as perguntas. Linguagem acessivel (serve para criancas e adultos), tom acolhedor de fe, sem jargao. NAO faca perguntas, ENSINE o conceito central da licao.
2. "versiculo": UMA referencia biblica chave relacionada AO TEMA ESPECIFICO da licao (varie conforme o assunto; evite repetir sempre o mesmo versiculo), no formato "Livro Capitulo:Versiculo" (ex: "Joao 3:16"). Use a nomenclatura da Almeida Revista e Corrigida.
REGRA CRITICA DE IDIOMA: escreva ABSOLUTAMENTE TUDO em portugues brasileiro. NUNCA misture palavras em ingles ou em qualquer outro idioma.
Responda APENAS JSON estrito, sem markdown, sem <think>: {"explicacao":"...","versiculo":"Livro C:V"}`;

function getFlag(name, fallback) {
  const i = process.argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i === -1) return fallback;
  const a = process.argv[i];
  if (a.includes('=')) return a.split('=')[1];
  return process.argv[i + 1] ?? fallback;
}
const LIMIT = parseInt(getFlag('limit', '999999'), 10);
const CONCURRENCY = parseInt(getFlag('concurrency', '8'), 10);
const ONLY = getFlag('only', '');

function loadToken() {
  const p = path.join(
    process.env.USERPROFILE || 'C:\\Users\\Donizeti',
    'Downloads', 'Projetos_VSCode', 'Tokens API e acessos', 'minimax', 'credentials.env',
  );
  const txt = fs.readFileSync(p, 'utf8');
  const m = txt.match(/MINIMAX_AUTH_TOKEN="([^"]+)"/);
  if (!m) throw new Error('MINIMAX_AUTH_TOKEN nao encontrado');
  return m[1];
}

async function callM2(licaoNome, moduloNome, area, token) {
  const userMsg = `Modulo: ${moduloNome} (area ${area})\nLicao: ${licaoNome}`;
  const body = {
    model: M2_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMsg },
    ],
    temperature: 0.4,
    max_tokens: 500,
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 40000);
  try {
    const res = await fetch(M2_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, err: `HTTP ${res.status}` };
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '';
    const limpo = raw.replace(THINK_REGEX, '').trim();
    const jm = limpo.match(/\{[\s\S]*\}/);
    if (!jm) return { ok: false, err: 'no-json: ' + limpo.slice(0, 80) };
    const parsed = JSON.parse(jm[0]);
    const explicacao = String(parsed.explicacao || '').trim();
    const versiculo = String(parsed.versiculo || '').trim();
    if (!explicacao) return { ok: false, err: 'empty-explicacao' };
    // Guard de idioma: rejeita (para retry) se a explicacao contem palavras claramente
    // em ingles (M2.7 ocasionalmente injeta fragmentos). Lista conservadora (sem falsos
    // positivos com PT-BR/nomes biblicos).
    if (/\b(the|and|with|that|need|quickly|which|word|book|any|from|when|where|about)\b/i.test(explicacao)) {
      return { ok: false, err: 'idioma-misturado' };
    }
    return { ok: true, explicacao, versiculo };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, err: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  const token = loadToken();
  const db = new DatabaseSync(DB_PATH);
  let licoes = db
    .prepare(
      `SELECT l.id AS id, l.nome AS nome, m.nome AS modulo_nome, m.area AS area
       FROM licoes l JOIN modulos m ON m.id = l.modulo_id ORDER BY m.ordem, l.ordem`,
    )
    .all();
  db.close();
  if (ONLY) licoes = licoes.filter((l) => String(l.id).startsWith(ONLY));

  const existing = fs.existsSync(OUT_PATH) ? JSON.parse(fs.readFileSync(OUT_PATH, 'utf8')) : {};
  let alvo = licoes.filter((l) => !existing[l.id]);
  if (alvo.length > LIMIT) alvo = alvo.slice(0, LIMIT);

  console.log(`[gen_d1] ${licoes.length} licoes totais, ${Object.keys(existing).length} ja feitas, ${alvo.length} alvo (conc=${CONCURRENCY})`);
  if (alvo.length === 0) { console.log('[gen_d1] nada a fazer'); return; }

  const queue = [...alvo];
  let ok = 0, err = 0, done = 0;
  const t0 = Date.now();
  let sinceSave = 0;

  function save() {
    fs.writeFileSync(OUT_PATH, JSON.stringify(existing, null, 0));
  }

  async function worker() {
    while (queue.length > 0) {
      const l = queue.shift();
      if (!l) break;
      let r = await callM2(l.nome, l.modulo_nome, l.area, token);
      // 1 retry em falha transitoria
      if (!r.ok) { await new Promise((x) => setTimeout(x, 1500)); r = await callM2(l.nome, l.modulo_nome, l.area, token); }
      done++;
      if (r.ok) {
        existing[l.id] = { explicacao: r.explicacao, versiculo: r.versiculo };
        ok++; sinceSave++;
      } else {
        err++;
        if (err <= 15) console.log(`[gen_d1] ERR ${l.id}: ${r.err}`);
      }
      if (sinceSave >= 20) { save(); sinceSave = 0; }
      if (done % 40 === 0 || done === alvo.length) {
        const el = ((Date.now() - t0) / 1000).toFixed(0);
        console.log(`[gen_d1] ${done}/${alvo.length} (ok=${ok} err=${err}) ${el}s last=${l.id}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  save();
  const el = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[gen_d1] DONE ok=${ok} err=${err} elapsed=${el}s total_no_arquivo=${Object.keys(existing).length}`);
}

main().catch((e) => { console.error('[gen_d1] FATAL', e); process.exit(1); });
