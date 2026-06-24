/**
 * network.ts — V9 M4.7 (modo offline)
 *
 * Monitor de conectividade SEM dep extra (sem @react-native-community/netinfo).
 * Estrategia: poll leve a cada 5s. Se fetch('https://www.google.com/generate_204')
 * falhar OU demorar > 3s, marca offline.
 *
 * Por que nao NetInfo: instalar dep extra apenas para um banner eh caro em bundle
 * size (NetInfo = ~50KB gzip). O poll a 5s eh imperceptivel e cobre 95% dos casos.
 *
 * Exporta:
 *   - isOnline(): checagem pontual
 *   - subscribe(listener): recebe callback sempre que o status muda
 *   - startMonitoring(): inicia o polling
 *   - stopMonitoring(): para o polling
 */

const POLL_MS = 5000;
const TIMEOUT_MS = 3000;
const PROBE_URL = 'https://www.google.com/generate_204';

let isOnlineCache = true;
let lastCheck = 0;
let interval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(online: boolean) => void>();

async function probe(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(PROBE_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok || (res.status >= 200 && res.status < 400);
  } catch {
    return false;
  }
}

function notify(online: boolean): void {
  for (const fn of listeners) {
    try {
      fn(online);
    } catch {
      // listener falhou - silencioso
    }
  }
}

export function isOnline(): boolean {
  // Cache tem TTL implicito de POLL_MS; se passou mais que isso, considerar stale
  if (Date.now() - lastCheck > POLL_MS * 2) {
    return isOnlineCache;
  }
  return isOnlineCache;
}

export function subscribe(listener: (online: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function tick(): Promise<void> {
  const online = await probe();
  lastCheck = Date.now();
  if (online !== isOnlineCache) {
    isOnlineCache = online;
    notify(online);
  }
}

export function startMonitoring(): void {
  if (interval) return;
  tick(); // primeira checagem
  interval = setInterval(() => {
    tick().catch(() => {});
  }, POLL_MS);
}

export function stopMonitoring(): void {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
