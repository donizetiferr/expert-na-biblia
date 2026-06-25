import { extrairAvaliacaoJson } from '../parse-json';

/**
 * V20: regressao do bug encontrado em teste de integracao real com o MiniMax-M2.7.
 * O modelo envolve a saida JSON em tags <think>...</think> E em cercas markdown
 * ```json ... ```. O parse antigo (so removia <think>) lancava em JSON.parse, fazendo
 * a "IA obrigatoria" das licoes cair para o fallback offline mesmo ONLINE.
 */
describe('extrairAvaliacaoJson', () => {
  const alvo = { correto: true, resposta_esperada: '66 livros', score: 1, feedback: 'ok' };

  it('parseia JSON puro', () => {
    const s = JSON.stringify(alvo);
    expect(JSON.parse(extrairAvaliacaoJson(s))).toEqual(alvo);
  });

  it('remove cercas markdown ```json', () => {
    const raw = '```json\n' + JSON.stringify(alvo) + '\n```';
    expect(JSON.parse(extrairAvaliacaoJson(raw))).toEqual(alvo);
  });

  it('remove cercas markdown ``` sem linguagem', () => {
    const raw = '```\n' + JSON.stringify(alvo) + '\n```';
    expect(JSON.parse(extrairAvaliacaoJson(raw))).toEqual(alvo);
  });

  it('remove tags <think> e cercas combinadas (formato real do M2.7)', () => {
    const raw =
      '<think>\nO usuario respondeu 66, que esta correto.\n</think>\n\n```json\n' +
      JSON.stringify(alvo) +
      '\n```';
    const out = extrairAvaliacaoJson(raw);
    expect(out).not.toMatch(/<think/i);
    expect(out).not.toMatch(/```/);
    expect(JSON.parse(out)).toEqual(alvo);
  });

  it('ignora texto antes/depois do objeto JSON', () => {
    const raw = 'Aqui esta a avaliacao:\n' + JSON.stringify(alvo) + '\nEspero ter ajudado!';
    expect(JSON.parse(extrairAvaliacaoJson(raw))).toEqual(alvo);
  });

  it('respeita chaves dentro de strings (feedback com { })', () => {
    const obj = { correto: false, resposta_esperada: 'x', score: 0, feedback: 'use {chave} assim' };
    const raw = '```json\n' + JSON.stringify(obj) + '\n```';
    expect(JSON.parse(extrairAvaliacaoJson(raw))).toEqual(obj);
  });

  it('lida com objeto aninhado balanceado', () => {
    const obj = { correto: true, resposta_esperada: 'a', score: 1, feedback: 'b', meta: { nested: 1 } };
    const raw = '<think>x</think>' + JSON.stringify(obj);
    expect(JSON.parse(extrairAvaliacaoJson(raw))).toEqual(obj);
  });
});
