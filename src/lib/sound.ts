/**
 * Helper de audio (V8-RETOMADA + double check M4.5 + V10 M6).
 *
 * V10 M6.1: sons novos (combo, tick, vitoria, cadeira_desbloqueia, shake)
 * V10 M6.2: volumes independentes (settings.volumeMusica, settings.volumeEfeitos)
 * V10 M6.4: playMusicaFundo(moduloId?) seleciona variante por area
 * V10 M6.7: resume da música (track positionMillis)
 *
 * Usa expo-av Audio API (https://docs.expo.dev/versions/latest/sdk/audio/).
 */

import { Audio } from 'expo-av';
import { loadSettings } from './settings';

let musicaFundoSound: Audio.Sound | null = null;
let sfxAtual: Audio.Sound | null = null;
let initialized = false;
// V10 M6.7: track posição para resume
let savedPositionMillis: number = 0;

async function ensureAudioMode(): Promise<void> {
  if (initialized) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    initialized = true;
  } catch (e) {
    console.warn('[sound] setAudioMode failed:', e);
  }
}

async function playOneShot(source: number, overrideVolume?: number): Promise<void> {
  try {
    const settings = await loadSettings();
    if (!settings.efeitos) return;

    await ensureAudioMode();

    // Limpa SFX anterior
    if (sfxAtual) {
      try {
        await sfxAtual.stopAsync();
        await sfxAtual.unloadAsync();
      } catch {
        // ignore
      }
      sfxAtual = null;
    }

    const volume = overrideVolume ?? settings.volumeEfeitos;
    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      volume,
    });
    sfxAtual = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (sfxAtual === sound) sfxAtual = null;
      }
    });
  } catch (e) {
    console.warn('[sound] playOneShot failed:', source, e);
  }
}

export async function playSplash(): Promise<void> {
  return playOneShot(require('../../assets/audio/splash.mp3'));
}

export async function playAcerto(): Promise<void> {
  return playOneShot(require('../../assets/audio/acerto.mp3'));
}

export async function playErro(): Promise<void> {
  return playOneShot(require('../../assets/audio/erro.mp3'));
}

export async function playTransicao(): Promise<void> {
  return playOneShot(require('../../assets/audio/transicao.mp3'));
}

// V10 M6.1: SFX novos
export async function playCombo(): Promise<void> {
  return playOneShot(require('../../assets/audio/combo.mp3'));
}
export async function playTick(): Promise<void> {
  return playOneShot(require('../../assets/audio/tick.mp3'), 0.4);
}
export async function playVitoria(): Promise<void> {
  return playOneShot(require('../../assets/audio/vitoria.mp3'));
}
export async function playCadeiraDesbloqueia(): Promise<void> {
  return playOneShot(require('../../assets/audio/cadeira_desbloqueia.mp3'));
}
export async function playShake(): Promise<void> {
  return playOneShot(require('../../assets/audio/shake.mp3'));
}

/**
 * V10 M6.4: playMusicaFundo com variante por area
 * - moduloId 'FB*' -> musica_fundo_fb.mp3 (místico)
 * - moduloId 'AT*' -> musica_fundo_at.mp3 (épico)
 * - moduloId 'NT*' -> musica_fundo_nt.mp3 (luminoso)
 * - outros/sem param -> musica_fundo.mp3 (default)
 */
export async function playMusicaFundo(moduloId?: string): Promise<void> {
  try {
    const settings = await loadSettings();
    if (!settings.musica) return;

    await ensureAudioMode();

    // Se já está tocando, não reiniciar
    if (musicaFundoSound) {
      const status = await musicaFundoSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) return;
    }

    // V10 M6.4: seleciona variante por area
    let source: number;
    if (moduloId?.startsWith('FB')) {
      try { source = require('../../assets/audio/musica_fundo_fb.mp3'); }
      catch { source = require('../../assets/audio/musica_fundo_v2.mp3'); }
    } else if (moduloId?.startsWith('AT')) {
      try { source = require('../../assets/audio/musica_fundo_at.mp3'); }
      catch { source = require('../../assets/audio/musica_fundo_v2.mp3'); }
    } else if (moduloId?.startsWith('NT')) {
      try { source = require('../../assets/audio/musica_fundo_nt.mp3'); }
      catch { source = require('../../assets/audio/musica_fundo_v2.mp3'); }
    } else {
      try { source = require('../../assets/audio/musica_fundo_v2.mp3'); }
      catch { source = require('../../assets/audio/musica_fundo.mp3'); }
    }

    // Para anterior se existir (e salva posição para resume)
    if (musicaFundoSound) {
      try {
        const s = await musicaFundoSound.getStatusAsync();
        if (s.isLoaded) savedPositionMillis = s.positionMillis ?? 0;
        await musicaFundoSound.stopAsync();
        await musicaFundoSound.unloadAsync();
      } catch {
        // ignore
      }
      musicaFundoSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      isLooping: true,
      volume: settings.volumeMusica,
    });
    // V10 M6.7: retoma de onde parou (se salvamos posição > 0)
    if (savedPositionMillis > 0) {
      try { await sound.setStatusAsync({ positionMillis: savedPositionMillis }); } catch {}
    }
    musicaFundoSound = sound;
  } catch (e) {
    console.warn('[sound] playMusicaFundo failed:', e);
  }
}

export async function stopMusicaFundo(): Promise<void> {
  if (!musicaFundoSound) return;
  try {
    const s = await musicaFundoSound.getStatusAsync();
    if (s.isLoaded) savedPositionMillis = s.positionMillis ?? 0;
    await musicaFundoSound.stopAsync();
    await musicaFundoSound.unloadAsync();
  } catch {
    // ignore
  }
  musicaFundoSound = null;
}

export async function cleanupAllAudio(): Promise<void> {
  await stopMusicaFundo();
  if (sfxAtual) {
    try {
      await sfxAtual.stopAsync();
      await sfxAtual.unloadAsync();
    } catch {
      // ignore
    }
    sfxAtual = null;
  }
}
