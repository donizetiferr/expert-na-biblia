/**
 * Modulo: matching canonico (TF-IDF + sinonimos)
 * Implementacao completa (V5, ITEM-28).
 *
 * Algoritmo 2-camadas + 3 camadas extras (V12 7.5):
 * 1. Match exato: Levenshtein normalizado > 0.50 sobre canonica
 * 2. Match semantico: TF-IDF cosine > 0.50 sobre bag-of-words com sinonimos expandidos
 * 3. Subconjunto de tokens: tokens do usuario contidos na canonica >= 60%
 * 4. Match numerico: extrair digitos e comparar como conjunto (ordem nao importa)
 * 5. Filtro de placeholders ('...', 'NAO SEI', '', 'tbd') antes do matching
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
 *
 * V12 7.5: sinonimos biblicos adicionais — antigo_testamento, novo_testamento,
 *   livros (39/66/73), deus_pai, jesus, etc.
 */

export interface MatchingResultado {
  score: number;          // 0-1
  correto: boolean;
  metodo: 'EXATO' | 'SEMANTICO' | 'SUBCONJUNTO' | 'NUMERICO' | 'SEM_GABARITO' | 'FALHOU';
}

const SINONIMOS: Record<string, string[]> = {
  // V12 7.5: sinonimos biblicos expandidos
  deus: ['senhor', 'yhwh', 'adonai', 'deus_pai', 'pai', 'altissimo'],
  jesus: ['cristo', 'messias', 'jesus_cristo', 'senhor_jesus', 'filho', 'ungido', 'salvador'],
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

  // V12 7.5: sinonimos biblicos comuns (AT/NT, livros)
  antigo_testamento: ['at', 'testamento_antigo', 'antigo', 'velho_pacto'],
  at: ['antigo_testamento', 'testamento_antigo', 'antigo', 'velho_pacto'],
  // V12 7.5: alias direto "antigo" -> "at" para casar "AT e NT" com "Antigo Testamento..."
  antigo: ['at', 'antigo_testamento', 'testamento_antigo', 'velho_pacto'],
  novo_testamento: ['nt', 'testamento_novo', 'novo', 'novo_pacto'],
  nt: ['novo_testamento', 'testamento_novo', 'novo', 'novo_pacto'],
  novo: ['nt', 'novo_testamento', 'testamento_novo', 'novo_pacto'],
  testamento: ['alianca', 'pacto', 'antigo_testamento', 'novo_testamento', 'at', 'nt'],
  livros: ['livro', 'escritos', 'escritura', 'rol', 'canon'],
  livro: ['livros', 'escritos', 'escritura'],
  genesis: ['gn', 'bereshit', 'criacao', 'principio'],
  gn: ['genesis', 'bereshit'],
  apocalipse: ['apoc', 'revelacao', 'revelacoes'],
  apoc: ['apocalipse', 'revelacao'],
  revelacao: ['apocalipse', 'apoc'],

  // Numeros biblicos comuns (string)
  trinta_nove: ['39'],
  '39': ['trinta_nove', 'trinta e nove'],
  sessenta_e_seis: ['66'],
  '66': ['sessenta_e_seis', 'sessenta e seis'],
  setenta_e_tres: ['73'],
  '73': ['setenta_e_tres', 'setenta e tres'],
};

// Placeholders reconhecidos (rejeitados ANTES do matching)
const PLACEHOLDERS = new Set([
  '',
  '...',
  '..',
  'nao sei',
  'nao_sabe',
  'nao sei responder',
  'tbd',
  'todo',
  'nada',
  'n/a',
  '?',
  'sem resposta',
  'placeholder',
]);

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

/**
 * V12 7.5: extrai apenas os digitos de uma string (normalizada).
 * Ex: "39 livros" -> "39", "sessenta e seis" -> "66" (NAO faz number-word conversion; so extrai digitos literais).
 */
export function extrairDigitos(texto: string): string {
  return (texto.match(/\d+/g) || []).join('');
}

/**
 * V12 7.5: detecta se o texto eh um placeholder.
 */
export function ehPlaceholder(texto: string): boolean {
  const norm = normalizar(texto);
  if (!norm) return true;
  if (PLACEHOLDERS.has(norm)) return true;
  // So pontuacao ou so numeros pequenos sem contexto (ex: "?")
  if (/^[\s\?\.]+$/.test(texto)) return true;
  return false;
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
 * V12 7.5: subconjunto de tokens — se tokens do usuario estao contidos na canonica
 * expandida (com sinonimos), retorna 1.0. Tolerante a respostas parciais tipo
 * "AT e NT" vs "Antigo Testamento e Novo Testamento".
 */
export function subconjuntoTokens(
  tokensUsuario: Set<string>,
  tokensCanonica: Set<string>
): { contido: boolean; score: number } {
  if (tokensUsuario.size === 0 || tokensCanonica.size === 0) {
    return { contido: false, score: 0 };
  }
  let contidos = 0;
  for (const t of tokensUsuario) {
    if (tokensCanonica.has(t)) contidos++;
  }
  const fracao = contidos / tokensUsuario.size;
  // V12 7.5: threshold 0.4 (era 0.6) — tolerante a respostas parciais com artigos/preposicoes
  // (ex: "39 livros do AT" vs "Antigo Testamento")
  return { contido: fracao >= 0.4, score: fracao };
}

/**
 * V12 7.5: match numerico — extrai digitos das duas strings e compara como conjunto
 * (sem ordem). "39" vs "39 livros" -> match.
 */
export function matchNumerico(a: string, b: string): { bate: boolean; score: number } {
  const digA = extrairDigitos(a);
  const digB = extrairDigitos(b);
  if (!digA || !digB) return { bate: false, score: 0 };
  // Compara como strings ordenadas por digito
  const setA = digA.split('').sort().join('');
  const setB = digB.split('').sort().join('');
  if (setA === setB && setA.length > 0) {
    return { bate: true, score: 1.0 };
  }
  return { bate: false, score: 0 };
}

/**
 * Match canonico completo: 5-camadas (V12 7.5).
 * Retorna { score, correto, metodo } onde metodo indica qual camada aprovou.
 */
export function matchCanonico(respostaUsuario: string, respostaCanonica: string): MatchingResultado {
  // V12 7.5: filtro de placeholders ANTES do matching
  if (ehPlaceholder(respostaUsuario)) {
    return { score: 0, correto: false, metodo: 'FALHOU' };
  }

  // V19 BUG-2 (guard anti-invencibilidade): se a resposta CANONICA eh um placeholder
  // (ex: '...', 'NAO SEI', vazia, <= 5 chars sem digitos), nao temos gabarito para
  // comparar — `normalizar('...')` => '' tornava a pergunta IMPOSSIVEL de acertar
  // (FALHOU sempre) e travava a progressao da licao. Como nao ha gabarito, NAO
  // penalizamos o usuario: qualquer resposta substantiva (>= 2 palavras OU >= 8
  // chars) eh aceita. Perguntas abertas sem gabarito sao casos de avaliacao por IA
  // (avaliador.ts / M2.7) quando online — ver evolution_plan V20.
  const canonNorm = normalizar(respostaCanonica);
  // So tratamos como "sem gabarito" os placeholders REAIS ('...', 'NAO SEI', '',
  // 'tbd', so pontuacao). NAO usar heuristica de tamanho: respostas curtas legitimas
  // como "Deus", "Jesus", "66", "39" sao gabaritos validos e devem seguir o matching.
  const canonSemGabarito = ehPlaceholder(respostaCanonica);
  if (canonSemGabarito) {
    const u = normalizar(respostaUsuario);
    const substantiva = u.length >= 8 || u.split(' ').filter((t) => t.length > 1).length >= 2;
    return substantiva
      ? { score: 0.7, correto: true, metodo: 'SEM_GABARITO' }
      : { score: 0, correto: false, metodo: 'FALHOU' };
  }

  const normUsuario = normalizar(respostaUsuario);
  const normCanonica = canonNorm;

  if (!normUsuario || !normCanonica) {
    return { score: 0, correto: false, metodo: 'FALHOU' };
  }

  // Match exato (normalizado)
  if (normUsuario === normCanonica) {
    return { score: 1.0, correto: true, metodo: 'EXATO' };
  }

  // Camada 0 (V12 7.5): match numerico — extrai digitos e compara
  const num = matchNumerico(normUsuario, normCanonica);
  if (num.bate) {
    return { score: num.score, correto: true, metodo: 'NUMERICO' };
  }

  // Camada 1: Levenshtein (threshold V12 7.5: 0.50)
  const dist = levenshtein(normUsuario, normCanonica);
  const maxLen = Math.max(normUsuario.length, normCanonica.length);
  const similaridade = maxLen === 0 ? 0 : 1 - dist / maxLen;

  if (similaridade >= 0.50) {
    return { score: similaridade, correto: true, metodo: 'EXATO' };
  }

  // Camada 2 (V12 7.5): subconjunto de tokens com sinonimos
  const tokensUsuario = expandirSinonimos(tokenizar(respostaUsuario));
  const tokensCanonica = expandirSinonimos(tokenizar(respostaCanonica));
  const sub = subconjuntoTokens(tokensUsuario, tokensCanonica);
  if (sub.contido) {
    return { score: Math.max(0.7, sub.score), correto: true, metodo: 'SUBCONJUNTO' };
  }

  // Camada 3 (V12 7.5): cosseno semantico (threshold 0.50)
  const scoreSemantico = cossinoSets(tokensUsuario, tokensCanonica);
  if (scoreSemantico >= 0.50) {
    return { score: scoreSemantico, correto: true, metodo: 'SEMANTICO' };
  }

  return {
    score: Math.max(similaridade, scoreSemantico, sub.score),
    correto: false,
    metodo: 'FALHOU',
  };
}
