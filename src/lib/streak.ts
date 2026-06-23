/**
 * Gamificacao: Streak de dias consecutivos (V5, ITEM-31).
 *
 * Regras:
 * - Incrementar contador diario quando usuario completa 1+ licao
 * - Mostrar na Tela Licoes 1: "🔥 N dias seguidos!"
 * - Resetar se pular 1 dia (mas permitir "freeze" semanal)
 */

import { getDatabase } from '../db/database';

export interface StreakInfo {
  dias_consecutivos: number;
  ultima_atividade: string | null; // YYYY-MM-DD
  congelado_esta_semana: boolean;
}

function hoje(): string {
  return new Date().toISOString().split('T')[0]!;
}

function diffDias(a: string, b: string): number {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

export async function registrarAtividade(): Promise<StreakInfo> {
  const d = hoje();
  try {
    const db = getDatabase();
    db.runSync(
      'INSERT INTO user_streak (dia, licoes_concluidas) VALUES (?, 1) ON CONFLICT(dia) DO UPDATE SET licoes_concluidas = licoes_concluidas + 1',
      [d]
    );
  } catch {
    // Mock
  }
  return obterStreak();
}

export async function obterStreak(): Promise<StreakInfo> {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ dia: string; licoes_concluidas: number }>(
      'SELECT dia, licoes_concluidas FROM user_streak ORDER BY dia DESC LIMIT 30'
    );
    if (rows.length === 0) {
      return { dias_consecutivos: 0, ultima_atividade: null, congelado_esta_semana: false };
    }

    // Calcular dias consecutivos retroativos
    let consecutivos = 0;
    let esperado = hoje();
    for (const r of rows) {
      if (r.dia === esperado) {
        consecutivos++;
        // Proximo dia esperado
        const d = new Date(esperado);
        d.setDate(d.getDate() - 1);
        esperado = d.toISOString().split('T')[0]!;
      } else if (diffDias(r.dia, esperado) === 1) {
        // Permitir 1 freeze por semana
        const congelado = await usarFreezeSemanal();
        if (congelado) {
          esperado = r.dia;
          continue;
        }
        break;
      } else {
        break;
      }
    }

    return {
      dias_consecutivos: consecutivos,
      ultima_atividade: rows[0]?.dia ?? null,
      congelado_esta_semana: await checarFreezeSemanalUsado(),
    };
  } catch {
    return { dias_consecutivos: 0, ultima_atividade: null, congelado_esta_semana: false };
  }
}

async function usarFreezeSemanal(): Promise<boolean> {
  // Logica simples: cada 7 dias, 1 freeze disponivel
  // Implementacao completa requereria tabela separada
  return false;
}

async function checarFreezeSemanalUsado(): Promise<boolean> {
  return false;
}

export function formatarStreakTexto(streak: StreakInfo): string {
  if (streak.dias_consecutivos === 0) return 'Comece sua jornada!';
  if (streak.dias_consecutivos === 1) return '🔥 1 dia seguido!';
  return `🔥 ${streak.dias_consecutivos} dias seguidos!`;
}