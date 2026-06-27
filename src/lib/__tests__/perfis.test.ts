// Mock da camada de DB: as funcoes puras nao tocam o banco; as de persistencia degradam
// graciosamente quando getDatabase lanca (sem expo-sqlite no Jest).
jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => {
    throw new Error('mock: sem db nos testes');
  }),
}));

import {
  nomeValido,
  gerarPerfilId,
  tabelasProgresso,
  PERFIL_PADRAO_ID,
  MAX_PERFIS,
  listarPerfis,
  obterPerfilAtivo,
  obterTipoAtivo,
  criarPerfil,
  trocarPerfil,
} from '../perfis';

/**
 * V23.9 (milestone I): testes das funcoes puras de perfis + degradacao graciosa da
 * persistencia sem DB.
 */
describe('perfis (I)', () => {
  describe('nomeValido', () => {
    it('aceita 1-20 chars apos trim', () => {
      expect(nomeValido('Maria')).toBe(true);
      expect(nomeValido('A')).toBe(true);
      expect(nomeValido('  João  ')).toBe(true);
      expect(nomeValido('12345678901234567890')).toBe(true); // 20
    });
    it('rejeita vazio e > 20 chars', () => {
      expect(nomeValido('')).toBe(false);
      expect(nomeValido('   ')).toBe(false);
      expect(nomeValido('123456789012345678901')).toBe(false); // 21
    });
  });

  describe('gerarPerfilId', () => {
    it('gera ids unicos com prefixo p_', () => {
      const ids = new Set(Array.from({ length: 50 }, () => gerarPerfilId()));
      expect(ids.size).toBe(50);
      for (const id of ids) expect(id.startsWith('p_')).toBe(true);
    });
  });

  describe('tabelasProgresso', () => {
    it('inclui as tabelas de estado de jogo (sem catalogo de conteudo)', () => {
      const t = tabelasProgresso();
      expect(t).toContain('user_xp');
      expect(t).toContain('user_streak');
      expect(t).toContain('user_cosmeticos');
      expect(t).toContain('streak_freeze');
      // NAO deve copiar catalogo de conteudo:
      expect(t).not.toContain('perguntas');
      expect(t).not.toContain('modulos');
      expect(t).not.toContain('licoes');
    });
  });

  describe('constantes', () => {
    it('expoe o id do perfil padrao e o limite', () => {
      expect(PERFIL_PADRAO_ID).toBe('default');
      expect(MAX_PERFIS).toBeGreaterThanOrEqual(2);
    });
  });

  describe('persistencia (degradacao graciosa sem DB)', () => {
    it('listarPerfis retorna [] sem DB', async () => {
      expect(await listarPerfis()).toEqual([]);
    });
    it('obterPerfilAtivo retorna null sem DB', async () => {
      expect(await obterPerfilAtivo()).toBeNull();
    });
    it('obterTipoAtivo cai em normal sem DB', async () => {
      expect(await obterTipoAtivo()).toBe('normal');
    });
    it('criarPerfil rejeita nome invalido ANTES do DB', async () => {
      expect(await criarPerfil('', 'normal')).toBeNull();
    });
    it('criarPerfil com nome valido retorna null sem DB (nao lanca)', async () => {
      expect(await criarPerfil('Maria', 'kids')).toBeNull();
    });
    it('trocarPerfil retorna false sem DB (nao lanca)', async () => {
      expect(await trocarPerfil('qualquer')).toBe(false);
    });
  });
});
