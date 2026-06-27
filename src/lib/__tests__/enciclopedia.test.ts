jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => {
    throw new Error('mock: sem db nos testes de funcao pura');
  }),
}));

import { normalizar, nomeApareceEm, listarVerbetes, encontrarVerbeteEm } from '../enciclopedia';

/**
 * V23.10 (J.1/J.3): testes das funcoes puras da enciclopedia.
 */
describe('enciclopedia (J)', () => {
  describe('normalizar', () => {
    it('remove acentos e baixa caixa', () => {
      expect(normalizar('Moisés')).toBe('moises');
      expect(normalizar('GRAÇA')).toBe('graca');
      expect(normalizar('João Batista')).toBe('joao batista');
    });
    it('lida com vazio/undefined', () => {
      expect(normalizar('')).toBe('');
      expect(normalizar(undefined as unknown as string)).toBe('');
    });
  });

  describe('nomeApareceEm (J.3 — match por palavra inteira)', () => {
    it('casa nome inteiro independente de acento/caixa', () => {
      expect(nomeApareceEm('A história de Moisés no Egito', 'Moisés')).toBe(true);
      expect(nomeApareceEm('Falamos sobre a graca de Deus.', 'Graça')).toBe(true);
      expect(nomeApareceEm('Davi venceu Golias', 'Davi')).toBe(true);
    });
    it('casa nome no fim com pontuacao', () => {
      expect(nomeApareceEm('O profeta era Elias.', 'Elias')).toBe(true);
      expect(nomeApareceEm('Quem foi Jonas?', 'Jonas')).toBe(true);
    });
    it('NAO casa substring dentro de outra palavra', () => {
      expect(nomeApareceEm('Ele estava feliz', 'fé')).toBe(false); // nome curto ignorado tambem
      expect(nomeApareceEm('A pedra rolou', 'Pedro')).toBe(false);
    });
    it('ignora nomes muito curtos (ruido)', () => {
      expect(nomeApareceEm('a e o', 'fé')).toBe(false);
    });
  });

  describe('persistencia (degradacao graciosa sem DB)', () => {
    it('listarVerbetes retorna [] sem DB', async () => {
      expect(await listarVerbetes()).toEqual([]);
    });
    it('encontrarVerbeteEm retorna null sem DB e sem texto', async () => {
      expect(await encontrarVerbeteEm('')).toBeNull();
      expect(await encontrarVerbeteEm('Moisés')).toBeNull(); // sem DB nao ha catalogo
    });
  });
});
