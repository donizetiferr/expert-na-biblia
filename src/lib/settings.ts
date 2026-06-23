import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings } from '../types';

/**
 * Helper de settings com AsyncStorage.
 * Toggles: musica (default true), efeitos (default true), notificacoes (default false).
 */

const KEY_MUSICA = '@settings:musica';
const KEY_EFEITOS = '@settings:efeitos';
const KEY_NOTIFICACOES = '@settings:notificacoes';

const DEFAULTS: Settings = {
  musica: true,
  efeitos: true,
  notificacoes: false,
};

export async function loadSettings(): Promise<Settings> {
  try {
    const [m, e, n] = await Promise.all([
      AsyncStorage.getItem(KEY_MUSICA),
      AsyncStorage.getItem(KEY_EFEITOS),
      AsyncStorage.getItem(KEY_NOTIFICACOES),
    ]);
    return {
      musica: m === null ? DEFAULTS.musica : m === '1',
      efeitos: e === null ? DEFAULTS.efeitos : e === '1',
      notificacoes: n === null ? DEFAULTS.notificacoes : n === '1',
    };
  } catch {
    return DEFAULTS;
  }
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  const map: Record<K, string> = {
    musica: KEY_MUSICA,
    efeitos: KEY_EFEITOS,
    notificacoes: KEY_NOTIFICACOES,
  } as Record<K, string>;
  await AsyncStorage.setItem(map[key], value ? '1' : '0');
}

export async function saveAllSettings(s: Settings): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEY_MUSICA, s.musica ? '1' : '0'),
    AsyncStorage.setItem(KEY_EFEITOS, s.efeitos ? '1' : '0'),
    AsyncStorage.setItem(KEY_NOTIFICACOES, s.notificacoes ? '1' : '0'),
  ]);
}

export { DEFAULTS as SETTINGS_DEFAULTS };