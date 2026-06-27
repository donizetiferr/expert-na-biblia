/**
 * gen_d3_completar.mjs (V23.5 / D.3 — novo formato "completar versiculo")
 *
 * Para uma lista CURADA de referencias biblicas conhecidas (Almeida Revista e
 * Corrigida), pede ao M2.7 o texto do versiculo com UMA palavra-chave removida
 * (lacuna "_____"), a palavra correta e 3 distratores plausiveis.
 *
 * Saida: data/completar_versiculos.json (array de itens validados).
 * Uso: node scripts/gen_d3_completar.mjs [--concurrency N]
 */
import * as fs from 'fs';
import * as path from 'path';

const M2_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';
const M2_MODEL = 'MiniMax-M2.7';
const THINK_REGEX = /<think[^>]*>[\s\S]*?<\/think>/g;
const OUT_PATH = path.join(process.cwd(), 'data', 'completar_versiculos.json');

// Referencias curadas (conhecidas, de varias areas — narrativa, salmos, evangelhos, cartas).
const REFERENCIAS = [
  'Genesis 1:1', 'Genesis 1:27', 'Exodo 20:3', 'Exodo 20:12', 'Josue 1:9',
  'Salmos 23:1', 'Salmos 23:4', 'Salmos 1:1', 'Salmos 119:105', 'Salmos 46:1',
  'Salmos 91:1', 'Salmos 37:5', 'Proverbios 3:5', 'Proverbios 3:6', 'Proverbios 22:6',
  'Eclesiastes 3:1', 'Isaias 40:31', 'Isaias 41:10', 'Isaias 53:5', 'Jeremias 29:11',
  'Miqueias 6:8', 'Mateus 5:9', 'Mateus 6:33', 'Mateus 11:28', 'Mateus 28:19',
  'Mateus 22:37', 'Marcos 12:30', 'Lucas 2:11', 'Joao 1:1', 'Joao 3:16',
  'Joao 14:6', 'Joao 8:32', 'Joao 11:25', 'Atos 1:8', 'Atos 16:31',
  'Romanos 3:23', 'Romanos 5:8', 'Romanos 6:23', 'Romanos 8:28', 'Romanos 12:2',
  'Romanos 10:9', '1 Corintios 13:4', '1 Corintios 13:13', 'Galatas 5:22', 'Efesios 2:8',
  'Efesios 6:1', 'Filipenses 4:13', 'Filipenses 4:6', 'Colossenses 3:23', 'Hebreus 11:1',
  'Hebreus 13:8', 'Tiago 1:22', '1 Pedro 5:7', '1 Joao 1:9', '1 Joao 4:8',
  '1 Joao 4:19', 'Apocalipse 3:20', 'Apocalipse 21:4', 'Salmos 100:1', 'Provervios 16:3',
];

const SYSTEM_PROMPT = `Voce cria exercicios de "completar o versiculo" para um app biblico em portugues brasileiro (traducao Almeida Revista e Corrigida).
Para a REFERENCIA dada:
1. "referencia": a referencia exata recebida.
2. "texto_com_lacuna": o texto do versiculo (ou trecho representativo de ate ~120 caracteres) com UMA palavra-chave substituida por "_____" (5 underscores). A palavra removida deve ser significativa (um substantivo/verbo central), nunca um artigo.
3. "resposta": a palavra exata que foi removida (1 ou 2 palavras).
4. "distratores": array com EXATAMENTE 3 palavras plausiveis porem ERRADAS para aquela lacuna.
Escreva TUDO em portugues. Responda APENAS JSON estrito, sem markdown, sem <think>:
{"referencia":"...","texto_com_lacuna":"... _____ ...","resposta":"...","distratores":["...","...","..."]}`;

function getFlag(name, fallback) {
  const i = process.argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i === -1) return fallback;
  const a = process.argv[i];
  return a.includes('=') ? a.split('=')[1] : (process.argv[i + 1] ?? fallback);
}
const CONCURRENCY = parseInt(getFlag('concurrency', '6'), 10);

function loadToken() {
  const p = path.join(process.env.USERPROFILE || 'C:\\Users\\Donizeti',
    'Downloads', 'Projetos_VSCode', 'Tokens API e acessos', 'minimax', 'credentials.env');
  const m = fs.readFileSync(p, 'utf8').match(/MINIMAX_AUTH_TOKEN="([^"]+)"/);
  if (!m) throw new Error('token nao encontrado');
  return m[1];
}

async function callM2(ref, token) {
  const body = {
    model: M2_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Referencia: ${ref}` },
    ],
    temperature: 0.3,
    max_tokens: 400,
  };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 40000);
  try {
    const res = await fetch(M2_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body), signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, err: `HTTP ${res.status}` };
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '';
    const jm = raw.replace(THINK_REGEX, '').trim().match(/\{[\s\S]*\}/);
    if (!jm) return { ok: false, err: 'no-json' };
    const p = JSON.parse(jm[0]);
    const texto = String(p.texto_com_lacuna || '').trim();
    const resposta = String(p.resposta || '').trim();
    const distratores = Array.isArray(p.distratores) ? p.distratores.map((d) => String(d).trim()).filter(Boolean) : [];
    if (!texto.includes('_____') || !resposta || distratores.length < 3) return { ok: false, err: 'validacao' };
    return { ok: true, item: { referencia: ref, texto_com_lacuna: texto, resposta, distratores: distratores.slice(0, 3) } };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, err: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  const token = loadToken();
  const out = [];
  const queue = [...REFERENCIAS];
  let ok = 0, err = 0;
  const t0 = Date.now();
  async function worker() {
    while (queue.length > 0) {
      const ref = queue.shift();
      if (!ref) break;
      let r = await callM2(ref, token);
      if (!r.ok) { await new Promise((x) => setTimeout(x, 1500)); r = await callM2(ref, token); }
      if (r.ok) { out.push(r.item); ok++; } else { err++; console.log(`[gen_d3] ERR ${ref}: ${r.err}`); }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 0));
  console.log(`[gen_d3] DONE ok=${ok} err=${err} elapsed=${((Date.now() - t0) / 1000).toFixed(1)}s -> ${OUT_PATH}`);
}
main().catch((e) => { console.error('[gen_d3] FATAL', e); process.exit(1); });
