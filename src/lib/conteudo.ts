/**
 * V23.5 (D.1 + D.4): conteudo didatico por licao.
 *
 * `licao_conteudo` (seeded via seed-conteudo) guarda, por licao, um mini-ensino
 * (`explicacao`) exibido no card "Aprenda" ANTES das perguntas e um `versiculo_chave`
 * reutilizado como referencia biblica no feedback (D.4).
 *
 * Degradacao graciosa: sem expo-sqlite (testes) ou sem conteudo, retorna null e a UI
 * simplesmente nao mostra o card / a referencia.
 */
import { getDatabase } from '../db/database';

export interface ConteudoLicao {
  explicacao: string;
  versiculoChave: string | null;
}

/** Conteudo didatico de uma licao (ou null se inexistente). */
export async function obterConteudoLicao(licaoId: string): Promise<ConteudoLicao | null> {
  if (!licaoId) return null;
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ explicacao: string; versiculo_chave: string | null }>(
      'SELECT explicacao, versiculo_chave FROM licao_conteudo WHERE licao_id = ?',
      [licaoId],
    );
    if (!row || !row.explicacao) return null;
    return { explicacao: row.explicacao, versiculoChave: row.versiculo_chave ?? null };
  } catch {
    return null;
  }
}
