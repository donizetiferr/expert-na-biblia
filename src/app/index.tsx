import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTES, ESPACAMENTOS } from '../constants/colors';
import { playSplash } from '../lib/sound';

const ONBOARDING_KEY = '@onboarding:completed';

/**
 * Tela 1: Splash screen com animacao do LOGO OFICIAL + som (3s).
 * V9 M2.1: usa imagem real do logo (whatsapp_media/images/image_20260622_205222.jpg)
 * V9 M4.5: na primeira abertura (sem @onboarding:completed), redireciona para /onboarding.
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

    playSplash().catch(() => {});

    const timer = setTimeout(async () => {
      try {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (done === '1') {
          router.replace('/modos');
        } else {
          router.replace('/onboarding');
        }
      } catch {
        router.replace('/modos');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, scaleAnim, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          marginBottom: ESPACAMENTOS.xl,
        }}
      >
        <Image
          source={require('../../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="Logo Expert Na Biblia"
        />
      </Animated.View>

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
  logo: {
    width: 340,
    height: 340,
  },
  titulo: {
    // V9.2.8: titulo removido (o logo JAH contem "EXPERT NA BIBLIA")
    // Mantido apenas para compatibilidade TS — nao usado
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
    fontSize: 20,
    color: COLORS.laranjaEscuro,
    textAlign: 'center',
    marginTop: ESPACAMENTOS.md,
    fontWeight: 'bold',
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