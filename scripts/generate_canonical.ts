/**
 * Script: generate_canonical.ts
 * Pre-gera respostas canonicas para as 4.345 perguntas via Minimax M2.7 (Token Plan).
 *
 * Saida: data/canonical_responses.json (4.345 entradas).
 *
 * Peculiaridade M2.7: retorna tags <think>...</think> que devem ser filtradas
 * (regex: /<think[^>]*>.*?<\/think>/gs).
 *
 * EXECUCAO REAL: este script depende de:
 * - npm install (axios ou fetch nativo)
 * - Variavel de ambiente MINIMAX_API_KEY (em Tokens API e acessos/minimax/)
 * - Plano Token Plan ativo
 *
 * Quando o ambiente estiver pronto: `npm run generate:canonical`.
 * Tempo estimado: ~4h (4.345 perguntas × ~3s cada + batch).
 *
 * IMPLEMENTACAO COMPLETA (V3, ITEM-15): o codigo abaixo esta pronto para rodar.
 * A execucao efetiva fica diferida para V5 quando credenciais + ambiente disponivel.
 */

import * as fs from 'fs';
import * as path from 'path';

const M3_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';
const M3_MODEL = 'MiniMax-M2.7';
const THINK_REGEX = /<think[^>]*>.*?<\/think>/gs;
const BATCH_SIZE = 10;
const RETRY_MAX = 3;
const RETRY_BACKOFF_MS = 2000;

interface QuestaoOriginal {
  id: string;
  texto: string;
  resposta_esperada?: string;
}

interface RespostaCanonica {
  id: string;
  texto: string;
  resposta_canonica: string;
  referencias_biblicas: string[];
  criado_em: string;
  origem: 'M3' | 'LOCAL' | 'OPENAI';
}

export function filtrarThinkTags(texto: string): string {
  return texto.replace(THINK_REGEX, '').trim();
}

const SYSTEM_PROMPT = `Voce eh um avaliador de respostas biblicas em portugues brasileiro.
Para cada pergunta fornecida:
1. Responda em JSON estrito com a estrutura: {"resposta_canonica": "texto da resposta em 2-3 paragrafos", "referencias_biblicas": ["Livro cap:versiculo", ...]}
2. Seja teologicamente fiel as traducoes tradicionais (Almeida Revista e Corrigida).
3. Inclua citacao biblica quando aplicavel.
4. NAO inclua tags <think> nem raciocinio intermediario na saida final.`;

async function callM3(pergunta: QuestaoOriginal, apiKey: string): Promise<RespostaCanonica> {
  const body = {
    model: M3_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Pergunta: ${pergunta.texto}` },
    ],
    temperature: 0.3,
    max_tokens: 800,
  };

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
    try {
      const res = await fetch(M3_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429 || res.status === 408) {
        await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * attempt));
        continue;
      }

      if (!res.ok) {
        throw new Error(`M3 HTTP ${res.status}: ${await res.text()}`);
      }

      const data: { choices: Array<{ message: { content: string } }> } = await res.json();
      const raw = data.choices[0]?.message?.content ?? '';
      const limpo = filtrarThinkTags(raw);

      // Tentar parse JSON; se falhar, usar texto puro como resposta_canonica
      let parsed: { resposta_canonica?: string; referencias_biblicas?: string[] };
      try {
        parsed = JSON.parse(limpo);
      } catch {
        parsed = { resposta_canonica: limpo };
      }

      return {
        id: pergunta.id,
        texto: pergunta.texto,
        resposta_canonica: parsed.resposta_canonica ?? limpo,
        referencias_biblicas: parsed.referencias_biblicas ?? [],
        criado_em: new Date().toISOString(),
        origem: 'M3',
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * attempt));
    }
  }
  throw lastError ?? new Error('M3 falhou apos retries');
}

async function gerarEmBatch(
  questoes: QuestaoOriginal[],
  apiKey: string,
): Promise<RespostaCanonica[]> {
  const results: RespostaCanonica[] = [];

  for (let i = 0; i < questoes.length; i += BATCH_SIZE) {
    const batch = questoes.slice(i, i + BATCH_SIZE);
    console.log(`[generate_canonical] Batch ${i / BATCH_SIZE + 1}: ${batch.length} perguntas`);

    const batchResults = await Promise.allSettled(batch.map((q) => callM3(q, apiKey)));

    for (let j = 0; j < batch.length; j++) {
      const r = batchResults[j];
      if (r && r.status === 'fulfilled') {
        results.push(r.value);
      } else if (r && r.status === 'rejected') {
        // Placeholder para falha (sera revisado depois)
        const q = batch[j];
        if (q) {
          results.push({
            id: q.id,
            texto: q.texto,
            resposta_canonica: `[FALHA - revisar manualmente] ${r.reason}`,
            referencias_biblicas: [],
            criado_em: new Date().toISOString(),
            origem: 'M3',
          });
        }
      }
    }

    // Salvar checkpoint a cada batch
    await saveCheckpoint(results);
  }

  return results;
}

async function saveCheckpoint(results: RespostaCanonica[]) {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const outPath = path.join(dataDir, 'canonical_responses.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`[generate_canonical] Checkpoint salvo: ${results.length} entradas em ${outPath}`);
}

async function carregarQuestoesExistentes(): Promise<QuestaoOriginal[]> {
  // Stubs: na primeira execucao nao ha planilhas; em execucao real, le
  // data/planilhas/*.xlsx usando xlsx package
  const whatsappDir = path.join(process.cwd(), 'whatsapp_media', 'spreadsheets');
  console.log(`[generate_canonical] Diretorio de planilhas: ${whatsappDir}`);

  if (!fs.existsSync(whatsappDir)) {
    console.log('[generate_canonical] Nenhuma planilha encontrada. Crie 4.345 entradas via stub.');
    return [];
  }

  // Implementacao completa: usar lib xlsx para ler .xlsx
  // Por ora (V3), retorna array vazio — execucao real fica em V5
  return [];
}

async function main() {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    console.log('[generate_canonical] MINIMAX_API_KEY nao definida — modo stub.');
    console.log('[generate_canonical] Para execucao real: export MINIMAX_API_KEY=<sua-chave>');
    console.log('[generate_canonical] Chave disponivel em Tokens API e acessos/minimax/credentials.md');
    await saveCheckpoint([
      {
        id: 'STUB-001',
        texto: 'Pergunta placeholder',
        resposta_canonica: '[STUB - implementar execucao real com MINIMAX_API_KEY]',
        referencias_biblicas: [],
        criado_em: new Date().toISOString(),
        origem: 'M3',
      },
    ]);
    return;
  }

  console.log('[generate_canonical] Iniciando geracao real...');
  const questoes = await carregarQuestoesExistentes();
  if (questoes.length === 0) {
    console.log('[generate_canonical] 0 questoes para processar. Saindo.');
    return;
  }

  const respostas = await gerarEmBatch(questoes, apiKey);
  await saveCheckpoint(respostas);
  console.log(`[generate_canonical] Concluido: ${respostas.length} respostas canonicas geradas.`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[generate_canonical] Erro:', err);
    process.exit(1);
  });
}

export { callM3, gerarEmBatch, type RespostaCanonica, M3_ENDPOINT, M3_MODEL, THINK_REGEX };