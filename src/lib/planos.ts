/**
 * V23.10 (J.2): planos de leitura / devocional. Ler um dia conta como atividade (mantem o
 * streak — decisao de produto V23.1: qualquer pratica vale) e concede um XP simbolico.
 * O progresso (plano_progresso) e' POR PERFIL (entra no snapshot-swap de lib/perfis).
 */

import { getDatabase } from '../db/database';
import { registrarAtividade } from './streak';
import { concederXp } from './xp';

export const XP_POR_DIA_PLANO = 10;

export interface Plano {
  id: string;
  titulo: string;
  descricao: string;
  dias: number;
}

export interface PlanoDia {
  dia: number;
  titulo: string;
  passagem: string;
  reflexao: string | null;
}

export async function listarPlanos(): Promise<Plano[]> {
  try {
    const db = getDatabase();
    return db.getAllSync<Plano>('SELECT id, titulo, descricao, dias FROM plano_leitura ORDER BY titulo');
  } catch {
    return [];
  }
}

export async function obterPlano(planoId: string): Promise<Plano | null> {
  try {
    const db = getDatabase();
    return (
      db.getFirstSync<Plano>('SELECT id, titulo, descricao, dias FROM plano_leitura WHERE id = ?', [planoId]) ??
      null
    );
  } catch {
    return null;
  }
}

export async function obterDias(planoId: string): Promise<PlanoDia[]> {
  try {
    const db = getDatabase();
    return db.getAllSync<PlanoDia>(
      'SELECT dia, titulo, passagem, reflexao FROM plano_dia WHERE plano_id = ? ORDER BY dia',
      [planoId],
    );
  } catch {
    return [];
  }
}

/** Dias ja concluidos (set de numeros) do perfil ativo. */
export async function diasConcluidos(planoId: string): Promise<Set<number>> {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ dia: number }>(
      'SELECT dia FROM plano_progresso WHERE plano_id = ?',
      [planoId],
    );
    return new Set(rows.map((r) => r.dia));
  } catch {
    return new Set();
  }
}

/**
 * Marca um dia como lido (idempotente). Na 1a vez: conta como atividade (streak) + XP.
 * Retorna true se foi a 1a marcacao do dia (concedeu recompensa).
 */
export async function marcarDiaLido(planoId: string, dia: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const ja = db.getFirstSync<{ c: number }>(
      'SELECT COUNT(*) AS c FROM plano_progresso WHERE plano_id = ? AND dia = ?',
      [planoId, dia],
    );
    if ((ja?.c ?? 0) > 0) return false;
    db.runSync(
      "INSERT OR IGNORE INTO plano_progresso (plano_id, dia, concluido_em) VALUES (?, ?, datetime('now'))",
      [planoId, dia],
    );
    await registrarAtividade().catch(() => {});
    await concederXp(XP_POR_DIA_PLANO, 'LICAO').catch(() => {});
    return true;
  } catch {
    return false;
  }
}

/** Quantos dias do plano o perfil ativo ja concluiu. */
export async function contarDiasConcluidos(planoId: string): Promise<number> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ c: number }>(
      'SELECT COUNT(*) AS c FROM plano_progresso WHERE plano_id = ?',
      [planoId],
    );
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}
