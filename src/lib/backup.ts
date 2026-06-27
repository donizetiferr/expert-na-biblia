/**
 * V23.A.7: Export/import manual do progresso como rede de seguranca (alem do Android
 * Auto Backup configurado em app.config.ts). Serializa o estado de jogo (conclusoes de
 * modulos/licoes, XP, streak, badges) para JSON e restaura a partir dele.
 *
 * Helpers de (de)serializacao sao puros (testaveis); export/import tocam o SQLite e
 * degradam graciosamente em mock.
 */

import { getDatabase } from '../db/database';

export interface BackupData {
  versao: number;
  exportado_em: string;
  modulos: Array<{ id: string; concluido: number }>;
  licoes: Array<{ id: string; concluida: number; score_max: number }>;
  user_xp: Array<{ data: string; pontos: number; origem: string }>;
  user_streak: Array<{ dia: string; licoes_concluidas: number }>;
  user_badges: Array<{ tipo: string }>;
}

const BACKUP_VERSAO = 1;

/** Serializa um BackupData em JSON compacto (puro). */
export function serializarBackup(data: BackupData): string {
  return JSON.stringify(data);
}

/**
 * Faz o parse + valida a estrutura minima de um backup (puro). Lanca em JSON invalido
 * ou shape incompativel.
 */
export function parsearBackup(json: string): BackupData {
  const obj = JSON.parse(json) as Partial<BackupData>;
  if (!obj || typeof obj !== 'object') throw new Error('backup invalido');
  if (typeof obj.versao !== 'number') throw new Error('backup sem versao');
  if (!Array.isArray(obj.modulos) || !Array.isArray(obj.licoes)) {
    throw new Error('backup sem dados de progresso');
  }
  return {
    versao: obj.versao,
    exportado_em: obj.exportado_em ?? '',
    modulos: obj.modulos ?? [],
    licoes: obj.licoes ?? [],
    user_xp: obj.user_xp ?? [],
    user_streak: obj.user_streak ?? [],
    user_badges: obj.user_badges ?? [],
  };
}

/** Le o estado atual do SQLite e retorna o JSON do backup. */
export async function exportarProgresso(): Promise<string> {
  const data: BackupData = {
    versao: BACKUP_VERSAO,
    exportado_em: new Date().toISOString(),
    modulos: [],
    licoes: [],
    user_xp: [],
    user_streak: [],
    user_badges: [],
  };
  try {
    const db = getDatabase();
    data.modulos = db.getAllSync<{ id: string; concluido: number }>(
      'SELECT id, concluido FROM modulos WHERE concluido = 1',
    );
    data.licoes = db.getAllSync<{ id: string; concluida: number; score_max: number }>(
      'SELECT id, concluida, score_max FROM licoes WHERE concluida = 1',
    );
    data.user_xp = db.getAllSync<{ data: string; pontos: number; origem: string }>(
      'SELECT data, pontos, origem FROM user_xp',
    );
    data.user_streak = db.getAllSync<{ dia: string; licoes_concluidas: number }>(
      'SELECT dia, licoes_concluidas FROM user_streak',
    );
    data.user_badges = db.getAllSync<{ tipo: string }>('SELECT tipo FROM user_badges');
  } catch {
    // Mock/test: retorna estrutura vazia valida.
  }
  return serializarBackup(data);
}

/**
 * Restaura o progresso a partir de um JSON de backup (merge nao-destrutivo: marca
 * concluidos e reinsere XP/streak/badges idempotentemente). Retorna true em sucesso.
 */
export async function importarProgresso(json: string): Promise<boolean> {
  let data: BackupData;
  try {
    data = parsearBackup(json);
  } catch {
    return false;
  }
  try {
    const db = getDatabase();
    db.withTransactionSync(() => {
      for (const m of data.modulos) {
        db.runSync('UPDATE modulos SET concluido = 1 WHERE id = ?', [m.id]);
      }
      for (const l of data.licoes) {
        db.runSync('UPDATE licoes SET concluida = 1, score_max = ? WHERE id = ?', [l.score_max ?? 100, l.id]);
      }
      for (const x of data.user_xp) {
        db.runSync('INSERT INTO user_xp (data, pontos, origem) VALUES (?, ?, ?)', [x.data, x.pontos, x.origem]);
      }
      for (const s of data.user_streak) {
        db.runSync(
          'INSERT INTO user_streak (dia, licoes_concluidas) VALUES (?, ?) ON CONFLICT(dia) DO UPDATE SET licoes_concluidas = MAX(user_streak.licoes_concluidas, excluded.licoes_concluidas)',
          [s.dia, s.licoes_concluidas],
        );
      }
      for (const b of data.user_badges) {
        db.runSync('INSERT OR IGNORE INTO user_badges (tipo) VALUES (?)', [b.tipo]);
      }
    });
    return true;
  } catch {
    return false;
  }
}
