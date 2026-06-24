import type { Modulo, Licao, Pergunta } from '../types';

/**
 * Helpers para leitura do SQLite (src/db/database.ts).
 * Em ambiente sem expo-sqlite (testes Jest), fallback para mock data deterministico.
 */

import { getDatabase } from '../db/database';

const MOCK_MODULOS: Modulo[] = Array.from({ length: 77 }, (_, i) => {
  const num = i + 1;
  const id = `M${String(num).padStart(3, '0')}`;
  const area: Modulo['area'] = i < 10 ? 'FB' : i < 30 ? 'AT' : i < 53 ? 'NT' : 'TE';
  return {
    id,
    ordem: num,
    area,
    nome: `${area} Modulo ${num}`,
    concluido: false,
  };
});

function gerarMockLicoes(moduloId: string): Licao[] {
  return Array.from({ length: 8 }, (_, i) => {
    const num = i + 1;
    return {
      id: `${moduloId}-L${String(num).padStart(2, '0')}`,
      modulo_id: moduloId,
      ordem: num,
      nome: `Licao ${num}`,
      total_perguntas: 25,
      concluida: false,
      score_max: 0,
    };
  });
}

function gerarMockPerguntas(licaoId: string): Pergunta[] {
  return Array.from({ length: 25 }, (_, i) => {
    const num = i + 1;
    return {
      id: `${licaoId}-Q${String(num).padStart(2, '0')}`,
      licao_id: licaoId,
      ordem: num,
      texto: `Pergunta ${num} da ${licaoId}?`,
      resposta_canonica: `Resposta ${num}`,
      tipo: 'ABERTA',
      dificuldade: 'MEDIO',
    };
  });
}

/**
 * V9 M4.1: helper para COUNT(*) generico. Reduz o boilerplate de
 * `db.getAllSync<{ n: number }>('SELECT COUNT(*) AS n FROM ...')` em N sitios.
 * Retorna 0 em caso de erro.
 */
function countWhere(where: string, params: any[] = []): number {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ n: number }>(
      `SELECT COUNT(*) AS n FROM ${where.split(' FROM ')[0] || '*'} FROM ${where.split(' FROM ')[1] || where}`,
      params,
    );
    return rows[0]?.n ?? 0;
  } catch {
    return 0;
  }
}

export async function listarModulos(): Promise<Modulo[]> {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{
      id: string;
      ordem: number;
      area: 'FB' | 'AT' | 'NT' | 'TE';
      nome: string;
      concluido: number;
    }>('SELECT id, ordem, area, nome, concluido FROM modulos ORDER BY ordem');
    return rows.map((r) => ({ ...r, concluido: r.concluido === 1 }));
  } catch {
    return MOCK_MODULOS;
  }
}

export async function listarLicoes(moduloId: string): Promise<Licao[]> {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{
      id: string;
      modulo_id: string;
      ordem: number;
      nome: string;
      total_perguntas: number;
      concluida: number;
      score_max: number;
    }>(
      'SELECT id, modulo_id, ordem, nome, total_perguntas, concluida, score_max FROM licoes WHERE modulo_id = ? ORDER BY ordem',
      [moduloId]
    );
    return rows.map((r) => ({ ...r, concluida: r.concluida === 1 }));
  } catch {
    return gerarMockLicoes(moduloId);
  }
}

export async function listarPerguntas(licaoId: string): Promise<Pergunta[]> {
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
      'SELECT id, licao_id, ordem, texto, resposta_canonica, tipo, dificuldade FROM perguntas WHERE licao_id = ? ORDER BY ordem',
      [licaoId]
    );
    return rows;
  } catch {
    return gerarMockPerguntas(licaoId);
  }
}

export async function marcarLicaoConcluida(licaoId: string, score: number): Promise<void> {
  try {
    const db = getDatabase();
    db.runSync('UPDATE licoes SET concluida = 1, score_max = ? WHERE id = ?', [score, licaoId]);
  } catch {
    // Silencioso em modo mock
  }
}

export async function resetarProgresso(): Promise<void> {
  try {
    const db = getDatabase();
    db.runSync('UPDATE licoes SET concluida = 0, score_max = 0');
    db.runSync('UPDATE modulos SET concluido = 0');
  } catch {
    // Mock
  }
}

/**
 * V9 M2.6: log da resposta do usuario para revisao posterior/debug.
 * Sem persistir (sem tabela nova); usa console.log estruturado.
 */
export async function registrarRespostaUsuario(
  perguntaId: string,
  respostaUsuario: string,
  correto: boolean,
  score: number,
): Promise<void> {
  // Log estruturado para eventual replay/auditoria.
  // Em producao real, escreveria em uma tabela `respostas_historico`.
  // Por enquanto, console apenas para nao inflar o schema durante V9.
  console.log(
    `[resposta] pergunta=${perguntaId} resposta="${respostaUsuario.slice(0, 60)}" correto=${correto} score=${score.toFixed(2)}`,
  );
}

/**
 * V9 M2.6 + M4.1: detecta se TODOS os modulos estao concluidos (true -> navegar para Trofeu).
 * Usa countWhere() para reduzir boilerplate. Em mock, considera false.
 */
export async function todosModulosConcluidos(): Promise<boolean> {
  const totalCount = countWhere('modulos');
  if (totalCount === 0) return false;
  const doneCount = countWhere('modulos WHERE concluido = 1');
  return totalCount === doneCount;
}