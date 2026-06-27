import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type ImageSourcePropType } from 'react-native';
import { useReduceMotion } from '../lib/a11y';

/**
 * Personagem livro animado com 5 poses (pensativo, feliz, assustado, TRISTE, EXCLAMANDO).
 * V18.2 (MB.3): usa os PNGs TRANSPARENTES originais da designer (Drive) renderizados
 * DIRETO sobre o fundo da tela — sem a moldura roxa + borda que dava o efeito de
 * "imagem com fundo dentro de um quadrado". Os assets ja vem com o livro recortado
 * (alpha real), entao o personagem se integra ao fundo.
 *
 * V20: DOIS mascotes por regra de identidade (docs/03_identidade_visual):
 *   - Personagem 1 = livro DOURADO/laranja -> modo LICOES (variante='licoes')
 *   - Personagem 2 = livro ROXO -> modo QUIZ (variante='quiz', DEFAULT)
 * O default 'quiz' preserva o comportamento legado (roxo) em todas as telas que nao
 * declaram variante. As telas de Licoes passam variante='licoes'.
 *
 * NOTA DE ASSET (honestidade): a pasta Drive "Personagens" so contem 3 poses DOURADAS
 * (positivas/neutras): pensativo (queixo), feliz/exclamando (dedo p/ cima), questionando.
 * Nao ha pose dourada ASSUSTADO/TRISTE dedicada — para esses estados de feedback nas
 * licoes usamos a pose dourada "questionando" (a mais neutra disponivel). O set ROXO do
 * Quiz tem as 5 poses completas.
 */

export type Pose = 'PENSATIVO' | 'FELIZ' | 'ASSUSTADO' | 'TRISTE' | 'EXCLAMANDO';
export type Variante = 'licoes' | 'quiz';

interface Props {
  pose?: Pose;
  size?: number;
  variante?: Variante;
  // V23.B.6: o mascote evolui com o NIVEL de XP — ganha uma aura/glow dourada que
  // intensifica nos niveis altos (driver de retencao: "meu personagem cresceu").
  nivel?: number;
}

// Set ROXO (Personagem 2 — modo Quiz). 5 poses completas.
const IMAGENS_QUIZ: Record<Pose, ImageSourcePropType> = {
  PENSATIVO: require('../../assets/images/personagem_pensativo.png') as ImageSourcePropType,
  FELIZ: require('../../assets/images/personagem_feliz.png') as ImageSourcePropType,
  ASSUSTADO: require('../../assets/images/personagem_assustado.png') as ImageSourcePropType,
  TRISTE: require('../../assets/images/personagem_triste.png') as ImageSourcePropType,
  EXCLAMANDO: require('../../assets/images/personagem_exclamando.png') as ImageSourcePropType,
};

// Set DOURADO (Personagem 1 — modo Licoes). Origem: 3 poses reais da designer
// (golden_13/14/15); ASSUSTADO/TRISTE reutilizam a pose dourada "questionando".
const IMAGENS_LICOES: Record<Pose, ImageSourcePropType> = {
  PENSATIVO: require('../../assets/images/personagem_licoes_pensativo.png') as ImageSourcePropType,
  FELIZ: require('../../assets/images/personagem_licoes_feliz.png') as ImageSourcePropType,
  ASSUSTADO: require('../../assets/images/personagem_licoes_assustado.png') as ImageSourcePropType,
  TRISTE: require('../../assets/images/personagem_licoes_triste.png') as ImageSourcePropType,
  EXCLAMANDO: require('../../assets/images/personagem_licoes_exclamando.png') as ImageSourcePropType,
};

export function PersonagemLivro({ pose = 'PENSATIVO', size = 120, variante = 'quiz', nivel = 1 }: Props) {
  const imagensPose = variante === 'licoes' ? IMAGENS_LICOES : IMAGENS_QUIZ;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  // V23.E.7: respeita "Reduzir animacoes" — sem os loops de bounce/blink (estatico).
  const reduceMotion = useReduceMotion();

  // V23.B.6: aura/glow estatica (sem loop) que cresce com o nivel. A partir do nivel 2,
  // o mascote ganha um brilho dourado cada vez mais forte (cap no nivel 6).
  const auraIntensidade = Math.min(Math.max(nivel - 1, 0), 5); // 0..5
  const glowStyle =
    auraIntensidade > 0
      ? {
          shadowColor: '#fded48',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.35 + auraIntensidade * 0.1,
          shadowRadius: 6 + auraIntensidade * 4,
          elevation: auraIntensidade * 2,
        }
      : null;

  useEffect(() => {
    // V23.E.7: com reduceMotion, mantem o personagem estatico (sem loops perpetuos).
    if (reduceMotion) {
      bounceAnim.setValue(0);
      blinkAnim.setValue(1);
      return;
    }
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.2, duration: 150, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(3500),
      ])
    );
    bounce.start();
    blink.start();
    // Cleanup: para os loops ao desmontar (evita animacao perpetua fora da tela — V22.B.2).
    return () => {
      bounce.stop();
      blink.stop();
    };
  }, [bounceAnim, blinkAnim, reduceMotion]);

  return (
    <Animated.View style={[styles.container, glowStyle, { transform: [{ translateY: bounceAnim }] }]}>
      <Animated.Image
        source={imagensPose[pose]}
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
