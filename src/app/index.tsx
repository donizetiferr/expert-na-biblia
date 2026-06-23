import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';

/**
 * Tela 1: Splash + entrada para modos (Sprint V1 - skeleton)
 * Implementacao completa: V4 (P1-1 + P1-2)
 */
export default function IndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Expert Na Bíblia</Text>
      <Text style={styles.subtitulo}>Aprenda a Bíblia de forma lúdica</Text>

      <View style={styles.cards}>
        <Pressable
          style={[styles.card, styles.cardQuiz]}
          onPress={() => router.push('/quiz')}
        >
          <Text style={styles.cardTitulo}>QUIZ BÍBLICO</Text>
          <Text style={styles.cardSubtitulo}>20 perguntas · Timer 10s</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.cardLicoes]}
          onPress={() => router.push('/licoes')}
        >
          <Text style={styles.cardTitulo}>LIÇÕES</Text>
          <Text style={styles.cardSubtitulo}>77 módulos progressivos</Text>
        </Pressable>
      </View>

      <Text style={styles.versao}>v0.1.0 — setup técnico concluído</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.roxoEscuro,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.lg,
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 56,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
    textShadowColor: COLORS.roxoPrimario,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 18,
    color: COLORS.branco,
    textAlign: 'center',
    marginTop: ESPACAMENTOS.sm,
    marginBottom: ESPACAMENTOS.xxl,
  },
  cards: {
    width: '100%',
    gap: ESPACAMENTOS.lg,
  },
  card: {
    padding: ESPACAMENTOS.xl,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraGrossa,
    alignItems: 'center',
  },
  cardQuiz: {
    backgroundColor: COLORS.roxoPrimario,
    borderColor: COLORS.laranjaEscuro,
  },
  cardLicoes: {
    backgroundColor: COLORS.laranjaEscuro,
    borderColor: COLORS.roxoPrimario,
  },
  cardTitulo: {
    fontFamily: FONTES.display,
    fontSize: 32,
    color: COLORS.branco,
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 14,
    color: COLORS.branco,
    marginTop: ESPACAMENTOS.xs,
    opacity: 0.9,
  },
  versao: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 12,
    color: COLORS.branco,
    opacity: 0.5,
    position: 'absolute',
    bottom: ESPACAMENTOS.lg,
  },
});