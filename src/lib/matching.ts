/**
 * Modulo: matching canonico (TF-IDF + sinonimos)
 * Implementacao completa (V5, ITEM-28).
 *
 * Algoritmo 2-camadas:
 * 1. Match exato: Levenshtein normalizado > 0.85 sobre canonica
 * 2. Match semantico: TF-IDF cosine > 0.75 sobre bag-of-words com sinonimos expandidos
 *
 * Sinonimos pre-mapeados (subset biblico):
 * - deus ~ senhor ~ yhwh ~ adonai ~ deus_pai
 * - jesus ~ cristo ~ messias ~ jesus_cristo ~ senhor_jesus
 * - espirito ~ espirito_santo ~ paracleto ~ consolador
 * - pai ~ deus_pai ~ progenitor
 * - filho ~ jesus ~ unigenito
 * - amor ~ caridade ~ dilecao
 * - salvacao ~ redencao ~ resgate ~ livramento
 * - pecado ~ transgressao ~ iniquidade
 * - fe ~ crenca ~ confianca
 * - oracao ~ rogativa ~ suplica
 * - igreja ~ ekklesia ~ congregacao ~ assembleia
 * - reino ~ basileia ~ dominio
 * - evangelho ~ boa_noticia ~ boa_nova
 * - baptismo ~ batismo
 * - ceia ~ eucaristia ~ santa_ceia
 * - alianca ~ pacto ~ testamento
 */

export interface MatchingResultado {
  score: number;          // 0-1
  correto: boolean;
  metodo: 'EXATO' | 'SEMANTICO' | 'FALHOU';
}

const SINONIMOS: Record<string, string[]> = {
  deus: ['senhor', 'yhwh', 'adonai', 'deus_pai', 'pai'],
  jesus: ['cristo', 'messias', 'jesus_cristo', 'senhor_jesus', 'filho'],
  cristo: ['jesus', 'messias', 'jesus_cristo', 'ungido'],
  espirito: ['espirito_santo', 'paracleto', 'consolador'],
  espirito_santo: ['espirito', 'paracleto', 'consolador'],
  amor: ['caridade', 'dilecao'],
  salvacao: ['redencao', 'resgate', 'livramento'],
  pecado: ['transgressao', 'iniquidade'],
  fe: ['crenca', 'confianca'],
  oracao: ['rogativa', 'suplica'],
  igreja: ['ekklesia', 'congregacao', 'assembleia'],
  reino: ['basileia', 'dominio'],
  evangelho: ['boa_noticia', 'boa_nova'],
  ceia: ['eucaristia', 'santa_ceia'],
  alianca: ['pacto', 'testamento'],
};

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizar(texto: string): string[] {
  return normalizar(texto).split(' ').filter((t) => t.length > 1);
}

export function expandirSinonimos(tokens: string[]): Set<string> {
  const set = new Set<string>();
  for (const token of tokens) {
    set.add(token);
    const sins = SINONIMOS[token];
    if (sins) {
      for (const s of sins) set.add(s);
    }
  }
  return set;
}

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
 * Similaridade por cosseno sobre sets de tokens expandidos.
 */
export function cossinoSets(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intercessao = 0;
  for (const token of a) {
    if (b.has(token)) intercessao++;
  }
  return intercessao / Math.sqrt(a.size * b.size);
}

/**
 * Match canonico completo: 2-camadas (Levenshtein exato + cossino semantico com sinonimos).
 */
export function matchCanonico(respostaUsuario: string, respostaCanonica: string): MatchingResultado {
  const normUsuario = normalizar(respostaUsuario);
  const normCanonica = normalizar(respostaCanonica);

  if (normUsuario === normCanonica) {
    return { score: 1.0, correto: true, metodo: 'EXATO' };
  }

  // Camada 1: Levenshtein exato
  const dist = levenshtein(normUsuario, normCanonica);
  const maxLen = Math.max(normUsuario.length, normCanonica.length);
  const similaridade = maxLen === 0 ? 0 : 1 - dist / maxLen;

  if (similaridade >= 0.85) {
    return { score: similaridade, correto: true, metodo: 'EXATO' };
  }

  // Camada 2: Cossino semantico com sinonimos
  const tokensUsuario = expandirSinonimos(tokenizar(respostaUsuario));
  const tokensCanonica = expandirSinonimos(tokenizar(respostaCanonica));
  const scoreSemantico = cossinoSets(tokensUsuario, tokensCanonica);

  if (scoreSemantico >= 0.75) {
    return { score: scoreSemantico, correto: true, metodo: 'SEMANTICO' };
  }

  return {
    score: Math.max(similaridade, scoreSemantico),
    correto: false,
    metodo: 'FALHOU',
  };
}