// Mocka a camada de DB (expo-sqlite nao e transformado pelo Jest). As funcoes puras
// testadas aqui nao tocam o banco; o mock so evita o import transitivo de expo-sqlite.
jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => {
    throw new Error('mock: sem db nos testes de funcao pura');
  }),
}));

import {
  COSMETICOS,
  COSMETICO_PADRAO,
  cosmeticoDesbloqueado,
  listarPorCategoria,
  cosmeticoPorId,
  corDoCosmetico,
  contarDesbloqueados,
  obterEquipado,
  equiparCosmetico,
} from '../cosmeticos';

/**
 * V23.8 (H.3): testes das funcoes puras de cosmeticos (catalogo + regra de desbloqueio
 * por nivel) + degradacao graciosa da camada de persistencia em ambiente sem DB.
 */
describe('cosmeticos (H.3)', () => {
  describe('catalogo', () => {
    it('todo cosmetico tem cor hex e categoria valida', () => {
      for (const c of COSMETICOS) {
        expect(c.cor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(['tema', 'aura']).toContain(c.categoria);
        expect(c.nivelRequisito).toBeGreaterThanOrEqual(1);
      }
    });

    it('cada categoria tem um PADRAO com requisito 1 (sempre desbloqueado)', () => {
      for (const cat of ['tema', 'aura'] as const) {
        const padrao = cosmeticoPorId(COSMETICO_PADRAO[cat]);
        expect(padrao).toBeDefined();
        expect(padrao!.categoria).toBe(cat);
        expect(padrao!.nivelRequisito).toBe(1);
      }
    });

    it('ids sao unicos', () => {
      const ids = COSMETICOS.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('cosmeticoDesbloqueado', () => {
    const c2 = { id: 'x', categoria: 'tema' as const, nome: 'X', cor: '#000000', nivelRequisito: 2 };
    it('bloqueado abaixo do requisito', () => {
      expect(cosmeticoDesbloqueado(c2, 1)).toBe(false);
    });
    it('desbloqueado no requisito e acima', () => {
      expect(cosmeticoDesbloqueado(c2, 2)).toBe(true);
      expect(cosmeticoDesbloqueado(c2, 5)).toBe(true);
    });
    it('nivel invalido cai para 1', () => {
      expect(cosmeticoDesbloqueado(c2, NaN)).toBe(false);
    });
  });

  describe('listarPorCategoria', () => {
    it('separa temas e auras', () => {
      const temas = listarPorCategoria('tema');
      const auras = listarPorCategoria('aura');
      expect(temas.length).toBeGreaterThan(0);
      expect(auras.length).toBeGreaterThan(0);
      expect(temas.every((c) => c.categoria === 'tema')).toBe(true);
      expect(auras.every((c) => c.categoria === 'aura')).toBe(true);
    });
  });

  describe('corDoCosmetico', () => {
    it('retorna a cor do id quando existe e e da categoria', () => {
      expect(corDoCosmetico('tema', 'tema_realeza')).toBe('#8b16c7');
    });
    it('cai no padrao quando id inexistente', () => {
      expect(corDoCosmetico('tema', 'inexistente')).toBe('#fe8917');
    });
    it('cai no padrao quando id e de outra categoria', () => {
      expect(corDoCosmetico('tema', 'aura_aurea')).toBe('#fe8917');
    });
    it('cai no padrao quando o nivel ainda nao desbloqueou', () => {
      // tema_ouro exige nivel 3
      expect(corDoCosmetico('tema', 'tema_ouro', 1)).toBe('#fe8917');
      expect(corDoCosmetico('tema', 'tema_ouro', 3)).toBe('#ffc027');
    });
  });

  describe('contarDesbloqueados', () => {
    it('cresce monotonicamente com o nivel', () => {
      const n1 = contarDesbloqueados(1);
      const n3 = contarDesbloqueados(3);
      const n9 = contarDesbloqueados(9);
      expect(n3).toBeGreaterThanOrEqual(n1);
      expect(n9).toBeGreaterThanOrEqual(n3);
      expect(n9).toBe(COSMETICOS.length); // nivel alto desbloqueia tudo
    });
  });

  describe('persistencia (degradacao graciosa sem DB)', () => {
    it('obterEquipado retorna o padrao quando nao ha DB', async () => {
      expect(await obterEquipado('tema')).toBe(COSMETICO_PADRAO.tema);
      expect(await obterEquipado('aura')).toBe(COSMETICO_PADRAO.aura);
    });
    it('equiparCosmetico recusa cosmetico bloqueado mesmo com DB', async () => {
      // tema_celeste exige nivel 5 — recusado em nivel 1 ANTES de tocar o DB.
      expect(await equiparCosmetico('tema', 'tema_celeste', 1)).toBe(false);
    });
    it('equiparCosmetico recusa id de outra categoria', async () => {
      expect(await equiparCosmetico('tema', 'aura_aurea', 9)).toBe(false);
    });
    it('equiparCosmetico desbloqueado retorna false sem DB (nao lanca)', async () => {
      // Desbloqueado no nivel, mas sem DB a persistencia falha graciosamente (false).
      expect(await equiparCosmetico('tema', 'tema_realeza', 9)).toBe(false);
    });
  });
});
