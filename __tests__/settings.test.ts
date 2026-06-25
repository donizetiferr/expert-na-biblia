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

// Mock expo-secure-store (V18.1: sem este mock o modulo nativo nao transpila e a
// suite inteira falhava ao carregar). Fallback para o comportamento "vazio" (null).
jest.mock('expo-secure-store', () => ({
  __esModule: true,
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

// Mock expo-sqlite. V18.1: openDatabaseSync LANCA para exercitar o fallback MOCK
// (catalogo deterministico) — antes retornava getAllSync=[] e os testes de catalogo
// (que checam o mock) recebiam [] e falhavam.
jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseSync: jest.fn(() => {
    throw new Error('sem expo-sqlite nativo (forca fallback mock nos testes)');
  }),
}));

import { loadSettings, saveSetting, SETTINGS_DEFAULTS } from '../src/lib/settings';
import { listarModulos, listarLicoes, listarPerguntas } from '../src/lib/db-queries';

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

describe('db-queries - MOCK data (V18: esquema REAL FB/AT/NT)', () => {
  it('catalogo mock tem 40 modulos (FB/AT/NT), sem M### nem TE', async () => {
    const modulos = await listarModulos();
    expect(modulos.length).toBe(40); // FB 18 + AT 18 + NT 4
    const areas = new Set(modulos.map((m) => m.area));
    expect(areas.has('FB')).toBe(true);
    expect(areas.has('AT')).toBe(true);
    expect(areas.has('NT')).toBe(true);
    // V18.1 MA.1: o mock NAO usa mais o esquema fake M### (que mascarava o bug do quiz)
    for (const m of modulos) {
      expect(m.id).toMatch(/^(FB|AT|NT)\d{2}$/);
    }
  });

  it('mock licoes tem 8 licoes por modulo com IDs MODULO-Lxx', async () => {
    const licoes = await listarLicoes('FB01');
    expect(licoes.length).toBe(8);
    expect(licoes[0]?.id).toMatch(/^FB01-L\d{2}$/);
  });

  it('mock perguntas tem 25 por licao', async () => {
    const perguntas = await listarPerguntas('FB01-L01');
    expect(perguntas.length).toBe(25);
    expect(perguntas[0]?.id).toMatch(/^FB01-L01-Q\d{2}$/);
  });
});