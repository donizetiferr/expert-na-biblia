/**
 * Script: generate_canonical.ts
 * Pre-gera respostas canonicas para as 4.345 perguntas via Minimax M2.7 (Token Plan).
 * Implementacao completa: V3 (ITEM-15).
 *
 * Output: data/canonical_responses.json (4.345 entradas).
 *
 * Peculiaridade M2.7: retorna tags <think>...</think> que devem ser filtradas
 * antes de salvar (regex: /<think[^>]*>.*?<\/think>/gs).
 */

import * as fs from 'fs';
import * as path from 'path';

interface QuestaoOriginal {
  id: string; // FB01-L01-Q01
  texto: string;
  resposta_esperada?: string;
}

interface RespostaCanonica {
  id: string;
  texto: string;
  resposta_canonica: string;
  referencias_biblicas: string[];
  criado_em: string;
}

const THINK_REGEX = /<think[^>]*>.*?<\/think>/gs;

function filtrarThinkTags(texto: string): string {
  return texto.replace(THINK_REGEX, '').trim();
}

async function gerarRespostaCanonica(pergunta: QuestaoOriginal): Promise<RespostaCanonica> {
  // Implementacao real: chamar https://api.minimax.io/v1/chat/completions
  // com system prompt "Voce eh um avaliador biblico..."
  // Por ora (V1 stub), retorna placeholder para teste do pipeline
  return {
    id: pergunta.id,
    texto: pergunta.texto,
    resposta_canonica: '[STUB - implementar em V3]',
    referencias_biblicas: [],
    criado_em: new Date().toISOString(),
  };
}

async function main() {
  console.log('[generate_canonical] STUB V1 - implementacao completa em V3');

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const stub: RespostaCanonica = {
    id: 'STUB-001',
    texto: 'Pergunta placeholder',
    resposta_canonica: 'Resposta placeholder',
    referencias_biblicas: [],
    criado_em: new Date().toISOString(),
  };

  const outPath = path.join(dataDir, 'canonical_responses.json');
  fs.writeFileSync(outPath, JSON.stringify([stub], null, 2), 'utf8');
  console.log(`[generate_canonical] Stub salvo em ${outPath}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[generate_canonical] Erro:', err);
    process.exit(1);
  });
}

export { filtrarThinkTags, gerarRespostaCanonica, type QuestaoOriginal, type RespostaCanonica };