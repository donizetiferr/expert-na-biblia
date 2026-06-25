/**
 * V18.1 (MA.1 + MA.5) — funcoes novas de db-queries:
 *  - listarPerguntasAleatorias (amostra global ORDER BY RANDOM)
 *  - marcarModuloConcluido / moduloEstaCompleto (gravacao + checagem de modulo)
 *  - MOCK_MODULOS alinhado ao esquema REAL (FB/AT/NT, sem M### que mascarava o bug)
 */

const mockGetAllSync = jest.fn();
const mockRunSync = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(async () => null), setItem: jest.fn(async () => undefined) },
}));

jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseSync: jest.fn(() => ({
    getAllSync: (...a: unknown[]) => mockGetAllSync(...a),
    getFirstSync: jest.fn(() => null),
    runSync: (...a: unknown[]) => mockRunSync(...a),
    execSync: jest.fn(),
    withTransactionSync: jest.fn((fn: () => unknown) => fn()),
    closeAsync: jest.fn(async () => undefined),
  })),
}));

import {
  listarModulos,
  listarPerguntasAleatorias,
  marcarModuloConcluido,
  moduloEstaCompleto,
} from '../src/lib/db-queries';

beforeEach(() => {
  mockGetAllSync.mockReset();
  mockRunSync.mockReset();
});

describe('listarPerguntasAleatorias (real query path)', () => {
  it('emite ORDER BY RANDOM com LIMIT e retorna as linhas', async () => {
    mockGetAllSync.mockReturnValue(
      Array.from({ length: 20 }, (_, i) => ({
        id: `FB01-L01-Q${i}`,
        licao_id: 'FB01-L01',
        ordem: i,
        texto: '?',
        resposta_canonica: 'r',
        tipo: 'ABERTA',
        dificuldade: 'MEDIO',
      })),
    );
    const out = await listarPerguntasAleatorias(20);
    expect(out).toHaveLength(20);
    const [sql, params] = mockGetAllSync.mock.calls[0]!;
    expect(String(sql)).toMatch(/ORDER BY RANDOM\(\)\s+LIMIT \?/i);
    expect(params).toEqual([20]);
  });
});

describe('marcarModuloConcluido / moduloEstaCompleto (MA.5)', () => {
  it('marcarModuloConcluido grava concluido = 1 para o modulo', async () => {
    await marcarModuloConcluido('FB01');
    expect(mockRunSync).toHaveBeenCalledWith(
      expect.stringMatching(/UPDATE modulos SET concluido = 1 WHERE id = \?/),
      ['FB01'],
    );
  });

  it('moduloEstaCompleto = true quando todas as licoes estao concluidas', async () => {
    mockGetAllSync.mockReturnValue([{ total: 12, concluidas: 12 }]);
    expect(await moduloEstaCompleto('FB01')).toBe(true);
  });

  it('moduloEstaCompleto = false quando faltam licoes', async () => {
    mockGetAllSync.mockReturnValue([{ total: 12, concluidas: 5 }]);
    expect(await moduloEstaCompleto('FB01')).toBe(false);
  });

  it('moduloEstaCompleto = false para modulo sem licoes', async () => {
    mockGetAllSync.mockReturnValue([{ total: 0, concluidas: 0 }]);
    expect(await moduloEstaCompleto('FB99')).toBe(false);
  });
});

describe('MOCK_MODULOS fallback alinhado ao esquema REAL', () => {
  it('quando o DB lanca, usa o catalogo mock com IDs FB/AT/NT (sem M###)', async () => {
    mockGetAllSync.mockImplementation(() => {
      throw new Error('sem expo-sqlite (simula ambiente sem DB nativo)');
    });
    const modulos = await listarModulos();
    expect(modulos.length).toBe(40); // FB 18 + AT 18 + NT 4
    const areas = new Set(modulos.map((m) => m.area));
    expect(areas.has('FB')).toBe(true);
    expect(areas.has('AT')).toBe(true);
    expect(areas.has('NT')).toBe(true);
    // REGRESSAO: nenhum ID no esquema fake M### que mascarava o bug do quiz
    for (const m of modulos) {
      expect(m.id).toMatch(/^(FB|AT|NT)\d{2}$/);
      expect(m.id).not.toMatch(/^M\d/);
    }
  });

  it('listarPerguntasAleatorias no fallback ainda retorna N perguntas', async () => {
    mockGetAllSync.mockImplementation(() => {
      throw new Error('sem DB');
    });
    const out = await listarPerguntasAleatorias(20);
    expect(out).toHaveLength(20);
  });
});
