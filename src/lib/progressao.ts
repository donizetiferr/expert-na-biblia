/**
 * progressao.ts — V18.1 (MA.5)
 *
 * Regra de negocio #2 (cadeado sequencial): apenas o primeiro modulo esta livre;
 * cada modulo seguinte so libera quando o ANTERIOR esta concluido.
 *
 * Extraido de licoes/index.tsx para ser testavel e para casar com a gravacao de
 * conclusao de modulo (db-queries.marcarModuloConcluido) introduzida nesta versao.
 */
import type { Modulo } from '../types';

/**
 * true se o modulo na posicao `index` (lista ordenada por `ordem`) esta liberado.
 * - index 0 sempre liberado.
 * - demais: liberado sse o modulo imediatamente anterior esta concluido.
 */
export function moduloLiberado(index: number, modulos: Modulo[]): boolean {
  if (index <= 0) return true;
  return modulos[index - 1]?.concluido === true;
}
