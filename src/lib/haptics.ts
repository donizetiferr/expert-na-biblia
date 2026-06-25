/**
 * haptics.ts — V10 M6.5
 * Feedback de vibracao para interacoes chave (acerto/erro/notificacao).
 * Respeita settings.hapticos.
 */
import * as Haptics from 'expo-haptics';
import { loadSettings } from './settings';

let cache: { hapticos: boolean } | null = null;

async function shouldVibrate(): Promise<boolean> {
  if (cache) return cache.hapticos;
  const s = await loadSettings();
  cache = { hapticos: s.hapticos };
  return s.hapticos;
}

export async function lightTap(): Promise<void> {
  if (!(await shouldVibrate())) return;
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

export async function successBuzz(): Promise<void> {
  if (!(await shouldVibrate())) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}

export async function errorBuzz(): Promise<void> {
  if (!(await shouldVibrate())) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
}

export async function notificationBuzz(): Promise<void> {
  if (!(await shouldVibrate())) return;
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
}

// Invalidar cache quando settings mudam
export function invalidateHapticsCache(): void {
  cache = null;
}
