/**
 * V23.B.1: Badges / Conquistas por marcos. Marcos dao pontos emocionais altos e senso
 * de progresso. Persistidas em user_badges (1 linha por tipo, idempotente).
 *
 * Os "verificadores" leem o estado atual (modulos, streak, area, quiz) e desbloqueiam
 * os badges cujo criterio foi atingido e que ainda nao estavam desbloqueados,
 * retornando os RECEM-desbloqueados para a tela celebrar.
 */

import { getDatabase } from '../db/database';
import { contarModulos, contarModulosPorArea } from './db-queries';
import { obterStreak } from './streak';

export interface BadgeDef {
  tipo: string;
  titulo: string;
  descricao: string;
  emoji: string;
}

export const BADGES: Record<string, BadgeDef> = {
  PRIMEIRO_MODULO: { tipo: 'PRIMEIRO_MODULO', titulo: 'Primeiro Passo', descricao: 'Concluiu o 1º módulo', emoji: '🌱' },
  MODULOS_5: { tipo: 'MODULOS_5', titulo: 'Aprendiz', descricao: '5 módulos concluídos', emoji: '📖' },
  MODULOS_10: { tipo: 'MODULOS_10', titulo: 'Estudioso', descricao: '10 módulos concluídos', emoji: '📚' },
  MODULOS_20: { tipo: 'MODULOS_20', titulo: 'Conhecedor', descricao: '20 módulos concluídos', emoji: '🎓' },
  MODULOS_40: { tipo: 'MODULOS_40', titulo: 'Expert', descricao: 'Todos os 40 módulos!', emoji: '🏆' },
  STREAK_7: { tipo: 'STREAK_7', titulo: 'Semana de Fé', descricao: '7 dias seguidos', emoji: '🔥' },
  STREAK_30: { tipo: 'STREAK_30', titulo: 'Mês Fiel', descricao: '30 dias seguidos', emoji: '⭐' },
  STREAK_100: { tipo: 'STREAK_100', titulo: 'Devoção', descricao: '100 dias seguidos', emoji: '💎' },
  AREA_FB: { tipo: 'AREA_FB', titulo: 'Fundamentos', descricao: '100% dos Fundamentos Bíblicos', emoji: '🧱' },
  AREA_AT: { tipo: 'AREA_AT', titulo: 'Antigo Testamento', descricao: '100% do Antigo Testamento', emoji: '📜' },
  AREA_NT: { tipo: 'AREA_NT', titulo: 'Novo Testamento', descricao: '100% do Novo Testamento', emoji: '✝️' },
  AREA_TE: { tipo: 'AREA_TE', titulo: 'Teologia', descricao: '100% da Teologia', emoji: '🕊️' },
  QUIZ_PERFEITO: { tipo: 'QUIZ_PERFEITO', titulo: 'Quiz Perfeito', descricao: 'Gabaritou um quiz', emoji: '🎯' },
};

// --- Logica PURA de threshold (testavel sem DB) ---

/** Tipos de badge atingidos por uma contagem de modulos concluidos. */
export function tiposPorModulos(concluidos: number): string[] {
  const t: string[] = [];
  if (concluidos >= 1) t.push('PRIMEIRO_MODULO');
  if (concluidos >= 5) t.push('MODULOS_5');
  if (concluidos >= 10) t.push('MODULOS_10');
  if (concluidos >= 20) t.push('MODULOS_20');
  if (concluidos >= 40) t.push('MODULOS_40');
  return t;
}

/** Tipos de badge atingidos por um streak (dias consecutivos). */
export function tiposPorStreak(dias: number): string[] {
  const t: string[] = [];
  if (dias >= 7) t.push('STREAK_7');
  if (dias >= 30) t.push('STREAK_30');
  if (dias >= 100) t.push('STREAK_100');
  return t;
}

/** Tipos de badge de area 100% a partir do progresso por area. */
export function tiposPorAreas(areas: Array<{ area: string; total: number; concluidos: number }>): string[] {
  const t: string[] = [];
  for (const a of areas) {
    if (a.total > 0 && a.concluidos === a.total) {
      const tipo = `AREA_${a.area}`;
      if (BADGES[tipo]) t.push(tipo);
    }
  }
  return t;
}

function jaTem(tipo: string): boolean {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM user_badges WHERE tipo = ?',
      [tipo],
    );
    return (row?.count ?? 0) > 0;
  } catch {
    return false;
  }
}

function desbloquear(tipo: string): boolean {
  if (!BADGES[tipo]) return false;
  if (jaTem(tipo)) return false;
  try {
    const db = getDatabase();
    db.runSync('INSERT OR IGNORE INTO user_badges (tipo) VALUES (?)', [tipo]);
    return true;
  } catch {
    return false;
  }
}

/** Desbloqueia os `tipos` ainda nao obtidos; retorna os RECEM-desbloqueados. */
function desbloquearVarios(tipos: string[]): BadgeDef[] {
  const novos: BadgeDef[] = [];
  for (const t of tipos) {
    if (desbloquear(t)) {
      const def = BADGES[t];
      if (def) novos.push(def);
    }
  }
  return novos;
}

/** Badges desbloqueadas (com data) — para a galeria do perfil. */
export async function listarBadgesDesbloqueadas(): Promise<Array<{ tipo: string; desbloqueado_em: string }>> {
  try {
    const db = getDatabase();
    return db.getAllSync<{ tipo: string; desbloqueado_em: string }>(
      'SELECT tipo, desbloqueado_em FROM user_badges ORDER BY desbloqueado_em',
    );
  } catch {
    return [];
  }
}

/**
 * Verifica marcos de progressao (chamar ao concluir uma licao 100%): contagem de
 * modulos, streak e areas 100%. Retorna os badges recem-desbloqueados.
 */
export async function verificarBadgesLicao(): Promise<BadgeDef[]> {
  const tipos: string[] = [];
  try {
    const { concluidos } = await contarModulos();
    tipos.push(...tiposPorModulos(concluidos));

    const streak = await obterStreak();
    tipos.push(...tiposPorStreak(streak.dias_consecutivos));

    const areas = await contarModulosPorArea();
    tipos.push(...tiposPorAreas(areas));
  } catch {
    return [];
  }
  return desbloquearVarios(tipos);
}

/**
 * Verifica marcos do quiz (chamar ao finalizar um quiz): quiz perfeito + streak.
 */
export async function verificarBadgesQuiz(scorePercent: number): Promise<BadgeDef[]> {
  const tipos: string[] = [];
  try {
    if (scorePercent >= 100) tipos.push('QUIZ_PERFEITO');
    const streak = await obterStreak();
    tipos.push(...tiposPorStreak(streak.dias_consecutivos));
  } catch {
    return [];
  }
  return desbloquearVarios(tipos);
}
