/**
 * V23.A.1: testes da logica pura de XP (curva de nivel + anti-farm).
 */

// expo-sqlite ausente nos testes -> openDatabaseSync lanca; helpers de DB de xp.ts
// degradam graciosamente (mas aqui so exercitamos as funcoes PURAS).
jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseSync: jest.fn(() => {
    throw new Error('sem expo-sqlite nativo (forca fallback mock)');
  }),
}));

import {
  nivelDeXp,
  xpMinimoDoNivel,
  resumoXp,
  calcularXpLicao,
  calcularXpQuiz,
  calcularBonusCombo,
  XP_POR_ACERTO,
  XP_BONUS_LICAO_100,
} from '../src/lib/xp';

describe('xp - nivelDeXp (curva floor(sqrt(xp/100))+1)', () => {
  it('nivel 1 na faixa 0..99', () => {
    expect(nivelDeXp(0)).toBe(1);
    expect(nivelDeXp(50)).toBe(1);
    expect(nivelDeXp(99)).toBe(1);
  });
  it('nivel 2 em 100..399', () => {
    expect(nivelDeXp(100)).toBe(2);
    expect(nivelDeXp(399)).toBe(2);
  });
  it('nivel 3 em 400..899 e nivel 4 em 900', () => {
    expect(nivelDeXp(400)).toBe(3);
    expect(nivelDeXp(899)).toBe(3);
    expect(nivelDeXp(900)).toBe(4);
  });
  it('valores invalidos/negativos -> nivel 1', () => {
    expect(nivelDeXp(-10)).toBe(1);
    expect(nivelDeXp(NaN)).toBe(1);
  });
});

describe('xp - xpMinimoDoNivel', () => {
  it('limites das faixas', () => {
    expect(xpMinimoDoNivel(1)).toBe(0);
    expect(xpMinimoDoNivel(2)).toBe(100);
    expect(xpMinimoDoNivel(3)).toBe(400);
    expect(xpMinimoDoNivel(4)).toBe(900);
  });
});

describe('xp - resumoXp', () => {
  it('total 0 -> nivel 1, progresso 0', () => {
    const r = resumoXp(0);
    expect(r).toEqual({ total: 0, nivel: 1, xpNoNivel: 0, xpParaProximo: 100, progresso: 0 });
  });
  it('total 150 -> nivel 2 (base 100, faixa 300, 50 no nivel)', () => {
    const r = resumoXp(150);
    expect(r.nivel).toBe(2);
    expect(r.xpNoNivel).toBe(50);
    expect(r.xpParaProximo).toBe(300);
    expect(r.progresso).toBeCloseTo(50 / 300, 5);
  });
});

describe('xp - calcularXpLicao (esforco + bonus 100% + anti-farm)', () => {
  it('10 acertos e 100% (1a vez) = 10*5 + 50', () => {
    expect(calcularXpLicao(10, 100, false)).toBe(10 * XP_POR_ACERTO + XP_BONUS_LICAO_100);
  });
  it('parcial (<100%) recompensa so o esforco, sem bonus', () => {
    expect(calcularXpLicao(8, 80, false)).toBe(8 * XP_POR_ACERTO);
  });
  it('revisita de licao concluida aplica anti-farm (20%)', () => {
    const base = 10 * XP_POR_ACERTO + XP_BONUS_LICAO_100; // 100
    expect(calcularXpLicao(10, 100, true)).toBe(Math.round(base * 0.2)); // 20
  });
  it('0 acertos e 0% = 0', () => {
    expect(calcularXpLicao(0, 0, false)).toBe(0);
  });
});

describe('xp - calcularXpQuiz', () => {
  it('5 XP por acerto', () => {
    expect(calcularXpQuiz(13)).toBe(13 * XP_POR_ACERTO);
    expect(calcularXpQuiz(0)).toBe(0);
  });
});

describe('xp - calcularBonusCombo (V23.B.5)', () => {
  it('sem bonus para combo < 3', () => {
    expect(calcularBonusCombo(0)).toBe(0);
    expect(calcularBonusCombo(2)).toBe(0);
  });
  it('+2 XP por acerto do combo a partir de 3', () => {
    expect(calcularBonusCombo(3)).toBe(6);
    expect(calcularBonusCombo(10)).toBe(20);
  });
});
