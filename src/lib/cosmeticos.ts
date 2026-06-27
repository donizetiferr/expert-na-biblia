/**
 * V23.8 (milestone H.3): personalizacao cosmetica desbloqueavel por XP.
 *
 * Decisao de produto: cosmeticos sao DESBLOQUEADOS ao alcancar um NIVEL de XP (nao
 * "gastam" XP). Gastar XP regrediria o nivel — quebraria o mascote-evolui-por-nivel
 * (V23.B.6) e a barra de progresso. Assim o XP continua sendo progresso puro e os
 * cosmeticos sao o "onde aplicar" (identidade), recompensando quem evolui.
 *
 * Duas categorias, ambas puro estilo (sem novos assets de arte):
 *  - `tema`: cor de ACENTO do app (barra de XP no header, CTA "Continuar").
 *  - `aura`: cor do GLOW do mascote (PersonagemLivro).
 *
 * As funcoes puras (catalogo + regra de desbloqueio) sao testaveis isoladamente; as de
 * persistencia degradam graciosamente em ambiente sem expo-sqlite (testes) via try/catch.
 */

import { getDatabase } from '../db/database';

export type CategoriaCosmetico = 'tema' | 'aura';

export interface Cosmetico {
  id: string;
  categoria: CategoriaCosmetico;
  nome: string;
  cor: string; // hex on-palette
  nivelRequisito: number; // nivel de XP minimo para desbloquear
}

/**
 * Catalogo (on-palette — cores derivadas de constants/colors). Ordenado por requisito
 * dentro de cada categoria. O 1o de cada categoria e' o PADRAO (requisito 1 = sempre
 * desbloqueado), garantindo um fallback valido mesmo sem XP.
 */
export const COSMETICOS: ReadonlyArray<Cosmetico> = [
  // Temas de acento
  { id: 'tema_classico', categoria: 'tema', nome: 'Clássico', cor: '#fe8917', nivelRequisito: 1 },
  { id: 'tema_realeza', categoria: 'tema', nome: 'Realeza', cor: '#8b16c7', nivelRequisito: 2 },
  { id: 'tema_ouro', categoria: 'tema', nome: 'Ouro', cor: '#ffc027', nivelRequisito: 3 },
  { id: 'tema_oliveira', categoria: 'tema', nome: 'Oliveira', cor: '#4ade80', nivelRequisito: 4 },
  { id: 'tema_celeste', categoria: 'tema', nome: 'Celeste', cor: '#38bdf8', nivelRequisito: 5 },
  // Auras do mascote
  { id: 'aura_aurea', categoria: 'aura', nome: 'Áurea', cor: '#fded48', nivelRequisito: 1 },
  { id: 'aura_mistica', categoria: 'aura', nome: 'Mística', cor: '#8b16c7', nivelRequisito: 2 },
  { id: 'aura_celeste', categoria: 'aura', nome: 'Celeste', cor: '#38bdf8', nivelRequisito: 3 },
  { id: 'aura_esmeralda', categoria: 'aura', nome: 'Esmeralda', cor: '#4ade80', nivelRequisito: 4 },
];

/** Id do cosmetico PADRAO de cada categoria (sempre desbloqueado, requisito 1). */
export const COSMETICO_PADRAO: Record<CategoriaCosmetico, string> = {
  tema: 'tema_classico',
  aura: 'aura_aurea',
};

/** true se o nivel atual ja desbloqueou o cosmetico. */
export function cosmeticoDesbloqueado(c: Cosmetico, nivel: number): boolean {
  const n = Number.isFinite(nivel) ? nivel : 1;
  return n >= c.nivelRequisito;
}

/** Cosmeticos de uma categoria (ordem do catalogo = por requisito). */
export function listarPorCategoria(categoria: CategoriaCosmetico): Cosmetico[] {
  return COSMETICOS.filter((c) => c.categoria === categoria);
}

/** Busca por id (undefined se nao existir). */
export function cosmeticoPorId(id: string): Cosmetico | undefined {
  return COSMETICOS.find((c) => c.id === id);
}

/**
 * Resolve a cor de um id, com fallback robusto: se o id nao existe OU (opcional) o nivel
 * informado ainda nao o desbloqueou, cai para o PADRAO da categoria.
 */
export function corDoCosmetico(categoria: CategoriaCosmetico, id: string, nivel?: number): string {
  const c = cosmeticoPorId(id);
  const padrao = cosmeticoPorId(COSMETICO_PADRAO[categoria])!;
  if (!c || c.categoria !== categoria) return padrao.cor;
  if (nivel !== undefined && !cosmeticoDesbloqueado(c, nivel)) return padrao.cor;
  return c.cor;
}

/**
 * Quantos cosmeticos estao desbloqueados no nivel atual (para badge/resumo).
 */
export function contarDesbloqueados(nivel: number): number {
  return COSMETICOS.filter((c) => cosmeticoDesbloqueado(c, nivel)).length;
}

/** Id equipado em uma categoria. Default = PADRAO. Degrada gracioso em mock. */
export async function obterEquipado(categoria: CategoriaCosmetico): Promise<string> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ cosmetico_id: string }>(
      'SELECT cosmetico_id FROM user_cosmeticos WHERE categoria = ?',
      [categoria],
    );
    const id = row?.cosmetico_id;
    // Guard: id persistido pode nao existir mais no catalogo — cai no padrao.
    if (id && cosmeticoPorId(id)?.categoria === categoria) return id;
    return COSMETICO_PADRAO[categoria];
  } catch {
    return COSMETICO_PADRAO[categoria];
  }
}

/**
 * Equipa um cosmetico. So persiste se ele existir, for da categoria e estiver
 * desbloqueado no nivel informado (defesa de servidor: a UI ja bloqueia os locked).
 * Retorna true se equipou.
 */
export async function equiparCosmetico(
  categoria: CategoriaCosmetico,
  id: string,
  nivel: number,
): Promise<boolean> {
  const c = cosmeticoPorId(id);
  if (!c || c.categoria !== categoria || !cosmeticoDesbloqueado(c, nivel)) return false;
  try {
    const db = getDatabase();
    db.runSync(
      "INSERT INTO user_cosmeticos (categoria, cosmetico_id, equipado_em) VALUES (?, ?, datetime('now')) " +
        'ON CONFLICT(categoria) DO UPDATE SET cosmetico_id = excluded.cosmetico_id, equipado_em = excluded.equipado_em',
      [categoria, id],
    );
    return true;
  } catch {
    return false;
  }
}

/** Cor de acento equipada (categoria 'tema'). */
export async function obterCorTema(): Promise<string> {
  return corDoCosmetico('tema', await obterEquipado('tema'));
}

/** Cor de aura equipada (categoria 'aura'). */
export async function obterCorAura(): Promise<string> {
  return corDoCosmetico('aura', await obterEquipado('aura'));
}
