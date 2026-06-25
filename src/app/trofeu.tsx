import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Image, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS } from '../constants/colors';
import { resetarProgresso } from '../lib/db-queries';
import { playVitoria } from '../lib/sound';

/**
 * Tela Final de Vitoria: Trofeu Expert.
 * V9 M2.3: usa imagem real do trofeu (whatsapp_media/images/image_20260622_215940.jpg)
 * + animacoes de vitoria (confete caindo + "Expert!" bounce + brilhos dourados).
 * Acionada quando TODOS os modulos estao concluida = true (ver todosModulosConcluidos em db-queries).
 */

// V18.3 MD.9: confetes on-palette (roxos/dourados/laranja) em vez de emojis.
const CONFETE_CORES = [
  COLORS.roxoPrimario,
  COLORS.laranjaClaro,
  COLORS.laranjaEscuro,
  COLORS.laranjaTrofeuBottom,
  COLORS.roxoMedio,
];
const CONFETE_COUNT = 14;

function ConfetePiece({ index }: { index: number }) {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const cor = CONFETE_CORES[index % CONFETE_CORES.length] ?? COLORS.laranjaClaro;
  const startX = (index * 37) % 100; // 0-100% spread
  const size = 10 + (index % 3) * 6;
  const isCirculo = index % 2 === 0;
  const duration = 3500 + (index % 5) * 700;
  const delay = (index * 280) % 2500;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(fallAnim, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(swayAnim, { toValue: 1, duration: duration / 2, useNativeDriver: true }),
            Animated.timing(swayAnim, { toValue: -1, duration: duration / 2, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(fallAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, [fallAnim, swayAnim, duration, delay]);

  const translateY = fallAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 700],
  });
  const translateX = swayAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-15, 0, 15],
  });
  const opacity = fallAnim.interpolate({
    inputRange: [0, 0.1, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: `${startX}%`,
        width: size,
        height: size,
        borderRadius: isCirculo ? size / 2 : 2,
        backgroundColor: cor,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate: `${index * 30}deg` }],
      }}
    />
  );
}

export default function TrofeuScreen() {
  const router = useRouter();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const trofeuScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Trofeu entra com bounce
    Animated.spring(trofeuScale, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // "Expert!" bounce loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -10, duration: 600, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 0, friction: 3, useNativeDriver: true }),
        Animated.delay(1500),
      ]),
    ).start();

    // Glow pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
      ]),
    ).start();

    playVitoria().catch((e: unknown) =>
      console.warn('[audio] trofeu playVitoria falhou:', e),
    );
  }, [bounceAnim, glowAnim, trofeuScale]);

  const handleRestart = async () => {
    await resetarProgresso();
    router.replace('/modos');
  };

  return (
    <View style={styles.container}>
      {/* Confete caindo */}
      {Array.from({ length: CONFETE_COUNT }).map((_, i) => (
        <ConfetePiece key={i} index={i} />
      ))}

      {/* Glow pulsando atras do trofeu */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowAnim,
            transform: [{ scale: glowAnim }],
          },
        ]}
      />

      {/* V18.3: imagem hero da designer (ja traz "Parabens, voce e um Expert!" com
          degrade + contorno) com bounce — evita duplicar o titulo em texto. */}
      <Animated.View
        style={{
          transform: [{ scale: trofeuScale }, { translateY: bounceAnim }],
        }}
      >
        <Image
          source={require('../../assets/images/trofeu.png')}
          style={styles.trofeuImg}
          resizeMode="contain"
          accessible
          accessibilityLabel="Troféu dourado: Parabéns, você é um Expert"
        />
      </Animated.View>

      <Text style={styles.subtitulo}>
        Concluiu todos os módulos da Bíblia
      </Text>

      <Pressable style={styles.botao} onPress={handleRestart}>
        <Text style={styles.botaoTexto}>RECOMEÇAR</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // V10 M5.7: briefing diz creme #f7f4ed, nao branco
    backgroundColor: COLORS.creme,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.lg,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: COLORS.laranjaClaro,
    opacity: 0.3,
  },
  trofeuImg: {
    width: 320,
    height: 360,
    marginVertical: ESPACAMENTOS.lg,
  },
  subtitulo: {
    fontFamily: FONTES.bodyBold,
    fontSize: 18,
    color: COLORS.preto,
    textAlign: 'center',
    marginTop: ESPACAMENTOS.md,
  },
  botao: {
    marginTop: ESPACAMENTOS.xl,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    backgroundColor: COLORS.roxoPrimario,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.laranjaEscuro,
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 24,
    color: COLORS.branco,
    letterSpacing: 2,
  },
});
