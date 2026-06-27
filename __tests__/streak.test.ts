/**
 * V23.A.2: testes da logica pura do streak (dias consecutivos + ponte por freeze).
 */

jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseSync: jest.fn(() => {
    throw new Error('sem expo-sqlite nativo (forca fallback mock)');
  }),
}));

import { calcularConsecutivos, semanaIso, formatarStreakTexto } from '../src/lib/streak';

const HOJE = '2026-06-26';

describe('streak - semanaIso', () => {
  it('formata YYYY-Www e agrupa dias da mesma semana ISO', () => {
    expect(semanaIso('2026-06-25')).toMatch(/^\d{4}-W\d{2}$/);
    expect(semanaIso('2026-06-22')).toBe(semanaIso('2026-06-26')); // seg..sex mesma semana
  });
});

describe('streak - calcularConsecutivos', () => {
  it('lista vazia -> 0', () => {
    expect(calcularConsecutivos([], new Set(), HOJE)).toBe(0);
  });

  it('3 dias consecutivos terminando hoje -> 3', () => {
    const dias = ['2026-06-26', '2026-06-25', '2026-06-24'];
    expect(calcularConsecutivos(dias, new Set(), HOJE)).toBe(3);
  });

  it('lacuna de 1 dia SEM freeze quebra o streak', () => {
    const dias = ['2026-06-26', '2026-06-24']; // falta 25
    expect(calcularConsecutivos(dias, new Set(), HOJE)).toBe(1);
  });

  it('lacuna de 1 dia COM freeze da semana faltante e bridge', () => {
    const dias = ['2026-06-26', '2026-06-24']; // falta 25
    const freeze = new Set([semanaIso('2026-06-25')]);
    expect(calcularConsecutivos(dias, freeze, HOJE)).toBe(2);
  });

  it('lacuna de 2 dias nao e coberta por 1 unico freeze', () => {
    const dias = ['2026-06-26', '2026-06-23']; // faltam 24 e 25
    const freeze = new Set([semanaIso('2026-06-25')]);
    expect(calcularConsecutivos(dias, freeze, HOJE)).toBe(1);
  });
});

describe('streak - formatarStreakTexto', () => {
  it('0 dias -> chamada para comecar', () => {
    expect(formatarStreakTexto({ dias_consecutivos: 0, ultima_atividade: null, congelado_esta_semana: false })).toContain('Comece');
  });
  it('1 dia e N dias', () => {
    expect(formatarStreakTexto({ dias_consecutivos: 1, ultima_atividade: HOJE, congelado_esta_semana: false })).toContain('1 dia');
    expect(formatarStreakTexto({ dias_consecutivos: 5, ultima_atividade: HOJE, congelado_esta_semana: false })).toContain('5 dias');
  });
});
