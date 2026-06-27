/**
 * V23.A.5: testes da logica pura do baú surpresa (RNG injetavel).
 */

jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseSync: jest.fn(() => {
    throw new Error('sem expo-sqlite nativo (forca fallback mock)');
  }),
}));

import { sortearBauXp, CHANCE_BAU, BONUS_BAU } from '../src/lib/bau';

describe('bau - sortearBauXp', () => {
  it('nao abre quando o 1o sorteio >= CHANCE_BAU', () => {
    // rng() retorna 0.99 (>= 0.3) -> sem baú
    expect(sortearBauXp(() => 0.99)).toBe(0);
  });

  it('abre e escolhe um bonus quando o 1o sorteio < CHANCE_BAU', () => {
    // 1o valor < CHANCE_BAU (abre), 2o valor escolhe o indice 0 -> BONUS_BAU[0]
    const seq = [CHANCE_BAU - 0.01, 0];
    let i = 0;
    const rng = () => seq[i++]!;
    expect(sortearBauXp(rng)).toBe(BONUS_BAU[0]);
  });

  it('escolhe o ultimo bonus quando o 2o sorteio ~1', () => {
    const seq = [0, 0.999];
    let i = 0;
    const rng = () => seq[i++]!;
    expect(sortearBauXp(rng)).toBe(BONUS_BAU[BONUS_BAU.length - 1]);
  });

  it('todo bonus possivel e positivo', () => {
    for (const b of BONUS_BAU) expect(b).toBeGreaterThan(0);
  });
});
