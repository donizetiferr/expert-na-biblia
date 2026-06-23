/**
 * Telemetria de crashes (V6, ITEM-48 — P3-9).
 * Wrapper Sentry: stack traces SEM dados do usuario (LGPD).
 *
 * Em producao: configurar SENTRY_DSN via env var.
 * Em dev: log local apenas.
 */

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const ENABLED = !!SENTRY_DSN;

interface CrashReport {
  error: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

let reports: CrashReport[] = [];

export function reportarCrash(error: Error, context?: Record<string, unknown>): void {
  const report: CrashReport = {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };
  reports.push(report);

  if (ENABLED) {
    // TODO: integracao real Sentry
    // Sentry.captureException(error, { extra: context });
    console.error('[sentry] report:', report);
  } else {
    console.warn('[sentry] Dev mode - crash reportado localmente:', report);
  }
}

export function obterReports(): CrashReport[] {
  return [...reports];
}

export function limparReports(): void {
  reports = [];
}

export function setupGlobalErrorHandler(): void {
  if (typeof ErrorUtils !== 'undefined' && ErrorUtils.setGlobalHandler) {
    const original = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      reportarCrash(error, { isFatal });
      if (original) original(error, isFatal);
    });
  }
}

export { SENTRY_DSN, ENABLED };