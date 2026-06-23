/**
 * Script: select_samples_for_review.ts
 * Seleciona 100 amostras teologicas aleatorias para revisao humana (P0-11).
 *
 * 50 de NT (data/planilhas/5_a_NT_completo.json) + 50 de Teologia
 * (data/planilhas/6_a_Teologia.json).
 *
 * Saida: docs/qa_conteudo_para_revisar.md (template pronto para revisao).
 *
 * BLOQUEADA_POR_USUARIO: este script RODA automaticamente quando ha
 * data/planilhas/*.json populados. A REVISAO HUMANA so acontece quando
 * usuario sinalizar — registrado em orchestration/pending_user_input.md.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Pergunta {
  id: string;
  modulo_id: string;
  licao_id: string;
  topico: string;
  texto: string;
  ordem: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function carregarPerguntas(arquivo: string): Pergunta[] {
  if (!fs.existsSync(arquivo)) return [];
  return JSON.parse(fs.readFileSync(arquivo, 'utf8')) as Pergunta[];
}

function gerarMarkdownRevisao(amostras: Array<{ area: string; pergunta: Pergunta }>): string {
  let md = `# QA Conteudo Para Revisao — Expert Na Biblia\n\n`;
  md += `> Data: ${new Date().toISOString().split('T')[0]}\n`;
  md += `> Total: ${amostras.length} amostras (50 NT + 50 Teologia)\n`;
  md += `> Revisao humana necessaria antes da publicacao (P0-11)\n\n`;

  md += `## Instrucoes para o revisor\n\n`;
  md += `Para cada pergunta abaixo, marque uma das opcoes:\n`;
  md += `- [OK] — Conteudo teologicamente correto\n`;
  md += `- [AJUSTAR] — Conteudo correto mas precisa de refinamento (anotar)\n`;
  md += `- [REJEITAR] — Conteudo teologicamente incorreto ou heresia\n\n`;
  md += `Se >10% rejeitadas, voltar para P0-5/P0-6 com feedback.\n\n`;
  md += `---\n\n`;

  for (let i = 0; i < amostras.length; i++) {
    const item = amostras[i];
    if (!item) continue;
    md += `## ${i + 1}. [${item.area}] ${item.pergunta.id}\n\n`;
    md += `**Modulo:** ${item.pergunta.modulo_id} | **Licao:** ${item.pergunta.licao_id} | **Topico:** ${item.pergunta.topico}\n\n`;
    md += `**Pergunta:** ${item.pergunta.texto}\n\n`;
    md += `- [ ] OK\n- [ ] AJUSTAR (nota: ___)\n- [ ] REJEITAR (motivo: ___)\n\n`;
    md += `---\n\n`;
  }

  return md;
}

async function main() {
  const dataDir = path.join(process.cwd(), 'data', 'planilhas');
  const ntPath = path.join(dataDir, '5_a_NT_completo.json');
  const tePath = path.join(dataDir, '6_a_Teologia.json');

  const nt = carregarPerguntas(ntPath);
  const te = carregarPerguntas(tePath);

  if (nt.length === 0 || te.length === 0) {
    console.log('[select_samples] data/planilhas/*.json ainda nao populados.');
    console.log('[select_samples] Execute `npm run generate:questions` primeiro.');
    return;
  }

  const amostrasNT = shuffle(nt).slice(0, 50);
  const amostrasTE = shuffle(te).slice(0, 50);
  const todas = [
    ...amostrasNT.map((p) => ({ area: 'NT', pergunta: p })),
    ...amostrasTE.map((p) => ({ area: 'TE', pergunta: p })),
  ];

  const md = gerarMarkdownRevisao(todas);
  const outPath = path.join(process.cwd(), 'docs', 'qa_conteudo_para_revisar.md');
  fs.writeFileSync(outPath, md, 'utf8');
  console.log(`[select_samples] 100 amostras selecionadas em ${outPath}`);
  console.log('[select_samples] Aguardando revisao humana do usuario (BLOQUEADA_POR_USUARIO).');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[select_samples] Erro:', err);
    process.exit(1);
  });
}

export { carregarPerguntas, gerarMarkdownRevisao, shuffle, type Pergunta };