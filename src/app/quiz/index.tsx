import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';

/**
 * Tela 3: Quiz Biblico - escolha de modo (Aleatorio vs Licoes personalizadas).
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
          <Text style={styles.cardTitulo}>ALEATÓRIO</Text>
          <Text style={styles.cardSubtitulo}>20 perguntas de modulos aleatorios</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.cardCustom]}
          onPress={() => router.push('/quiz/customizar')}
        >
          <Text style={styles.cardEmoji}>📚</Text>
          <Text style={styles.cardTitulo}>PERSONALIZADO</Text>
          <Text style={styles.cardSubtitulo}>Escolha ate 20 modulos</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.roxoEscuro,
    padding: ESPACAMENTOS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 42,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 16,
    color: COLORS.branco,
    marginTop: ESPACAMENTOS.sm,
    marginBottom: ESPACAMENTOS.xxl,
  },
  cards: { width: '100%', gap: ESPACAMENTOS.lg },
  card: {
    padding: ESPACAMENTOS.xl,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraGrossa,
    alignItems: 'center',
  },
  cardAleatorio: { backgroundColor: COLORS.roxoPrimario, borderColor: COLORS.laranjaEscuro },
  cardCustom: { backgroundColor: COLORS.laranjaEscuro, borderColor: COLORS.roxoPrimario },
  cardEmoji: { fontSize: 48, marginBottom: ESPACAMENTOS.sm },
  cardTitulo: {
    fontFamily: FONTES.display,
    fontSize: 32,
    color: COLORS.branco,
  },
  cardSubtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 14,
    color: COLORS.branco,
    marginTop: ESPACAMENTOS.xs,
    opacity: 0.9,
  },
});