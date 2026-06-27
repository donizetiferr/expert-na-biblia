/**
 * V23.A.7: testes da (de)serializacao de backup (puro).
 */

jest.mock('expo-sqlite', () => ({
  __esModule: true,
  openDatabaseSync: jest.fn(() => {
    throw new Error('sem expo-sqlite nativo (forca fallback mock)');
  }),
}));

import { serializarBackup, parsearBackup, type BackupData } from '../src/lib/backup';

const SAMPLE: BackupData = {
  versao: 1,
  exportado_em: '2026-06-26T00:00:00.000Z',
  modulos: [{ id: 'FB01', concluido: 1 }],
  licoes: [{ id: 'FB01-L01', concluida: 1, score_max: 100 }],
  user_xp: [{ data: '2026-06-26', pontos: 50, origem: 'LICAO' }],
  user_streak: [{ dia: '2026-06-26', licoes_concluidas: 1 }],
  user_badges: [{ tipo: 'PRIMEIRO_MODULO' }],
};

describe('backup - round-trip', () => {
  it('serializar -> parsear preserva os dados', () => {
    const json = serializarBackup(SAMPLE);
    const back = parsearBackup(json);
    expect(back).toEqual(SAMPLE);
  });
});

describe('backup - parsear invalido', () => {
  it('lanca em JSON malformado', () => {
    expect(() => parsearBackup('{nao eh json')).toThrow();
  });
  it('lanca quando falta versao', () => {
    expect(() => parsearBackup(JSON.stringify({ modulos: [], licoes: [] }))).toThrow('versao');
  });
  it('lanca quando falta progresso', () => {
    expect(() => parsearBackup(JSON.stringify({ versao: 1 }))).toThrow('progresso');
  });
  it('preenche arrays ausentes com vazio', () => {
    const back = parsearBackup(JSON.stringify({ versao: 1, modulos: [], licoes: [] }));
    expect(back.user_xp).toEqual([]);
    expect(back.user_badges).toEqual([]);
  });
});
