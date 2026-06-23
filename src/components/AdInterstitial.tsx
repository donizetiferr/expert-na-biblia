/**
 * Interstitial AdMob (V6, ITEM-46).
 * Max 1 a cada 3 conclusoes de licao/quiz.
 * NUNCA em: splash, Tela Final, Tela Feedback (regra do projeto).
 */

import { useState, useEffect } from 'react';

const FREQUENCIA_MINIMA = 3; // 1 ad a cada 3 conclusoes

let contadorConclusoes = 0;

export function registrarConclusao(): boolean {
  contadorConclusoes++;
  return contadorConclusoes % FREQUENCIA_MINIMA === 0;
}

export function resetarContador(): void {
  contadorConclusoes = 0;
}

interface Props {
  visivel: boolean;
  onFechar: () => void;
}

export function AdInterstitial({ visivel, onFechar }: Props) {
  useEffect(() => {
    if (!visivel) return;
    const timer = setTimeout(() => {
      onFechar();
    }, 5000); // Auto-fecha apos 5s (mock)
    return () => clearTimeout(timer);
  }, [visivel, onFechar]);

  if (!visivel) return null;
  // TODO: integrar com <InterstitialAd unitId="..." />
  return null;
}

export default AdInterstitial;