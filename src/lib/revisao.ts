/**
 * V23.5 (D.2): Revisao espacada (sistema Leitner simplificado).
 *
 * Cada pergunta tem uma "caixa" (1..5). Acertar move a pergunta para a caixa
 * seguinte (intervalo maior); errar volta para a caixa 1 (revisao em breve). O modo
 * Revisao reapresenta as perguntas cujo `proximo_em` ja venceu, priorizando as de
 * caixa baixa / mais erradas. Recompensa o esforco com XP.
 *
 * Funcoes puras (intervalo/caixa/data) sao testaveis isoladamente; as de persistencia
 * degradam graciosamente em ambiente sem expo-sqlite (testes) via try/catch.
 */
import { getDatabase } from '../db/database';
import type { Pergunta } from '../types';

// Intervalo (dias) ate a proxima revisao, por caixa. Caixa alta = lembrado bem = ve menos.
const INTERVALOS_DIAS = [1, 2, 4, 8, 16];
export const CAIXA_MAX = 5;

/** Dias ate a proxima revisao para uma caixa (1..5). Clampa fora do range. */
export function intervaloDias(caixa: number): number {
  const c = Math.min(CAIXA_MAX, Math.max(1, Math.floor(caixa)));
  return INTERVALOS_DIAS[c - 1]!;
}

/** Nova caixa apos responder: acerto sobe (ate 5), erro volta para 1. */
export function proximaCaixa(caixaAtual: number, acertou: boolean): number {
  const c = Math.min(CAIXA_MAX, Math.max(1, Math.floor(caixaAtual)));
  if (!acertou) return 1;
  return Math.min(CAIXA_MAX, c + 1);
}

function hojeIso(): string {
  return new Date().toISOString().split('T')[0]!;
}

/** Data (YYYY-MM-DD) da proxima revisao dado a caixa, a partir de uma data base. */
export function proximaDataIso(caixa: number, baseIso?: string): string {
  const base = baseIso ?? hojeIso();
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + intervaloDias(caixa));
  return d.toISOString().split('T')[0]!;
}

/**
 * Registra o resultado de uma pergunta no agendamento Leitner (upsert). Chamado ao
 * responder uma pergunta de licao OU de revisao. Idempotente por (pergunta_id).
 */
export async function registrarRevisao(
  perguntaId: string,
  licaoId: string,
  acertou: boolean,
): Promise<void> {
  try {
    const db = getDatabase();
    const atual = db.getFirstSync<{ caixa: number }>(
      'SELECT caixa FROM pergunta_revisao WHERE pergunta_id = ?',
      [perguntaId],
    );
    const caixaAtual = atual?.caixa ?? 1;
    const novaCaixa = proximaCaixa(caixaAtual, acertou);
    const hoje = hojeIso();
    const prox = proximaDataIso(novaCaixa, hoje);
    db.runSync(
      `INSERT INTO pergunta_revisao (pergunta_id, licao_id, caixa, acertos, erros, ultima_em, proximo_em)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(pergunta_id) DO UPDATE SET
         caixa = excluded.caixa,
         acertos = pergunta_revisao.acertos + ?,
         erros = pergunta_revisao.erros + ?,
         ultima_em = excluded.ultima_em,
         proximo_em = excluded.proximo_em`,
      [
        perguntaId,
        licaoId,
        novaCaixa,
        acertou ? 1 : 0,
        acertou ? 0 : 1,
        hoje,
        prox,
        acertou ? 1 : 0,
        acertou ? 0 : 1,
      ],
    );
  } catch {
    // Mock/test: sem expo-sqlite.
  }
}

/**
 * Perguntas vencidas para revisar hoje (proximo_em <= hoje), priorizando caixa baixa
 * e mais erros. Junta com `perguntas` para trazer o enunciado/canonica.
 */
export async function listarParaRevisar(limite = 10): Promise<Pergunta[]> {
  const n = Math.max(1, Math.floor(limite));
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{
      id: string;
      licao_id: string;
      ordem: number;
      texto: string;
      resposta_canonica: string;
      tipo: 'ABERTA' | 'MULTIPLA_ESCOLHA';
      dificuldade: 'FACIL' | 'MEDIO' | 'DIFICIL';
    }>(
      `SELECT p.id, p.licao_id, p.ordem, p.texto, p.resposta_canonica, p.tipo, p.dificuldade
       FROM pergunta_revisao r JOIN perguntas p ON p.id = r.pergunta_id
       WHERE r.proximo_em <= ?
       ORDER BY r.caixa ASC, r.erros DESC, r.proximo_em ASC
       LIMIT ?`,
      [hojeIso(), n],
    );
    return rows;
  } catch {
    return [];
  }
}

/** Quantas perguntas estao vencidas para revisao hoje. */
export async function contarRevisaoPendente(): Promise<number> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM pergunta_revisao WHERE proximo_em <= ?',
      [hojeIso()],
    );
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}
