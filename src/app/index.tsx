import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { PersonagemLivro } from '../components/PersonagemLivro';
import { playSplash } from '../lib/sound';

/**
 * Tela 1: Splash screen com animacao do logo + som (3s).
 * Apos 3s, avanca automaticamente para /modos.
 * Botao "PULAR" disponivel para usuarios avancados.
 */
export default function SplashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Tocar splash sound (3s) ao montar a tela
    playSplash().catch(() => {});

    const timer = setTimeout(() => {
      router.replace('/modos');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, scaleAnim, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <PersonagemLivro pose="FELIZ" size={140} />
      </Animated.View>

      <Animated.Text style={[styles.titulo, { opacity: fadeAnim }]}>
        Expert Na Bíblia
      </Animated.Text>
      <Animated.Text style={[styles.subtitulo, { opacity: fadeAnim }]}>
        Sua jornada pela Palavra
      </Animated.Text>

      <Pressable
        style={styles.botaoPular}
        onPress={() => router.replace('/modos')}
      >
        <Text style={styles.textoPular}>PULAR ›</Text>
      </Pressable>
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
    fontSize: 48,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
    marginTop: ESPACAMENTOS.lg,
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 18,
    color: COLORS.branco,
    textAlign: 'center',
    marginTop: ESPACAMENTOS.sm,
  },
  botaoPular: {
    position: 'absolute',
    bottom: ESPACAMENTOS.xl,
    right: ESPACAMENTOS.lg,
    padding: ESPACAMENTOS.sm,
  },
  textoPular: {
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.laranjaEscuro,
  },
});