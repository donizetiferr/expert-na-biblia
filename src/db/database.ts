import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';

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
 * Executa migrations a partir de SQL files. Idempotente.
 * Estrategia simples: tabela _migrations guarda versoes ja aplicadas.
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

  // Migration 001
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

  const alreadyApplied = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM _migrations WHERE name = ?',
    ['001_initial']
  );

  if ((alreadyApplied?.count ?? 0) === 0) {
    db.execSync(migration001);
    db.runSync('INSERT INTO _migrations (name) VALUES (?)', ['001_initial']);
    migrationsApplied = true;
    return { applied: 1, skipped: 0 };
  }

  migrationsApplied = true;
  return { applied: 0, skipped: 1 };
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