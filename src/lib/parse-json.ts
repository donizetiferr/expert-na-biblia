/**
 * V20: extrator robusto de JSON da resposta dos LLMs avaliadores (M2.7 / OpenAI).
 *
 * Motivo (bug encontrado em teste de integracao real V20): o MiniMax-M2.7 envolve a
 * saida em:
 *   - tags de raciocinio `<think>...</think>` (formato thinking nativo);
 *   - cercas de codigo markdown ` ```json ... ``` ` (mesmo pedindo "JSON estrito").
 * `JSON.parse` falhava direto sobre esse texto -> a avaliacao por IA SEMPRE lancava
 * excecao -> caia para o fallback offline mesmo ONLINE (IA obrigatoria nunca rodava).
 *
 * `extrairAvaliacaoJson` normaliza tudo isso e extrai o primeiro objeto `{...}`
 * balanceado, retornando a string pronta para `JSON.parse`.
 */

const THINK_REGEX = /<think[^>]*>[\s\S]*?<\/think>/gi;
const FENCE_REGEX = /```(?:json|JSON)?\s*([\s\S]*?)```/;

/** Remove tags <think>, cercas markdown e isola o primeiro objeto JSON balanceado. */
export function extrairAvaliacaoJson(raw: string): string {
  let texto = (raw ?? '').replace(THINK_REGEX, '').trim();

  // Se houver cerca de codigo markdown, usar o conteudo interno.
  const fence = texto.match(FENCE_REGEX);
  if (fence && fence[1]) {
    texto = fence[1].trim();
  }

  // Extrair o primeiro objeto {...} balanceado (ignora texto antes/depois).
  const inicio = texto.indexOf('{');
  if (inicio === -1) return texto;

  let profundidade = 0;
  let emString = false;
  let escapando = false;
  for (let i = inicio; i < texto.length; i++) {
    const ch = texto[i];
    if (escapando) {
      escapando = false;
      continue;
    }
    if (ch === '\\') {
      escapando = true;
      continue;
    }
    if (ch === '"') {
      emString = !emString;
      continue;
    }
    if (emString) continue;
    if (ch === '{') profundidade++;
    else if (ch === '}') {
      profundidade--;
      if (profundidade === 0) {
        return texto.slice(inicio, i + 1);
      }
    }
  }

  // Sem fechamento balanceado: devolve do primeiro '{' em diante (deixa o parse falhar).
  return texto.slice(inicio);
}

export { THINK_REGEX, FENCE_REGEX };
