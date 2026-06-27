/**
 * Tipos compartilhados do projeto Expert Na Bíblia
 */

export type Area = 'FB' | 'AT' | 'NT' | 'TE';

export interface Modulo {
  id: string;          // FB01, AT05, NT12, TE03
  ordem: number;
  area: Area;
  nome: string;
  descricao?: string;
  concluido: boolean;
}

export interface Licao {
  id: string;          // FB01-L01, FB01-L02, etc
  modulo_id: string;
  ordem: number;
  nome: string;
  total_perguntas: number;
  concluida: boolean;
  score_max: number;
}

export interface Pergunta {
  id: string;          // FB01-L01-Q01
  licao_id: string;
  ordem: number;
  texto: string;
  resposta_canonica: string;
  referencias_biblicas?: string[];
  tipo: 'ABERTA' | 'MULTIPLA_ESCOLHA';
  dificuldade: 'FACIL' | 'MEDIO' | 'DIFICIL';
}

export interface RespostaUsuario {
  pergunta_id: string;
  texto: string;
  score: number;       // 0-1
  correto: boolean;
  origem: 'LOCAL' | 'M3' | 'OPENAI';
  criado_em: string;   // ISO 8601
}

export interface UserStreak {
  dia: string;          // YYYY-MM-DD
  licoes_concluidas: number;
}

export interface Ranking {
  data: string;         // YYYY-MM-DD
  modulos: string[];
  score: number;
  tipo: 'LICOES' | 'QUIZ';
}

export interface QuizAlternativa {
  pergunta_id: string;
  correta: string;
  distrator1: string;
  distrator2: string;
  distrator3: string;
}

export interface RespostaAvaliacao {
  correto: boolean;
  resposta_esperada: string;
  score: number;       // 0-1
  feedback: string;
}

export interface Settings {
  musica: boolean;
  efeitos: boolean;
  notificacoes: boolean;
  // V10 M6.2: volumes independentes
  volumeMusica: number;   // 0-1
  volumeEfeitos: number;  // 0-1
  // V10 M6.5: haptic feedback
  hapticos: boolean;
  // V10 M6.6: TTS para perguntas
  voz: boolean;
  // V23.A.0: preferencias de engajamento/acessibilidade (estado de jogo fica no SQLite)
  metaDiaria: number;      // XP/dia alvo (ex.: 50 | 100 | 150)
  horarioLembrete: string; // "HH:MM" (lembrete diario; default "19:00")
  reduceMotion: boolean;   // reduz animacoes/celebracoes (a11y vestibular)
  textoGrande: boolean;    // aumenta o corpo de texto (idosos/baixa visao)
}

/**
 * V23.A.1: resumo do XP do usuario (total + nivel + progresso no nivel atual).
 * Curva: nivel = floor(sqrt(xp/100)) + 1 (nivel 1 = 0..99, nivel 2 = 100..399, ...).
 */
export interface XpResumo {
  total: number;
  nivel: number;
  xpNoNivel: number;     // XP acumulado dentro do nivel atual
  xpParaProximo: number; // tamanho da faixa do nivel atual (XP para subir)
  progresso: number;     // 0-1 (fracao do nivel atual ja conquistada)
}

export type OrigemXp = 'LICAO' | 'QUIZ' | 'ACERTO' | 'STREAK_BONUS' | 'META_BONUS' | 'BAU';