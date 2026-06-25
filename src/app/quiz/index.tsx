import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';

/**
 * Tela 3: Quiz Biblico - escolha de modo (Aleatorio vs Licoes personalizadas).
 * V14 M15.2:
 *   - fundo creme #f7f4ed (consistente com /modos)
 *   - emojis do briefing (🎲/📚) MANTIDOS — 15.9 rejeitado (briefing valida emojis)
 *   - emoji size 48 -> 64, com laranjaEscuro (palavra-chave) — alinhado com 15.9 nota
 */
export default function QuizIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>QUIZ BÍBLICO</Text>
      <Text style={styles.subtitulo}>20 perguntas · Timer 10s</Text>

      <View style={styles.cards}>
        <Pressable
          style={[styles.card, styles.cardAleatorio]}
          onPress={() => router.push('/quiz/jogar?modo=aleatorio')}
        >
          <Text style={styles.cardEmoji}>🎲</Text>
          <Text style={styles.cardTitulo}>
            <Text style={styles.palavraChave}>ALEATÓRIO</Text>
          </Text>
          <Text style={styles.cardSubtitulo}>20 perguntas de modulos aleatorios</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.cardCustom]}
          onPress={() => router.push('/quiz/customizar')}
        >
          <Text style={styles.cardEmoji}>📚</Text>
          <Text style={styles.cardTitulo}>
            <Text style={styles.palavraChavePreta}>PERSONALIZADO</Text>
          </Text>
          <Text style={styles.cardSubtitulo}>Escolha ate 20 modulos</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // V14 M15.2: fundo creme (consistente com /modos)
    backgroundColor: COLORS.creme,
    padding: ESPACAMENTOS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 42,
    color: COLORS.roxoEscuro,
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 16,
    color: COLORS.preto,
    marginTop: ESPACAMENTOS.sm,
    marginBottom: ESPACAMENTOS.xxl,
  },
  cards: { width: '100%', gap: ESPACAMENTOS.lg },
  card: {
    padding: ESPACAMENTOS.xl,
    borderRadius: BORDAS.raioGrande,
    borderWidth: 4, // V14 M15.2: borda mais grossa (4px) consistente com /modos
    alignItems: 'center',
  },
  cardAleatorio: { backgroundColor: COLORS.roxoPrimario, borderColor: COLORS.laranjaEscuro },
  cardCustom: { backgroundColor: COLORS.laranjaEscuro, borderColor: COLORS.roxoPrimario },
  // V14 M15.2: emoji size 48 -> 64 (nota 15.9 rejeitado)
  cardEmoji: { fontSize: 64, marginBottom: ESPACAMENTOS.sm },
  cardTitulo: {
    fontFamily: FONTES.display,
    fontSize: 32,
    color: COLORS.branco,
  },
  // V14 M15.2: "ALEATÓRIO" laranja sobre roxo
  palavraChave: {
    color: COLORS.laranjaEscuro,
    fontFamily: FONTES.bodyExtraBold,
  },
  // V14 M15.2: "PERSONALIZADO" preto sobre laranjaEscuro
  palavraChavePreta: {
    color: COLORS.preto,
    fontFamily: FONTES.bodyExtraBold,
  },
  cardSubtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 14,
    color: COLORS.branco,
    marginTop: ESPACAMENTOS.xs,
    opacity: 0.9,
  },
});