/**
 * Helper de audio (V8-RETOMADA + double check M4.5 — 2026-06-23).
 *
 * 5 sons royalty-free (gerados via ElevenLabs) embarcados em assets/audio/:
 * - splash.mp3 (~3s, magical whoosh) — tocado na SplashScreen
 * - acerto.mp3 (~1s, success ding) — tocado quando 100% na Tela Final
 * - erro.mp3 (~1s, error buzz) — tocado quando <100% na Tela Final
 * - transicao.mp3 (~1s, pop click) — tocado entre telas (futuro: Pressable wrapper)
 * - musica_fundo.mp3 (~5s, calm ambient) — loop em background no RootLayout
 *
 * Usa expo-av Audio API (https://docs.expo.dev/versions/latest/sdk/audio/).
 *
 * Comportamento:
 * - playSplash/playAcerto/playErro/playTransicao: SFX one-shot, sobrepõem anteriores
 * - playMusicaFundo: inicia loop, só toca 1x por vez (parar antes de reiniciar)
 * - stopMusicaFundo: para loop
 * - Todos respeitam settings.musica/efeitos (lidos de settings.ts)
 * - Falha de audio é silenciosa (console.warn) — não crasha app
 */

import { Audio } from 'expo-av';
import { loadSettings } from './settings';

let musicaFundoSound: Audio.Sound | null = null;
let sfxAtual: Audio.Sound | null = null;
let initialized = false;

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

async function playOneShot(source: number): Promise<void> {
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

    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      volume: 0.7,
    });
    sfxAtual = sound;
    // Auto-cleanup após reprodução (não bloqueia)
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

export async function playMusicaFundo(): Promise<void> {
  try {
    const settings = await loadSettings();
    if (!settings.musica) return;

    await ensureAudioMode();

    // Se já está tocando, não reiniciar
    if (musicaFundoSound) {
      const status = await musicaFundoSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) return;
    }

    // Para anterior se existir
    if (musicaFundoSound) {
      try {
        await musicaFundoSound.stopAsync();
        await musicaFundoSound.unloadAsync();
      } catch {
        // ignore
      }
      musicaFundoSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/audio/musica_fundo.mp3'),
      {
        shouldPlay: true,
        isLooping: true,
        volume: 0.3,
      }
    );
    musicaFundoSound = sound;
  } catch (e) {
    console.warn('[sound] playMusicaFundo failed:', e);
  }
}

export async function stopMusicaFundo(): Promise<void> {
  if (!musicaFundoSound) return;
  try {
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