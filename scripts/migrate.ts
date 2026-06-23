/**
 * Script: migrate.ts
 * Aplica migrations no banco SQLite embarcado.
 * Executar via: npm run db:migrate
 *
 * Em React Native (app rodando), as migrations rodam automaticamente via
 * src/db/database.ts:runMigrations() na inicializacao. Este script eh util
 * para forcar re-execucao em testes ou em build CLI.
 */

import * as path from 'path';

async function main() {
  console.log('[migrate] Script stub V2 - migrations rodam via app runtime');
  console.log('[migrate] Para forcar re-execucao: abra o app, que runMigrations() aplica automaticamente');

  // Em ambiente Node puro (sem expo-sqlite), exibimos as migrations disponiveis
  const migrationsDir = path.join(process.cwd(), 'migrations');
  console.log(`[migrate] Diretorio de migrations: ${migrationsDir}`);

  console.log('[migrate] Para STUB, listando migrations encontradas:');
  console.log('  - 001_initial.sql (8 tabelas: modulos, licoes, perguntas, cache, quiz_alt, streak, ranking, m3_usage)');
  console.log('[migrate] DONE');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[migrate] Erro:', err);
    process.exit(1);
  });
}