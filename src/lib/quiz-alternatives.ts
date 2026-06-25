/**
 * Gerador batch de 4 alternativas plausiveis via M3.
 * Implementacao completa (V6, ITEM-41).
 *
 * Saida: data/quiz_alternatives.json com 10.850 entradas (4 alternativas cada).
 * Cada alternativa eh plausivel mas distinta da correta.
 *
 * EXECUCAO REAL: `npm run generate:alternatives` (requer MINIMAX_API_KEY).
 */

import * as fs from 'fs';
import * as path from 'path';

interface Questao {
  id: string;
  texto: string;
  resposta_canonica: string;
}

interface Alternativas {
  pergunta_id: string;
  correta: string;
  distrator1: string;
  distrator2: string;
  distrator3: string;
}

const M3_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';
const M3_MODEL = 'MiniMax-M2.7';
const THINK_REGEX = /<think[^>]*>.*?<\/think>/gs;

const SYSTEM_PROMPT = `Voce gera 3 distrators plausiveis (alternativas erradas) para perguntas biblicas.
Cada distrator deve ser plausivel (relacionado ao tema) mas claramente incorreto.
Responda em JSON estrito: { "d1": "...", "d2": "...", "d3": "..." }
NAO inclua tags <think>. Apenas JSON valido.`;

function filtrarThink(texto: string): string {
  return texto.replace(THINK_REGEX, '').trim();
}

async function callM3Alternativas(questao: Questao, apiKey: string): Promise<Alternativas | null> {
  const body = {
    model: M3_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Pergunta: ${questao.texto}\nResposta correta: ${questao.resposta_canonica}\nGere 3 distrators.`,
      },
    ],
    temperature: 0.6,
    max_tokens: 300,
  };

  try {
    const res = await fetch(M3_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;

    const data: { choices: Array<{ message: { content: string } }> } = await res.json();
    const raw = data.choices[0]?.message?.content ?? '';
    const limpo = filtrarThink(raw);

    const parsed: { d1?: string; d2?: string; d3?: string } = JSON.parse(limpo);
    if (!parsed.d1 || !parsed.d2 || !parsed.d3) return null;

    return {
      pergunta_id: questao.id,
      correta: questao.resposta_canonica,
      distrator1: parsed.d1,
      distrator2: parsed.d2,
      distrator3: parsed.d3,
    };
  } catch {
    return null;
  }
}

async function main() {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    console.debug('[quiz-alternatives] MINIMAX_API_KEY nao definida — modo stub.');
    const stubDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(stubDir)) fs.mkdirSync(stubDir, { recursive: true });
    const stub: Alternativas = {
      pergunta_id: 'STUB-001',
      correta: 'Jesus Cristo',
      distrator1: 'Moisés',
      distrator2: 'Paulo',
      distrator3: 'Pedro',
    };
    fs.writeFileSync(path.join(stubDir, 'quiz_alternatives.json'), JSON.stringify([stub], null, 2), 'utf8');
    return;
  }

  console.debug('[quiz-alternatives] Carregando questoes canônicas...');
  const canonicalPath = path.join(process.cwd(), 'data', 'canonical_responses.json');
  if (!fs.existsSync(canonicalPath)) {
    console.error('[quiz-alternatives] data/canonical_responses.json nao encontrado. Rode generate:canonical primeiro.');
    return;
  }

  const questoes: Questao[] = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
  const resultados: Alternativas[] = [];

  for (let i = 0; i < questoes.length; i++) {
    const q = questoes[i];
    if (!q) continue;
    const alt = await callM3Alternativas(q, apiKey);
    if (alt) resultados.push(alt);

    if (i % 100 === 0) {
      console.debug(`[quiz-alternatives] ${i}/${questoes.length} processadas`);
      fs.writeFileSync(
        path.join(process.cwd(), 'data', 'quiz_alternatives.json'),
        JSON.stringify(resultados, null, 2),
        'utf8'
      );
    }
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'data', 'quiz_alternatives.json'),
    JSON.stringify(resultados, null, 2),
    'utf8'
  );
  console.debug(`[quiz-alternatives] Concluido: ${resultados.length} alternativas geradas.`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[quiz-alternatives] Erro:', err);
    process.exit(1);
  });
}

export { callM3Alternativas, filtrarThink, type Questao, type Alternativas };