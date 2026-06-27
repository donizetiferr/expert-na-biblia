/**
 * V23.A.3: Meta diaria (daily goal). Da senso de propriedade + dose diaria previsivel
 * e ancora o streak. A meta e medida em XP/dia (settings.metaDiaria) e o progresso do
 * dia e o XP ganho hoje (user_xp). Ao bater a meta, concede um bonus 1x/dia.
 *
 * Decisao de produto V23.1: tom de progresso, sem punir — a meta e um incentivo, nunca
 * um bloqueio.
 */

import { getDatabase } from '../db/database';
import { loadSettings } from './settings';
import { obterXpDoDia, concederXp } from './xp';

export const META_BONUS_XP = 20;

export interface MetaStatus {
  meta: number;       // XP-alvo do dia
  progresso: number;  // XP ganho hoje
  batida: boolean;
  fracao: number;     // 0-1
}

function hojeIso(): string {
  return new Date().toISOString().split('T')[0]!;
}

/** Status atual da meta do dia (para exibir no header/perfil). */
export async function obterMetaStatus(): Promise<MetaStatus> {
  const settings = await loadSettings();
  const meta = Math.max(1, Math.floor(settings.metaDiaria));
  const progresso = await obterXpDoDia();
  return {
    meta,
    progresso,
    batida: progresso >= meta,
    fracao: Math.min(1, progresso / meta),
  };
}

/**
 * Chamar APOS conceder o XP de uma licao/quiz. Se a meta do dia foi batida e o bonus
 * ainda nao foi concedido hoje, concede META_BONUS_XP (1x/dia) e retorna o valor.
 * Caso contrario, retorna 0.
 */
export async function verificarMetaEConcederBonus(): Promise<number> {
  const settings = await loadSettings();
  const meta = Math.max(1, Math.floor(settings.metaDiaria));
  const dia = hojeIso();
  const progresso = await obterXpDoDia(dia);
  if (progresso < meta) {
    // Ainda nao bateu: registra o progresso (sem bonus) para historico.
    upsertLog(dia, progresso, meta, 0, 0);
    return 0;
  }
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ bonus_concedido: number }>(
      'SELECT bonus_concedido FROM meta_diaria_log WHERE dia = ?',
      [dia],
    );
    if (row && row.bonus_concedido === 1) return 0; // ja concedeu hoje
    upsertLog(dia, progresso, meta, 1, 1);
    await concederXp(META_BONUS_XP, 'META_BONUS');
    return META_BONUS_XP;
  } catch {
    return 0;
  }
}

function upsertLog(dia: string, progresso: number, meta: number, batida: number, bonus: number): void {
  try {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO meta_diaria_log (dia, progresso, meta, batida, bonus_concedido)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(dia) DO UPDATE SET progresso = excluded.progresso, meta = excluded.meta,
         batida = MAX(meta_diaria_log.batida, excluded.batida),
         bonus_concedido = MAX(meta_diaria_log.bonus_concedido, excluded.bonus_concedido)`,
      [dia, progresso, meta, batida, bonus],
    );
  } catch {
    // Mock/test
  }
}

/** Opcoes de meta diaria oferecidas no onboarding/config (em XP/dia). */
export const OPCOES_META: ReadonlyArray<{ valor: number; rotulo: string; descricao: string }> = [
  { valor: 50, rotulo: 'Tranquilo', descricao: '50 XP/dia' },
  { valor: 100, rotulo: 'Dedicado', descricao: '100 XP/dia' },
  { valor: 150, rotulo: 'Expert', descricao: '150 XP/dia' },
];
