import type { Modulo, Licao, Pergunta } from '../types';

/**
 * Helpers para leitura do SQLite (src/db/database.ts).
 * Em ambiente sem expo-sqlite (testes Jest), fallback para mock data deterministico.
 */

import { getDatabase } from '../db/database';
import { moduloLiberado } from './progressao';

/**
 * V18.1 (MA.1): mock ALINHADO ao esquema REAL do DB (FB##/AT##/NT##, 40 modulos:
 * FB 18, AT 18, NT 4). Antes o mock usava M001..M077 — esquema que NAO existe no DB
 * real — e por isso mascarava o bug do quiz (IDs hardcoded M001-M004) em Jest: a
 * query mockada respondia para qualquer ID. Com o mock fiel, qualquer codigo que use
 * o esquema fake (M###) retorna vazio tambem nos testes, expondo regressoes.
 */
const MOCK_AREA_COUNTS: Array<{ area: Modulo['area']; count: number }> = [
  { area: 'FB', count: 18 },
  { area: 'AT', count: 18 },
  { area: 'NT', count: 4 },
];

const MOCK_MODULOS: Modulo[] = (() => {
  const mods: Modulo[] = [];
  let ordem = 0;
  for (const { area, count } of MOCK_AREA_COUNTS) {
    for (let i = 1; i <= count; i++) {
      ordem += 1;
      const id = `${area}${String(i).padStart(2, '0')}`;
      mods.push({ id, ordem, area, nome: `${area} Modulo ${i}`, concluido: false });
    }
  }
  return mods;
})();

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
 * V9 M4.1 (polish): helper para COUNT(*) generico.
 *
 * API:
 *   countWhere('modulos')                              -> total de modulos
 *   countWhere('modulos WHERE concluido = ?', [1])     -> modulos concluidos
 *   countWhere('perguntas WHERE licao_id = ?', [lid])  -> perguntas de uma licao
 *
 * Restricoes (anti-SQL-injection):
 * - O argumento `fromClause` e validado por regex contra a forma esperada
 *   `<tabela>( WHERE <col> <op> ?)?` (sem `;`, sem comentarios).
 * - Valores vao em `params` (binding), nunca concatenados.
 *
 * Retorna 0 em caso de erro (consumidores nao quebram em mock/test).
 */
const FROM_CLAUSE_RE = /^[a-zA-Z_][a-zA-Z0-9_]*(\s+WHERE\s+[a-zA-Z_][a-zA-Z0-9_]*\s*(=|<>|!=|>=|<=|>|<|LIKE|IN)\s*\?)?$/;

// Tipos aceitos pelo SQLite bind (expo-sqlite): number | string | boolean | null | Uint8Array
type SqlBindValue = number | string | boolean | null | Uint8Array;
type SqlBindParams = SqlBindValue[];

function countWhere(fromClause: string, params: SqlBindParams = []): number {
  if (!FROM_CLAUSE_RE.test(fromClause.trim())) {
    // Clausula malformada — nao executa. Retorna 0 silenciosamente.
    return 0;
  }
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ n: number }>(
      `SELECT COUNT(*) AS n FROM ${fromClause}`,
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

/**
 * V18.1 (MA.1): retorna `total` perguntas aleatorias de TODO o banco numa unica query
 * (ORDER BY RANDOM() LIMIT ?). Substitui o loop hardcoded M001..M004 da tela de quiz,
 * que retornava [] no DB real (IDs FB/AT/NT) -> spinner eterno. Sem dependencia de
 * nenhum ID de modulo.
 */
export async function listarPerguntasAleatorias(total: number): Promise<Pergunta[]> {
  const n = Math.max(0, Math.floor(total));
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
      'SELECT id, licao_id, ordem, texto, resposta_canonica, tipo, dificuldade FROM perguntas ORDER BY RANDOM() LIMIT ?',
      [n],
    );
    return rows;
  } catch {
    // Mock (Jest): gera `n` perguntas a partir de licoes de modulos reais (esquema FB/AT/NT).
    const out: Pergunta[] = [];
    let idx = 0;
    while (out.length < n && MOCK_MODULOS.length > 0) {
      const modulo = MOCK_MODULOS[idx % MOCK_MODULOS.length]!;
      const licoes = gerarMockLicoes(modulo.id);
      for (const licao of licoes) {
        for (const p of gerarMockPerguntas(licao.id)) {
          out.push(p);
          if (out.length >= n) break;
        }
        if (out.length >= n) break;
      }
      idx += 1;
      if (idx > MOCK_MODULOS.length) break; // guarda contra loop infinito
    }
    return out.slice(0, n);
  }
}

/**
 * V23.A.1: true se a licao JA estava marcada como concluida ANTES de ser refeita.
 * Usado para o anti-farm de XP (revisita de licao concluida da XP reduzido).
 */
export async function licaoJaConcluida(licaoId: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ concluida: number }>(
      'SELECT concluida FROM licoes WHERE id = ?',
      [licaoId],
    );
    return (row?.concluida ?? 0) === 1;
  } catch {
    return false;
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

/**
 * V18.1 (MA.5): grava conclusao de MODULO. Antes NENHUM codigo gravava
 * `modulos.concluido = 1` (so existia o reset `= 0`), entao o modulo 2+ ficava
 * travado para sempre (licoes/index liberado() exige modulos[N-1].concluido) e o
 * trofeu era inalcancavel (todosModulosConcluidos nunca true).
 */
export async function marcarModuloConcluido(moduloId: string): Promise<void> {
  try {
    const db = getDatabase();
    db.runSync('UPDATE modulos SET concluido = 1 WHERE id = ?', [moduloId]);
  } catch {
    // Silencioso em modo mock
  }
}

/**
 * V18.1 (MA.5): true quando TODAS as licoes do modulo estao concluidas.
 * Usado para decidir, ao concluir uma licao 100%, se o modulo inteiro deve ser
 * marcado como concluido (desbloqueia o proximo + caminha para o trofeu).
 */
export async function moduloEstaCompleto(moduloId: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ total: number; concluidas: number }>(
      'SELECT COUNT(*) AS total, SUM(CASE WHEN concluida = 1 THEN 1 ELSE 0 END) AS concluidas FROM licoes WHERE modulo_id = ?',
      [moduloId],
    );
    const r = rows[0];
    if (!r || r.total === 0) return false;
    return r.total === r.concluidas;
  } catch {
    return false;
  }
}

/**
 * V23.B.3: progresso GLOBAL de modulos (X/40 concluidos) para a barra de progresso.
 */
export async function contarModulos(): Promise<{ total: number; concluidos: number }> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ total: number; concluidos: number }>(
      'SELECT COUNT(*) AS total, SUM(CASE WHEN concluido = 1 THEN 1 ELSE 0 END) AS concluidos FROM modulos',
    );
    return { total: row?.total ?? 0, concluidos: row?.concluidos ?? 0 };
  } catch {
    return { total: 40, concluidos: 0 };
  }
}

/**
 * V23.B.1/B.2: progresso por AREA (FB/AT/NT/TE) — usado para badges de area 100% e
 * para o detalhamento no perfil.
 */
export async function contarModulosPorArea(): Promise<Array<{ area: string; total: number; concluidos: number }>> {
  try {
    const db = getDatabase();
    return db.getAllSync<{ area: string; total: number; concluidos: number }>(
      'SELECT area, COUNT(*) AS total, SUM(CASE WHEN concluido = 1 THEN 1 ELSE 0 END) AS concluidos FROM modulos GROUP BY area ORDER BY MIN(ordem)',
    );
  } catch {
    return [];
  }
}

/**
 * V23.B.4: recordes pessoais (melhor score por tipo) — meta a superar (self-vs-self).
 */
export async function obterRecordes(): Promise<{ quiz: number; licoes: number }> {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<{ tipo: string; melhor: number }>(
      'SELECT tipo, MAX(score) AS melhor FROM user_rankings GROUP BY tipo',
    );
    let quiz = 0;
    let licoes = 0;
    for (const r of rows) {
      if (r.tipo === 'QUIZ') quiz = r.melhor ?? 0;
      else if (r.tipo === 'LICOES') licoes = r.melhor ?? 0;
    }
    return { quiz, licoes };
  } catch {
    return { quiz: 0, licoes: 0 };
  }
}

/**
 * V23.C.2: proxima licao pendente (continuar de onde parou). Percorre os modulos
 * liberados em ordem e retorna a 1a licao nao concluida do 1o modulo liberado com
 * pendencia. Respeita o cadeado sequencial (para no 1o modulo bloqueado).
 */
export async function proximaLicaoPendente(): Promise<{ moduloId: string; licaoId: string } | null> {
  try {
    const modulos = await listarModulos();
    for (let i = 0; i < modulos.length; i++) {
      if (!moduloLiberado(i, modulos)) break;
      const m = modulos[i]!;
      const licoes = await listarLicoes(m.id);
      const pendente = licoes.find((l) => !l.concluida);
      if (pendente) return { moduloId: m.id, licaoId: pendente.id };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * V23.B.4: historico de pontuacoes (user_rankings) — gravado em quiz/final e licao,
 * lido aqui (antes a tabela era gravada e NUNCA lida). Mais recentes primeiro.
 */
export async function listarRankings(limit = 10): Promise<Array<{ data: string; score: number; tipo: string }>> {
  const n = Math.max(1, Math.floor(limit));
  try {
    const db = getDatabase();
    return db.getAllSync<{ data: string; score: number; tipo: string }>(
      'SELECT data, score, tipo FROM user_rankings ORDER BY criado_em DESC LIMIT ?',
      [n],
    );
  } catch {
    return [];
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
  // V13 14.4: console.debug em vez de console.log (nao aparece em release build).
  // Log estruturado para eventual replay/auditoria.
  // Em producao real, escreveria em uma tabela `respostas_historico`.
  // Por enquanto, console apenas para nao inflar o schema durante V9.
  console.debug(
    `[resposta] pergunta=${perguntaId} resposta="${respostaUsuario.slice(0, 60)}" correto=${correto} score=${score.toFixed(2)}`,
  );
}

/**
 * V9 M2.6 + M4.1 (polish): detecta se TODOS os modulos estao concluidos (true -> navegar para Trofeu).
 * Usa countWhere() validado para reduzir boilerplate. Em mock (total=0), considera false.
 */
export async function todosModulosConcluidos(): Promise<boolean> {
  const totalCount = countWhere('modulos');
  if (totalCount === 0) return false;
  const doneCount = countWhere('modulos WHERE concluido = ?', [1]);
  return totalCount === doneCount;
}