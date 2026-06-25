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
}