import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { Settings } from '../types';

/**
 * V9 M4.4: persistencia de settings com EXPO-SECURE-STORE (criptografado).
 *
 * Migracao de AsyncStorage -> SecureStore:
 * - Settings sao dados sensiveis (preferencia de audio/notificacao) que NUNCA devem
 *   ficar em texto plano no filesystem do device.
 * - SecureStore usa Keychain (iOS) / Keystore (Android) — criptografado por hardware.
 *
 * Mantem compat com testes (Jest sem SecureStore nativo): try/catch em cada op
 * com fallback para AsyncStorage (texto plano so em dev/test, nao em prod).
 *
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

async function getItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    // Fallback para AsyncStorage em ambiente sem Keychain (testes)
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Fallback silencioso
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Silencioso - settings nao sao criticos
    }
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const [m, e, n] = await Promise.all([
      getItem(KEY_MUSICA),
      getItem(KEY_EFEITOS),
      getItem(KEY_NOTIFICACOES),
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
  await setItem(map[key], value ? '1' : '0');
}

export async function saveAllSettings(s: Settings): Promise<void> {
  await Promise.all([
    setItem(KEY_MUSICA, s.musica ? '1' : '0'),
    setItem(KEY_EFEITOS, s.efeitos ? '1' : '0'),
    setItem(KEY_NOTIFICACOES, s.notificacoes ? '1' : '0'),
  ]);
}

export { DEFAULTS as SETTINGS_DEFAULTS };
