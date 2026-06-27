/**
 * V23.6 (E.4): leitura em voz alta (TTS) via expo-speech.
 *
 * `expo-speech` ja estava instalado e `settings.voz` existia, mas Speech.speak() nunca
 * era chamado. Aqui expomos `falar()` para os botoes "ouvir" (acao explicita do usuario
 * — acessibilidade para pre-leitores / baixa visao + modalidade de aprendizado por audio)
 * em pt-BR. Degrada graciosamente (try/catch) em ambiente sem o modulo nativo.
 */
import * as Speech from 'expo-speech';

/** Le um texto em voz alta (pt-BR). Para qualquer fala em andamento antes de comecar. */
export function falar(texto: string): void {
  const t = (texto || '').trim();
  if (!t) return;
  try {
    Speech.stop();
    Speech.speak(t, { language: 'pt-BR', rate: 0.95, pitch: 1.05 });
  } catch {
    // Sem modulo nativo (testes) — no-op.
  }
}

/** Interrompe qualquer leitura em andamento (ex.: ao sair da tela). */
export function pararFala(): void {
  try {
    Speech.stop();
  } catch {
    // no-op
  }
}
