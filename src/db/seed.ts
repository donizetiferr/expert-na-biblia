/**
 * Seed do banco: importa dados pedagogicos de 3 arquivos TS gerados
 * automaticamente e popula o DB na PRIMEIRA execucao (antes das migrations).
 *
 * Sem isso, expo-sqlite cria DB vazio e db-queries.ts cai no MOCK
 * ("Pergunta N da M001-L01?" + "Resposta N") — usuario ve placeholder.
 *
 * Os arquivos seed-{modulos-licoes,perguntas,quiz}.ts sao gerados pelo
 * scripts/generate_seed_ts.cjs (commitados no repo, NAO requerem rebuild).
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { applySeedModulosLicoes } from './seed-modulos-licoes';
import { applySeedPerguntas } from './seed-perguntas';
import { applySeedQuiz } from './seed-quiz';
import { applySeedConteudo } from './seed-conteudo';
import { applySeedCompletar } from './seed-completar';
import { applySeedEnciclopedia } from './seed-enciclopedia';
import { applySeedPlanos } from './seed-planos';

// Efeito colateral: garantir que Metro bundle inclui os 3 arquivos
// (tree-shaking removeria se nao houvesse referencia estaticamente observavel).
// Chamada "morta" — o resultado eh descartado, so importa para o bundler.
const _FORCE_BUNDLE = [
  applySeedModulosLicoes.toString(),
  applySeedPerguntas.toString(),
  applySeedQuiz.toString(),
];
if (_FORCE_BUNDLE.length !== 3) throw new Error('seed broken');

const SEED_FLAG_TABLE = '_seed_applied';
const SEED_FLAG_VALUE = 'v9_2_1';

export function seedDatabaseIfEmpty(db: SQLiteDatabase): void {
  // Idempotente: se ja aplicou, retorna
  try {
    const existing = db.getFirstSync<{ value: string }>(
      `SELECT value FROM ${SEED_FLAG_TABLE} WHERE key = 'seed_version'`
    );
    if (existing && existing.value === SEED_FLAG_VALUE) {
      return;
    }
  } catch {
    // Tabela _seed_applied nao existe ainda — aplicar seed
  }

  applySeedModulosLicoes(db);
  applySeedPerguntas(db);
  applySeedQuiz(db);

  // Marcar como aplicado (em transacao separada para nao falhar se a tabela nao existe)
  try {
    db.runSync(
      `CREATE TABLE IF NOT EXISTS ${SEED_FLAG_TABLE} (key TEXT PRIMARY KEY, value TEXT, aplicado_em TEXT NOT NULL DEFAULT (datetime('now')))`
    );
    db.runSync(
      `INSERT OR REPLACE INTO ${SEED_FLAG_TABLE} (key, value) VALUES ('seed_version', ?)`,
      SEED_FLAG_VALUE
    );
  } catch (e) {
    console.warn('[seed] flag nao persistiu:', e);
  }
}

// V23.5 (milestone D): conteudo de APRENDIZADO (licao_conteudo + completar_versiculo).
// Gate PROPRIO (independente do seed principal) para que, no UPGRADE de quem ja tem o
// app, o conteudo novo entre SEM re-rodar os seeds antigos (que resetariam progresso).
// applySeed* usa INSERT OR IGNORE — idempotente e seguro.
const CONTEUDO_FLAG_VALUE = 'v23_5_aprendizado';

export function seedConteudoIfNeeded(db: SQLiteDatabase): void {
  try {
    const existing = db.getFirstSync<{ value: string }>(
      `SELECT value FROM ${SEED_FLAG_TABLE} WHERE key = 'conteudo_version'`,
    );
    if (existing && existing.value === CONTEUDO_FLAG_VALUE) return;
  } catch {
    // Tabela de flags ainda nao existe — segue e aplica.
  }

  applySeedConteudo(db);
  applySeedCompletar(db);

  try {
    db.runSync(
      `CREATE TABLE IF NOT EXISTS ${SEED_FLAG_TABLE} (key TEXT PRIMARY KEY, value TEXT, aplicado_em TEXT NOT NULL DEFAULT (datetime('now')))`,
    );
    db.runSync(
      `INSERT OR REPLACE INTO ${SEED_FLAG_TABLE} (key, value) VALUES ('conteudo_version', ?)`,
      CONTEUDO_FLAG_VALUE,
    );
  } catch (e) {
    console.warn('[seed] conteudo flag nao persistiu:', e);
  }
}

// V23.10 (milestone J): conteudo de REFERENCIA (enciclopedia + planos de leitura). Gate
// proprio (igual ao de conteudo) para entrar no UPGRADE sem re-rodar os seeds antigos.
const REFERENCIA_FLAG_VALUE = 'v23_10_referencia';

export function seedReferenciaIfNeeded(db: SQLiteDatabase): void {
  try {
    const existing = db.getFirstSync<{ value: string }>(
      `SELECT value FROM ${SEED_FLAG_TABLE} WHERE key = 'referencia_version'`,
    );
    if (existing && existing.value === REFERENCIA_FLAG_VALUE) return;
  } catch {
    // Tabela de flags ainda nao existe — segue e aplica.
  }

  applySeedEnciclopedia(db);
  applySeedPlanos(db);

  try {
    db.runSync(
      `CREATE TABLE IF NOT EXISTS ${SEED_FLAG_TABLE} (key TEXT PRIMARY KEY, value TEXT, aplicado_em TEXT NOT NULL DEFAULT (datetime('now')))`,
    );
    db.runSync(
      `INSERT OR REPLACE INTO ${SEED_FLAG_TABLE} (key, value) VALUES ('referencia_version', ?)`,
      REFERENCIA_FLAG_VALUE,
    );
  } catch (e) {
    console.warn('[seed] referencia flag nao persistiu:', e);
  }
}
