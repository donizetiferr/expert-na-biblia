import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';

/**
 * Tela 2: Selecao de modo (Quiz Biblico / Licoes).
 * V10 M5.2: cores oficiais do briefing (pixel analysis).
 * - Fundo creme #f7f4ed
 * - Cards roxo #4d0a7d com borda laranja #f9ea59
 * - Logo grande no topo
 * - "BÍBLICO" e "LIÇÕES" em laranjaEscuro (resto branco)
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

      <Image
        source={require('../../assets/images/logo.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.cards}>
        <Pressable
          style={[styles.card, styles.cardQuiz]}
          onPress={() => router.push('/quiz')}
        >
          <Text style={styles.cardTitulo}>
            <Text style={styles.palavraChave}>QUIZ </Text>
            <Text style={styles.palavraChave}>BÍBLICO</Text>
          </Text>
          <Text style={styles.cardSubtitulo}>20 perguntas · Timer 10s</Text>
        </Pressable>

        <Pressable
          style={[styles.card, styles.cardLicoes]}
          onPress={() => router.push('/licoes')}
        >
          <Text style={styles.cardTitulo}>
            <Text style={styles.palavraChave}>LIÇÕES</Text>
          </Text>
          <Text style={styles.cardSubtitulo}>77 módulos progressivos</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creme,
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
  logo: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    marginTop: ESPACAMENTOS.xl,
    marginBottom: ESPACAMENTOS.lg,
  },
  cards: {
    flex: 1,
    justifyContent: 'center',
    gap: ESPACAMENTOS.lg,
  },
  card: {
    padding: ESPACAMENTOS.xl,
    borderRadius: BORDAS.raioGrande,
    borderWidth: 4,  // BORDAS.larguraExtraGrossa (4px) — mais grossa que default
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
    shadowColor: COLORS.preto,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  cardQuiz: {
    backgroundColor: COLORS.roxoCard,        // #4d0a7d (briefing)
    borderColor: COLORS.laranjaBorda,        // #f9ea59 (briefing)
  },
  cardLicoes: {
    backgroundColor: COLORS.roxoCard,        // #4d0a7d (briefing — fundo roxo)
    borderColor: COLORS.laranjaBorda,        // #f9ea59 (briefing)
  },
  cardTitulo: {
    fontFamily: FONTES.display,
    fontSize: 36,
    color: COLORS.branco,
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  palavraChave: {
    color: COLORS.laranjaEscuro,             // #fd8414 — "BÍBLICO"/"LIÇÕES" em laranja
    fontFamily: FONTES.bodyExtraBold,
  },
  cardSubtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 16,
    color: COLORS.branco,
    marginTop: ESPACAMENTOS.xs,
    opacity: 0.9,
  },
});
