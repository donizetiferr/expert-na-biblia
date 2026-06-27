/**
 * seed-completar.ts — GERADO por scripts/gen_seed_d.mjs (V23.5, D.3).
 * Itens do formato "completar versiculo". NAO editar a mao.
 */
import type { SQLiteDatabase } from 'expo-sqlite';

// [id, referencia, texto_com_lacuna, resposta, distratores(JSON)]
export const COMPLETAR_VERSICULOS: Array<[string, string, string, string, string]> = [
  ['CV001', 'Josue 1:9', 'Não te mandei eu? Sê forte e _____ ; não temas, nem te espantes, porque o Senhor teu Deus é contigo, por onde quer que vás.', 'corajoso', '["valente","ousado","destemido"]'],
  ['CV002', 'Salmos 23:1', 'O Senhor é o meu _____, nada me faltará.', 'pastor', '["amigo","guia","protetor"]'],
  ['CV003', 'Exodo 20:12', 'Honra a teu pai e a tua mãe, para que se prolonguem os teus dias na _____ que o Senhor, o teu Deus, te dá.', 'terra', '["ceu","pais","regiao"]'],
  ['CV004', 'Salmos 119:105', 'Lâmpada para os meus pés é a tua _____, e luz para o meu caminho.', 'palavra', '["lei","verdade","vontade"]'],
  ['CV005', 'Genesis 1:1', 'No princípio _____ Deus os céus e a terra.', 'criou', '["fez","formou","produziu"]'],
  ['CV006', 'Salmos 1:1', 'Bem-aventurado o _____ que não andou no conselho dos ímpios, nem ficou no caminho dos pecadores, nem se assentou na cadeira dos escarnecedores.', 'homem', '["menino","servo","profeta"]'],
  ['CV007', 'Exodo 20:3', 'Não terás outros _____ diante de mim.', 'deuses', '["ídolos","senhores","bens"]'],
  ['CV008', 'Salmos 23:4', 'Ainda que eu ande em meio à _____ da morte, não temerei mal algum, porque tu estás comigo; o teu bordão e o teu cayado me consolam.', 'sombra', '["escuridão","perigo","trevas"]'],
  ['CV009', 'Proverbios 3:5', 'Confia no Senhor de todo o teu _____, e não te encostas à tua própria inteligência.', 'coração', '["mente","espírito","entendimento"]'],
  ['CV010', 'Salmos 46:1', 'Deus é o nosso refúgio e a nossa _____, bem como o nosso pronto auxílio nas tribulações.', 'fortaleza', '["proteção","defesa","segurança"]'],
  ['CV011', 'Salmos 91:1', 'Aquele que habita no _____ do Altíssimo, à sombra do Onipotente descansará.', 'esconderijo', '["abrigo","refúgio","santuário"]'],
  ['CV012', 'Eclesiastes 3:1', 'Tudo tem o seu tempo determinado, e há tempo para todo o _____ debaixo do céu.', 'propósito', '["misterio","sentido","lugar"]'],
  ['CV013', 'Isaias 41:10', 'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te _____, e te ajudo, e te sustento com a minha destra fiel.', 'fortaleço', '["abandono","condeno","destruo"]'],
  ['CV014', 'Proverbios 22:6', 'Instrui a criança na _____ em que deve andar, e quando for velha não se desviará dele.', 'caminho', '["vereda","rota","direção"]'],
  ['CV015', 'Isaias 53:5', 'Todavia ele foi ferido pelas nossas transgressões e moído pelas nossas iniquidades; o castigo que nos traz a paz estava sobre ele, e pelas suas pisaduras somos _____', 'sarados', '["curados","salvos","livres"]'],
  ['CV016', 'Miqueias 6:8', 'Ele te declarou, ó homem, o que é bom; e que é o que o SENHOR pede de ti, senão que pratiques a _____, e ames a misericórdia, e andes humildemente com o teu Deus?', 'justiça', '["bondade","caridade","verdade"]'],
  ['CV017', 'Jeremias 29:11', 'Pois eu bem sei os pensamentos que penso sobre vós, diz o SENHOR; _____ de paz, e não de mal, para vos dar o fim que esperais.', 'pensamentos', '["planos","desígnios","propósitos"]'],
  ['CV018', 'Mateus 5:9', 'Bem-aventurados os _____, porque eles serão chamados filhos de Deus.', 'pacificadores', '["mansos","sofredores","peregrinos"]'],
  ['CV019', 'Mateus 6:33', 'Buscai primeiro o _____ de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.', 'reino', '["mundo","céu","favor"]'],
  ['CV020', 'Mateus 22:37', 'Jesus disse-lhe: Amarás o _____, teu Deus, de todo o teu coração, de toda a tua alma e de toda a tua mente.', 'Senhor', '["Cristo","Messias","Espírito"]'],
  ['CV021', 'Mateus 28:19', 'Ide, portanto, e fazei _____ de todas as nações, batizando-os em nome do Pai, do Filho e do Espírito Santo', 'discípulos', '["crentes","convertidos","seguidores"]'],
  ['CV022', 'Lucas 2:11', 'Porque vos nasceu hoje, na cidade de Davi, um _____, que é Cristo o Senhor.', 'Salvador', '["Profeta","Messias","Redentor"]'],
  ['CV023', 'Mateus 11:28', 'Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos _____', 'aliviarei', '["ajudarei","consolarei","salvarei"]'],
  ['CV024', 'Joao 14:6', 'Jesus disse-lhe: Eu sou o _____, a verdade e a vida; ninguém vem ao Pai, senão por mim.', 'caminho', '["Salvador","life","caminhos"]'],
  ['CV025', 'Joao 8:32', 'E conhecereis a _____, e a verdade vos libertará.', 'verdade', '["vida","luz","palavra"]'],
  ['CV026', 'Joao 11:25', 'Disse-lhe Jesus: Eu sou a _____ e a vida; quem crê em mim, ainda que esteja morto, viverá.', 'ressurreição', '["salvação","redenção","verdade"]'],
  ['CV027', 'Joao 1:1', 'No princípio era o _____, e o Verbo estava com Deus, e o Verbo era Deus.', 'Verbo', '["Filho","Espírito","Messias"]'],
  ['CV028', 'Joao 3:16', 'Porque Deus amou o mundo de tal maneira que deu o seu _____ unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.', 'Filho', '["Pai","Espírito","Messias"]'],
  ['CV029', 'Romanos 3:23', 'Porque todos _____ e destituídos estão da glória de Deus', 'pecaram', '["erraram","falharam","transgrediram"]'],
  ['CV030', 'Romanos 5:8', 'Mas Deus prova o seu próprio _____ para conosco, em que, sendo ainda pecadores, Cristo morreu por nós.', 'amor', '["odio","carinho","afeto"]'],
  ['CV031', 'Romanos 8:28', 'E sabemos que todas as coisas contribuem juntamente para o _____ daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.', 'bem', '["mal","proveito","interesse"]'],
  ['CV032', 'Romanos 10:9', 'Porque se tu confessares com a tua boca o Senhor Jesus, e creres no teu coração que Deus o ressuscitou dos mortos, serás _____', 'salvo', '["perdido","condenado","abençoado"]'],
  ['CV033', '1 Corintios 13:4', 'O amor é _____, é benigno; o amor não é invejoso; o amor não se ufana, não se ensoberbece.', 'sofredor', '["forte","impaciente","fiel"]'],
  ['CV034', 'Atos 16:31', 'Crê no Senhor Jesus Cristo e serás _____, tu e a tua casa.', 'salvo', '["bendito","livre","feliz"]'],
  ['CV035', '1 Corintios 13:13', 'Agora, pois, permanecem estes três: a fé, a esperança e o amor; mas a maior delas é o _____', 'amor', '["fé","esperança","caridade"]'],
  ['CV036', 'Efesios 2:8', 'Porque pela _____ sois salvos, mediante a fé; e isso não veio de vós; é dom de Deus.', 'graça', '["fé","amor","misericórdia"]'],
  ['CV037', 'Galatas 5:22', 'O fruto do _____ é: amor, alegria, paz, longanimidade, benignidade, bondade, fidelidade,', 'Espírito', '["Filho","Senhor","Pai"]'],
  ['CV038', 'Colossenses 3:23', 'Tudo quanto fizerdes, fazei-o de todo _____ , como para o Senhor, e não para os homens,', 'coração', '["jeito","intuito","ânimo"]'],
  ['CV039', 'Filipenses 4:13', 'Tudo posso naquele que me _____', 'fortalece', '["sustenta","ajuda","guia"]'],
  ['CV040', 'Filipenses 4:6', 'Não andeis _____ de coisa alguma; antes, em tudo, pela oração e súplica, com ações de graças, fazei.vos. conhecer vossas petições a Deus.', 'ansiosos', '["tristes","preocupados","nervosos"]'],
  ['CV041', 'Efesios 6:1', 'Filhos, sede _____, no Senhor, aos vossos pais; porque isto é justo.', 'obedientes', '["sujeitos","submissos","humildes"]'],
  ['CV042', 'Tiago 1:22', 'Sede, porém, _____ da palavra, e não apenas ouvintes, enganando-vos a vós mesmos.', 'praticantes', '["leitores","estudiosos","ouvintes"]'],
  ['CV043', 'Hebreus 11:1', 'Ora, a fé é o _______ fundamento das coisas que se esperam e a prova das coisas que não se veem.', 'firme', '["sólido","grande","bom"]'],
  ['CV044', 'Hebreus 13:8', 'Jesus Cristo é o mesmo ontem, hoje, e para _____.', 'sempre', '["agora","eternamente","jamais"]'],
  ['CV045', '1 Pedro 5:7', 'Lançando sobre ele toda a vossa _____, porque ele tem cuidado de vós.', 'ansiedade', '["preocupação","angústia","tristeza"]'],
  ['CV046', '1 Joao 1:9', 'Se confessarmos os nossos pecados, ele é fiel e justo para nos _____ os pecados, e nos purificar de toda injustiça.', 'perdoar', '["condenar","esquecer","evitar"]'],
  ['CV047', '1 Joao 4:8', 'Aquele que não ama não conheceu a Deus; porque Deus é _____', 'amor', '["fé","paz","vida"]'],
  ['CV048', '1 Joao 4:19', 'Nós o amamos a ele, porque ele nos _____ primeiro', 'amou', '["odiava","conheceu","escolheu"]'],
  ['CV049', 'Provervios 16:3', 'Confia ao Senhor as tuas obras, e os teus pensamentos serão _____', 'firmados', '["confirmados","estabelecidos","orientados"]'],
  ['CV050', 'Apocalipse 21:4', 'E Deus limpará de toda a lágrima os seus olhos; e não haverá mais morte, nem haverá mais lamento, nem clamor, nem mais haverá _____; porque já as primeiras coisas são passadas.', 'dor', '["paz","medo","sofrimento"]'],
  ['CV051', 'Apocalipse 3:20', 'Eis que estou à _____, e bato; se alguém ouvir a minha voz, e abrir a porta, entrarei em ele, e com ele cearmei.', 'porta', '["casa","portão","entrada"]'],
  ['CV052', 'Salmos 100:1', 'Louvai ao SENHOR, todas as _____', 'terras', '["nações","pessoas","criaturas"]'],
];

export function applySeedCompletar(db: SQLiteDatabase): void {
  db.withTransactionSync(() => {
    for (const [id, ref, texto, resp, distr] of COMPLETAR_VERSICULOS) {
      db.runSync(
        'INSERT OR IGNORE INTO completar_versiculo (id, referencia, texto_com_lacuna, resposta, distratores) VALUES (?, ?, ?, ?, ?)',
        [id, ref, texto, resp, distr],
      );
    }
  });
}
