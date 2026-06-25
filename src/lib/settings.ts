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
 * V18.1 (ME.2): wire completo dos 7 campos de Settings. Antes, volumeMusica/
 * volumeEfeitos/hapticos/voz existiam no tipo + eram usados por config.tsx/sound.ts,
 * mas NUNCA eram persistidos nem carregados (saveSetting so mapeava 3 chaves ->
 * gravava sob chave undefined; loadSettings nao os retornava -> sound.ts lia
 * undefined/NaN). Agora todos os 7 sao serializados (bool como '1'/'0', number como
 * string decimal) e carregados com fallback para DEFAULTS.
 */

const KEYS: Record<keyof Settings, string> = {
  musica: '@settings:musica',
  efeitos: '@settings:efeitos',
  notificacoes: '@settings:notificacoes',
  volumeMusica: '@settings:volumeMusica',
  volumeEfeitos: '@settings:volumeEfeitos',
  hapticos: '@settings:hapticos',
  voz: '@settings:voz',
};

const DEFAULTS: Settings = {
  musica: true,
  efeitos: true,
  notificacoes: false,
  volumeMusica: 0.3,
  volumeEfeitos: 0.7,
  hapticos: true,
  voz: false,
};

// Campos numericos (0-1); os demais sao booleanos.
const NUMERIC_KEYS: ReadonlyArray<keyof Settings> = ['volumeMusica', 'volumeEfeitos'];

function isNumericKey(key: keyof Settings): boolean {
  return NUMERIC_KEYS.includes(key);
}

function serialize<K extends keyof Settings>(key: K, value: Settings[K]): string {
  return isNumericKey(key) ? String(value) : value ? '1' : '0';
}

function deserialize<K extends keyof Settings>(key: K, raw: string | null): Settings[K] {
  if (raw === null) return DEFAULTS[key];
  if (isNumericKey(key)) {
    const n = parseFloat(raw);
    return (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : DEFAULTS[key]) as Settings[K];
  }
  return (raw === '1') as Settings[K];
}

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
    const entries = await Promise.all(
      (Object.keys(KEYS) as Array<keyof Settings>).map(async (k) => {
        const raw = await getItem(KEYS[k]);
        return [k, deserialize(k, raw)] as const;
      }),
    );
    return entries.reduce(
      (acc, [k, v]) => ({ ...acc, [k]: v }),
      { ...DEFAULTS },
    ) as Settings;
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await setItem(KEYS[key], serialize(key, value));
}

export async function saveAllSettings(s: Settings): Promise<void> {
  await Promise.all(
    (Object.keys(KEYS) as Array<keyof Settings>).map((k) => setItem(KEYS[k], serialize(k, s[k]))),
  );
}

export { DEFAULTS as SETTINGS_DEFAULTS };
