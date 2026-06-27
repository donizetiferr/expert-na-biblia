jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => {
    throw new Error('mock: sem db nos testes');
  }),
}));

import {
  XP_POR_DIA_PLANO,
  listarPlanos,
  obterPlano,
  obterDias,
  diasConcluidos,
  contarDiasConcluidos,
  marcarDiaLido,
} from '../planos';

/**
 * V23.10 (J.2): testes da camada de planos de leitura (degradacao graciosa sem DB +
 * constante de recompensa).
 */
describe('planos (J.2)', () => {
  it('XP por dia e positivo', () => {
    expect(XP_POR_DIA_PLANO).toBeGreaterThan(0);
  });

  describe('persistencia (degradacao graciosa sem DB)', () => {
    it('listarPlanos retorna []', async () => {
      expect(await listarPlanos()).toEqual([]);
    });
    it('obterPlano retorna null', async () => {
      expect(await obterPlano('x')).toBeNull();
    });
    it('obterDias retorna []', async () => {
      expect(await obterDias('x')).toEqual([]);
    });
    it('diasConcluidos retorna Set vazio', async () => {
      const s = await diasConcluidos('x');
      expect(s instanceof Set).toBe(true);
      expect(s.size).toBe(0);
    });
    it('contarDiasConcluidos retorna 0', async () => {
      expect(await contarDiasConcluidos('x')).toBe(0);
    });
    it('marcarDiaLido retorna false sem DB (nao lanca)', async () => {
      expect(await marcarDiaLido('x', 1)).toBe(false);
    });
  });
});
