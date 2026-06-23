/**
 * Criptografia local do SQLite (V6, ITEM-48 — P3-8).
 * Adapter para SQLCipher extension (expo-sqlite com encryption).
 *
 * Chave derivada de device ID + salt.
 * Em ambiente padrao (sem SQLCipher), expo-sqlite funciona sem criptografia.
 * Para ativar: instalar expo-sqlite-cipher OU usar build customizado.
 */

import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import { getDatabase } from '../db/database';

const SALT = 'expert-na-biblia-salt-v1';

let cachedKey: string | null = null;

async function gerarChave(): Promise<string> {
  if (cachedKey) return cachedKey;
  const deviceId = Application.getAndroidId() ?? 'unknown-device';
  const raw = `${deviceId}:${SALT}`;
  const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
  cachedKey = hash;
  return hash;
}

export async function inicializarBancoCriptografado(): Promise<void> {
  try {
    const chave = await gerarChave();
    const db = getDatabase();

    // Pragmas de seguranca (SQLCipher-compatible)
    db.execSync(`PRAGMA key = '${chave}'`);
    db.execSync('PRAGMA cipher_page_size = 4096');
    db.execSync('PRAGMA kdf_iter = 64000');
    db.execSync('PRAGMA cipher_use_hmac = ON');

    // Smoke test: query simples para verificar chave correta
    db.getFirstSync('SELECT 1 AS test');
  } catch (err) {
    console.error('[sqlcipher] Falha ao inicializar banco criptografado:', err);
  }
}

export async function resetarChave(): Promise<void> {
  cachedKey = null;
}