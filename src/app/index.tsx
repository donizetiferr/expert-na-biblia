import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Image } from 'react-native';
import * as SplashScreenLib from 'expo-splash-screen';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTES, ESPACAMENTOS } from '../constants/colors';
import { playSplash } from '../lib/sound';

const ONBOARDING_KEY = '@onboarding:completed';

/**
 * Tela 1: Splash screen com animacao do LOGO OFICIAL grande.
 * V14 M15.1:
 *   - Logo 340x340 mantido (mesmo tamanho — splash nativo ja tem logo cropped)
 *   - SplashScreen.hideAsync() em ~500ms para liberar splash nativo IMEDIATAMENTE
 *     e mostrar o logo JSX em tela cheia (não esperar 3s)
 *   - Redirecionamento acontece em 500ms (não em 3000ms)
 * V9 M2.1: usa imagem real do logo (whatsapp_media/images/image_20260622_205222.jpg)
 * V9 M4.5: na primeira abertura (sem @onboarding:completed), redireciona para /onboarding.
 */
export default function SplashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // V15 M15.1: refs estáveis (não mudam entre renders) para o useEffect
  // NAO re-rodar e causar loop. O bug anterior era colocar `scaleAnim, fadeAnim`
  // nas deps — como `current` muda a cada render, useEffect re-rodava
  // criando setTimeout infinitos.
  const scaleAnimRef = useRef(scaleAnim);
  const fadeAnimRef = useRef(fadeAnim);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnimRef.current, {
        toValue: 1.0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimRef.current, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    playSplash().catch((e: unknown) =>
      console.warn('[audio] splash playSplash falhou:', e),
    );

    // V15 M15.1: libera splash nativo em ~500ms e redireciona.
    // O logo grande JSX fica visivel durante esses 500ms.
    const timer = setTimeout(async () => {
      try {
        await SplashScreenLib.hideAsync().catch((e: unknown) =>
          console.warn('[splash] hideAsync falhou:', e),
        );
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        console.log('[onboarding] key:', done);
        if (done === '1') {
          router.replace('/modos');
        } else {
          router.replace('/onboarding');
        }
      } catch (e) {
        console.warn('[splash] erro no redirect:', e);
        router.replace('/modos');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

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
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="Logo Expert Na Biblia — sua jornada pela Palavra"
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
    // V11: briefing oficial — splash roxo escuro #3f0170 (image_20260622_205222.jpg)
    backgroundColor: '#3f0170',
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