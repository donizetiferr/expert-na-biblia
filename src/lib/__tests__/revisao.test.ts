// Mocka a camada de DB (expo-sqlite nao e transformado pelo Jest). As funcoes puras
// testadas aqui nao tocam o banco; o mock so evita o import transitivo de expo-sqlite.
jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => {
    throw new Error('mock: sem db nos testes de funcao pura');
  }),
}));

import { intervaloDias, proximaCaixa, proximaDataIso, CAIXA_MAX } from '../revisao';

/**
 * V23.5 (D.2): testes das funcoes puras do agendamento Leitner.
 */
describe('revisao (Leitner) — funcoes puras', () => {
  describe('intervaloDias', () => {
    it('mapeia caixas 1..5 para intervalos crescentes', () => {
      expect(intervaloDias(1)).toBe(1);
      expect(intervaloDias(2)).toBe(2);
      expect(intervaloDias(3)).toBe(4);
      expect(intervaloDias(4)).toBe(8);
      expect(intervaloDias(5)).toBe(16);
    });
    it('clampa caixas fora do range', () => {
      expect(intervaloDias(0)).toBe(1); // < 1 vira 1
      expect(intervaloDias(99)).toBe(16); // > 5 vira 5
      expect(intervaloDias(2.7)).toBe(2); // floor
    });
  });

  describe('proximaCaixa', () => {
    it('acerto sobe a caixa ate o maximo', () => {
      expect(proximaCaixa(1, true)).toBe(2);
      expect(proximaCaixa(4, true)).toBe(5);
      expect(proximaCaixa(CAIXA_MAX, true)).toBe(CAIXA_MAX); // nao passa de 5
    });
    it('erro sempre volta para a caixa 1', () => {
      expect(proximaCaixa(1, false)).toBe(1);
      expect(proximaCaixa(3, false)).toBe(1);
      expect(proximaCaixa(5, false)).toBe(1);
    });
  });

  describe('proximaDataIso', () => {
    it('soma o intervalo da caixa a data base (UTC)', () => {
      expect(proximaDataIso(1, '2026-06-27')).toBe('2026-06-28'); // +1 dia
      expect(proximaDataIso(3, '2026-06-27')).toBe('2026-07-01'); // +4 dias (vira o mes)
      expect(proximaDataIso(5, '2026-06-27')).toBe('2026-07-13'); // +16 dias
    });
    it('retorna formato YYYY-MM-DD', () => {
      expect(proximaDataIso(2, '2026-01-01')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
