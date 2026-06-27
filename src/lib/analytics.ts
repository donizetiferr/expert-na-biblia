/**
 * V23.G.3: telemetria/analytics local (JS puro, sem dependencia nativa).
 *
 * Por que JS puro: adicionar `@sentry/react-native` (crash reporting externo) exige
 * modulo NATIVO + `expo prebuild` + DSN — incompativel com o pipeline de build atual
 * (android/ pre-gerado em C:\ENB, sem prebuild). Esta camada da a FUNDACAO para medir
 * retencao (funil de eventos) e capturar erros HOJE, sem quebrar o build; quando houver
 * conta Sentry (DSN) + prebuild, `_forward` passa a enviar para la sem mudar os call sites.
 *
 * - registrarEvento: eventos-chave do funil (licao concluida, quiz, streak, etc.).
 * - registrarErro: erros capturados (ErrorBoundary + handler global).
 * - eventosRecentes: ring buffer em memoria (debug / export futuro).
 * - instalarHandlerGlobalDeErros: captura erros JS nao tratados (ErrorUtils).
 */

export type EventoNome =
  | 'app_open'
  | 'licao_concluida'
  | 'quiz_concluido'
  | 'streak_incrementado'
  | 'revisao_concluida'
  | 'completar_concluido'
  | 'meta_batida'
  | 'badge_desbloqueado'
  | 'erro';

interface RegistroEvento {
  nome: EventoNome;
  props?: Record<string, string | number | boolean> | undefined;
  em: string; // ISO
}

const RING_MAX = 100;
const ring: RegistroEvento[] = [];

// Hook de envio para um backend externo (Sentry/analytics) quando disponivel.
// Default: no-op (apenas console). Pode ser setado em runtime sem tocar os call sites.
let _forward: ((e: RegistroEvento) => void) | null = null;

export function configurarForward(fn: ((e: RegistroEvento) => void) | null): void {
  _forward = fn;
}

function push(e: RegistroEvento): void {
  ring.push(e);
  if (ring.length > RING_MAX) ring.shift();
  try {
    _forward?.(e);
  } catch {
    // Forward nunca pode quebrar o app.
  }
}

/** Registra um evento de funil. Nao lanca; degrada para no-op em erro. */
export function registrarEvento(
  nome: EventoNome,
  props?: Record<string, string | number | boolean>,
): void {
  try {
    const e: RegistroEvento = { nome, props, em: new Date().toISOString() };
    push(e);
    // V13: console.debug nao aparece em release build — ruido zero em prod.
    console.debug(`[analytics] ${nome}`, props ? JSON.stringify(props) : '');
  } catch {
    // no-op
  }
}

/** Registra um erro capturado (ErrorBoundary / handler global). */
export function registrarErro(erro: unknown, stack?: string): void {
  try {
    const msg = erro instanceof Error ? erro.message : String(erro);
    const e: RegistroEvento = {
      nome: 'erro',
      props: { mensagem: msg.slice(0, 200), stack: (stack ?? '').slice(0, 400) },
      em: new Date().toISOString(),
    };
    push(e);
    console.error('[analytics] erro capturado:', msg);
  } catch {
    // no-op
  }
}

/** Snapshot dos eventos recentes (debug / export). */
export function eventosRecentes(): ReadonlyArray<RegistroEvento> {
  return ring.slice();
}

/**
 * Instala um handler global para erros JS nao tratados (alem do ErrorBoundary, que so
 * pega erros de render). Idempotente. Preserva o handler anterior (encadeia).
 */
let instalado = false;
export function instalarHandlerGlobalDeErros(): void {
  if (instalado) return;
  instalado = true;
  try {
    const g = globalThis as unknown as {
      ErrorUtils?: {
        getGlobalHandler?: () => ((e: unknown, fatal?: boolean) => void) | undefined;
        setGlobalHandler?: (h: (e: unknown, fatal?: boolean) => void) => void;
      };
    };
    const anterior = g.ErrorUtils?.getGlobalHandler?.();
    g.ErrorUtils?.setGlobalHandler?.((e: unknown, fatal?: boolean) => {
      registrarErro(e, fatal ? 'fatal' : 'nao-fatal');
      anterior?.(e, fatal);
    });
  } catch {
    // Sem ErrorUtils (ambiente nao-RN / testes) — no-op.
  }
}
