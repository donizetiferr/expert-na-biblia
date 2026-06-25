/**
 * network.ts — V9 M4.7 (polish)
 *
 * Monitor de conectividade SEM dep extra (sem @react-native-community/netinfo).
 * Estrategia: poll leve a cada 5s. Se fetch('https://www.google.com/generate_204')
 * falhar OU demorar > 3s, marca offline.
 *
 * Por que nao NetInfo: instalar dep extra apenas para um banner eh caro em bundle
 * size (NetInfo = ~50KB gzip). O poll a 5s eh imperceptivel e cobre 95% dos casos.
 *
 * M4.7 polish:
 *  - Probe com retry 1x antes de marcar offline (evita flicker em rede instavel)
 *  - Metricas: latencia media das ultimas 5 probes, ultima falha timestamp
 *  - Snapshot diagnostics para debugging (getNetworkStats)
 *  - isOnline() agora retorna cache imediato (sincrono) — antes podia estar stale
 *
 * Exporta:
 *   - isOnline(): checagem pontual (sincrono, O(1))
 *   - subscribe(listener): recebe callback sempre que o status muda
 *   - startMonitoring(): inicia o polling
 *   - stopMonitoring(): para o polling
 *   - getNetworkStats(): snapshot de metricas (debug)
 */

const POLL_MS = 5000;
const TIMEOUT_MS = 3000;
const PROBE_URL = 'https://www.google.com/generate_204';
const LATENCY_WINDOW = 5; // tamanho da janela de latencia media
const RETRY_BEFORE_OFFLINE = 1; // tentativas extras antes de confirmar offline

interface NetworkStats {
  online: boolean;
  lastCheck: number;
  lastChange: number;
  latencyMsAvg: number | null;
  consecutiveFailures: number;
  totalProbes: number;
}

let isOnlineCache = true;
let lastCheck = 0;
let lastChange = Date.now();
let interval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<(online: boolean) => void>();

// Metricas
const latencyWindow: number[] = [];
let consecutiveFailures = 0;
let totalProbes = 0;

async function probe(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(PROBE_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - start;
    const ok = res.ok || (res.status >= 200 && res.status < 400);
    return { ok, latencyMs };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
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

function updateLatency(latencyMs: number, ok: boolean): void {
  if (ok) {
    latencyWindow.push(latencyMs);
    if (latencyWindow.length > LATENCY_WINDOW) {
      latencyWindow.shift();
    }
  }
}

function getAvgLatency(): number | null {
  if (latencyWindow.length === 0) return null;
  const sum = latencyWindow.reduce((a, b) => a + b, 0);
  return Math.round(sum / latencyWindow.length);
}

export function isOnline(): boolean {
  // Sincrono, O(1). Cache eh atualizado pelo polling a cada POLL_MS.
  return isOnlineCache;
}

export function subscribe(listener: (online: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function tick(): Promise<void> {
  totalProbes++;
  let { ok, latencyMs } = await probe();
  // Retry se primeira tentativa falhou (evita flicker em rede instavel)
  if (!ok && RETRY_BEFORE_OFFLINE > 0) {
    for (let i = 0; i < RETRY_BEFORE_OFFLINE; i++) {
      await new Promise((r) => setTimeout(r, 250));
      const retry = await probe();
      if (retry.ok) {
        ok = true;
        latencyMs = retry.latencyMs;
        break;
      }
    }
  }
  updateLatency(latencyMs, ok);
  lastCheck = Date.now();

  if (ok) {
    consecutiveFailures = 0;
    if (!isOnlineCache) {
      isOnlineCache = true;
      lastChange = Date.now();
      notify(true);
    }
  } else {
    consecutiveFailures++;
    if (isOnlineCache) {
      isOnlineCache = false;
      lastChange = Date.now();
      notify(false);
    }
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

/**
 * Snapshot de metricas para debug/telemetria. NAO usar em hot paths.
 */
export function getNetworkStats(): NetworkStats {
  return {
    online: isOnlineCache,
    lastCheck,
    lastChange,
    latencyMsAvg: getAvgLatency(),
    consecutiveFailures,
    totalProbes,
  };
}