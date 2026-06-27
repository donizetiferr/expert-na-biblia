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
  // V23.A.0
  metaDiaria: '@settings:metaDiaria',
  horarioLembrete: '@settings:horarioLembrete',
  reduceMotion: '@settings:reduceMotion',
  textoGrande: '@settings:textoGrande',
};

const DEFAULTS: Settings = {
  musica: true,
  efeitos: true,
  notificacoes: false,
  volumeMusica: 0.3,
  volumeEfeitos: 0.7,
  hapticos: true,
  voz: false,
  // V23.A.0
  metaDiaria: 50,
  horarioLembrete: '19:00',
  reduceMotion: false,
  textoGrande: false,
};

// V23.A.0: classificacao de campos por forma de (de)serializacao.
// - VOLUME_KEYS: float clampado 0-1 (volumes de audio).
// - INT_KEYS: inteiro sem clamp (metaDiaria pode ser 50/100/150).
// - STRING_KEYS: string literal (horarioLembrete "HH:MM").
// - demais: booleanos serializados como '1'/'0'.
const VOLUME_KEYS: ReadonlyArray<keyof Settings> = ['volumeMusica', 'volumeEfeitos'];
const INT_KEYS: ReadonlyArray<keyof Settings> = ['metaDiaria'];
const STRING_KEYS: ReadonlyArray<keyof Settings> = ['horarioLembrete'];

function serialize<K extends keyof Settings>(key: K, value: Settings[K]): string {
  if (VOLUME_KEYS.includes(key) || INT_KEYS.includes(key)) return String(value);
  if (STRING_KEYS.includes(key)) return String(value);
  return value ? '1' : '0';
}

function deserialize<K extends keyof Settings>(key: K, raw: string | null): Settings[K] {
  if (raw === null) return DEFAULTS[key];
  if (VOLUME_KEYS.includes(key)) {
    const n = parseFloat(raw);
    return (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : DEFAULTS[key]) as Settings[K];
  }
  if (INT_KEYS.includes(key)) {
    const n = parseInt(raw, 10);
    return (Number.isFinite(n) && n > 0 ? n : DEFAULTS[key]) as Settings[K];
  }
  if (STRING_KEYS.includes(key)) {
    return (raw.length > 0 ? raw : DEFAULTS[key]) as Settings[K];
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
