/**
 * Gradiente.tsx — V18.3 (MC.2)
 *
 * Componentes reutilizaveis de degrade da identidade (briefing: paleta oficial).
 * Antes o app NAO tinha expo-linear-gradient instalado -> ZERO degrades; ~12
 * superficies que o briefing pede em degrade estavam em cor solida.
 *
 * Cores em src/constants/colors.ts. Direcao padrao vertical (topo->base).
 */
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';

type GradProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** vertical (padrao) ou diagonal */
  diagonal?: boolean;
};

const vert = { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } } as const;
const diag = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } } as const;

/**
 * Degrade roxo (fundos, cards, botoes) — V19: #8b16c7 -> #3c026d (degrade OFICIAL
 * do briefing). Antes usava #5c0d8d -> #3c026d (dois roxos quase identicos) que
 * parecia COR SOLIDA ("chapado") em onboarding e na tela de pergunta. A amplitude
 * maior torna o degrade visivel.
 */
export function GradienteRoxo({ children, style, diagonal }: GradProps) {
  const dir = diagonal ? diag : vert;
  return (
    <LinearGradient
      colors={[COLORS.roxoPrimario, COLORS.roxoEscuro]}
      start={dir.start}
      end={dir.end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

/** Degrade laranja (feedback, placar, destaques) — #fded48 -> #fd8414. */
export function GradienteLaranja({ children, style, diagonal }: GradProps) {
  const dir = diagonal ? diag : vert;
  return (
    <LinearGradient
      colors={[COLORS.laranjaClaro, COLORS.laranjaEscuro]}
      start={dir.start}
      end={dir.end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

/** Degrade laranja "forte" (fundo de feedback/placar) — #fea726 -> #fe8917. */
export function GradienteLaranjaForte({ children, style, diagonal }: GradProps) {
  const dir = diagonal ? diag : vert;
  return (
    <LinearGradient
      colors={[COLORS.laranjaMedio, COLORS.laranjaForte]}
      start={dir.start}
      end={dir.end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

/** Degrade dourado do trofeu — #fca605 -> #ffc027. */
export function GradienteTrofeu({ children, style, diagonal }: GradProps) {
  const dir = diagonal ? diag : vert;
  return (
    <LinearGradient
      colors={[COLORS.laranjaTrofeuTop, COLORS.laranjaTrofeuBottom]}
      start={dir.start}
      end={dir.end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
