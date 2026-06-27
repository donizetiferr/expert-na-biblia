import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * V23.10 (J.2): seed dos planos de leitura / devocional. Conteudo CURADO (sequencias de
 * passagens consagradas). INSERT OR IGNORE -> idempotente e seguro no upgrade. Expandir o
 * acervo (mais planos / mais dias) e' follow-up.
 */

export interface PlanoSeed {
  id: string;
  titulo: string;
  descricao: string;
  dias: Array<{ titulo: string; passagem: string; reflexao: string }>;
}

export const PLANOS: PlanoSeed[] = [
  {
    id: 'plano_salmos7',
    titulo: '7 dias nos Salmos',
    descricao: 'Uma semana de oração e louvor com os Salmos mais amados.',
    dias: [
      { titulo: 'O Bom Pastor', passagem: 'Salmo 23', reflexao: 'O Senhor cuida de cada detalhe da sua vida. Onde você precisa confiar mais nele hoje?' },
      { titulo: 'Gratidão', passagem: 'Salmo 100', reflexao: 'Entre pelas portas de Deus com ações de graças. Liste 3 motivos para agradecer hoje.' },
      { titulo: 'Refúgio', passagem: 'Salmo 91', reflexao: 'Deus é o seu abrigo. Que medo você pode entregar a ele agora?' },
      { titulo: 'Coração quebrantado', passagem: 'Salmo 51', reflexao: 'Um convite ao arrependimento sincero. Peça a Deus um coração limpo.' },
      { titulo: 'A Palavra de Deus', passagem: 'Salmo 119:105-112', reflexao: 'A Palavra ilumina o caminho. Como ela tem guiado as suas decisões?' },
      { titulo: 'Espera', passagem: 'Salmo 27', reflexao: 'Espera no Senhor e tem bom ânimo. Em que área você precisa de paciência?' },
      { titulo: 'Louvor', passagem: 'Salmo 150', reflexao: 'Tudo o que respira louve ao Senhor. Termine a semana adorando a Deus.' },
    ],
  },
  {
    id: 'plano_vida_jesus7',
    titulo: 'A vida de Jesus em 7 dias',
    descricao: 'Caminhe pelos momentos centrais da vida de Jesus nos Evangelhos.',
    dias: [
      { titulo: 'O nascimento', passagem: 'Lucas 2:1-20', reflexao: 'Deus se fez próximo de nós. O que significa para você que Jesus nasceu humilde?' },
      { titulo: 'O batismo', passagem: 'Mateus 3:13-17', reflexao: 'O Pai se agrada do Filho. Lembre-se: você também é amado por Deus.' },
      { titulo: 'O Sermão do Monte', passagem: 'Mateus 5:1-16', reflexao: 'As bem-aventuranças mostram o coração do Reino. Qual delas fala mais com você?' },
      { titulo: 'Os milagres', passagem: 'Marcos 4:35-41', reflexao: 'Jesus acalma a tempestade. Que tempestade você pode entregar a ele?' },
      { titulo: 'O bom pastor', passagem: 'João 10:1-18', reflexao: 'Jesus dá a vida pelas ovelhas. Como você ouve a voz dele no dia a dia?' },
      { titulo: 'A cruz', passagem: 'Lucas 23:32-46', reflexao: 'No maior sofrimento, Jesus perdoa. Há alguém que você precisa perdoar?' },
      { titulo: 'A ressurreição', passagem: 'João 20:1-18', reflexao: 'Cristo vive! Como a esperança da ressurreição muda o seu hoje?' },
    ],
  },
];

export function applySeedPlanos(db: SQLiteDatabase): void {
  for (const p of PLANOS) {
    db.runSync('INSERT OR IGNORE INTO plano_leitura (id, titulo, descricao, dias) VALUES (?, ?, ?, ?)', [
      p.id,
      p.titulo,
      p.descricao,
      p.dias.length,
    ]);
    p.dias.forEach((d, i) => {
      db.runSync(
        'INSERT OR IGNORE INTO plano_dia (plano_id, dia, titulo, passagem, reflexao) VALUES (?, ?, ?, ?, ?)',
        [p.id, i + 1, d.titulo, d.passagem, d.reflexao],
      );
    });
  }
}
