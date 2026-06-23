import { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTES, ESPACAMENTOS } from '../constants/colors';

/**
 * Personagem livro animado com 3 poses (pensativo, feliz, assustado).
 * Troca automatica a cada 4s; pode ser controlada externamente via prop `pose`.
 */

export type Pose = 'PENSATIVO' | 'FELIZ' | 'ASSUSTADO';

interface Props {
  pose?: Pose;
  size?: number;
}

const CORES_POSE = {
  PENSATIVO: COLORS.laranjaEscuro,
  FELIZ: COLORS.acertoVerde,
  ASSUSTADO: COLORS.erroVermelho,
};

const EMOCAO_EMOJI = {
  PENSATIVO: '🤔',
  FELIZ: '😄',
  ASSUSTADO: '😱',
};

export function PersonagemLivro({ pose = 'PENSATIVO', size = 120 }: Props) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 150, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(3500),
      ])
    ).start();
  }, [bounceAnim, blinkAnim]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: bounceAnim }] }]}>
      <View
        style={[
          styles.livro,
          {
            width: size,
            height: size * 1.3,
            backgroundColor: COLORS.roxoPrimario,
            borderColor: CORES_POSE[pose],
          },
        ]}
      >
        <Text style={[styles.capa, { fontSize: size * 0.6 }]}>{EMOCAO_EMOJI[pose]}</Text>
        <Animated.Text style={[styles.olho, { opacity: blinkAnim, fontSize: size * 0.08 }]}>
          📖
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  livro: {
    borderRadius: 8,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.sm,
  },
  capa: {
    textAlign: 'center',
  },
  olho: {
    position: 'absolute',
    bottom: ESPACAMENTOS.xs,
  },
});