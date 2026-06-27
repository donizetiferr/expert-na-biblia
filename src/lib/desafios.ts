/**
 * V23.11 (milestone K): desafios rotativos (diario/semanal) + eventos sazonais
 * liturgicos. Cada desafio tem uma META de XP no periodo (medivel a partir de user_xp,
 * sem nova instrumentacao) e uma RECOMPENSA resgatavel 1x (desafio_progresso, por perfil).
 *
 * As funcoes de seleciona/sazonal sao PURAS (deterministicas pela data) e testaveis.
 */

import { getDatabase } from '../db/database';
import { obterXpDoDia, concederXp } from './xp';
import { semanaIso } from './streak';

export type TipoDesafio = 'diario' | 'semanal' | 'sazonal';

export interface Desafio {
  id: string; // carrega a data/semana/ano -> nunca colide entre periodos
  tipo: TipoDesafio;
  titulo: string;
  descricao: string;
  emoji: string;
  metaXp: number;
  recompensa: number;
}

function iso(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

/** Dia do ano (1-366). */
export function diaDoAno(d: Date): number {
  const inicio = Date.UTC(d.getUTCFullYear(), 0, 0);
  const atual = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((atual - inicio) / 86400000);
}

/**
 * Data da Pascoa (domingo) de um ano — algoritmo de Gauss/Computus Gregoriano anonimo.
 * Retorna { mes (1-12), dia }.
 */
export function calcularPascoa(ano: number): { mes: number; dia: number } {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31); // 3 = março, 4 = abril
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return { mes, dia };
}

function diffDias(a: Date, b: Date): number {
  const ua = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const ub = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((ua - ub) / 86400000);
}

/**
 * Evento sazonal liturgico ativo na data, ou null. Janelas: Natal (1-25 dez), Pascoa
 * (domingo de Pascoa + 6 dias), Quaresma (46 a 1 dias antes da Pascoa).
 */
export function eventoSazonal(d: Date): Desafio | null {
  const ano = d.getUTCFullYear();
  // Natal
  if (d.getUTCMonth() === 11 && d.getUTCDate() >= 1 && d.getUTCDate() <= 25) {
    return {
      id: `sazonal-natal-${ano}`,
      tipo: 'sazonal',
      titulo: 'Especial de Natal',
      descricao: 'Celebre o nascimento de Jesus estudando nesta época.',
      emoji: '🎄',
      metaXp: 100,
      recompensa: 50,
    };
  }
  // Pascoa / Quaresma (datas moveis)
  const pascoa = calcularPascoa(ano);
  const dataPascoa = new Date(Date.UTC(ano, pascoa.mes - 1, pascoa.dia));
  const dist = diffDias(d, dataPascoa); // 0 = domingo de Pascoa; negativo = antes
  if (dist >= 0 && dist <= 6) {
    return {
      id: `sazonal-pascoa-${ano}`,
      tipo: 'sazonal',
      titulo: 'Especial de Páscoa',
      descricao: 'Celebre a ressurreição de Cristo com a Palavra.',
      emoji: '✝️',
      metaXp: 100,
      recompensa: 50,
    };
  }
  if (dist >= -46 && dist <= -1) {
    return {
      id: `sazonal-quaresma-${ano}`,
      tipo: 'sazonal',
      titulo: 'Caminho da Quaresma',
      descricao: 'Um tempo de reflexão e preparação para a Páscoa.',
      emoji: '🕯️',
      metaXp: 80,
      recompensa: 40,
    };
  }
  return null;
}

const DIARIOS: Array<{ titulo: string; metaXp: number; recompensa: number }> = [
  { titulo: 'Aquecimento do dia', metaXp: 20, recompensa: 10 },
  { titulo: 'Foco total', metaXp: 30, recompensa: 15 },
  { titulo: 'Dedicação extra', metaXp: 40, recompensa: 20 },
];

const SEMANAIS: Array<{ titulo: string; metaXp: number; recompensa: number }> = [
  { titulo: 'Maratona da semana', metaXp: 150, recompensa: 40 },
  { titulo: 'Constância', metaXp: 200, recompensa: 60 },
];

/** Desafio diario (rotativo, deterministico pela data). */
export function desafioDiario(d: Date): Desafio {
  const t = DIARIOS[diaDoAno(d) % DIARIOS.length]!;
  return {
    id: `diario-${iso(d)}`,
    tipo: 'diario',
    titulo: t.titulo,
    descricao: `Ganhe ${t.metaXp} XP hoje.`,
    emoji: '⚡',
    metaXp: t.metaXp,
    recompensa: t.recompensa,
  };
}

/** Desafio semanal (rotativo, deterministico pela semana ISO). */
export function desafioSemanal(d: Date): Desafio {
  const semana = semanaIso(iso(d));
  const idx = parseInt(semana.split('-W')[1] ?? '1', 10) % SEMANAIS.length;
  const t = SEMANAIS[idx]!;
  return {
    id: `semanal-${semana}`,
    tipo: 'semanal',
    titulo: t.titulo,
    descricao: `Ganhe ${t.metaXp} XP nesta semana.`,
    emoji: '🏅',
    metaXp: t.metaXp,
    recompensa: t.recompensa,
  };
}

/** Lista os desafios ativos hoje (sazonal se houver + diario + semanal). */
export function desafiosAtivos(d: Date = new Date()): Desafio[] {
  const lista: Desafio[] = [];
  const sazonal = eventoSazonal(d);
  if (sazonal) lista.push(sazonal);
  lista.push(desafioDiario(d));
  lista.push(desafioSemanal(d));
  return lista;
}

// ---- progresso (XP no periodo) + resgate ----

/** XP ganho hoje (diario/sazonal) ou na semana (semanal), conforme o tipo. */
export async function progressoDesafio(desafio: Desafio): Promise<number> {
  try {
    if (desafio.tipo === 'semanal') {
      const db = getDatabase();
      // soma o XP dos ultimos 7 dias (aproxima a semana corrente de forma robusta).
      const hoje = new Date();
      const inicio = new Date(hoje);
      inicio.setUTCDate(inicio.getUTCDate() - 6);
      const row = db.getFirstSync<{ total: number }>(
        'SELECT COALESCE(SUM(pontos), 0) AS total FROM user_xp WHERE data >= ?',
        [iso(inicio)],
      );
      return row?.total ?? 0;
    }
    // diario/sazonal: XP de hoje
    return await obterXpDoDia();
  } catch {
    return 0;
  }
}

export async function desafioResgatado(id: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const row = db.getFirstSync<{ c: number }>('SELECT COUNT(*) AS c FROM desafio_progresso WHERE id = ?', [id]);
    return (row?.c ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Resgata a recompensa de um desafio (idempotente). So concede se ainda nao resgatado.
 * A UI so habilita o resgate quando o progresso >= meta. Retorna o XP concedido (0 se nada).
 */
export async function resgatarDesafio(desafio: Desafio): Promise<number> {
  try {
    const db = getDatabase();
    if (await desafioResgatado(desafio.id)) return 0;
    db.runSync("INSERT OR IGNORE INTO desafio_progresso (id, concluido_em) VALUES (?, datetime('now'))", [desafio.id]);
    await concederXp(desafio.recompensa, 'META_BONUS');
    return desafio.recompensa;
  } catch {
    return 0;
  }
}
