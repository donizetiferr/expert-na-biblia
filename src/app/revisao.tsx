import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { GradienteRoxo } from '../components/Gradiente';
import { PersonagemLivro } from '../components/PersonagemLivro';
import { IconeHome } from '../components/IconeHome';
import { listarParaRevisar, registrarRevisao } from '../lib/revisao';
import { concederXp, XP_POR_ACERTO } from '../lib/xp';
import { registrarAtividade } from '../lib/streak';
import type { Pergunta } from '../types';

const LIMITE = 10;

/**
 * V23.5 (D.2): Modo Revisao (repeticao espacada / Leitner).
 * Reapresenta perguntas vencidas em formato flashcard (recall ativo): mostra a pergunta,
 * o usuario tenta lembrar, revela a resposta canonica e auto-avalia (Acertei/Errei).
 * O resultado reagenda a pergunta (acerto espaca; erro revisa em breve) e recompensa XP.
 */
export default function RevisaoScreen() {
  const router = useRouter();
  const [fila, setFila] = useState<Pergunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [revelado, setRevelado] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fim, setFim] = useState(false);

  useEffect(() => {
    listarParaRevisar(LIMITE)
      .then((lista) => setFila(lista))
      .finally(() => setLoading(false));
  }, []);

  const atual = fila[indice];

  const avaliar = async (acertou: boolean) => {
    if (!atual) return;
    await registrarRevisao(atual.id, atual.licao_id, acertou).catch(() => {});
    const novoAcertos = acertos + (acertou ? 1 : 0);
    if (acertou) setAcertos(novoAcertos);
    if (indice + 1 >= fila.length) {
      const ganho = novoAcertos * XP_POR_ACERTO;
      if (ganho > 0) await concederXp(ganho, 'ACERTO');
      await registrarAtividade().catch(() => {});
      setFim(true);
    } else {
      setRevelado(false);
      setIndice((i) => i + 1);
    }
  };

  if (loading) {
    return (
      <GradienteRoxo style={styles.centro}>
        <ActivityIndicator size="large" color={COLORS.laranjaClaro} />
      </GradienteRoxo>
    );
  }

  if (fila.length === 0) {
    return (
      <GradienteRoxo style={styles.centro}>
        <PersonagemLivro pose="FELIZ" size={160} variante="licoes" />
        <Text style={styles.vazioTitulo}>Tudo em dia!</Text>
        <Text style={styles.vazioTexto}>
          Nenhuma revisão pendente por agora. Conclua lições para alimentar sua revisão — ela traz de volta o que você
          aprendeu, no momento certo de lembrar.
        </Text>
        <Pressable style={styles.botao} onPress={() => router.replace('/modos')}>
          <Text style={styles.botaoTexto}>VOLTAR</Text>
        </Pressable>
      </GradienteRoxo>
    );
  }

  if (fim) {
    return (
      <GradienteRoxo style={styles.centro}>
        <PersonagemLivro pose="EXCLAMANDO" size={160} variante="licoes" />
        <Text style={styles.fimTitulo}>REVISÃO CONCLUÍDA!</Text>
        <Text style={styles.fimTexto}>
          Você lembrou {acertos} de {fila.length}.
        </Text>
        {acertos > 0 ? <Text style={styles.fimXp}>+{acertos * XP_POR_ACERTO} XP</Text> : null}
        <Pressable style={styles.botao} onPress={() => router.replace('/modos')}>
          <Text style={styles.botaoTexto}>VOLTAR</Text>
        </Pressable>
      </GradienteRoxo>
    );
  }

  if (!atual) return null;

  return (
    <GradienteRoxo style={styles.fundo}>
      <View style={styles.header}>
        <Text style={styles.indicador}>
          {indice + 1}/{fila.length}
        </Text>
        <Text style={styles.titulo}>REVISÃO</Text>
        <IconeHome />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PersonagemLivro pose="PENSATIVO" size={150} variante="licoes" />

        <View style={styles.quadro}>
          <Text style={styles.pergunta}>{atual.texto}</Text>
        </View>

        {revelado ? (
          <View style={styles.respostaQuadro}>
            <Text style={styles.respostaLabel}>Resposta:</Text>
            <Text style={styles.respostaTexto}>{atual.resposta_canonica}</Text>
          </View>
        ) : null}

        {!revelado ? (
          <Pressable style={styles.botao} onPress={() => setRevelado(true)}>
            <Text style={styles.botaoTexto}>MOSTRAR RESPOSTA</Text>
          </Pressable>
        ) : (
          <View style={styles.autoavaliacao}>
            <Pressable style={[styles.avBotao, styles.avErrei]} onPress={() => avaliar(false)} accessibilityRole="button" accessibilityLabel="Não lembrei">
              <Text style={styles.avTexto}>NÃO LEMBREI</Text>
            </Pressable>
            <Pressable style={[styles.avBotao, styles.avAcertei]} onPress={() => avaliar(true)} accessibilityRole="button" accessibilityLabel="Lembrei">
              <Text style={[styles.avTexto, styles.avTextoPreto]}>LEMBREI ✓</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </GradienteRoxo>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, padding: ESPACAMENTOS.lg },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: ESPACAMENTOS.lg, gap: ESPACAMENTOS.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: ESPACAMENTOS.md },
  indicador: { fontFamily: FONTES.bodyBold, fontSize: 18, color: COLORS.laranjaClaro, width: 48 },
  titulo: { fontFamily: FONTES.display, fontSize: 24, color: COLORS.branco, letterSpacing: 1, flex: 1, textAlign: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: ESPACAMENTOS.lg, paddingVertical: ESPACAMENTOS.lg },
  quadro: {
    width: '100%',
    backgroundColor: COLORS.branco,
    padding: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
    minHeight: 100,
    justifyContent: 'center',
  },
  pergunta: { fontFamily: FONTES.bodyBold, fontSize: 18, color: COLORS.preto, textAlign: 'center' },
  respostaQuadro: {
    width: '100%',
    backgroundColor: COLORS.laranjaClaro,
    padding: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.preto,
    gap: ESPACAMENTOS.xs,
  },
  respostaLabel: { fontFamily: FONTES.bodyBold, fontSize: 13, color: COLORS.preto, textTransform: 'uppercase', letterSpacing: 1 },
  respostaTexto: { fontFamily: FONTES.bodyBold, fontSize: 18, color: COLORS.roxoEscuro, textAlign: 'center' },
  botao: {
    backgroundColor: COLORS.laranjaEscuro,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: 3,
    borderColor: COLORS.preto,
    alignItems: 'center',
  },
  botaoTexto: { fontFamily: FONTES.display, fontSize: 22, color: COLORS.branco, letterSpacing: 1 },
  autoavaliacao: { flexDirection: 'row', gap: ESPACAMENTOS.md, width: '100%' },
  avBotao: { flex: 1, paddingVertical: ESPACAMENTOS.md, borderRadius: BORDAS.raioMedio, alignItems: 'center', borderWidth: BORDAS.larguraGrossa, borderColor: COLORS.preto },
  avErrei: { backgroundColor: COLORS.erroVermelho },
  avAcertei: { backgroundColor: COLORS.acertoVerde },
  avTexto: { fontFamily: FONTES.display, fontSize: 18, color: COLORS.branco, letterSpacing: 1 },
  avTextoPreto: { color: COLORS.preto },
  vazioTitulo: { fontFamily: FONTES.display, fontSize: 40, color: COLORS.laranjaClaro, textAlign: 'center' },
  vazioTexto: { fontFamily: FONTES.bodyRegular, fontSize: 16, color: COLORS.branco, textAlign: 'center', lineHeight: 23 },
  fimTitulo: { fontFamily: FONTES.display, fontSize: 40, color: COLORS.laranjaClaro, textAlign: 'center' },
  fimTexto: { fontFamily: FONTES.bodyBold, fontSize: 18, color: COLORS.branco, textAlign: 'center' },
  fimXp: {
    fontFamily: FONTES.display,
    fontSize: 28,
    color: COLORS.laranjaClaro,
    backgroundColor: COLORS.preto,
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingVertical: ESPACAMENTOS.xs,
    borderRadius: BORDAS.raioMedio,
    overflow: 'hidden',
  },
});
