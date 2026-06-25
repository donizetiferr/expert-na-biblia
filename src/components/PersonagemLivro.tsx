import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type ImageSourcePropType } from 'react-native';

/**
 * Personagem livro animado com 5 poses (pensativo, feliz, assustado, TRISTE, EXCLAMANDO).
 * V18.2 (MB.3): usa os PNGs TRANSPARENTES originais da designer (Drive) renderizados
 * DIRETO sobre o fundo da tela — sem a moldura roxa + borda que dava o efeito de
 * "imagem com fundo dentro de um quadrado". Os assets ja vem com o livro recortado
 * (alpha real), entao o personagem se integra ao fundo.
 */

export type Pose = 'PENSATIVO' | 'FELIZ' | 'ASSUSTADO' | 'TRISTE' | 'EXCLAMANDO';

interface Props {
  pose?: Pose;
  size?: number;
}

const IMAGENS_POSE: Record<Pose, ImageSourcePropType> = {
  PENSATIVO: require('../../assets/images/personagem_pensativo.png') as ImageSourcePropType,
  FELIZ: require('../../assets/images/personagem_feliz.png') as ImageSourcePropType,
  ASSUSTADO: require('../../assets/images/personagem_assustado.png') as ImageSourcePropType,
  TRISTE: require('../../assets/images/personagem_triste.png') as ImageSourcePropType,
  EXCLAMANDO: require('../../assets/images/personagem_exclamando.png') as ImageSourcePropType,
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
      <Animated.Image
        source={IMAGENS_POSE[pose]}
        // PNG transparente direto sobre o fundo da tela (sem moldura/caixa).
        style={{ width: size, height: size * 1.3, opacity: blinkAnim }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
