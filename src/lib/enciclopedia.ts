/**
 * V23.10 (J.1 + J.3): acesso a Enciclopedia (personagens/termos/eventos) + busca contextual
 * para o "Saiba mais" do feedback.
 */

import { getDatabase } from '../db/database';

export type TipoVerbete = 'personagem' | 'termo' | 'evento';

export interface Verbete {
  id: string;
  tipo: TipoVerbete;
  nome: string;
  resumo: string;
  detalhe: string;
  referencias: string | null;
}

/** Normaliza para busca: minusculas + sem acentos. */
export function normalizar(s: string): string {
  // ̀-ͯ = marcas diacriticas combinantes (apos NFD).
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * NUCLEO PURO (J.3): true se o NOME do verbete aparece como palavra inteira no texto
 * (case/acento-insensitive). Evita falsos positivos de substring (ex.: "fe" dentro de
 * "feliz") exigindo limites de palavra.
 */
export function nomeApareceEm(texto: string, nome: string): boolean {
  const alvo = normalizar(nome).trim();
  if (alvo.length < 3) return false; // ignora nomes muito curtos (ruido)
  const hay = ` ${normalizar(texto)} `;
  return hay.includes(` ${alvo} `) || hay.includes(` ${alvo}, `) || hay.includes(` ${alvo}.`) || hay.includes(` ${alvo}?`);
}

export async function listarVerbetes(tipo?: TipoVerbete): Promise<Verbete[]> {
  try {
    const db = getDatabase();
    if (tipo) {
      return db.getAllSync<Verbete>(
        'SELECT id, tipo, nome, resumo, detalhe, referencias FROM enciclopedia WHERE tipo = ? ORDER BY nome',
        [tipo],
      );
    }
    return db.getAllSync<Verbete>(
      'SELECT id, tipo, nome, resumo, detalhe, referencias FROM enciclopedia ORDER BY nome',
    );
  } catch {
    return [];
  }
}

export async function buscarVerbetes(texto: string): Promise<Verbete[]> {
  const todos = await listarVerbetes();
  const q = normalizar(texto).trim();
  if (!q) return todos;
  return todos.filter((v) => normalizar(`${v.nome} ${v.resumo}`).includes(q));
}

export async function obterVerbete(id: string): Promise<Verbete | null> {
  try {
    const db = getDatabase();
    return (
      db.getFirstSync<Verbete>(
        'SELECT id, tipo, nome, resumo, detalhe, referencias FROM enciclopedia WHERE id = ?',
        [id],
      ) ?? null
    );
  } catch {
    return null;
  }
}

/**
 * J.3: dado um texto (pergunta/resposta), encontra o 1o verbete cujo nome aparece nele.
 * Retorna null se nenhum casar. Usado para oferecer "Saiba mais" no feedback.
 */
export async function encontrarVerbeteEm(texto: string): Promise<Verbete | null> {
  if (!texto) return null;
  const todos = await listarVerbetes();
  // Preferir nomes mais longos primeiro (mais especificos).
  const ordenados = [...todos].sort((a, b) => b.nome.length - a.nome.length);
  for (const v of ordenados) {
    if (nomeApareceEm(texto, v.nome)) return v;
  }
  return null;
}
