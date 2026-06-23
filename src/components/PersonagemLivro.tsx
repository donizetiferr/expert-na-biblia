import { useEffect, useRef } from 'react';
import { Animated, View, Image, StyleSheet } from 'react-native';
import { COLORS, ESPACAMENTOS } from '../constants/colors';

/**
 * Personagem livro animado com 3 poses (pensativo, feliz, assustado).
 * Troca automatica a cada 4s; pode ser controlada externamente via prop `pose`.
 * M4.1 (V8-RETOMADA): usa imagens reais em assets/images/ em vez de emojis.
 */

export type Pose = 'PENSATIVO' | 'FELIZ' | 'ASSUSTADO';

interface Props {
  pose?: Pose;
  size?: number;
}

const IMAGENS_POSE: Record<Pose, any> = {
  PENSATIVO: require('../../assets/images/personagem_pensativo.jpg'),
  FELIZ: require('../../assets/images/personagem_feliz.jpg'),
  ASSUSTADO: require('../../assets/images/personagem_assustado.jpg'),
};

const CORES_POSE = {
  PENSATIVO: COLORS.laranjaEscuro,
  FELIZ: COLORS.acertoVerde,
  ASSUSTADO: COLORS.erroVermelho,
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
        <Animated.Image
          source={IMAGENS_POSE[pose]}
          style={[styles.imagem, { width: size * 0.85, height: size * 1.1, opacity: blinkAnim }]}
          resizeMode="contain"
        />
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
  imagem: {
    // imagem do personagem com animacao
  },
});
