/**
 * Modulo: matching canonico (TF-IDF + sinonimos)
 * Implementacao completa: V5 (ITEM-28).
 *
 * Algoritmo 2-camadas:
 * 1. Match exato: Levenshtein normalizado > 0.85 sobre a canonica
 * 2. Match semantico: TF-IDF cosine > 0.75 sobre bag-of-words com sinonimos expandidos
 *
 * Sinonimos pre-mapeados: deus ~ senhor ~ yhwh ~ adonai; jesus ~ cristo ~ messias
 */

export interface MatchingResultado {
  score: number;          // 0-1
  correto: boolean;
  metodo: 'EXATO' | 'SEMANTICO' | 'FALHOU';
}

/**
 * Normaliza texto: lowercase + remove acentos.
 */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/**
 * Levenshtein distance (placeholder V1; implementacao completa em V5).
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i]![0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0]![j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost
      );
    }
  }

  return matrix[a.length]![b.length]!;
}

/**
 * Match canonico placeholder. Implementacao real (TF-IDF + sinonimos): V5.
 */
export function matchCanonico(respostaUsuario: string, respostaCanonica: string): MatchingResultado {
  const normUsuario = normalizar(respostaUsuario);
  const normCanonica = normalizar(respostaCanonica);

  if (normUsuario === normCanonica) {
    return { score: 1.0, correto: true, metodo: 'EXATO' };
  }

  const dist = levenshtein(normUsuario, normCanonica);
  const maxLen = Math.max(normUsuario.length, normCanonica.length);
  const similaridade = maxLen === 0 ? 0 : 1 - dist / maxLen;

  return {
    score: similaridade,
    correto: similaridade >= 0.85,
    metodo: similaridade >= 0.85 ? 'EXATO' : 'FALHOU',
  };
}