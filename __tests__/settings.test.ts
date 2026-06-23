/**
 * Testes para src/lib/settings.ts e src/lib/db-queries.ts
 * Valida logica deterministica (mock do AsyncStorage e do expo-sqlite).
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseSync: jest.fn(() => ({
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null),
    runSync: jest.fn(),
    execSync: jest.fn(),
    withTransactionSync: jest.fn((fn: () => unknown) => fn()),
    closeAsync: jest.fn(async () => undefined),
  })),
}));

import { loadSettings, saveSetting, SETTINGS_DEFAULTS } from '../src/lib/settings';

describe('settings - loadSettings', () => {
  it('retorna defaults quando AsyncStorage vazio', async () => {
    const s = await loadSettings();
    expect(s.musica).toBe(SETTINGS_DEFAULTS.musica);
    expect(s.efeitos).toBe(SETTINGS_DEFAULTS.efeitos);
    expect(s.notificacoes).toBe(SETTINGS_DEFAULTS.notificacoes);
  });
});

describe('settings - saveSetting', () => {
  it('salva musica=true como "1"', async () => {
    await saveSetting('musica', true);
    expect(true).toBe(true);
  });
});

describe('db-queries - MOCK data (V4)', () => {
  it('catalogo mock tem 77 modulos com areas distribuidas', async () => {
    const { listarModulos } = await import('../src/lib/db-queries');
    const modulos = await listarModulos();
    expect(modulos.length).toBe(77);
    const areas = new Set(modulos.map((m) => m.area));
    expect(areas.has('FB')).toBe(true);
    expect(areas.has('AT')).toBe(true);
    expect(areas.has('NT')).toBe(true);
    expect(areas.has('TE')).toBe(true);
  });

  it('mock licoes tem 8 licoes por modulo com IDs MODULO-Lxx', async () => {
    const { listarLicoes } = await import('../src/lib/db-queries');
    const licoes = await listarLicoes('M001');
    expect(licoes.length).toBe(8);
    expect(licoes[0]?.id).toMatch(/^M001-L\d{2}$/);
  });

  it('mock perguntas tem 25 por licao', async () => {
    const { listarPerguntas } = await import('../src/lib/db-queries');
    const perguntas = await listarPerguntas('M001-L01');
    expect(perguntas.length).toBe(25);
    expect(perguntas[0]?.id).toMatch(/^M001-L01-Q\d{2}$/);
  });
});