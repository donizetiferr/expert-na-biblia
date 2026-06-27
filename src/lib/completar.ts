/**
 * V23.5 (D.3): novo formato "completar versiculo".
 *
 * `completar_versiculo` (seeded via seed-completar) guarda versiculos conhecidos com
 * uma lacuna (_____), a palavra correta e 3 distratores. Aqui montamos itens jogaveis
 * com as 4 opcoes embaralhadas.
 *
 * Degradacao graciosa: sem expo-sqlite (testes) retorna [].
 */
import { getDatabase } from '../db/database';

export interface ItemCompletar {
  id: string;
  referencia: string;
  textoComLacuna: string;
  resposta: string;
  opcoes: string[]; // 4 opcoes embaralhadas (inclui a resposta)
}

/** Embaralhamento Fisher-Yates (puro; nao muta a entrada). */
export function embaralhar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

interface LinhaCompletar {
  id: string;
  referencia: string;
  texto_com_lacuna: string;
  resposta: string;
  distratores: string;
}

/** Monta um item jogavel a partir de uma linha do banco (opcoes embaralhadas). */
export function montarItem(row: LinhaCompletar): ItemCompletar | null {
  let distratores: string[] = [];
  try {
    const parsed = JSON.parse(row.distratores);
    if (Array.isArray(parsed)) distratores = parsed.map((d) => String(d)).filter(Boolean);
  } catch {
    distratores = [];
  }
  if (!row.resposta || distratores.length < 3) return null;
  const opcoes = embaralhar([row.resposta, ...distratores.slice(0, 3)]);
  return {
    id: row.id,
    referencia: row.referencia,
    textoComLacuna: row.texto_com_lacuna,
    resposta: row.resposta,
    opcoes,
  };
}

/** N itens aleatorios de "completar versiculo", jogaveis (opcoes embaralhadas). */
export async function listarCompletar(total = 10): Promise<ItemCompletar[]> {
  const n = Math.max(1, Math.floor(total));
  try {
    const db = getDatabase();
    const rows = db.getAllSync<LinhaCompletar>(
      'SELECT id, referencia, texto_com_lacuna, resposta, distratores FROM completar_versiculo ORDER BY RANDOM() LIMIT ?',
      [n],
    );
    return rows.map(montarItem).filter((x): x is ItemCompletar => x !== null);
  } catch {
    return [];
  }
}

/** Total de itens disponiveis (para decidir se o card aparece). */
export async function contarCompletar(): Promise<number> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM completar_versiculo');
    return row?.n ?? 0;
  } catch {
    return 0;
  }
}
