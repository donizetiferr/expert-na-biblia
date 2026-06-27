/**
 * quiz-loader.ts — V18.1 (MA.1 + MA.2)
 *
 * Logica de carregamento de perguntas do Quiz, extraida da tela quiz/jogar.tsx para
 * ser testavel (a tela e' um componente RN, dificil de unit-testar isolado).
 *
 * Causa-raiz corrigida: a tela montava IDs hardcoded `M001..M004` (que NAO existem
 * no DB real — IDs sao FB##/AT##/NT##). A query voltava [] sem lancar, o fallback
 * mock nao disparava, e a tela ficava presa num ActivityIndicator eterno.
 *
 * Agora:
 * - modo 'custom' + modulos (CSV): perguntas APENAS dos modulos escolhidos.
 * - modo 'aleatorio' (default): amostra global via ORDER BY RANDOM().
 */
import {
  listarLicoes,
  listarPerguntas,
  listarPerguntasAleatorias,
} from './db-queries';
import { obterTipoAtivo } from './perfis';
import type { Pergunta } from '../types';

/** Fisher-Yates — embaralha sem mutar o array original. */
function embaralhar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Parseia o CSV de modulos do deep link, removendo vazios/espacos. */
export function parseModulosCsv(csv?: string | string[]): string[] {
  const raw = Array.isArray(csv) ? csv.join(',') : (csv ?? '');
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Carrega ate `total` perguntas para o quiz conforme o modo.
 * @param total quantidade alvo (ex.: 20)
 * @param modo  'custom' | 'aleatorio' | undefined
 * @param modulosCsv CSV de IDs de modulo (usado so em modo custom)
 */
export async function carregarPerguntasQuiz(
  total: number,
  modo?: string | string[],
  modulosCsv?: string | string[],
): Promise<Pergunta[]> {
  const modoStr = Array.isArray(modo) ? modo[0] : modo;

  // V23.9 (I.2): no Modo Kids, o quiz aleatorio prioriza perguntas FACIL.
  const kids = await obterTipoAtivo()
    .then((t) => t === 'kids')
    .catch(() => false);

  // Passa o 2o arg (preferirFacil) APENAS no Modo Kids — mantem a chamada de 1 arg no
  // caminho normal (compat com contratos/testes existentes).
  const aleatorias = (n: number) => (kids ? listarPerguntasAleatorias(n, true) : listarPerguntasAleatorias(n));

  if (modoStr === 'custom') {
    const ids = parseModulosCsv(modulosCsv);
    if (ids.length === 0) {
      // Custom sem modulos -> degrada para aleatorio (nunca trava).
      return aleatorias(total);
    }
    const todas: Pergunta[] = [];
    for (const moduloId of ids) {
      const licoes = await listarLicoes(moduloId);
      for (const licao of licoes) {
        todas.push(...(await listarPerguntas(licao.id)));
      }
    }
    return embaralhar(todas).slice(0, total);
  }

  // aleatorio (default)
  return aleatorias(total);
}
