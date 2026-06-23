-- Migrations 001_initial.sql
-- Schema base do SQLite embarcado para Expert Na Biblia
-- Implementacao completa: V2 (ITEM-08)

CREATE TABLE IF NOT EXISTS modulos (
  id TEXT PRIMARY KEY,           -- FB01, AT05, NT12, TE03
  ordem INTEGER NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('FB', 'AT', 'NT', 'TE')),
  nome TEXT NOT NULL,
  descricao TEXT,
  concluido INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_modulos_area_ordem ON modulos(area, ordem);

CREATE TABLE IF NOT EXISTS licoes (
  id TEXT PRIMARY KEY,           -- FB01-L01
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
  id TEXT PRIMARY KEY,           -- FB01-L01-Q01
  licao_id TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  texto TEXT NOT NULL,
  resposta_canonica TEXT NOT NULL,
  referencias_biblicas TEXT,     -- JSON array
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
  dia TEXT PRIMARY KEY,          -- YYYY-MM-DD
  licoes_concluidas INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_rankings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,            -- YYYY-MM-DD
  modulos TEXT NOT NULL,         -- JSON array
  score REAL NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('LICOES', 'QUIZ')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rankings_data ON user_rankings(data);

CREATE TABLE IF NOT EXISTS m3_usage (
  data TEXT PRIMARY KEY,         -- YYYY-MM-DD
  chamadas INTEGER NOT NULL DEFAULT 0,
  tokens_estimados INTEGER NOT NULL DEFAULT 0
);