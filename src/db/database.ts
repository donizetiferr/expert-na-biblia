import * as SQLite from 'expo-sqlite';
import { seedDatabaseIfEmpty, seedConteudoIfNeeded, seedReferenciaIfNeeded } from './seed';

/**
 * Wrapper expo-sqlite para Expert Na Biblia.
 * Gerencia abertura, migracao automatica e helpers transacionais.
 *
 * Padrao: singleton lazy-instantiated. Em React Native o modulo expo-sqlite
 * expoe openDatabaseSync (sync) — preferido para migrations (sequencial).
 */

const DB_NAME = 'expert_na_biblia.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let migrationsApplied = false;

/**
 * Abre (ou retorna handle existente) do banco SQLite.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
  }
  return dbInstance;
}

/**
 * Lista ordenada de migrations. Cada entrada e aplicada UMA vez (controle por
 * _migrations.name). Adicionar uma nova tabela/feature = NOVA entrada no fim (NUNCA
 * editar uma migration ja publicada). Assim o upgrade de quem ja tem o app instalado
 * roda apenas as migrations novas — sem recriar nem perder dados.
 */
interface Migration {
  name: string;
  sql: string;
}

/**
 * Executa migrations pendentes em ordem. Idempotente.
 * Estrategia simples: tabela _migrations guarda os names ja aplicados.
 *
 * V23.A.0: refatorado de "001 hardcoded" para lista de migrations, permitindo
 * adicionar a migration 002 (tabelas de engajamento) sem quebrar app ja instalado.
 */
export async function runMigrations(): Promise<{ applied: number; skipped: number }> {
  if (migrationsApplied) {
    return { applied: 0, skipped: -1 };
  }

  const db = getDatabase();

  // Bootstrap tabela de migrations
  db.execSync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      aplicado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migration 001 (esquema base do catalogo)
  const migration001 = `
    CREATE TABLE IF NOT EXISTS modulos (
      id TEXT PRIMARY KEY,
      ordem INTEGER NOT NULL,
      area TEXT NOT NULL CHECK (area IN ('FB', 'AT', 'NT', 'TE')),
      nome TEXT NOT NULL,
      descricao TEXT,
      concluido INTEGER NOT NULL DEFAULT 0,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_modulos_area_ordem ON modulos(area, ordem);

    CREATE TABLE IF NOT EXISTS licoes (
      id TEXT PRIMARY KEY,
      modulo_id TEXT NOT NULL,
      ordem INTEGER NOT NULL,
      nome TEXT NOT NULL,
      total_perguntas INTEGER NOT NULL DEFAULT 0,
      concluida INTEGER NOT NULL DEFAULT 0,
      score_max INTEGER NOT NULL DEFAULT 0,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_licoes_modulo_ordem ON licoes(modulo_id, ordem);

    CREATE TABLE IF NOT EXISTS perguntas (
      id TEXT PRIMARY KEY,
      licao_id TEXT NOT NULL,
      ordem INTEGER NOT NULL,
      texto TEXT NOT NULL,
      resposta_canonica TEXT NOT NULL,
      referencias_biblicas TEXT,
      tipo TEXT NOT NULL DEFAULT 'ABERTA' CHECK (tipo IN ('ABERTA', 'MULTIPLA_ESCOLHA')),
      dificuldade TEXT NOT NULL DEFAULT 'MEDIO' CHECK (dificuldade IN ('FACIL', 'MEDIO', 'DIFICIL')),
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (licao_id) REFERENCES licoes(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_perguntas_licao_ordem ON perguntas(licao_id, ordem);

    CREATE TABLE IF NOT EXISTS respostas_canonicas_cache (
      pergunta_id TEXT PRIMARY KEY,
      texto TEXT NOT NULL,
      score REAL NOT NULL,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_cache_criado_em ON respostas_canonicas_cache(criado_em);

    CREATE TABLE IF NOT EXISTS quiz_alternatives (
      pergunta_id TEXT PRIMARY KEY,
      correta TEXT NOT NULL,
      distrator1 TEXT NOT NULL,
      distrator2 TEXT NOT NULL,
      distrator3 TEXT NOT NULL,
      FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_streak (
      dia TEXT PRIMARY KEY,
      licoes_concluidas INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_rankings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      modulos TEXT NOT NULL,
      score REAL NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('LICOES', 'QUIZ')),
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_rankings_data ON user_rankings(data);

    CREATE TABLE IF NOT EXISTS m3_usage (
      data TEXT PRIMARY KEY,
      chamadas INTEGER NOT NULL DEFAULT 0,
      tokens_estimados INTEGER NOT NULL DEFAULT 0
    );
  `;

  // Migration 002 (V23.A.0): fundacao de ENGAJAMENTO.
  // - user_xp: cada concessao de XP (origem LICAO/QUIZ/ACERTO/STREAK_BONUS/META_BONUS/BAU).
  // - user_badges: conquistas desbloqueadas (1 linha por tipo).
  // - meta_diaria_log: progresso/meta do dia (V23.A.3).
  // - streak_freeze: token semanal que protege o streak contra 1 falta (V23.A.2).
  // Tudo CREATE TABLE IF NOT EXISTS — seguro em app ja instalado.
  const migration002 = `
    CREATE TABLE IF NOT EXISTS user_xp (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      pontos INTEGER NOT NULL,
      origem TEXT NOT NULL,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_xp_data ON user_xp(data);

    CREATE TABLE IF NOT EXISTS user_badges (
      tipo TEXT PRIMARY KEY,
      desbloqueado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meta_diaria_log (
      dia TEXT PRIMARY KEY,
      progresso INTEGER NOT NULL DEFAULT 0,
      meta INTEGER NOT NULL DEFAULT 50,
      batida INTEGER NOT NULL DEFAULT 0,
      bonus_concedido INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS streak_freeze (
      semana TEXT PRIMARY KEY,
      usado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `;

  // Migration 003 (V23.5): fundacao de APRENDIZADO (milestone D).
  // - licao_conteudo: mini-ensino didatico + versiculo-chave por licao (D.1 + D.4). Seeded.
  // - pergunta_revisao: estado Leitner (caixa 1-5 + proxima data) por pergunta (D.2). Gerado pelo uso.
  // - completar_versiculo: itens do novo formato "completar versiculo" (D.3). Seeded.
  // Tudo CREATE TABLE IF NOT EXISTS — seguro em app ja instalado.
  const migration003 = `
    CREATE TABLE IF NOT EXISTS licao_conteudo (
      licao_id TEXT PRIMARY KEY,
      explicacao TEXT NOT NULL,
      versiculo_chave TEXT
    );

    CREATE TABLE IF NOT EXISTS pergunta_revisao (
      pergunta_id TEXT PRIMARY KEY,
      licao_id TEXT NOT NULL,
      caixa INTEGER NOT NULL DEFAULT 1,
      acertos INTEGER NOT NULL DEFAULT 0,
      erros INTEGER NOT NULL DEFAULT 0,
      ultima_em TEXT,
      proximo_em TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_revisao_proximo ON pergunta_revisao(proximo_em);
    CREATE INDEX IF NOT EXISTS idx_revisao_licao ON pergunta_revisao(licao_id);

    CREATE TABLE IF NOT EXISTS completar_versiculo (
      id TEXT PRIMARY KEY,
      referencia TEXT NOT NULL,
      texto_com_lacuna TEXT NOT NULL,
      resposta TEXT NOT NULL,
      distratores TEXT NOT NULL
    );
  `;

  // Migration 004 (V23.8 — milestone H): personalizacao cosmetica.
  // - user_cosmeticos: o cosmetico EQUIPADO por categoria (tema de acento, aura do
  //   mascote). O DESBLOQUEIO e derivado do nivel de XP (lib/cosmeticos) — nao persiste
  //   "unlocked", apenas o que esta equipado. CREATE TABLE IF NOT EXISTS — seguro no
  //   upgrade de quem ja tem o app instalado.
  const migration004 = `
    CREATE TABLE IF NOT EXISTS user_cosmeticos (
      categoria TEXT PRIMARY KEY,
      cosmetico_id TEXT NOT NULL,
      equipado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `;

  // Migration 005 (V23.9 — milestone I): multi-perfil local (familia/multi-idade).
  // - perfis: cada perfil local (sem login/backend) com nome + tipo (normal|kids).
  // - perfil_ativo: singleton (id=1) apontando para o perfil cujo progresso esta "ao vivo"
  //   nas tabelas globais (modulos.concluido, licoes.concluida, user_xp, ...).
  // - perfil_estado: snapshot (JSON por tabela) do progresso dos perfis INATIVOS. Ao trocar
  //   de perfil, o ativo e' snapshotado aqui e o destino e' restaurado para as tabelas globais.
  // O perfil "default" (criado no bootstrap garantirPerfilPadrao) herda o progresso global
  // atual SEM snapshot — preserva os dados existentes de quem ja usa o app.
  const migration005 = `
    CREATE TABLE IF NOT EXISTS perfis (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'normal' CHECK (tipo IN ('normal', 'kids')),
      avatar TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS perfil_ativo (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      perfil_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS perfil_estado (
      perfil_id TEXT NOT NULL,
      chave TEXT NOT NULL,
      dados TEXT NOT NULL,
      PRIMARY KEY (perfil_id, chave)
    );
  `;

  // Migration 006 (V23.10 — milestone J): conteudo de referencia + planos de leitura.
  // - enciclopedia: verbetes (personagens/termos/eventos) navegaveis offline. Seeded.
  // - plano_leitura/plano_dia: planos devocionais curados (sequencia de passagens). Seeded.
  // - plano_progresso: dias de plano concluidos — ESTADO de jogo, POR PERFIL (entra no
  //   snapshot-swap de lib/perfis). As demais sao catalogo compartilhado.
  const migration006 = `
    CREATE TABLE IF NOT EXISTS enciclopedia (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL CHECK (tipo IN ('personagem', 'termo', 'evento')),
      nome TEXT NOT NULL,
      resumo TEXT NOT NULL,
      detalhe TEXT NOT NULL,
      referencias TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_enciclopedia_tipo ON enciclopedia(tipo);

    CREATE TABLE IF NOT EXISTS plano_leitura (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      dias INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plano_dia (
      plano_id TEXT NOT NULL,
      dia INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      passagem TEXT NOT NULL,
      reflexao TEXT,
      PRIMARY KEY (plano_id, dia)
    );

    CREATE TABLE IF NOT EXISTS plano_progresso (
      plano_id TEXT NOT NULL,
      dia INTEGER NOT NULL,
      concluido_em TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (plano_id, dia)
    );
  `;

  const MIGRATIONS: Migration[] = [
    { name: '001_initial', sql: migration001 },
    { name: '002_engajamento', sql: migration002 },
    { name: '003_aprendizado', sql: migration003 },
    { name: '004_cosmeticos', sql: migration004 },
    { name: '005_perfis', sql: migration005 },
    { name: '006_referencia', sql: migration006 },
  ];

  let applied = 0;
  let skipped = 0;
  for (const m of MIGRATIONS) {
    const row = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(*) as count FROM _migrations WHERE name = ?',
      [m.name],
    );
    if ((row?.count ?? 0) === 0) {
      db.execSync(m.sql);
      db.runSync('INSERT INTO _migrations (name) VALUES (?)', [m.name]);
      applied += 1;
    } else {
      skipped += 1;
    }
  }

  migrationsApplied = true;
  // V9.2.6: seed APOS migrations (tabelas existem agora). Idempotente (checa flag
  // _seed_applied) — roda mesmo quando todas as migrations ja estavam aplicadas.
  try {
    seedDatabaseIfEmpty(db);
  } catch (e) {
    console.warn('[db] seed nao aplicado:', e);
  }
  // V23.5: conteudo de aprendizado (gate proprio, idempotente). Apos seed principal e
  // a migration 003 (tabelas licao_conteudo/completar_versiculo ja existem).
  try {
    seedConteudoIfNeeded(db);
  } catch (e) {
    console.warn('[db] seed de conteudo nao aplicado:', e);
  }
  // V23.10: conteudo de referencia (enciclopedia + planos), gate proprio idempotente.
  // Apos a migration 006 (tabelas enciclopedia/plano_leitura/plano_dia ja existem).
  try {
    seedReferenciaIfNeeded(db);
  } catch (e) {
    console.warn('[db] seed de referencia nao aplicado:', e);
  }
  return { applied, skipped };
}

/**
 * Fecha o banco. Util para testes.
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    migrationsApplied = false;
  }
}

/**
 * Helper transacional para operacoes em batch.
 */
export function transaction<T>(fn: (db: SQLite.SQLiteDatabase) => T): T {
  const db = getDatabase();
  return db.withTransactionSync(() => fn(db)) as T;
}

/**
 * Conta total de tabelas (util para sanity check pos-migration).
 */
export function countTables(): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_migrations'"
  );
  return result?.count ?? 0;
}