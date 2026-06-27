import { registrarEvento, registrarErro, eventosRecentes } from '../analytics';

/**
 * V23.G.3: testes da telemetria local (JS puro — sem dependencia nativa).
 */
describe('analytics (telemetria local)', () => {
  it('registra eventos no ring buffer com nome + timestamp', () => {
    const antes = eventosRecentes().length;
    registrarEvento('quiz_concluido', { score: 80 });
    const depois = eventosRecentes();
    expect(depois.length).toBe(antes + 1);
    const ultimo = depois[depois.length - 1]!;
    expect(ultimo.nome).toBe('quiz_concluido');
    expect(ultimo.props).toEqual({ score: 80 });
    expect(typeof ultimo.em).toBe('string');
  });

  it('registra erro como evento "erro" com mensagem truncada', () => {
    registrarErro(new Error('falha de teste'), 'stack-aqui');
    const ultimo = eventosRecentes().slice(-1)[0]!;
    expect(ultimo.nome).toBe('erro');
    expect(ultimo.props?.mensagem).toContain('falha de teste');
  });

  it('mantem o ring buffer limitado (nao cresce indefinidamente)', () => {
    for (let i = 0; i < 150; i++) registrarEvento('app_open');
    // RING_MAX = 100 — o buffer nao deve exceder esse teto.
    expect(eventosRecentes().length).toBeLessThanOrEqual(100);
  });
});
