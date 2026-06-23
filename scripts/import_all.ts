/**
 * Script: import_all.ts
 * Importa os 77 modulos + ~10.850 perguntas para SQLite.
 * Implementacao completa: V5 (ITEM-34).
 *
 * Fontes:
 * - data/planilhas/1_a_10.xlsx (FB + AT inicial)
 * - data/planilhas/11_a_20.xlsx
 * - data/planilhas/21_a_30.xlsx
 * - data/planilhas/31_a_40.xlsx
 * - data/planilhas/5_a_NT_completo.xlsx (gerado V3)
 * - data/planilhas/6_a_Teologia.xlsx (gerado V3)
 * - data/canonical_responses.json (gerado V3)
 */

import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('[import_all] STUB V1 - implementacao completa em V5');

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('[import_all] data/ nao existe ainda - aguardar V3 gerar planilhas');
    return;
  }

  const planilhas = ['1_a_10.xlsx', '11_a_20.xlsx', '21_a_30.xlsx', '31_a_40.xlsx'];
  for (const p of planilhas) {
    const fullPath = path.join(dataDir, 'planilhas', p);
    if (fs.existsSync(fullPath)) {
      console.log(`[import_all] Encontrado: ${p}`);
    } else {
      console.log(`[import_all] Ausente: ${p}`);
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[import_all] Erro:', err);
    process.exit(1);
  });
}