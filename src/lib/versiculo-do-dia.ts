/**
 * V23.D.5: Versiculo do dia / devocional leve. Entry point de ~30s que traz o usuario
 * de volta sem exigir uma licao inteira (YouVersion/Manna mostram alto ROI de retencao).
 *
 * Conjunto curado embarcado (sem migracao/DB): a selecao roda pelo DIA DO ANO, entao o
 * versiculo muda diariamente de forma deterministica. Pode ser expandido para 365 via
 * batch M2.7 numa versao futura.
 */

export interface VersiculoDia {
  referencia: string;
  texto: string;
}

// Curadoria inicial (NVI-like, dominio devocional comum). Ampliar via batch depois.
export const VERSICULOS: ReadonlyArray<VersiculoDia> = [
  { referencia: 'João 3:16', texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna.' },
  { referencia: 'Salmos 23:1', texto: 'O Senhor é o meu pastor; nada me faltará.' },
  { referencia: 'Filipenses 4:13', texto: 'Tudo posso naquele que me fortalece.' },
  { referencia: 'Provérbios 3:5', texto: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento.' },
  { referencia: 'Romanos 8:28', texto: 'Sabemos que Deus age em todas as coisas para o bem daqueles que o amam.' },
  { referencia: 'Josué 1:9', texto: 'Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.' },
  { referencia: 'Isaías 41:10', texto: 'Não tema, pois estou com você; não tenha medo, pois sou o seu Deus. Eu o fortalecerei e o ajudarei.' },
  { referencia: 'Mateus 11:28', texto: 'Venham a mim, todos os que estão cansados e sobrecarregados, e eu darei descanso a vocês.' },
  { referencia: 'Salmos 46:1', texto: 'Deus é o nosso refúgio e a nossa fortaleza, auxílio sempre presente na adversidade.' },
  { referencia: 'Jeremias 29:11', texto: 'Porque sou eu que conheço os planos que tenho para vocês, planos de fazê-los prosperar e não de causar dano.' },
  { referencia: '1 Coríntios 13:4', texto: 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.' },
  { referencia: 'Salmos 119:105', texto: 'A tua palavra é lâmpada que ilumina os meus passos e luz que clareia o meu caminho.' },
  { referencia: 'Gálatas 5:22', texto: 'Mas o fruto do Espírito é amor, alegria, paz, paciência, amabilidade, bondade, fidelidade.' },
  { referencia: 'Mateus 6:33', texto: 'Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas serão acrescentadas a vocês.' },
  { referencia: 'Salmos 37:5', texto: 'Entregue o seu caminho ao Senhor; confie nele, e ele agirá.' },
  { referencia: 'Hebreus 11:1', texto: 'Ora, a fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.' },
  { referencia: 'Efésios 2:8', texto: 'Pois vocês são salvos pela graça, por meio da fé, e isto não vem de vocês, é dom de Deus.' },
  { referencia: 'Salmos 91:1', texto: 'Aquele que habita no abrigo do Altíssimo e descansa à sombra do Todo-poderoso.' },
  { referencia: 'João 14:6', texto: 'Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.' },
  { referencia: 'Romanos 12:2', texto: 'Não se amoldem ao padrão deste mundo, mas transformem-se pela renovação da sua mente.' },
  { referencia: 'Salmos 121:1', texto: 'Levanto os meus olhos para os montes e pergunto: De onde me vem o socorro?' },
  { referencia: '2 Timóteo 1:7', texto: 'Pois Deus não nos deu espírito de covardia, mas de poder, de amor e de equilíbrio.' },
  { referencia: 'Provérbios 16:3', texto: 'Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos.' },
  { referencia: 'Salmos 34:8', texto: 'Provem e vejam como o Senhor é bom. Como é feliz o homem que nele se refugia!' },
  { referencia: 'Tiago 1:5', texto: 'Se algum de vocês tem falta de sabedoria, peça-a a Deus, que a todos dá livremente.' },
  { referencia: 'Salmos 27:1', texto: 'O Senhor é a minha luz e a minha salvação; de quem terei temor?' },
  { referencia: 'Colossenses 3:23', texto: 'Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens.' },
  { referencia: 'Isaías 40:31', texto: 'Mas os que esperam no Senhor renovam as suas forças. Voam alto como águias.' },
  { referencia: '1 Pedro 5:7', texto: 'Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.' },
  { referencia: 'Salmos 118:24', texto: 'Este é o dia que o Senhor fez; alegremo-nos e exultemos neste dia.' },
];

/** Dia do ano (1..366) de uma data. */
export function diaDoAno(d: Date): number {
  const inicio = Date.UTC(d.getUTCFullYear(), 0, 0);
  const atual = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((atual - inicio) / (1000 * 60 * 60 * 24));
}

/** Versiculo do dia (deterministico por dia do ano). */
export function versiculoDeHoje(data: Date = new Date()): VersiculoDia {
  const idx = (diaDoAno(data) - 1 + VERSICULOS.length) % VERSICULOS.length;
  return VERSICULOS[idx] ?? VERSICULOS[0]!;
}

/** Texto pronto para compartilhar. */
export function textoCompartilhavel(v: VersiculoDia): string {
  return `"${v.texto}"\n— ${v.referencia}\n\nVia Expert na Bíblia`;
}
