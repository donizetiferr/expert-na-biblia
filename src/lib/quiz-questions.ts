/**
 * Gerador de 4 alternativas para Quiz (1 correta + 3 distrators plausiveis).
 * Implementacao (V5, ITEM-41 sera V6).
 *
 * Estrategia V5: geracao MOCK (deterministica via hash do ID).
 * V6: chamada M3 real em scripts/ ou src/lib/m3-quiz.ts.
 */

export interface QuizAlternativas {
  pergunta_id: string;
  correta: string;
  distrator1: string;
  distrator2: string;
  distrator3: string;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function gerarAlternativas(
  perguntaId: string,
  respostaCorreta: string
): QuizAlternativas {
  const h = hashStr(perguntaId);
  const distractors = [
    `${respostaCorreta} (verso X)`,
    `${respostaCorreta} (outro contexto)`,
    `Nenhuma das anteriores`,
  ];
  // Rotaciona com base no hash
  const offset = h % 3;
  return {
    pergunta_id: perguntaId,
    correta: respostaCorreta,
    distrator1: distractors[(0 + offset) % 3]!,
    distrator2: distractors[(1 + offset) % 3]!,
    distrator3: distractors[(2 + offset) % 3]!,
  };
}

export function embaralharAlternativas(
  quiz: QuizAlternativas
): Array<{ texto: string; correta: boolean }> {
  const alternativas = [
    { texto: quiz.correta, correta: true },
    { texto: quiz.distrator1, correta: false },
    { texto: quiz.distrator2, correta: false },
    { texto: quiz.distrator3, correta: false },
  ];
  // Fisher-Yates com seed = hash do pergunta_id
  let seed = hashStr(quiz.pergunta_id);
  for (let i = alternativas.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [alternativas[i], alternativas[j]] = [alternativas[j]!, alternativas[i]!];
  }
  return alternativas;
}