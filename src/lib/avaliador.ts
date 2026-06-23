/**
 * Orquestrador de avaliacao (V5, ITEM-29 + ITEM-30).
 * Estrategia: cache local → M3 → OpenAI (fallback).
 * Se M3 falhar (timeout, 429, rede), tenta OpenAI.
 * Se ambas falharem, retorna score 0 com feedback explicativo.
 *
 * CACHE: se score >= 0.85, persiste em SQLite (respostas_canonicas_cache).
 * MONITORIA: log em m3_usage (data, chamadas, tokens_estimados).
 */

import * as M3 from './m3';
import * as OpenAI from './openai';
import { matchCanonico } from './matching';
import { getDatabase } from '../db/database';
import type { RespostaAvaliacao, Pergunta } from '../types';

const CACHE_THRESHOLD = 0.85;
const CACHE_TTL_DIAS = 90;

interface CacheRow {
  texto: string;
  score: number;
  criado_em: string;
}

export async function avaliarResposta(
  pergunta: Pergunta,
  respostaUsuario: string
): Promise<RespostaAvaliacao & { origem: 'CACHE' | 'M3' | 'OPENAI' | 'FALHOU' }> {
  // Camada 1: matching local canonico
  const local = matchCanonico(respostaUsuario, pergunta.resposta_canonica);
  if (local.correto && local.score >= 0.85) {
    await cachearSeAlto(pergunta.id, respostaUsuario, local.score);
    return {
      correto: local.correto,
      resposta_esperada: pergunta.resposta_canonica,
      score: local.score,
      feedback: 'Resposta validada localmente.',
      origem: 'CACHE',
    };
  }

  // Camada 2: cache SQLite
  const cacheRow = await buscarCache(pergunta.id, respostaUsuario);
  if (cacheRow && cacheRow.score >= CACHE_THRESHOLD) {
    return {
      correto: cacheRow.score >= 0.85,
      resposta_esperada: pergunta.resposta_canonica,
      score: cacheRow.score,
      feedback: 'Resposta do cache.',
      origem: 'CACHE',
    };
  }

  // Camada 3: M3
  await registrarUso('M3');
  try {
    const resultado = await M3.avaliarResposta(pergunta.texto, respostaUsuario);
    if (resultado.score >= CACHE_THRESHOLD) {
      await cachearSeAlto(pergunta.id, respostaUsuario, resultado.score);
    }
    return { ...resultado, origem: 'M3' };
  } catch (errM3) {
    // Camada 4: OpenAI fallback
    await registrarUso('OPENAI');
    try {
      const resultado = await OpenAI.avaliarResposta(pergunta.texto, respostaUsuario);
      if (resultado.score >= CACHE_THRESHOLD) {
        await cachearSeAlto(pergunta.id, respostaUsuario, resultado.score);
      }
      return { ...resultado, origem: 'OPENAI' };
    } catch (errOpenAI) {
      return {
        correto: false,
        resposta_esperada: pergunta.resposta_canonica,
        score: local.score,
        feedback: `Avaliacao offline. M3 falhou (${errM3 instanceof Error ? errM3.message : 'unknown'}), OpenAI falhou (${errOpenAI instanceof Error ? errOpenAI.message : 'unknown'}).`,
        origem: 'FALHOU',
      };
    }
  }
}

async function buscarCache(perguntaId: string, texto: string): Promise<CacheRow | null> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<CacheRow>(
      'SELECT texto, score, criado_em FROM respostas_canonicas_cache WHERE pergunta_id = ? AND texto = ?',
      [perguntaId, texto]
    );
    if (!row) return null;
    // Verificar TTL
    const criadoEm = new Date(row.criado_em);
    const idadeDias = (Date.now() - criadoEm.getTime()) / (1000 * 60 * 60 * 24);
    if (idadeDias > CACHE_TTL_DIAS) return null;
    return row;
  } catch {
    return null;
  }
}

async function cachearSeAlto(perguntaId: string, texto: string, score: number): Promise<void> {
  if (score < CACHE_THRESHOLD) return;
  try {
    const db = getDatabase();
    db.runSync(
      'INSERT OR REPLACE INTO respostas_canonicas_cache (pergunta_id, texto, score) VALUES (?, ?, ?)',
      [perguntaId, texto, score]
    );
  } catch {
    // Mock mode
  }
}

async function registrarUso(origem: 'M3' | 'OPENAI'): Promise<void> {
  const hoje = new Date().toISOString().split('T')[0]!;
  try {
    const db = getDatabase();
    db.runSync(
      'INSERT INTO m3_usage (data, chamadas, tokens_estimados) VALUES (?, 1, 500) ON CONFLICT(data) DO UPDATE SET chamadas = chamadas + 1, tokens_estimados = tokens_estimados + 500',
      [hoje]
    );
  } catch {
    // Mock
  }
}

export async function limparCacheAntigo(): Promise<number> {
  try {
    const db = getDatabase();
    const limite = new Date(Date.now() - CACHE_TTL_DIAS * 24 * 60 * 60 * 1000).toISOString();
    const result = db.runSync('DELETE FROM respostas_canonicas_cache WHERE criado_em < ?', [limite]);
    return result.changes ?? 0;
  } catch {
    return 0;
  }
}