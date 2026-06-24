/**
 * design-tokens.ts — V9 M4.2 (polish)
 *
 * Tokens semanticos — camada acima de valores hard-coded.
 * Telas finais (final.tsx, trofeu.tsx, feedback.tsx, splash, quiz) devem
 * preferir TEMA.* em vez de COLORS.* / ESPACAMENTOS.* / BORDAS.* diretos.
 *
 * Convenção:
 *  - Cada token SEMANTICO agrega um contexto de uso (fundo, texto, borda, gap, raio)
 *  - Cores hard-coded continuam em `constants/colors.ts` (fonte da verdade)
 *  - Espacamentos/bordas em `constants/colors.ts` tambem (mantemos co-located)
 *  - Este arquivo apenas da NOME SEMANTICO a valores ja definidos
 *
 * Beneficios do polish M4.2:
 *  - Variantes de feedback (acerto/erro/parcial) consistentes em todas as telas
 *  - Hierarquia visual uniforme: superficies primarias/secundarias/neutras
 *  - Tokens de tipografia (display, body, caption) para ajustar tamanho global
 *  - Espacamento semantico (apinhado, confortavel, arejado) alem do raw xs/sm/md
 *  - Bordas semanticas (fina/media/grossa) alem do raw largura*
 */

import { COLORS, ESPACAMENTOS, BORDAS, FONTES } from '../constants/colors';

// ─────────────────────────────────────────────────────────────────────
// Espacamento semantico (alem de ESPACAMENTOS raw)
// ─────────────────────────────────────────────────────────────────────

export const ESPACO = {
  apinhado: ESPACAMENTOS.xs,    // 4  — entre itens do mesmo grupo (icon + label)
  confortavel: ESPACAMENTOS.md, // 16 — entre grupos visuais (cards)
  arejado: ESPACAMENTOS.lg,    // 24 — entre secoes (titulo -> conteudo)
  generoso: ESPACAMENTOS.xl,   // 32 — entre blocos principais
} as const;

// ─────────────────────────────────────────────────────────────────────
// Bordas semanticas
// ─────────────────────────────────────────────────────────────────────

export const BORDA = {
  fina: BORDAS.larguraFina,       // 1 — divisores sutis
  media: BORDAS.larguraMedia,     // 2 — bordas normais
  grossa: BORDAS.larguraGrossa,   // 3 — bordas de destaque (cards de feedback)
  raio: {
    pequeno: BORDAS.raioPequeno,  // 8
    medio: BORDAS.raioMedio,      // 16
    grande: BORDAS.raioGrande,    // 24
    extra: BORDAS.raioExtra,      // 32
  },
} as const;

// ─────────────────────────────────────────────────────────────────────
// Tipografia semantica
// ─────────────────────────────────────────────────────────────────────

export const TIPOGRAFIA = {
  // Titulos (Bangers - comic book)
  display: {
    fontFamily: FONTES.display,
    hero: 56,    // titulo da tela final (VOCE PASSOU!)
    grande: 48,  // titulo da splash/modos
    medio: 32,   // subtitulo
  },
  // Corpo (Nunito)
  corpo: {
    fontFamily: FONTES.bodyRegular,
    grande: 22,  // instrucoes principais
    medio: 18,   // paragrafos
    pequeno: 14, // detalhes/caption
  },
  corpoBold: {
    fontFamily: FONTES.bodyBold,
    grande: 22,
    medio: 18,
    pequeno: 14,
  },
  extraBold: {
    fontFamily: FONTES.bodyExtraBold,
    grande: 24,
    medio: 20,
    pequeno: 16,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────
// Cores semanticas (TEMA) — preservado + enriquecido
// ─────────────────────────────────────────────────────────────────────

export const TEMA = {
  fundo: {
    principal: COLORS.roxoEscuro,    // fundo default (splash, modos, quiz)
    superficie: COLORS.roxoPrimario, // cards/botoes secundarios
    neutro: COLORS.branco,           // cards de pergunta
  },
  borda: {
    primaria: COLORS.laranjaEscuro,  // bordas de destaque
    fina: COLORS.preto,              // bordas discretas
  },
  texto: {
    primario: COLORS.branco,         // texto principal em fundos escuros
    destaque: COLORS.laranjaClaro,   // destaque sobre roxo
    secundario: COLORS.preto,        // texto sobre branco/amarelo
    discreto: COLORS.cinzaMedio,     // caption, labels secundarios
  },
  feedback: {
    acerto: {
      fundo: COLORS.acertoVerde,
      borda: COLORS.preto,
      texto: COLORS.branco,
    },
    erro: {
      fundo: COLORS.erroVermelho,
      borda: COLORS.preto,
      texto: COLORS.branco,
    },
    parcial: {
      fundo: COLORS.avisoAmarelo,
      borda: COLORS.preto,
      texto: COLORS.branco,
    },
  },
  sombra: {
    // textShadow padrao para titulos comic-book (3px offset, raio 4)
    comic: {
      textShadowColor: COLORS.preto,
      textShadowOffset: { width: 3, height: 3 },
      textShadowRadius: 4,
    },
  },
} as const;

export type Tema = typeof TEMA;
export type Espaco = typeof ESPACO;
export type Borda = typeof BORDA;
export type Tipografia = typeof TIPOGRAFIA;