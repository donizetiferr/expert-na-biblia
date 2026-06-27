import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * V23.10 (J.1): seed da Enciclopedia leve (personagens + termos + eventos).
 *
 * Conteudo CURADO a mao (verbetes biblicos consagrados) — preferido a geracao por LLM
 * para esses itens conhecidos por confiabilidade/precisao. Expandir o acervo via batch
 * M2.7 e' um follow-up. INSERT OR IGNORE -> idempotente e seguro no upgrade.
 */

export interface VerbeteSeed {
  id: string;
  tipo: 'personagem' | 'termo' | 'evento';
  nome: string;
  resumo: string;
  detalhe: string;
  referencias: string;
}

export const ENCICLOPEDIA: VerbeteSeed[] = [
  // ---- Personagens ----
  {
    id: 'p_adao',
    tipo: 'personagem',
    nome: 'Adão',
    resumo: 'O primeiro ser humano criado por Deus.',
    detalhe:
      'Criado à imagem de Deus e colocado no Jardim do Éden junto com Eva. A desobediência do casal trouxe o pecado e a morte ao mundo, marcando a queda da humanidade.',
    referencias: 'Gênesis 1-3',
  },
  {
    id: 'p_noe',
    tipo: 'personagem',
    nome: 'Noé',
    resumo: 'Construiu a arca e sobreviveu ao dilúvio.',
    detalhe:
      'Homem justo a quem Deus ordenou construir uma arca para preservar sua família e os animais durante o dilúvio. Depois, Deus fez aliança com ele, tendo o arco-íris como sinal.',
    referencias: 'Gênesis 6-9',
  },
  {
    id: 'p_abraao',
    tipo: 'personagem',
    nome: 'Abraão',
    resumo: 'O pai da fé e das nações.',
    detalhe:
      'Chamado por Deus para deixar sua terra rumo a Canaã. Recebeu a promessa de uma descendência numerosa e de ser bênção para todas as nações. É lembrado por sua fé ao confiar em Deus mesmo diante do impossível.',
    referencias: 'Gênesis 12-25',
  },
  {
    id: 'p_jose',
    tipo: 'personagem',
    nome: 'José do Egito',
    resumo: 'Vendido pelos irmãos, tornou-se governador do Egito.',
    detalhe:
      'Filho de Jacó, foi vendido como escravo pelos próprios irmãos, mas Deus o elevou a governador do Egito. Interpretou os sonhos do faraó e salvou muitos da fome, perdoando depois seus irmãos.',
    referencias: 'Gênesis 37-50',
  },
  {
    id: 'p_moises',
    tipo: 'personagem',
    nome: 'Moisés',
    resumo: 'Libertou Israel do Egito e recebeu a Lei.',
    detalhe:
      'Conduziu o povo de Israel para fora da escravidão no Egito através do Mar Vermelho. No monte Sinai recebeu de Deus os Dez Mandamentos e a Lei que orientaria a nação.',
    referencias: 'Êxodo - Deuteronômio',
  },
  {
    id: 'p_davi',
    tipo: 'personagem',
    nome: 'Davi',
    resumo: 'Pastor que se tornou rei de Israel.',
    detalhe:
      'Venceu o gigante Golias ainda jovem e tornou-se o maior rei de Israel. Escreveu muitos Salmos e foi chamado "homem segundo o coração de Deus", apesar de suas falhas.',
    referencias: '1 e 2 Samuel; Salmos',
  },
  {
    id: 'p_salomao',
    tipo: 'personagem',
    nome: 'Salomão',
    resumo: 'O rei mais sábio; construiu o Templo.',
    detalhe:
      'Filho de Davi, pediu a Deus sabedoria para governar e tornou-se conhecido por sua sabedoria e riqueza. Construiu o primeiro Templo em Jerusalém e escreveu Provérbios e Eclesiastes.',
    referencias: '1 Reis 1-11',
  },
  {
    id: 'p_elias',
    tipo: 'personagem',
    nome: 'Elias',
    resumo: 'Profeta de fogo que enfrentou os falsos deuses.',
    detalhe:
      'Profeta corajoso que confrontou os profetas de Baal no monte Carmelo e foi atendido por Deus com fogo do céu. Foi levado ao céu num carro de fogo.',
    referencias: '1 Reis 17 - 2 Reis 2',
  },
  {
    id: 'p_daniel',
    tipo: 'personagem',
    nome: 'Daniel',
    resumo: 'Fiel a Deus na cova dos leões.',
    detalhe:
      'Jovem levado cativo à Babilônia que permaneceu fiel a Deus. Interpretou sonhos do rei e foi salvo na cova dos leões por sua integridade e oração.',
    referencias: 'Daniel 1-12',
  },
  {
    id: 'p_jonas',
    tipo: 'personagem',
    nome: 'Jonas',
    resumo: 'O profeta engolido pelo grande peixe.',
    detalhe:
      'Tentou fugir do chamado de Deus para pregar em Nínive e foi engolido por um grande peixe. Após arrepender-se, pregou e a cidade se converteu.',
    referencias: 'Jonas 1-4',
  },
  {
    id: 'p_maria',
    tipo: 'personagem',
    nome: 'Maria',
    resumo: 'A mãe de Jesus.',
    detalhe:
      'Jovem de Nazaré escolhida por Deus para ser mãe de Jesus pelo poder do Espírito Santo. Respondeu ao chamado com fé e humildade.',
    referencias: 'Lucas 1-2',
  },
  {
    id: 'p_joao_batista',
    tipo: 'personagem',
    nome: 'João Batista',
    resumo: 'Preparou o caminho para Jesus.',
    detalhe:
      'Pregou no deserto chamando o povo ao arrependimento e batizou Jesus no rio Jordão. Anunciou a chegada do Messias.',
    referencias: 'Mateus 3; João 1',
  },
  {
    id: 'p_pedro',
    tipo: 'personagem',
    nome: 'Pedro',
    resumo: 'Pescador que se tornou líder dos apóstolos.',
    detalhe:
      'Um dos doze discípulos mais próximos de Jesus. Apesar de tê-lo negado, foi restaurado e tornou-se líder da igreja primitiva, pregando no dia de Pentecoste.',
    referencias: 'Evangelhos; Atos 1-12',
  },
  {
    id: 'p_paulo',
    tipo: 'personagem',
    nome: 'Paulo',
    resumo: 'De perseguidor a maior missionário.',
    detalhe:
      'Perseguia os cristãos até encontrar-se com Jesus no caminho de Damasco. Tornou-se o grande missionário aos gentios e escreveu boa parte das cartas do Novo Testamento.',
    referencias: 'Atos 9-28; Epístolas',
  },
  {
    id: 'p_jesus',
    tipo: 'personagem',
    nome: 'Jesus Cristo',
    resumo: 'O Filho de Deus, Salvador do mundo.',
    detalhe:
      'O centro de toda a Bíblia. Viveu sem pecado, ensinou o Reino de Deus, morreu na cruz pelos pecados da humanidade e ressuscitou ao terceiro dia, oferecendo salvação a todos que creem.',
    referencias: 'Mateus - João',
  },

  // ---- Termos / glossario ----
  {
    id: 't_alianca',
    tipo: 'termo',
    nome: 'Aliança',
    resumo: 'Acordo solene entre Deus e seu povo.',
    detalhe:
      'Compromisso firmado por Deus com a humanidade (com Noé, Abraão, Moisés e Davi) e renovado na Nova Aliança em Cristo, baseada na graça.',
    referencias: 'Gênesis 9; Jeremias 31; Lucas 22',
  },
  {
    id: 't_graca',
    tipo: 'termo',
    nome: 'Graça',
    resumo: 'O favor imerecido de Deus.',
    detalhe:
      'Bondade de Deus concedida gratuitamente, não por mérito humano. É pela graça, mediante a fé, que somos salvos.',
    referencias: 'Efésios 2:8-9',
  },
  {
    id: 't_evangelho',
    tipo: 'termo',
    nome: 'Evangelho',
    resumo: 'A "boa notícia" de salvação em Jesus.',
    detalhe:
      'Significa "boas novas": a mensagem de que Jesus morreu e ressuscitou para reconciliar as pessoas com Deus. Também nomeia os quatro primeiros livros do Novo Testamento.',
    referencias: 'Marcos 1:1; 1 Coríntios 15',
  },
  {
    id: 't_salvacao',
    tipo: 'termo',
    nome: 'Salvação',
    resumo: 'Ser resgatado do pecado e da morte.',
    detalhe:
      'Obra de Deus que liberta o ser humano do pecado e da separação dele, dando vida eterna a quem crê em Jesus.',
    referencias: 'João 3:16; Romanos 10:9',
  },
  {
    id: 't_pecado',
    tipo: 'termo',
    nome: 'Pecado',
    resumo: 'Tudo que afasta o ser humano de Deus.',
    detalhe:
      'Desobediência à vontade de Deus, em pensamento, palavra ou ação. Todos pecaram; por isso a humanidade precisa de um Salvador.',
    referencias: 'Romanos 3:23',
  },
  {
    id: 't_arrependimento',
    tipo: 'termo',
    nome: 'Arrependimento',
    resumo: 'Mudar de direção e voltar-se para Deus.',
    detalhe:
      'Reconhecer o pecado, sentir pesar por ele e mudar de atitude, voltando-se para Deus. É o primeiro passo da conversão.',
    referencias: 'Atos 2:38',
  },
  {
    id: 't_fe',
    tipo: 'termo',
    nome: 'Fé',
    resumo: 'Confiar em Deus e em suas promessas.',
    detalhe:
      'Certeza das coisas que se esperam e convicção das que não se veem. É por meio dela que o ser humano se relaciona com Deus.',
    referencias: 'Hebreus 11:1',
  },
  {
    id: 't_parabola',
    tipo: 'termo',
    nome: 'Parábola',
    resumo: 'História curta com lição espiritual.',
    detalhe:
      'Narrativa simples do cotidiano usada por Jesus para ensinar verdades do Reino de Deus, como o Bom Samaritano e o Filho Pródigo.',
    referencias: 'Lucas 10; Lucas 15',
  },
  {
    id: 't_apostolo',
    tipo: 'termo',
    nome: 'Apóstolo',
    resumo: '"Enviado" para anunciar o evangelho.',
    detalhe:
      'Significa "enviado". Refere-se especialmente aos doze discípulos escolhidos por Jesus e a Paulo, comissionados para anunciar o evangelho e edificar a igreja.',
    referencias: 'Mateus 10; Atos',
  },
  {
    id: 't_profeta',
    tipo: 'termo',
    nome: 'Profeta',
    resumo: 'Quem fala da parte de Deus ao povo.',
    detalhe:
      'Pessoa chamada por Deus para transmitir sua mensagem, chamar ao arrependimento e anunciar acontecimentos futuros, como Isaías, Jeremias e Elias.',
    referencias: 'Isaías; Jeremias',
  },

  // ---- Eventos ----
  {
    id: 'e_exodo',
    tipo: 'evento',
    nome: 'Êxodo',
    resumo: 'A saída de Israel da escravidão no Egito.',
    detalhe:
      'Libertação do povo de Israel da escravidão egípcia, conduzida por Moisés, com a travessia do Mar Vermelho. É símbolo central da redenção no Antigo Testamento.',
    referencias: 'Êxodo 1-15',
  },
  {
    id: 'e_pentecoste',
    tipo: 'evento',
    nome: 'Pentecostes',
    resumo: 'A vinda do Espírito Santo sobre a igreja.',
    detalhe:
      'Cinquenta dias após a ressurreição, o Espírito Santo desceu sobre os discípulos, marcando o nascimento da igreja e o início da pregação do evangelho ao mundo.',
    referencias: 'Atos 2',
  },
];

export function applySeedEnciclopedia(db: SQLiteDatabase): void {
  for (const v of ENCICLOPEDIA) {
    db.runSync(
      'INSERT OR IGNORE INTO enciclopedia (id, tipo, nome, resumo, detalhe, referencias) VALUES (?, ?, ?, ?, ?, ?)',
      [v.id, v.tipo, v.nome, v.resumo, v.detalhe, v.referencias],
    );
  }
}
