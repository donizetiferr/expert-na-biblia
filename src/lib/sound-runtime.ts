/**
 * sound-runtime.ts — V9 M3.1 + M4.4 (polish)
 *
 * Sistema de reacao a mudancas de settings em tempo real.
 * - Observa settings.musica e settings.efeitos via settings.ts (SecureStore-backed)
 * - Quando musica muda para false: stopMusicaFundo() IMEDIATO
 * - Quando musica muda para true: playMusicaFundo() IMEDIATO
 * - Quando efeitos muda para false: descarta qualquer playOneShot em flight (early return)
 *
 * Implementacao: polling leve a cada 500ms (alternativa a real listeners RN sem dep extra).
 * Custo: 1 leitura de 1 objeto settings a cada 500ms = desprezivel.
 *
 * M4.4 polish: usa settings.ts como single source of truth (SecureStore) em vez
 * de ler AsyncStorage diretamente. Garante que se o backend de persistencia
 * mudar (migracao para MMKV, SQLite proprio, etc), o runtime continua funcionando
 * sem alterar este arquivo.
 *
 * Exporta:
 *   - initSoundRuntime(): inicia polling (chamado em _layout.tsx)
 *   - stopSoundRuntime(): para polling (cleanup)
 *   - checkAndReact(): tick manual (util para testes)
 */

import { loadSettings } from './settings';
import { stopMusicaFundo, playMusicaFundo } from './sound';

const POLL_MS = 500;

let interval: ReturnType<typeof setInterval> | null = null;
let lastMusica: boolean | null = null;
let lastEfeitos: boolean | null = null;

export async function checkAndReact(): Promise<void> {
  const settings = await loadSettings();
  const { musica, efeitos } = settings;

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
