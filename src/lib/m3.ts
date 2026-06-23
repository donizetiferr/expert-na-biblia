/**
 * Cliente Minimax M2.7 (Token Plan) para avaliacao de respostas biblicas.
 * Implementacao completa (V5, ITEM-29).
 *
 * Endpoint: https://api.minimax.io/v1/chat/completions
 * Modelo: MiniMax-M2.7
 * Filtro: tags <think>...</think> sao removidas antes de parsear JSON.
 *
 * ATENCAO (pesquisa A4): API keys em expo-secure-store, NAO AsyncStorage.
 */

import * as SecureStore from 'expo-secure-store';
import type { RespostaAvaliacao } from '../types';

const M3_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';
const M3_MODEL = 'MiniMax-M2.7';
const THINK_REGEX = /<think[^>]*>.*?<\/think>/gs;
const SECURE_KEY_NAME = 'minimax_api_key';
const TIMEOUT_MS = 10000;
const RETRY_MAX = 3;
const RETRY_BACKOFF_MS = 1500;

export const SYSTEM_PROMPT_AVALIADOR = `Voce eh um avaliador de respostas biblicas em portugues brasileiro.
Para cada par (pergunta, resposta_usuario), responda em JSON estrito:
{
  "correto": boolean,
  "resposta_esperada": "texto canonico esperado",
  "score": 0-1,
  "feedback": "explicacao curta"
}
Use a traducao Almeida Revista e Corrigida como referencia. Tolerante a sinonimos biblicos (jesus = cristo = messias).
NAO inclua tags <think> nem raciocinio intermediario na saida final.`;

function filtrarThink(texto: string): string {
  return texto.replace(THINK_REGEX, '').trim();
}

export async function salvarApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEY_NAME, key);
}

export async function obterApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEY_NAME);
}

export async function avaliarResposta(
  pergunta: string,
  respostaUsuario: string
): Promise<RespostaAvaliacao> {
  const apiKey = await obterApiKey();
  if (!apiKey) {
    throw new Error('M3_API_KEY_NAO_CONFIGURADA: defina via salvarApiKey() antes de chamar.');
  }

  const body = {
    model: M3_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_AVALIADOR },
      { role: 'user', content: `Pergunta: ${pergunta}\n\nResposta do usuario: ${respostaUsuario}` },
    ],
    temperature: 0.2,
    max_tokens: 600,
  };

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= RETRY_MAX; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(M3_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 429 || res.status === 408) {
        await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * attempt));
        continue;
      }

      if (!res.ok) {
        throw new Error(`M3_HTTP_${res.status}`);
      }

      const data: { choices: Array<{ message: { content: string } }> } = await res.json();
      const raw = data.choices[0]?.message?.content ?? '';
      const limpo = filtrarThink(raw);

      const parsed = JSON.parse(limpo) as RespostaAvaliacao;
      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.name === 'AbortError') {
        throw new Error('M3_TIMEOUT');
      }
      await new Promise((r) => setTimeout(r, RETRY_BACKOFF_MS * attempt));
    }
  }

  throw lastError ?? new Error('M3_FALHOU_APOS_RETRIES');
}

export { M3_ENDPOINT, M3_MODEL, THINK_REGEX, TIMEOUT_MS };