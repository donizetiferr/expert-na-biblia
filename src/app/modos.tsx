import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { GradienteRoxo } from '../components/Gradiente';

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
      {/* V23.B.2: acesso ao perfil/"Meu Progresso" (canto superior esquerdo). */}
      <Pressable
        style={styles.botaoPerfil}
        onPress={() => router.push('/perfil')}
        accessibilityRole="button"
        accessibilityLabel="Meu Progresso"
      >
        <Text style={styles.textoPerfil}>📊</Text>
      </Pressable>

      <Pressable
        style={styles.botaoConfig}
        onPress={() => router.push('/config')}
        accessibilityRole="button"
        accessibilityLabel="Configurações"
      >
        <Text style={styles.textoConfig}>≡</Text>
      </Pressable>

      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.cards}>
        <Pressable style={styles.cardShadow} onPress={() => router.push('/quiz')}>
          <GradienteRoxo diagonal style={styles.card}>
            <Text style={styles.cardTitulo}>
              <Text style={styles.palavraChave}>QUIZ </Text>
              <Text style={styles.palavraChave}>BÍBLICO</Text>
            </Text>
            <Text style={styles.cardSubtitulo}>20 perguntas · Timer 10s</Text>
          </GradienteRoxo>
        </Pressable>

        <Pressable style={styles.cardShadow} onPress={() => router.push('/licoes')}>
          <GradienteRoxo diagonal style={styles.card}>
            <Text style={styles.cardTitulo}>
              <Text style={styles.palavraChave}>LIÇÕES</Text>
            </Text>
            <Text style={styles.cardSubtitulo}>40 módulos progressivos</Text>
          </GradienteRoxo>
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
  // V23.B.2: botao de perfil (canto superior esquerdo).
  botaoPerfil: {
    position: 'absolute',
    top: ESPACAMENTOS.xl,
    left: ESPACAMENTOS.lg,
    padding: ESPACAMENTOS.sm,
    zIndex: 10,
  },
  textoPerfil: {
    fontSize: 30,
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
  // V18.3 MC.2/MD.2: sombra fica no Pressable externo; o degrade roxo + borda
  // laranja ficam no card interno (overflow hidden para o degrade respeitar o raio).
  cardShadow: {
    borderRadius: BORDAS.raioGrande,
    shadowColor: COLORS.preto,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  card: {
    padding: ESPACAMENTOS.xl,
    borderRadius: BORDAS.raioGrande,
    borderWidth: 4,
    borderColor: COLORS.laranjaBorda,        // #f9ea59 (briefing): borda laranja
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
    overflow: 'hidden',
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
    color: COLORS.laranjaClaro,              // amarelo-laranja sobre o degrade roxo
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
