/**
 * quiz-alternatives-db.ts — V9 M1.1 follow-up
 *
 * Le alternativas do DB (tabela quiz_alternatives populada pelo batch M2.7).
 * Fallback para mock quiz-questions.gerarAlternativas() se a tabela estiver vazia
 * (defensivo — em V9, apos M1.1 batch, a tabela tera 4345 registros).
 */

import { getDatabase } from '../db/database';
import { gerarAlternativas, type QuizAlternativas } from './quiz-questions';

export function listarAlternativasDB(perguntaId: string): QuizAlternativas | null {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{
      pergunta_id: string;
      correta: string;
      distrator1: string;
      distrator2: string;
      distrator3: string;
    }>(
      `SELECT pergunta_id, correta, distrator1, distrator2, distrator3
       FROM quiz_alternatives WHERE pergunta_id = ? LIMIT 1`,
      [perguntaId],
    );
    const row = rows[0];
    if (!row) return null;
    return {
      pergunta_id: row.pergunta_id,
      correta: row.correta,
      distrator1: row.distrator1,
      distrator2: row.distrator2,
      distrator3: row.distrator3,
    };
  } catch {
    return null;
  }
}

export function obterAlternativas(perguntaId: string, respostaCorreta: string): QuizAlternativas {
  return listarAlternativasDB(perguntaId) ?? gerarAlternativas(perguntaId, respostaCorreta);
}
