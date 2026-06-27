/**
 * V23.A.3: testes do catalogo/constantes de meta diaria + degradacao em mock.
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => undefined) },
}));
jest.mock('expo-secure-store', () => ({
  __esModule: true,
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
}));
jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseSync: jest.fn(() => {
    throw new Error('sem expo-sqlite nativo (forca fallback mock)');
  }),
}));

import { OPCOES_META, META_BONUS_XP, obterMetaStatus, verificarMetaEConcederBonus } from '../src/lib/meta';

describe('meta - catalogo/constantes', () => {
  it('3 opcoes de meta com valores crescentes', () => {
    expect(OPCOES_META).toHaveLength(3);
    const valores = OPCOES_META.map((o) => o.valor);
    expect(valores).toEqual([50, 100, 150]);
  });
  it('META_BONUS_XP positivo', () => {
    expect(META_BONUS_XP).toBeGreaterThan(0);
  });
});

describe('meta - degradacao em mock (sem DB)', () => {
  it('obterMetaStatus usa meta default (50) e progresso 0', async () => {
    const st = await obterMetaStatus();
    expect(st.meta).toBe(50);
    expect(st.progresso).toBe(0);
    expect(st.batida).toBe(false);
    expect(st.fracao).toBe(0);
  });
  it('verificarMetaEConcederBonus nao concede bonus quando progresso < meta', async () => {
    expect(await verificarMetaEConcederBonus()).toBe(0);
  });
});
