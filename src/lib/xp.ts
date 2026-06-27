/**
 * V23.A.1: Sistema de XP (moeda comum do engajamento).
 *
 * XP conecta streak, metas, niveis e (futuramente) badges/ligas. Recompensa o
 * ESFORCO (cada acerto), nao so o 100% — com anti-farm para revisitas (decisao
 * de produto V23.1: refazer licao ja concluida da XP reduzido).
 *
 * Curva de nivel: nivel = floor(sqrt(xp / 100)) + 1.
 *   nivel 1 = 0..99 XP | nivel 2 = 100..399 | nivel 3 = 400..899 | nivel N inicia em (N-1)^2 * 100.
 *
 * As funcoes puras (sem DB) sao testaveis isoladamente; as de persistencia degradam
 * graciosamente em ambiente sem expo-sqlite (testes) via try/catch.
 */

import { getDatabase } from '../db/database';
import type { XpResumo, OrigemXp } from '../types';

const XP_BASE_NIVEL = 100;

// Recompensas (decisao de produto V23.1):
export const XP_POR_ACERTO = 5;
export const XP_BONUS_LICAO_100 = 50;
// Revisita (licao ja concluida): fator anti-farm aplicado ao XP.
export const FATOR_ANTIFARM = 0.2;

/** Nivel a partir do XP total (>= 1). */
export function nivelDeXp(xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / XP_BASE_NIVEL)) + 1;
}

/** XP minimo (acumulado) para alcancar um dado nivel. */
export function xpMinimoDoNivel(nivel: number): number {
  if (nivel <= 1) return 0;
  return (nivel - 1) * (nivel - 1) * XP_BASE_NIVEL;
}

/** Resumo completo (total, nivel, progresso no nivel) a partir do XP total. */
export function resumoXp(total: number): XpResumo {
  const t = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const nivel = nivelDeXp(t);
  const base = xpMinimoDoNivel(nivel);
  const prox = xpMinimoDoNivel(nivel + 1);
  const faixa = Math.max(1, prox - base);
  const noNivel = t - base;
  return {
    total: t,
    nivel,
    xpNoNivel: noNivel,
    xpParaProximo: faixa,
    progresso: Math.min(1, Math.max(0, noNivel / faixa)),
  };
}

/**
 * XP de uma licao com base em acertos + score%.
 * +5 por acerto (esforco) + 50 se 100% (conclusao). Revisita = fator anti-farm.
 */
export function calcularXpLicao(acertos: number, score: number, jaConcluida: boolean): number {
  const a = Number.isFinite(acertos) && acertos > 0 ? Math.floor(acertos) : 0;
  const bonus = score >= 100 ? XP_BONUS_LICAO_100 : 0;
  const base = a * XP_POR_ACERTO + bonus;
  return jaConcluida ? Math.round(base * FATOR_ANTIFARM) : base;
}

/** XP de um quiz: +5 por acerto. */
export function calcularXpQuiz(acertos: number): number {
  const a = Number.isFinite(acertos) && acertos > 0 ? Math.floor(acertos) : 0;
  return a * XP_POR_ACERTO;
}

function hojeIso(): string {
  return new Date().toISOString().split('T')[0]!;
}

/** Concede (persiste) XP. No-op para pontos <= 0. Degradacao graciosa em mock. */
export async function concederXp(pontos: number, origem: OrigemXp): Promise<void> {
  const p = Math.floor(pontos);
  if (!Number.isFinite(p) || p <= 0) return;
  try {
    const db = getDatabase();
    db.runSync('INSERT INTO user_xp (data, pontos, origem) VALUES (?, ?, ?)', [hojeIso(), p, origem]);
  } catch {
    // Mock/test: sem expo-sqlite nativo.
  }
}

/** XP total acumulado (SUM). Retorna 0 em mock/erro. */
export async function obterXpTotal(): Promise<number> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ total: number }>(
      'SELECT COALESCE(SUM(pontos), 0) AS total FROM user_xp',
    );
    return row?.total ?? 0;
  } catch {
    return 0;
  }
}

/** XP ganho em um dia especifico (YYYY-MM-DD). Default hoje. */
export async function obterXpDoDia(dia?: string): Promise<number> {
  const d = dia ?? hojeIso();
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ total: number }>(
      'SELECT COALESCE(SUM(pontos), 0) AS total FROM user_xp WHERE data = ?',
      [d],
    );
    return row?.total ?? 0;
  } catch {
    return 0;
  }
}

/** Resumo de XP (total + nivel + progresso). */
export async function obterResumoXp(): Promise<XpResumo> {
  return resumoXp(await obterXpTotal());
}
