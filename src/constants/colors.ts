/**
 * Paleta oficial Expert Na Bíblia
 * Extraida de CLAUDE.md secao "Identidade visual"
 */
export const COLORS = {
  // Degradê Roxo
  roxoPrimario: '#8b16c7',
  roxoEscuro: '#3c026d',
  // Degradê Laranja
  laranjaClaro: '#fded48',
  laranjaEscuro: '#fd8414',
  // Base
  branco: '#ffffff',
  preto: '#0b0012',
  // Feedback
  acertoVerde: '#4ade80',
  erroVermelho: '#f87171',
  avisoAmarelo: '#fbbf24',
  // Cinzas
  cinzaClaro: '#f3f4f6',
  cinzaMedio: '#9ca3af',
  cinzaEscuro: '#4b5563',
} as const;

export const FONTES = {
  display: 'Bangers_400Regular',
  bodyRegular: 'Nunito_400Regular',
  bodyBold: 'Nunito_700Bold',
  bodyExtraBold: 'Nunito_800ExtraBold',
} as const;

export const ESPACAMENTOS = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDAS = {
  raioPequeno: 8,
  raioMedio: 16,
  raioGrande: 24,
  raioExtra: 32,
  larguraFina: 1,
  larguraMedia: 2,
  larguraGrossa: 3,
} as const;

export type Cores = typeof COLORS;
export type Fontes = typeof FONTES;