/**
 * Gamificacao: Streak de dias consecutivos (V5, ITEM-31; wired e endurecido em V23.A.2).
 *
 * Regras (decisoes de produto V23.1):
 * - QUALQUER pratica do dia mantem o streak (concluir/atacar uma licao, jogar quiz,
 *   ler o versiculo do dia) — nao exige 100%.
 * - 1 "freeze" automatico por semana protege contra UMA falta de 1 dia (aversao a perda
 *   sem punir injustamente). O token e semanal e idempotente (tabela streak_freeze).
 * - obterStreak() e READ-ONLY (nao consome nem cria tokens) — pode ser chamado a cada
 *   render do header sem efeitos colaterais. A criacao do token e feita por
 *   garantirFreezeSemanal() (1x/semana, no boot do app).
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

/**
 * Semana ISO (YYYY-Www) de uma data YYYY-MM-DD. Usada como chave do freeze semanal.
 */
export function semanaIso(diaIso: string): string {
  const d = new Date(diaIso + 'T00:00:00Z');
  // ISO 8601: quinta-feira da semana define o ano; semana 1 contem a 1a quinta.
  const dayNum = (d.getUTCDay() + 6) % 7; // 0 = segunda
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // quinta desta semana
  const primeiraQuinta = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const primeiraDayNum = (primeiraQuinta.getUTCDay() + 6) % 7;
  primeiraQuinta.setUTCDate(primeiraQuinta.getUTCDate() - primeiraDayNum + 3);
  const semana = 1 + Math.round((d.getTime() - primeiraQuinta.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return `${d.getUTCFullYear()}-W${String(semana).padStart(2, '0')}`;
}

/**
 * NUCLEO PURO (testavel sem DB): calcula dias consecutivos a partir da lista de dias
 * com atividade (DESC, YYYY-MM-DD) e do conjunto de semanas que possuem freeze.
 *
 * Caminha do dia esperado (hoje) para tras:
 * - se ha atividade no dia esperado -> conta e recua 1 dia;
 * - se ha lacuna de exatamente 1 dia e existe freeze (nao consumido nesta caminhada)
 *   para a semana do dia faltante -> ponte (recua sem contar), consome o token na conta;
 * - caso contrario -> para.
 */
export function calcularConsecutivos(
  diasDesc: string[],
  semanasComFreeze: ReadonlySet<string>,
  hojeIso: string,
): number {
  if (diasDesc.length === 0) return 0;
  const setDias = new Set(diasDesc);
  const freezeUsado = new Set<string>();
  let consecutivos = 0;
  let esperado = hojeIso;

  // Limite de seguranca: nao caminhar mais que o tamanho da janela observada + folga.
  for (let passos = 0; passos < diasDesc.length + 8; passos++) {
    if (setDias.has(esperado)) {
      consecutivos += 1;
      esperado = recuarUmDia(esperado);
      continue;
    }
    // Lacuna: tentar usar freeze da semana do dia faltante.
    const wk = semanaIso(esperado);
    if (semanasComFreeze.has(wk) && !freezeUsado.has(wk)) {
      freezeUsado.add(wk);
      esperado = recuarUmDia(esperado); // ponte: pula o dia faltante (nao conta)
      continue;
    }
    break;
  }
  return consecutivos;
}

function recuarUmDia(diaIso: string): string {
  const d = new Date(diaIso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0]!;
}

export async function registrarAtividade(): Promise<StreakInfo> {
  const d = hoje();
  try {
    const db = getDatabase();
    db.runSync(
      'INSERT INTO user_streak (dia, licoes_concluidas) VALUES (?, 1) ON CONFLICT(dia) DO UPDATE SET licoes_concluidas = licoes_concluidas + 1',
      [d],
    );
  } catch {
    // Mock
  }
  return obterStreak();
}

/**
 * Garante 1 token de freeze para a semana atual (idempotente). Chamar no boot do app.
 * Retorna true se o token foi criado agora, false se ja existia.
 */
export async function garantirFreezeSemanal(): Promise<boolean> {
  try {
    const db = getDatabase();
    const semana = semanaIso(hoje());
    const row = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM streak_freeze WHERE semana = ?',
      [semana],
    );
    if ((row?.count ?? 0) > 0) return false;
    db.runSync('INSERT OR IGNORE INTO streak_freeze (semana) VALUES (?)', [semana]);
    return true;
  } catch {
    return false;
  }
}

function lerSemanasComFreeze(): Set<string> {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ semana: string }>('SELECT semana FROM streak_freeze');
    return new Set(rows.map((r) => r.semana));
  } catch {
    return new Set();
  }
}

export async function obterStreak(): Promise<StreakInfo> {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ dia: string; licoes_concluidas: number }>(
      'SELECT dia, licoes_concluidas FROM user_streak ORDER BY dia DESC LIMIT 60',
    );
    if (rows.length === 0) {
      return { dias_consecutivos: 0, ultima_atividade: null, congelado_esta_semana: false };
    }
    const dias = rows.map((r) => r.dia);
    const semanas = lerSemanasComFreeze();
    const consecutivos = calcularConsecutivos(dias, semanas, hoje());
    return {
      dias_consecutivos: consecutivos,
      ultima_atividade: rows[0]?.dia ?? null,
      congelado_esta_semana: semanas.has(semanaIso(hoje())),
    };
  } catch {
    return { dias_consecutivos: 0, ultima_atividade: null, congelado_esta_semana: false };
  }
}

export function formatarStreakTexto(streak: StreakInfo): string {
  if (streak.dias_consecutivos === 0) return 'Comece sua jornada!';
  if (streak.dias_consecutivos === 1) return '🔥 1 dia seguido!';
  return `🔥 ${streak.dias_consecutivos} dias seguidos!`;
}
