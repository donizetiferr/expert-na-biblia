/**
 * Monitoria de quota M3 + alerta Telegram (V6, ITEM-43).
 *
 * Dashboard: % de quota Token Plan usada (estimado por dia)
 * Alertar via Telegram se >80% da quota mensal esperada.
 *
 * TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID via env vars (em Tokens API e acessos/telegram/).
 */

import { getDatabase } from '../db/database';

const QUOTA_MENSAL_ESTIMADA_TOKENS = 1_000_000; // Exemplo Token Plan

interface UsoStats {
  data: string;
  chamadas: number;
  tokens_estimados: number;
}

interface QuotaInfo {
  chamadas_mes: number;
  tokens_mes: number;
  pct_usado: number;
  alerta_ativo: boolean;
}

export async function obterQuota(): Promise<QuotaInfo> {
  try {
    const db = getDatabase();
    const rows = db.getAllSync<UsoStats>(
      "SELECT data, chamadas, tokens_estimados FROM m3_usage WHERE data >= date('now', '-30 days')"
    );
    const chamadas = rows.reduce((acc, r) => acc + r.chamadas, 0);
    const tokens = rows.reduce((acc, r) => acc + r.tokens_estimados, 0);
    const pct = tokens / QUOTA_MENSAL_ESTIMADA_TOKENS;
    return {
      chamadas_mes: chamadas,
      tokens_mes: tokens,
      pct_usado: pct,
      alerta_ativo: pct > 0.8,
    };
  } catch {
    return { chamadas_mes: 0, tokens_mes: 0, pct_usado: 0, alerta_ativo: false };
  }
}

export async function enviarAlertaTelegram(quota: QuotaInfo): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('[quota-monitor] TELEGRAM_BOT_TOKEN/CHAT_ID nao definidos. Alerta nao enviado.');
    return false;
  }

  const msg = `⚠️ Alerta de quota M3 Expert Na Bíblia\n\n` +
    `Chamadas no mes: ${quota.chamadas_mes}\n` +
    `Tokens estimados: ${quota.tokens_mes.toLocaleString('pt-BR')}\n` +
    `% da quota usada: ${(quota.pct_usado * 100).toFixed(1)}%\n` +
    `Limite: ${QUOTA_MENSAL_ESTIMADA_TOKENS.toLocaleString('pt-BR')} tokens/mes`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function checarEAlertar(): Promise<void> {
  const quota = await obterQuota();
  if (quota.alerta_ativo) {
    await enviarAlertaTelegram(quota);
  }
}