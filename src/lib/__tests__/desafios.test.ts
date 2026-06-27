jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => {
    throw new Error('mock: sem db nos testes de funcao pura');
  }),
}));

import {
  diaDoAno,
  calcularPascoa,
  eventoSazonal,
  desafioDiario,
  desafioSemanal,
  desafiosAtivos,
  progressoDesafio,
  desafioResgatado,
  resgatarDesafio,
} from '../desafios';

const dataUTC = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

/**
 * V23.11 (K): testes das funcoes puras de desafios (rotacao deterministica + sazonais).
 */
describe('desafios (K)', () => {
  describe('diaDoAno', () => {
    it('1 de janeiro = 1', () => {
      expect(diaDoAno(dataUTC(2026, 1, 1))).toBe(1);
    });
    it('31 de dezembro = 365 (ano nao bissexto)', () => {
      expect(diaDoAno(dataUTC(2026, 12, 31))).toBe(365);
    });
  });

  describe('calcularPascoa (computus)', () => {
    it('bate com datas conhecidas', () => {
      expect(calcularPascoa(2024)).toEqual({ mes: 3, dia: 31 });
      expect(calcularPascoa(2025)).toEqual({ mes: 4, dia: 20 });
      expect(calcularPascoa(2026)).toEqual({ mes: 4, dia: 5 });
      expect(calcularPascoa(2027)).toEqual({ mes: 3, dia: 28 });
    });
  });

  describe('eventoSazonal', () => {
    it('Natal em dezembro (1-25)', () => {
      const e = eventoSazonal(dataUTC(2026, 12, 10));
      expect(e?.titulo).toContain('Natal');
      expect(e?.tipo).toBe('sazonal');
    });
    it('Páscoa no domingo de Páscoa (2026 = 5/abr)', () => {
      const e = eventoSazonal(dataUTC(2026, 4, 5));
      expect(e?.titulo).toContain('Páscoa');
    });
    it('Quaresma alguns dias antes da Páscoa', () => {
      const e = eventoSazonal(dataUTC(2026, 3, 20)); // ~16 dias antes de 5/abr
      expect(e?.titulo).toContain('Quaresma');
    });
    it('dia comum -> null', () => {
      expect(eventoSazonal(dataUTC(2026, 7, 17))).toBeNull();
    });
  });

  describe('rotacao deterministica', () => {
    it('desafioDiario e estavel no mesmo dia e muda o id por data', () => {
      const a = desafioDiario(dataUTC(2026, 7, 17));
      const a2 = desafioDiario(dataUTC(2026, 7, 17));
      const b = desafioDiario(dataUTC(2026, 7, 18));
      expect(a.id).toBe(a2.id);
      expect(a.id).not.toBe(b.id);
      expect(a.metaXp).toBeGreaterThan(0);
    });
    it('desafioSemanal tem id por semana ISO', () => {
      const s = desafioSemanal(dataUTC(2026, 7, 17));
      expect(s.id).toMatch(/^semanal-\d{4}-W\d{2}$/);
      expect(s.metaXp).toBeGreaterThan(0);
    });
    it('desafiosAtivos inclui diario + semanal (e sazonal quando houver)', () => {
      const comum = desafiosAtivos(dataUTC(2026, 7, 17));
      expect(comum.map((d) => d.tipo).sort()).toEqual(['diario', 'semanal']);
      const natal = desafiosAtivos(dataUTC(2026, 12, 10));
      expect(natal.map((d) => d.tipo)).toContain('sazonal');
      expect(natal).toHaveLength(3);
    });
  });

  describe('persistencia (degradacao graciosa sem DB)', () => {
    it('progressoDesafio retorna 0', async () => {
      expect(await progressoDesafio(desafioDiario(new Date()))).toBe(0);
    });
    it('desafioResgatado retorna false', async () => {
      expect(await desafioResgatado('x')).toBe(false);
    });
    it('resgatarDesafio retorna 0 sem DB (nao lanca)', async () => {
      expect(await resgatarDesafio(desafioDiario(new Date()))).toBe(0);
    });
  });
});
