/**
 * V23.A.5: Recompensa variavel (baú surpresa). A imprevisibilidade sustenta a dopamina
 * a longo prazo (vs sempre a mesma celebracao). Ao concluir uma licao 100%, ha uma
 * CHANCE de abrir um baú com bonus de XP variavel.
 *
 * RNG injetavel para testes deterministicos.
 */

import { concederXp } from './xp';

export const CHANCE_BAU = 0.3; // ~30% de chance ao concluir uma licao
export const BONUS_BAU = [5, 10, 15, 25] as const;

/**
 * Sorteia o XP do baú (puro). Retorna 0 quando o baú nao aparece.
 * @param rng funcao 0..1 (default Math.random)
 */
export function sortearBauXp(rng: () => number = Math.random): number {
  if (rng() >= CHANCE_BAU) return 0;
  const idx = Math.min(BONUS_BAU.length - 1, Math.floor(rng() * BONUS_BAU.length));
  return BONUS_BAU[idx]!;
}

/** Abre o baú (sorteia + concede XP se houver). Retorna o XP ganho (0 se nada). */
export async function abrirBau(rng: () => number = Math.random): Promise<number> {
  const xp = sortearBauXp(rng);
  if (xp > 0) {
    await concederXp(xp, 'BAU');
  }
  return xp;
}
