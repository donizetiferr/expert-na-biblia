/**
 * Paleta oficial Expert Na Bíblia
 * V10: extraida via pixel-analysis das imagens oficiais do briefing (whatsapp_media/images/)
 * - Creme off-white (fundo T2, TL1, Trofeu): #f7f4ed
 * - Roxo claro (fundo TL Pergunta): #3e036f / #5c0d8d (degradê)
 * - Roxo escuro (card botões Modos): #4d0a7d / #4d0978 (degradê)
 * - Laranja forte (Feedback/Placar): #fe8917 / #fea726 (degradê)
 * - Laranja claro (borda cards / texto palavra-chave): #fded48 / #f9ea59
 * - Laranja escuro (borda do input / degradê trofeu): #fd8414 / #fca605 / #ffc027
 */
export const COLORS = {
  // Fundo oficial (briefing)
  creme: '#f7f4ed',

  // Degradê Roxo
  roxoPrimario: '#8b16c7',         // (mantido - icon)
  roxoEscuro: '#3c026d',           // (mantido - icon)
  roxoClaro: '#3e036f',            // TL Pergunta (oficial)
  roxoMedio: '#5c0d8d',            // TL Pergunta degradê meio
  roxoCard: '#4d0a7d',             // T2 botões
  roxoCardEscuro: '#4d0978',       // TL1 card

  // Degradê Laranja
  laranjaClaro: '#fded48',
  laranjaEscuro: '#fd8414',
  laranjaBorda: '#f9ea59',         // T2 borda botões
  laranjaForte: '#fe8917',         // Feedback/Placar fundo
  laranjaMedio: '#fea726',         // Feedback degradê meio
  laranjaBordaCard: '#fdc937',     // Feedback borda
  laranjaInput: '#f88800',         // TL input borda
  laranjaTrofeuTop: '#fca605',     // Troféu gradiente
  laranjaTrofeuBottom: '#ffc027',  // Troféu gradiente

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