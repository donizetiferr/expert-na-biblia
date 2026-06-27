/**
 * V23.B.1: testes da logica pura de thresholds de badges + integridade do catalogo.
 */

jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseSync: jest.fn(() => {
    throw new Error('sem expo-sqlite nativo (forca fallback mock)');
  }),
}));

import { BADGES, tiposPorModulos, tiposPorStreak, tiposPorAreas } from '../src/lib/badges';

describe('badges - catalogo', () => {
  it('todo badge tem tipo == chave, titulo, descricao e emoji', () => {
    for (const [chave, def] of Object.entries(BADGES)) {
      expect(def.tipo).toBe(chave);
      expect(def.titulo.length).toBeGreaterThan(0);
      expect(def.descricao.length).toBeGreaterThan(0);
      expect(def.emoji.length).toBeGreaterThan(0);
    }
  });
});

describe('badges - tiposPorModulos', () => {
  it('marcos cumulativos por contagem de modulos', () => {
    expect(tiposPorModulos(0)).toEqual([]);
    expect(tiposPorModulos(1)).toEqual(['PRIMEIRO_MODULO']);
    expect(tiposPorModulos(5)).toContain('MODULOS_5');
    expect(tiposPorModulos(40)).toEqual([
      'PRIMEIRO_MODULO',
      'MODULOS_5',
      'MODULOS_10',
      'MODULOS_20',
      'MODULOS_40',
    ]);
  });
});

describe('badges - tiposPorStreak', () => {
  it('marcos de streak 7/30/100', () => {
    expect(tiposPorStreak(6)).toEqual([]);
    expect(tiposPorStreak(7)).toEqual(['STREAK_7']);
    expect(tiposPorStreak(100)).toEqual(['STREAK_7', 'STREAK_30', 'STREAK_100']);
  });
});

describe('badges - tiposPorAreas', () => {
  it('so marca area 100% concluida', () => {
    const areas = [
      { area: 'FB', total: 18, concluidos: 18 },
      { area: 'AT', total: 18, concluidos: 10 },
      { area: 'NT', total: 4, concluidos: 4 },
    ];
    expect(tiposPorAreas(areas)).toEqual(['AREA_FB', 'AREA_NT']);
  });
  it('ignora area vazia (total 0)', () => {
    expect(tiposPorAreas([{ area: 'TE', total: 0, concluidos: 0 }])).toEqual([]);
  });
});
