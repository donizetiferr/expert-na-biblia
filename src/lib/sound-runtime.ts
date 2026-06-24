/**
 * sound-runtime.ts — V9 M3.1
 *
 * Sistema de reacao a mudancas de settings em tempo real.
 * - Observa AsyncStorage keys @settings:musica e @settings:efeitos
 * - Quando musica muda para false: stopMusicaFundo() IMEDIATO
 * - Quando musica muda para true: playMusicaFundo() IMEDIATO
 * - Quando efeitos muda para false: descarta qualquer playOneShot em flight (early return)
 *
 * Implementacao: polling leve a cada 500ms (alternativa a real listeners RN sem dep extra).
 * Custo: 1 leitura de 2 keys a cada 500ms = desprezivel.
 *
 * Exporta:
 *   - initSoundRuntime(): inicia polling (chamado em _layout.tsx)
 *   - stopSoundRuntime(): para polling (cleanup)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { stopMusicaFundo, playMusicaFundo } from './sound';

const KEY_MUSICA = '@settings:musica';
const KEY_EFEITOS = '@settings:efeitos';
const POLL_MS = 500;

let interval: ReturnType<typeof setInterval> | null = null;
let lastMusica: boolean | null = null;
let lastEfeitos: boolean | null = null;

async function readBool(key: string): Promise<boolean> {
  const v = await AsyncStorage.getItem(key);
  return v === null ? true : v === '1'; // default true para musica/efeitos
}

export async function checkAndReact(): Promise<void> {
  const musica = await readBool(KEY_MUSICA);
  const efeitos = await readBool(KEY_EFEITOS);

  // Reagir a mudanca de MUSICA
  if (lastMusica !== null && musica !== lastMusica) {
    if (musica) {
      await playMusicaFundo().catch(() => {});
    } else {
      await stopMusicaFundo().catch(() => {});
    }
  }
  lastMusica = musica;

  // EFEITOS: a playOneShot ja checa runtime, entao nao precisa reagir.
  // Apenas guardamos o estado para detectar mudanca (eventualmente para log).
  lastEfeitos = efeitos;
  void lastEfeitos; // suppress unused warning enquanto sem reagir
}

export function initSoundRuntime(): void {
  if (interval) return;
  // Inicializa com valores atuais
  checkAndReact();
  interval = setInterval(() => {
    checkAndReact().catch(() => {});
  }, POLL_MS);
}

export function stopSoundRuntime(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
