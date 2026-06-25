/**
 * Testes expandidos de matching canonico (V5, ITEM-39).
 * Cobre sinonimos + cossino semantico + edge cases.
 * Cobertura alvo: >90% de src/lib/matching.ts
 */

import {
  normalizar,
  tokenizar,
  expandirSinonimos,
  cossinoSets,
  levenshtein,
  matchCanonico,
} from '../matching';

describe('matching V5 - sinonimos', () => {
  it('deus ~ senhor expandidos', () => {
    const t = expandirSinonimos(['deus']);
    expect(t.has('deus')).toBe(true);
    expect(t.has('senhor')).toBe(true);
    expect(t.has('yhwh')).toBe(true);
  });

  it('jesus ~ cristo ~ messias expandidos', () => {
    const t = expandirSinonimos(['jesus']);
    expect(t.has('cristo')).toBe(true);
    expect(t.has('messias')).toBe(true);
    expect(t.has('jesus_cristo')).toBe(true);
  });

  it('token sem sinonimos retorna apenas ele mesmo', () => {
    const t = expandirSinonimos(['banana']);
    expect(t.size).toBe(1);
    expect(t.has('banana')).toBe(true);
  });
});

describe('matching V5 - cossino', () => {
  it('sets identicos = 1.0', () => {
    const a = new Set(['deus', 'amor']);
    const b = new Set(['deus', 'amor']);
    expect(cossinoSets(a, b)).toBeCloseTo(1.0, 5);
  });

  it('sets disjuntos = 0.0', () => {
    const a = new Set(['a']);
    const b = new Set(['b']);
    expect(cossinoSets(a, b)).toBe(0);
  });

  it('sets vazios = 0.0', () => {
    expect(cossinoSets(new Set(), new Set(['a']))).toBe(0);
  });

  it('parcial overlap < 1.0', () => {
    const a = new Set(['deus', 'mundo', 'carne']);
    const b = new Set(['deus', 'espirito']);
    const c = cossinoSets(a, b);
    expect(c).toBeGreaterThan(0);
    expect(c).toBeLessThan(1);
  });
});

describe('matching V5 - normalizar + tokenizar', () => {
  it('remove acentos e pontuacao', () => {
    expect(normalizar('Jesus Cristo!')).toBe('jesus cristo');
  });

  it('tokeniza string normalizada', () => {
    expect(tokenizar('Deus amou o mundo')).toEqual(['deus', 'amou', 'mundo']);
  });

  it('remove palavras de 1 caractere', () => {
    expect(tokenizar('a deus b')).toEqual(['deus']);
  });

  it('multiplos espacos viram um', () => {
    expect(normalizar('  deus    amor  ')).toBe('deus amor');
  });
});

describe('matching V5 - levenshtein', () => {
  it('strings identicas = 0', () => {
    expect(levenshtein('jesus', 'jesus')).toBe(0);
  });

  it('1 caractere diferente = 1', () => {
    expect(levenshtein('jesus', 'jesua')).toBe(1);
  });

  it('insercao de caractere', () => {
    expect(levenshtein('jesus', 'jesusx')).toBe(1);
  });

  it('delecao de caractere', () => {
    expect(levenshtein('jesus', 'jesu')).toBe(1);
  });

  it('strings vazias', () => {
    expect(levenshtein('', '')).toBe(0);
    expect(levenshtein('abc', '')).toBe(3);
  });
});

describe('matching V5 - matchCanonico 2-camadas', () => {
  it('match exato literal', () => {
    const r = matchCanonico('Deus', 'Deus');
    expect(r.correto).toBe(true);
    expect(r.metodo).toBe('EXATO');
    expect(r.score).toBe(1.0);
  });

  it('match aproximado (typo 1 char)', () => {
    const r = matchCanonico('Jesua', 'Jesus');
    expect(r.metodo).toBe('EXATO');
    expect(r.correto).toBe(true);
  });

  it('match semantico via sinonimos', () => {
    const r = matchCanonico('Cristo', 'Jesus');
    // V18.4 (ME.3): a garantia relevante e' que Cristo casa com Jesus (sinonimo).
    // O metodo pode ser SUBCONJUNTO ou SEMANTICO — ambos usam a tabela de sinonimos
    // (a camada de subconjunto roda antes da semantica e tambem resolve o sinonimo).
    expect(r.correto).toBe(true);
    expect(['SEMANTICO', 'SUBCONJUNTO']).toContain(r.metodo);
  });

  it('match semantico inverso (senhor ~ deus)', () => {
    const r = matchCanonico('Senhor', 'Deus');
    expect(r.correto).toBe(true);
  });

  it('match semantico messias ~ jesus', () => {
    const r = matchCanonico('Messias', 'Jesus Cristo');
    expect(r.correto).toBe(true);
  });

  it('rejeita resposta nao relacionada', () => {
    const r = matchCanonico('banana', 'Jesus Cristo');
    expect(r.correto).toBe(false);
    expect(r.metodo).toBe('FALHOU');
  });

  it('rejeita resposta vazia', () => {
    const r = matchCanonico('', 'Jesus Cristo');
    expect(r.correto).toBe(false);
  });

  it('ignora case + acentos', () => {
    const r = matchCanonico('JESUS', 'jesus');
    expect(r.correto).toBe(true);
    expect(r.score).toBe(1.0);
  });

  it('tolera pontuacao na resposta', () => {
    const r = matchCanonico('Jesus Cristo!', 'jesus cristo');
    expect(r.correto).toBe(true);
  });

  it('aceita sinonimo via caridade = amor', () => {
    const r = matchCanonico('Caridade', 'Amor');
    expect(r.correto).toBe(true);
  });

  // V19 BUG-2 (regressao): canonica placeholder NAO pode tornar a pergunta invencivel.
  describe('V19 BUG-2 — guard anti-invencibilidade (canonica placeholder)', () => {
    it('canonica "..." + resposta substantiva => aceita (SEM_GABARITO)', () => {
      const r = matchCanonico('A Biblia tem 66 livros no total', '...');
      expect(r.correto).toBe(true);
      expect(r.metodo).toBe('SEM_GABARITO');
    });
    it('canonica "NAO SEI" + resposta substantiva => aceita', () => {
      const r = matchCanonico('Genesis fala da criacao do mundo', 'NAO SEI');
      expect(r.correto).toBe(true);
      expect(r.metodo).toBe('SEM_GABARITO');
    });
    it('canonica placeholder + resposta trivial => FALHOU (nao passa de graca)', () => {
      const r = matchCanonico('ok', '...');
      expect(r.correto).toBe(false);
    });
    it('canonica curta VALIDA ("Deus") nao vira SEM_GABARITO', () => {
      const r = matchCanonico('Senhor', 'Deus');
      expect(r.metodo).not.toBe('SEM_GABARITO');
      expect(r.correto).toBe(true);
    });
    it('resposta placeholder do usuario sempre FALHOU', () => {
      const r = matchCanonico('...', 'A Palavra de Deus');
      expect(r.correto).toBe(false);
      expect(r.metodo).toBe('FALHOU');
    });
  });
});