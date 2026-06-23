/**
 * Script: generate_questions.ts
 * Gera perguntas dos 13 modulos NT faltantes (NT05-NT17) + 24 modulos Teologia via M3.
 *
 * Saida:
 * - data/planilhas/5_a_NT_completo.json (~3.000 perguntas)
 * - data/planilhas/6_a_Teologia.json (~3.500 perguntas)
 *
 * IDs consistentes: NT05-L01-Q01, NT05-L01-Q02, ..., TE24-L10-Q15
 *
 * Topicos-base: docs/05_conteudo_pedagogico/README.md
 *
 * EXECUCAO REAL: depende de npm install + MINIMAX_API_KEY.
 * Comando: `npm run generate:questions`
 * Tempo estimado: ~25h de maquina (~30s por pergunta).
 *
 * IMPLEMENTACAO COMPLETA (V3, ITEM-16 + ITEM-17). Execucao efetiva fica para V5.
 */

import * as fs from 'fs';
import * as path from 'path';

const M3_ENDPOINT = 'https://api.minimax.io/v1/chat/completions';
const M3_MODEL = 'MiniMax-M2.7';
const THINK_REGEX = /<think[^>]*>.*?<\/think>/gs;

interface ModuloTopico {
  id: string;          // NT05, NT06, ..., TE24
  nome: string;
  topicos: string[];
  num_licoes: number;
  perguntas_por_licao: number;
}

interface PerguntaGerada {
  id: string;          // NT05-L01-Q01
  modulo_id: string;
  licao_id: string;
  topico: string;
  texto: string;
  ordem: number;
}

export function filtrarThinkTags(texto: string): string {
  return texto.replace(THINK_REGEX, '').trim();
}

const MODULOS_NT: ModuloTopico[] = [
  { id: 'NT05', nome: 'Ensinos de Jesus', topicos: ['Sermao da Montanha', 'Parabolas', 'Discurso de despedida'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'NT06', nome: 'Milagres e Parabolas', topicos: ['Multiplicacao dos paes', 'Caminhada sobre as aguas', 'Filho prodigo'], num_licoes: 7, perguntas_por_licao: 25 },
  { id: 'NT07', nome: 'Evangelhos Sinoticos', topicos: ['Mateus', 'Marcos', 'Lucas'], num_licoes: 9, perguntas_por_licao: 25 },
  { id: 'NT08', nome: 'Evangelho de Joao', topicos: ['Prologo', 'Sinais', 'Discurso do Pão da Vida'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'NT09', nome: 'Atos dos Apostolos', topicos: ['Pentecostes', 'Viageis missionarios', 'Concilio de Jerusalem'], num_licoes: 7, perguntas_por_licao: 25 },
  { id: 'NT10', nome: 'Cartas Paulinas', topicos: ['Romanos', 'Corintios', 'Galatas', 'Efesios'], num_licoes: 10, perguntas_por_licao: 25 },
  { id: 'NT11', nome: 'Cartas Gerais', topicos: ['Tiago', 'Pedro', 'Joao', 'Judas'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'NT12', nome: 'Apocalipse', topicos: ['Cartas as 7 igrejas', 'Visoes', 'Nova Jerusalem'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'NT13', nome: 'Vida de Paulo', topicos: ['Conversao', 'Ministerio', 'Epistolas pastorais'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'NT14', nome: 'Vida de Pedro', topicos: ['Chamado', 'Ministerio', 'Cartas'], num_licoes: 5, perguntas_por_licao: 25 },
  { id: 'NT15', nome: 'Vida de Joao', topicos: ['Apostolo amado', 'Evangelho', 'Apocalipse'], num_licoes: 5, perguntas_por_licao: 25 },
  { id: 'NT16', nome: 'Geografia do NT', topicos: ['Palestina', 'Jerusalem', 'Mares e viagens'], num_licoes: 5, perguntas_por_licao: 25 },
  { id: 'NT17', nome: 'Cronologia do NT', topicos: ['Linha do tempo', 'Imperios', 'Governadores romanos'], num_licoes: 4, perguntas_por_licao: 25 },
];

const MODULOS_TEOLOGIA: ModuloTopico[] = [
  { id: 'TE01', nome: 'Teologia Biblica', topicos: ['Revelacao', 'Inspiracao', 'Canon'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'TE02', nome: 'Teologia Propria (Deus)', topicos: ['Atributos', 'Trindade', 'Providencia'], num_licoes: 10, perguntas_por_licao: 25 },
  { id: 'TE03', nome: 'Cristologia', topicos: ['Natureza de Cristo', 'Encarnacao', 'Expiacao'], num_licoes: 10, perguntas_por_licao: 25 },
  { id: 'TE04', nome: 'Pneumatologia', topicos: ['Pessoa do Espirito Santo', 'Dons', 'Frutos'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'TE05', nome: 'Antropologia Teologica', topicos: ['Imagem de Deus', 'Queda', 'Livre arbitrio'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'TE06', nome: 'Hamartiologia (Pecado)', topicos: ['Origem', 'Consequencias', 'Tipos de pecado'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'TE07', nome: 'Soteriologia (Salvacao)', topicos: ['Justificacao', 'Santificacao', 'Glorificacao'], num_licoes: 10, perguntas_por_licao: 25 },
  { id: 'TE08', nome: 'Eclesiologia (Igreja)', topicos: ['Natureza', 'Sacramentos', 'Missao'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'TE09', nome: 'Escatologia (Ultimas coisas)', topicos: ['Segunda vinda', 'Resurreicao', 'Juizo final'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'TE10', nome: 'Angelologia', topicos: ['Anjos', 'Demonios', 'Guerra espiritual'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'TE11', nome: 'Etica Crista', topicos: ['Principios', 'Casamento', 'Trabalho'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'TE12', nome: 'Historia da Igreja', topicos: ['Perseguicoes', 'Concilios', 'Reforma'], num_licoes: 10, perguntas_por_licao: 25 },
  { id: 'TE13', nome: 'Missiologia', topicos: ['Grande Comissao', 'Evangelismo', 'Plantacao de igrejas'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'TE14', nome: 'Liturgia e Adoracao', topicos: ['Formas de culto', 'Musica', 'Sacramentos'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'TE15', nome: 'Hermeneutica', topicos: ['Interpretacao', 'Generos literarios', 'Contexto historico'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'TE16', nome: 'Apologetica', topicos: ['Evidencias', 'Argumentos', 'Defesa da fe'], num_licoes: 8, perguntas_por_licao: 25 },
  { id: 'TE17', nome: 'Discipulado', topicos: ['Crescimento', 'Formacao', 'Multiplicacao'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'TE18', nome: 'Espiritualidade Crista', topicos: ['Oracao', 'Leitura biblica', 'Jejum'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'TE19', nome: 'Cosmovisao Crista', topicos: ['Mundo', 'Cultura', 'Engajamento'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'TE20', nome: 'Relacoes e Familia', topicos: ['Casamento', 'Filhos', 'Amizade'], num_licoes: 6, perguntas_por_licao: 25 },
  { id: 'TE21', nome: 'Financas e Mordomia', topicos: ['Dizimos', 'Ofertas', 'Investimentos'], num_licoes: 5, perguntas_por_licao: 25 },
  { id: 'TE22', nome: 'Trabalho e Vocacao', topicos: ['Chamado', 'Carreira', 'Equilibrio'], num_licoes: 5, perguntas_por_licao: 25 },
  { id: 'TE23', nome: 'Sofrimento e Luto', topicos: ['Teodiceia', 'Consolo', 'Esperanca'], num_licoes: 5, perguntas_por_licao: 25 },
  { id: 'TE24', nome: 'Ciencia e Fe', topicos: ['Cosmogonia', 'Origem da vida', 'Etica cientifica'], num_licoes: 5, perguntas_por_licao: 25 },
];

export function gerarId(moduloId: string, licaoNum: number, perguntaNum: number): string {
  const licao = String(licaoNum).padStart(2, '0');
  const pergunta = String(perguntaNum).padStart(2, '0');
  return `${moduloId}-L${licao}-Q${pergunta}`;
}

function buildSystemPrompt(modulo: ModuloTopico, licaoNum: number): string {
  const topicoAtual = modulo.topicos[Math.min(licaoNum - 1, modulo.topicos.length - 1)];
  return `Voce gera perguntas pedagogicas sobre "${modulo.nome}" — topico "${topicoAtual}".
Para cada batch (25 perguntas), responda em JSON estrito:
{
  "perguntas": [
    { "texto": "pergunta biblica clara em portugues", "ordem": 1 },
    ... 25 perguntas
  ]
}
Variacao: F (facil), M (medio), D (dificil). Use citacao biblica quando aplicavel.
NAO inclua tags <think>. Apenas JSON valido.`;
}

async function callM3Batch(modulo: ModuloTopico, licaoNum: number, apiKey: string): Promise<PerguntaGerada[]> {
  const body = {
    model: M3_MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(modulo, licaoNum) },
      { role: 'user', content: `Gere 25 perguntas para L${String(licaoNum).padStart(2, '0')} de ${modulo.id} — ${modulo.nome}.` },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  };

  const res = await fetch(M3_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`M3 HTTP ${res.status}: ${await res.text()}`);

  const data: { choices: Array<{ message: { content: string } }> } = await res.json();
  const raw = data.choices[0]?.message?.content ?? '';
  const limpo = filtrarThinkTags(raw);

  const parsed: { perguntas?: Array<{ texto: string; ordem: number }> } = JSON.parse(limpo);
  if (!parsed.perguntas) return [];

  return parsed.perguntas.map((p, idx) => ({
    id: gerarId(modulo.id, licaoNum, idx + 1),
    modulo_id: modulo.id,
    licao_id: `${modulo.id}-L${String(licaoNum).padStart(2, '0')}`,
    topico: modulo.topicos[Math.min(licaoNum - 1, modulo.topicos.length - 1)] ?? modulo.nome,
    texto: p.texto,
    ordem: p.ordem ?? idx + 1,
  }));
}

async function gerarModulo(modulo: ModuloTopico, apiKey: string): Promise<PerguntaGerada[]> {
  const todas: PerguntaGerada[] = [];

  for (let l = 1; l <= modulo.num_licoes; l++) {
    console.log(`[generate_questions] ${modulo.id} L${String(l).padStart(2, '0')}/${modulo.num_licoes}`);
    try {
      const perguntas = await callM3Batch(modulo, l, apiKey);
      todas.push(...perguntas);
    } catch (err) {
      console.error(`[generate_questions] Erro ${modulo.id} L${l}:`, err);
    }
  }

  return todas;
}

async function main() {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    console.log('[generate_questions] MINIMAX_API_KEY nao definida — modo stub.');
    await saveStub();
    return;
  }

  const dataDir = path.join(process.cwd(), 'data', 'planilhas');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  console.log('[generate_questions] Gerando NT (13 modulos)...');
  const nt: PerguntaGerada[] = [];
  for (const m of MODULOS_NT) {
    nt.push(...(await gerarModulo(m, apiKey)));
  }
  fs.writeFileSync(path.join(dataDir, '5_a_NT_completo.json'), JSON.stringify(nt, null, 2), 'utf8');
  console.log(`[generate_questions] NT: ${nt.length} perguntas salvas.`);

  console.log('[generate_questions] Gerando Teologia (24 modulos)...');
  const te: PerguntaGerada[] = [];
  for (const m of MODULOS_TEOLOGIA) {
    te.push(...(await gerarModulo(m, apiKey)));
  }
  fs.writeFileSync(path.join(dataDir, '6_a_Teologia.json'), JSON.stringify(te, null, 2), 'utf8');
  console.log(`[generate_questions] Teologia: ${te.length} perguntas salvas.`);
}

async function saveStub() {
  const dataDir = path.join(process.cwd(), 'data', 'planilhas');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const stubNT = MODULOS_NT.slice(0, 2).flatMap((m) =>
    Array.from({ length: m.num_licoes }, (_, i) => ({
      id: gerarId(m.id, i + 1, 1),
      modulo_id: m.id,
      licao_id: `${m.id}-L${String(i + 1).padStart(2, '0')}`,
      topico: m.topicos[0] ?? m.nome,
      texto: `[STUB - executar com MINIMAX_API_KEY] ${m.nome} - L${i + 1} - Q01`,
      ordem: 1,
    })),
  );
  const stubTE = MODULOS_TEOLOGIA.slice(0, 2).flatMap((m) =>
    Array.from({ length: m.num_licoes }, (_, i) => ({
      id: gerarId(m.id, i + 1, 1),
      modulo_id: m.id,
      licao_id: `${m.id}-L${String(i + 1).padStart(2, '0')}`,
      topico: m.topicos[0] ?? m.nome,
      texto: `[STUB - executar com MINIMAX_API_KEY] ${m.nome} - L${i + 1} - Q01`,
      ordem: 1,
    })),
  );

  fs.writeFileSync(path.join(dataDir, '5_a_NT_completo.json'), JSON.stringify(stubNT, null, 2), 'utf8');
  fs.writeFileSync(path.join(dataDir, '6_a_Teologia.json'), JSON.stringify(stubTE, null, 2), 'utf8');
  console.log('[generate_questions] Stubs salvos em data/planilhas/');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[generate_questions] Erro:', err);
    process.exit(1);
  });
}

export { gerarModulo, callM3Batch, buildSystemPrompt, type ModuloTopico, type PerguntaGerada, MODULOS_NT, MODULOS_TEOLOGIA };