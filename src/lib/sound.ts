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
        sound.unloadAsync().catch((e: unknown) =>
          console.warn('[sound] unloadAsync failed:', e),
        );
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
 * - outros/sem param -> musica_fundo_v3.mp3 (default, V14 M15.7 — sem glitch)
 *
 * V13 14.1.4: detecta erro de `isAudioPlayingAsync` e faz fallback gracioso.
 *
 * V14 M15.7:
 *   - musica_fundo_v2 -> musica_fundo_v3 (gerado via ElevenLabs SFX chunks 5s
 *     concatenados com crossfade — sem glitches)
 *   - fade in (1s) do volume 0 → settings.volumeMusica ao iniciar
 *   - fade out (0.5s) ao parar antes de stopAsync
 *   - ensureAudioMode ja idempotente (controlado por flag `initialized`)
 */
export async function playMusicaFundo(moduloId?: string): Promise<void> {
  try {
    const settings = await loadSettings();
    if (!settings.musica) return;

    await ensureAudioMode();

    // Se já está tocando, não reiniciar
    if (musicaFundoSound) {
      try {
        const status = await musicaFundoSound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) return;
      } catch (e) {
        console.warn('[sound] getStatusAsync falhou:', e);
        musicaFundoSound = null;
      }
    }

    // V10 M6.4: seleciona variante por area (fallback musica_fundo_v3)
    let source: number;
    if (moduloId?.startsWith('FB')) {
      try { source = require('../../assets/audio/musica_fundo_fb.mp3'); }
      catch { source = require('../../assets/audio/musica_fundo_v3.mp3'); }
    } else if (moduloId?.startsWith('AT')) {
      try { source = require('../../assets/audio/musica_fundo_at.mp3'); }
      catch { source = require('../../assets/audio/musica_fundo_v3.mp3'); }
    } else if (moduloId?.startsWith('NT')) {
      try { source = require('../../assets/audio/musica_fundo_nt.mp3'); }
      catch { source = require('../../assets/audio/musica_fundo_v3.mp3'); }
    } else {
      // V14 M15.7: default agora eh v3 (sem glitch)
      source = require('../../assets/audio/musica_fundo_v3.mp3');
    }

    // Para anterior se existir (e salva posição para resume)
    if (musicaFundoSound) {
      try {
        const s = await musicaFundoSound.getStatusAsync();
        if (s.isLoaded) savedPositionMillis = s.positionMillis ?? 0;
        await musicaFundoSound.stopAsync();
        await musicaFundoSound.unloadAsync();
      } catch (e) {
        console.warn('[sound] stop anterior falhou:', e);
      }
      musicaFundoSound = null;
    }

    // V14 M15.7: cria com volume 0 e faz fade in de 1s ate settings.volumeMusica
    const targetVolume = settings.volumeMusica;
    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      isLooping: true,
      volume: 0,
    });
    // V10 M6.7: retoma de onde parou (se salvamos posição > 0)
    if (savedPositionMillis > 0) {
      try { await sound.setStatusAsync({ positionMillis: savedPositionMillis }); }
      catch (e) { console.warn('[sound] setStatusAsync falhou:', e); }
    }
    musicaFundoSound = sound;

    // V14 M15.7: fade in 1s (volume 0 -> targetVolume)
    const fadeSteps = 20;
    const fadeIntervalMs = 50;
    for (let i = 1; i <= fadeSteps; i++) {
      const v = (targetVolume * i) / fadeSteps;
      setTimeout(async () => {
        try {
          if (musicaFundoSound === sound) {
            await sound.setStatusAsync({ volume: v });
          }
        } catch {
          // ignore — track pode ter sido parado
        }
      }, i * fadeIntervalMs);
    }
  } catch (e) {
    console.warn('[sound] playMusicaFundo failed:', e);
  }
}

export async function stopMusicaFundo(): Promise<void> {
  if (!musicaFundoSound) return;
  const sound = musicaFundoSound;
  try {
    const s = await sound.getStatusAsync();
    if (!s.isLoaded) {
      musicaFundoSound = null;
      return;
    }
    savedPositionMillis = s.positionMillis ?? 0;
    // V14 M15.7: fade out 0.5s antes de stop
    const fadeSteps = 10;
    const fadeIntervalMs = 50;
    const startVolume = s.volume ?? 1;
    for (let i = 1; i <= fadeSteps; i++) {
      const v = (startVolume * (fadeSteps - i)) / fadeSteps;
      try { await sound.setStatusAsync({ volume: v }); }
      catch { /* ignore */ }
      await new Promise<void>((r) => setTimeout(r, fadeIntervalMs));
    }
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch (e) {
    console.warn('[sound] stopMusicaFundo falhou:', e);
  }
  musicaFundoSound = null;
}

export async function cleanupAllAudio(): Promise<void> {
  await stopMusicaFundo();
  if (sfxAtual) {
    try {
      await sfxAtual.stopAsync();
      await sfxAtual.unloadAsync();
    } catch (e) {
      console.warn('[sound] cleanupAllAudio falhou:', e);
    }
    sfxAtual = null;
  }
}
