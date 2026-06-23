import { normalizar, levenshtein, matchCanonico } from '../src/lib/matching';

describe('matching - normalizar', () => {
  it('remove acentos', () => {
    expect(normalizar('Jesus')).toBe('jesus');
    expect(normalizar('Coraçao')).toBe('coracao');
  });

  it('lowercase + trim', () => {
    expect(normalizar('  DEUS  ')).toBe('deus');
  });
});

describe('matching - levenshtein', () => {
  it('strings identicas = 0', () => {
    expect(levenshtein('jesus', 'jesus')).toBe(0);
  });

  it('1 caractere diferente = 1', () => {
    expect(levenshtein('jesus', 'jesua')).toBe(1);
  });

  it('strings vazias', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('', '')).toBe(0);
  });
});

describe('matching - matchCanonico', () => {
  it('match exato', () => {
    const r = matchCanonico('Jesus', 'Jesus');
    expect(r.correto).toBe(true);
    expect(r.score).toBe(1.0);
  });

  it('match aproximado (typo 1 char)', () => {
    const r = matchCanonico('Jesua', 'Jesus');
    expect(r.metodo).toBe('EXATO');
    expect(r.correto).toBe(true);
  });

  it('resposta vazia = falhou', () => {
    const r = matchCanonico('', 'Jesus');
    expect(r.correto).toBe(false);
    expect(r.metodo).toBe('FALHOU');
  });
});