/**
 * sound-runtime.ts — V10 M6.3 (sem polling)
 *
 * Substitui o setInterval(checkAndReact, 500) por um sistema de eventos.
 * Como settings.ts e' async (SecureStore), nao podemos usar observer direto.
 * Solucao: callback-based com invalidacao explicita.
 *
 * Mudancas de settings: o chamador (config.tsx ou settings page) chama
 * notifySettingsChanged() apos saveSetting() — isso dispara checkAndReact()
 * IMEDIATAMENTE, sem polling.
 *
 * initSoundRuntime() ainda faz um checkAndReact() inicial para o caso do app
 * ser iniciado com settings diferentes do default.
 */

import { loadSettings } from './settings';
import { stopMusicaFundo, playMusicaFundo } from './sound';

let lastMusica: boolean | null = null;
let lastEfeitos: boolean | null = null;
let initialized = false;

export async function checkAndReact(): Promise<void> {
  const settings = await loadSettings();
  const { musica, efeitos } = settings;

  if (lastMusica !== null && musica !== lastMusica) {
    if (musica) {
      await playMusicaFundo().catch(() => {});
    } else {
      await stopMusicaFundo().catch(() => {});
    }
  }
  lastMusica = musica;
  lastEfeitos = efeitos;
}

export async function notifySettingsChanged(): Promise<void> {
  // Disparado manualmente apos saveSetting() no config.tsx.
  // Reage IMEDIATAMENTE em <100ms (vs 500ms do polling).
  await checkAndReact();
}

export function initSoundRuntime(): void {
  if (initialized) return;
  initialized = true;
  checkAndReact();
}

export function stopSoundRuntime(): void {
  initialized = false;
  lastMusica = null;
  lastEfeitos = null;
}
