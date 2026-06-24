/**
 * design-tokens.ts — V9 M4.2
 *
 * Tokens semanticos (camada acima de cores hard-coded).
 * Telas finais (final.tsx, trofeu.tsx, feedback.tsx) devem usar estes
 * em vez de COLORS.* diretamente — facilita ajustar feedback de variante
 * sem mexer no resto do design system.
 *
 * Convenção:
 *  - `tema` agrupa tokens por contexto de uso (fundo, texto, borda)
 *  - Cores hard-coded continuam em `constants/colors.ts` (fonte da verdade)
 *  - Este arquivo apenas dá NOME SEMANTICO para uma cor
 */

import { COLORS } from '../constants/colors';

export const TEMA = {
  fundo: {
    principal: COLORS.roxoEscuro,
    superficie: COLORS.roxoPrimario,
    neutro: COLORS.branco,
  },
  borda: {
    primaria: COLORS.laranjaEscuro,
    fina: COLORS.preto,
  },
  texto: {
    primario: COLORS.branco,
    destaque: COLORS.laranjaClaro,
    secundario: COLORS.preto,
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
} as const;

export type Tema = typeof TEMA;
