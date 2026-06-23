/**
 * Cliente OpenAI GPT-4o-mini (fallback para M3).
 * Implementacao completa (V5, ITEM-30).
 *
 * Acionado quando:
 * - M3 retorna 429/timeout/erro de rede
 * - M3 quota mensal estourada
 *
 * Endpoint: https://api.openai.com/v1/chat/completions
 * Mesmo JSON schema do M3.
 */

import * as SecureStore from 'expo-secure-store';
import type { RespostaAvaliacao } from '../types';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const SECURE_KEY_NAME = 'openai_api_key';
const TIMEOUT_MS = 10000;

export const SYSTEM_PROMPT_AVALIADOR = `Voce eh um avaliador de respostas biblicas em portugues brasileiro.
Responda em JSON estrito:
{ "correto": bool, "resposta_esperada": "texto", "score": 0-1, "feedback": "explicacao" }
Use Almeida Revista e Corrigida como referencia. Tolerante a sinonimos.`;

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
    throw new Error('OPENAI_API_KEY_NAO_CONFIGURADA');
  }

  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_AVALIADOR },
      { role: 'user', content: `Pergunta: ${pergunta}\n\nResposta: ${respostaUsuario}` },
    ],
    temperature: 0.2,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`OPENAI_HTTP_${res.status}`);

    const data: { choices: Array<{ message: { content: string } }> } = await res.json();
    const raw = data.choices[0]?.message?.content ?? '';
    return JSON.parse(raw) as RespostaAvaliacao;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('OPENAI_TIMEOUT');
    }
    throw err;
  }
}

export { OPENAI_ENDPOINT, OPENAI_MODEL, TIMEOUT_MS };