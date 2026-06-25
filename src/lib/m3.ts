/**
 * Cliente Minimax M2.7 (Token Plan) para avaliacao de respostas biblicas.
 * Implementacao completa (V5, ITEM-29; M6 V8-RETOMADA: le key de app.config.ts via expo-constants).
 *
 * Endpoint: https://api.minimax.io/v1/chat/completions
 * Modelo: MiniMax-M2.7
 * Filtro: tags <think>...</think> sao removidas antes de parsear JSON.
 *
 * Resolucao de API key (ordem de prioridade):
 * 1. expo-secure-store (chave salva pelo usuario na UI)
 * 2. expo-constants extra.minimaxApiKey (config global via app.config.ts)
 * 3. Erro: instruir usuario a configurar
 */

import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import type { RespostaAvaliacao } from '../types';
import { extrairAvaliacaoJson } from './parse-json';

const M3_ENDPOINT =
  (Constants.expoConfig?.extra?.minimaxBaseUrl as string | undefined) || 'https://api.minimax.io/v1';
const M3_MODEL =
  (Constants.expoConfig?.extra?.minimaxModel as string | undefined) || 'MiniMax-M2.7';
const M3_CHAT_COMPLETIONS = `${M3_ENDPOINT}/chat/completions`;
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

export async function salvarApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEY_NAME, key);
}

export async function obterApiKey(): Promise<string | null> {
  // 1) Tenta secure-store primeiro (chave salva pelo usuario)
  const stored = await SecureStore.getItemAsync(SECURE_KEY_NAME);
  if (stored) return stored;
  // 2) Fallback: app.config.ts extra.minimaxApiKey
  const fromConfig = (Constants.expoConfig?.extra?.minimaxApiKey as string | undefined) || '';
  return fromConfig || null;
}

export async function avaliarResposta(
  pergunta: string,
  respostaUsuario: string
): Promise<RespostaAvaliacao> {
  const apiKey = await obterApiKey();
  if (!apiKey) {
    throw new Error('M3_API_KEY_NAO_CONFIGURADA: defina via ConfigScreen ou app.config.ts.');
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
      const res = await fetch(M3_CHAT_COMPLETIONS, {
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
      // V20: M2.7 envolve a saida em <think>...</think> E em cercas markdown ```json.
      // `extrairAvaliacaoJson` remove ambos e isola o objeto {...} antes do parse
      // (antes so removia <think>, e a cerca markdown quebrava o JSON.parse -> a IA
      // nunca era usada online). THINK_REGEX segue exportado para compat de testes.
      const limpo = extrairAvaliacaoJson(raw);

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

export { M3_ENDPOINT, M3_CHAT_COMPLETIONS, M3_MODEL, THINK_REGEX, TIMEOUT_MS };