/**
 * V23.9 (milestone I): perfis locais multiplos (familia / multi-idade), sem login/backend.
 *
 * O app guarda o progresso (modulos.concluido, licoes.concluida/score_max, user_xp,
 * user_streak, user_badges, meta_diaria_log, user_rankings, pergunta_revisao,
 * user_cosmeticos, streak_freeze) nas tabelas GLOBAIS — esse e' o progresso do perfil ATIVO.
 *
 * Modelo "save-slot" (snapshot-swap): cada perfil INATIVO guarda seu progresso serializado
 * em `perfil_estado` (JSON por tabela). Trocar de perfil = (1) snapshotar o ativo, (2)
 * restaurar o destino nas tabelas globais, (3) marcar o destino como ativo — tudo numa
 * transacao. Isola o progresso por perfil SEM reescrever todas as queries do app.
 *
 * O perfil "default" e criado no bootstrap e HERDA o progresso global existente (sem
 * snapshot) — preserva os dados de quem ja usa o app (decisao do team-lead).
 */

import { getDatabase } from '../db/database';

export type PerfilTipo = 'normal' | 'kids';

export interface Perfil {
  id: string;
  nome: string;
  tipo: PerfilTipo;
  avatar?: string | null;
  criado_em?: string;
}

export const PERFIL_PADRAO_ID = 'default';
export const MAX_PERFIS = 6;

// Tabelas de progresso copiadas integralmente (DELETE + re-INSERT) no swap. Allowlist fixa
// (sem injecao — nomes nunca vem de input). NAO inclui catalogo de conteudo (perguntas,
// modulos/licoes em si, conteudo) — so o ESTADO de jogo.
const TABELAS_PROGRESSO_FULL = [
  'user_xp',
  'user_streak',
  'user_badges',
  'meta_diaria_log',
  'user_rankings',
  'pergunta_revisao',
  'user_cosmeticos',
  'streak_freeze',
] as const;

// ---- funcoes puras (testaveis sem DB) ----

/** Nome valido: 1-20 chars apos trim. */
export function nomeValido(nome: string): boolean {
  const t = (nome ?? '').trim();
  return t.length >= 1 && t.length <= 20;
}

/** Id unico de perfil (timestamp + aleatorio). */
export function gerarPerfilId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Tabelas de progresso (exposto para teste de integridade). */
export function tabelasProgresso(): readonly string[] {
  return TABELAS_PROGRESSO_FULL;
}

// ---- persistencia (degrada gracioso sem expo-sqlite) ----

type Db = ReturnType<typeof getDatabase>;

function dumpTabela(db: Db, t: string): Record<string, unknown>[] {
  return db.getAllSync<Record<string, unknown>>(`SELECT * FROM ${t}`);
}

function restaurarTabela(db: Db, t: string, rows: Record<string, unknown>[]): void {
  db.runSync(`DELETE FROM ${t}`);
  for (const row of rows) {
    const cols = Object.keys(row);
    if (cols.length === 0) continue;
    const placeholders = cols.map(() => '?').join(', ');
    db.runSync(
      `INSERT INTO ${t} (${cols.join(', ')}) VALUES (${placeholders})`,
      cols.map((c) => row[c] as string | number | null),
    );
  }
}

interface CatalogoSnap {
  mods: Array<{ id: string; concluido: number }>;
  lics: Array<{ id: string; concluida: number; score_max: number }>;
}

function dumpCatalogo(db: Db): CatalogoSnap {
  return {
    mods: db.getAllSync<{ id: string; concluido: number }>('SELECT id, concluido FROM modulos'),
    lics: db.getAllSync<{ id: string; concluida: number; score_max: number }>(
      'SELECT id, concluida, score_max FROM licoes',
    ),
  };
}

function restaurarCatalogo(db: Db, snap: CatalogoSnap | null): void {
  // Reset do progresso (mantem o catalogo de conteudo intacto).
  db.runSync('UPDATE modulos SET concluido = 0');
  db.runSync('UPDATE licoes SET concluida = 0, score_max = 0');
  if (!snap) return;
  for (const m of snap.mods) {
    db.runSync('UPDATE modulos SET concluido = ? WHERE id = ?', [m.concluido, m.id]);
  }
  for (const l of snap.lics) {
    db.runSync('UPDATE licoes SET concluida = ?, score_max = ? WHERE id = ?', [l.concluida, l.score_max, l.id]);
  }
}

function salvarEstado(db: Db, perfilId: string, chave: string, dados: string): void {
  db.runSync(
    'INSERT INTO perfil_estado (perfil_id, chave, dados) VALUES (?, ?, ?) ' +
      'ON CONFLICT(perfil_id, chave) DO UPDATE SET dados = excluded.dados',
    [perfilId, chave, dados],
  );
}

function lerEstado(db: Db, perfilId: string, chave: string): string | null {
  const row = db.getFirstSync<{ dados: string }>(
    'SELECT dados FROM perfil_estado WHERE perfil_id = ? AND chave = ?',
    [perfilId, chave],
  );
  return row?.dados ?? null;
}

function snapshotPerfil(db: Db, perfilId: string): void {
  for (const t of TABELAS_PROGRESSO_FULL) {
    salvarEstado(db, perfilId, t, JSON.stringify(dumpTabela(db, t)));
  }
  salvarEstado(db, perfilId, 'catalogo', JSON.stringify(dumpCatalogo(db)));
}

function restaurarPerfil(db: Db, perfilId: string): void {
  for (const t of TABELAS_PROGRESSO_FULL) {
    const raw = lerEstado(db, perfilId, t);
    const rows = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
    restaurarTabela(db, t, rows);
  }
  const catRaw = lerEstado(db, perfilId, 'catalogo');
  restaurarCatalogo(db, catRaw ? (JSON.parse(catRaw) as CatalogoSnap) : null);
}

/** Bootstrap idempotente: cria o perfil "default" se nao houver nenhum perfil. */
export async function garantirPerfilPadrao(): Promise<void> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ c: number }>('SELECT COUNT(*) AS c FROM perfis');
    if ((row?.c ?? 0) > 0) return;
    db.runSync('INSERT INTO perfis (id, nome, tipo) VALUES (?, ?, ?)', [PERFIL_PADRAO_ID, 'Eu', 'normal']);
    db.runSync(
      'INSERT INTO perfil_ativo (id, perfil_id) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET perfil_id = excluded.perfil_id',
      [PERFIL_PADRAO_ID],
    );
    // NAO snapshotar nem resetar: o progresso global atual JA e' o estado do perfil default.
  } catch {
    // mock/test
  }
}

export async function listarPerfis(): Promise<Perfil[]> {
  try {
    const db = getDatabase();
    return db.getAllSync<Perfil>('SELECT id, nome, tipo, avatar, criado_em FROM perfis ORDER BY criado_em');
  } catch {
    return [];
  }
}

function lerPerfilAtivoId(db: Db): string | null {
  const row = db.getFirstSync<{ perfil_id: string }>('SELECT perfil_id FROM perfil_ativo WHERE id = 1');
  return row?.perfil_id ?? null;
}

export async function obterPerfilAtivo(): Promise<Perfil | null> {
  try {
    const db = getDatabase();
    const id = lerPerfilAtivoId(db);
    if (!id) return null;
    return (
      db.getFirstSync<Perfil>('SELECT id, nome, tipo, avatar, criado_em FROM perfis WHERE id = ?', [id]) ?? null
    );
  } catch {
    return null;
  }
}

/** Tipo do perfil ativo (default 'normal'). Usado pelo Modo Kids. */
export async function obterTipoAtivo(): Promise<PerfilTipo> {
  const p = await obterPerfilAtivo();
  return p?.tipo ?? 'normal';
}

/** Cria um perfil novo (NAO troca para ele). Retorna o perfil ou null. */
export async function criarPerfil(nome: string, tipo: PerfilTipo): Promise<Perfil | null> {
  if (!nomeValido(nome)) return null;
  try {
    const db = getDatabase();
    const total = db.getFirstSync<{ c: number }>('SELECT COUNT(*) AS c FROM perfis')?.c ?? 0;
    if (total >= MAX_PERFIS) return null;
    const id = gerarPerfilId();
    const nomeLimpo = nome.trim();
    db.runSync('INSERT INTO perfis (id, nome, tipo) VALUES (?, ?, ?)', [id, nomeLimpo, tipo]);
    return { id, nome: nomeLimpo, tipo };
  } catch {
    return null;
  }
}

/**
 * Troca o perfil ativo: snapshota o atual e restaura o destino nas tabelas globais, numa
 * transacao. Perfil destino sem snapshot (novo) comeca zerado. Retorna true se trocou.
 */
export async function trocarPerfil(destinoId: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const existe = db.getFirstSync<{ c: number }>('SELECT COUNT(*) AS c FROM perfis WHERE id = ?', [destinoId]);
    if ((existe?.c ?? 0) === 0) return false;
    const ativo = lerPerfilAtivoId(db);
    if (ativo === destinoId) return true;
    db.withTransactionSync(() => {
      if (ativo) snapshotPerfil(db, ativo);
      restaurarPerfil(db, destinoId);
      db.runSync(
        'INSERT INTO perfil_ativo (id, perfil_id) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET perfil_id = excluded.perfil_id',
        [destinoId],
      );
    });
    return true;
  } catch {
    return false;
  }
}
