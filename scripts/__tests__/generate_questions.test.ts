/**
 * Testes para scripts/generate_questions.ts (V3, ITEM-16 + ITEM-17)
 * Foco em logica deterministica: filtro think tags, geracao de IDs, topicos.
 */

import { filtrarThinkTags, gerarId, MODULOS_NT, MODULOS_TEOLOGIA, type ModuloTopico } from '../generate_questions';

describe('filtrarThinkTags (V3)', () => {
  it('remove bloco <think> simples', () => {
    const input = '<think>raciocinio</think>{"resposta_canonica": "texto"}';
    expect(filtrarThinkTags(input)).toBe('{"resposta_canonica": "texto"}');
  });

  it('remove bloco think multilinha com flag gs', () => {
    const input = '<think>linha 1\nlinha 2\nlinha 3</think>{"ok": true}';
    expect(filtrarThinkTags(input)).toBe('{"ok": true}');
  });

  it('preserva texto sem tags think', () => {
    expect(filtrarThinkTags('{"ok": true}')).toBe('{"ok": true}');
  });

  it('trim resultado final', () => {
    const input = ' <think>x</think>  {"ok": 1}  ';
    expect(filtrarThinkTags(input)).toBe('{"ok": 1}');
  });
});

describe('gerarId (V3)', () => {
  it('formato NT05-L01-Q01 (modulo-licao-pergunta com padding)', () => {
    expect(gerarId('NT05', 1, 1)).toBe('NT05-L01-Q01');
    expect(gerarId('TE24', 10, 25)).toBe('TE24-L10-Q25');
  });

  it('zero-padding de licao 1-9 e Q 1-9', () => {
    expect(gerarId('FB01', 5, 3)).toBe('FB01-L05-Q03');
  });

  it('sem padding quando >= 10', () => {
    expect(gerarId('FB01', 15, 10)).toBe('FB01-L15-Q10');
  });
});

describe('MODULOS_NT + MODULOS_TEOLOGIA (catalogo V3)', () => {
  it('MODULOS_NT tem 13 modulos (NT05-NT17)', () => {
    expect(MODULOS_NT).toHaveLength(13);
    expect(MODULOS_NT[0]?.id).toBe('NT05');
    expect(MODULOS_NT[12]?.id).toBe('NT17');
  });

  it('MODULOS_TEOLOGIA tem 24 modulos (TE01-TE24)', () => {
    expect(MODULOS_TEOLOGIA).toHaveLength(24);
    expect(MODULOS_TEOLOGIA[0]?.id).toBe('TE01');
    expect(MODULOS_TEOLOGIA[23]?.id).toBe('TE24');
  });

  it('cada modulo tem ao menos 1 topico', () => {
    const todos = [...MODULOS_NT, ...MODULOS_TEOLOGIA];
    for (const m of todos) {
      expect(m.topicos.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('cada modulo tem num_licoes >= 4', () => {
    const todos: ModuloTopico[] = [...MODULOS_NT, ...MODULOS_TEOLOGIA];
    for (const m of todos) {
      expect(m.num_licoes).toBeGreaterThanOrEqual(4);
    }
  });

  it('total de perguntas NT ~ 3.000 (calculo)', () => {
    const total = MODULOS_NT.reduce((acc, m) => acc + m.num_licoes * m.perguntas_por_licao, 0);
    expect(total).toBeGreaterThanOrEqual(2800);
    expect(total).toBeLessThanOrEqual(3200);
  });

  it('total de perguntas Teologia ~ 3.500 (calculo)', () => {
    const total = MODULOS_TEOLOGIA.reduce((acc, m) => acc + m.num_licoes * m.perguntas_por_licao, 0);
    expect(total).toBeGreaterThanOrEqual(3300);
    expect(total).toBeLessThanOrEqual(3700);
  });
});