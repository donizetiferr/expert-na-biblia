import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';

/**
 * Tela 2: Selecao de modo (Quiz Biblico / Licoes).
 * Botao hamburguer (≡) canto superior direito → modal de Configuracoes.
 */
export default function ModosScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.botaoConfig}
        onPress={() => router.push('/config')}
      >
        <Text style={styles.textoConfig}>≡</Text>
      </Pressable>

      <Text style={styles.titulo}>Escolha seu modo</Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.roxoEscuro,
    padding: ESPACAMENTOS.lg,
  },
  botaoConfig: {
    position: 'absolute',
    top: ESPACAMENTOS.xl,
    right: ESPACAMENTOS.lg,
    padding: ESPACAMENTOS.sm,
    zIndex: 10,
  },
  textoConfig: {
    fontSize: 36,
    color: COLORS.laranjaEscuro,
    fontWeight: 'bold',
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 36,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
    marginTop: ESPACAMENTOS.xxl,
    marginBottom: ESPACAMENTOS.xl,
  },
  cards: {
    flex: 1,
    justifyContent: 'center',
    gap: ESPACAMENTOS.lg,
  },
  card: {
    padding: ESPACAMENTOS.xl,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraGrossa,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
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
    fontSize: 36,
    color: COLORS.branco,
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  cardSubtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 16,
    color: COLORS.branco,
    marginTop: ESPACAMENTOS.xs,
    opacity: 0.9,
  },
});