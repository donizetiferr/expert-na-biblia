/**
 * Regressao V21 (I1): timeout do M2.7/OpenAI deve ser classificado como erro de
 * CONEXAO (caminho gracioso com match local), NAO como "Avaliacao automatica
 * indisponivel" (mensagem dura).
 *
 * Antes do fix, M3/OpenAI lancavam 'M3_TIMEOUT'/'OPENAI_TIMEOUT' no AbortError, mas
 * o regex de classificacao em avaliador.ts era /network|fetch|abort/i — "TIMEOUT"
 * NAO casava, entao um timeout (latencia alta do modelo de raciocinio) caia na
 * mensagem dura. O fix incluiu 'timeout' no regex.
 */

import type { Pergunta } from '../../types';

// Factories explicitas: evitam carregar os modulos reais (m3/openai importam
// expo-secure-store, que nao resolve no ambiente Node do Jest).
jest.mock('../m3', () => ({ avaliarResposta: jest.fn() }));
jest.mock('../openai', () => ({ avaliarResposta: jest.fn() }));
jest.mock('../matching', () => ({ matchCanonico: jest.fn() }));
jest.mock('../../db/database', () => ({
  getDatabase: () => ({
    getFirstSync: () => null,
    runSync: () => ({ changes: 0 }),
  }),
}));

import * as M3 from '../m3';
import * as OpenAI from '../openai';
import { matchCanonico } from '../matching';
import { avaliarResposta } from '../avaliador';

const perguntaFake: Pergunta = {
  id: 'FB01-L01-Q07',
  licao_id: 'FB01-L01',
  ordem: 7,
  texto: 'A Biblia foi escrita por uma unica pessoa?',
  resposta_canonica: 'Nao, por cerca de 40 autores ao longo de 1500 anos.',
  tipo: 'ABERTA',
  dificuldade: 'MEDIO',
};

beforeEach(() => {
  jest.clearAllMocks();
  // match local parcial (>=0.5 e <0.85): nao resolve local, vai para a IA,
  // e em falha de conexao deve ser considerado "provavelmente correto".
  (matchCanonico as jest.Mock).mockReturnValue({ correto: false, score: 0.6 });
});

describe('avaliador V21 I1 — classificacao de timeout', () => {
  it('M3_TIMEOUT + OPENAI_TIMEOUT => caminho gracioso (sem conexao), correto pelo match local', async () => {
    (M3.avaliarResposta as jest.Mock).mockRejectedValue(new Error('M3_TIMEOUT'));
    (OpenAI.avaliarResposta as jest.Mock).mockRejectedValue(new Error('OPENAI_TIMEOUT'));

    const r = await avaliarResposta(perguntaFake, 'resposta do usuario');

    expect(r.origem).toBe('FALHOU');
    expect(r.correto).toBe(true); // local.score 0.6 >= 0.5 => provavel
    expect(r.feedback).toMatch(/sem conex[aã]o/i);
    expect(r.feedback).not.toMatch(/indispon[ií]vel/i);
  });

  it('erro NAO-conexao (HTTP 500) => mensagem dura "indisponivel"', async () => {
    (M3.avaliarResposta as jest.Mock).mockRejectedValue(new Error('M3_HTTP_500'));
    (OpenAI.avaliarResposta as jest.Mock).mockRejectedValue(new Error('OPENAI_HTTP_500'));

    const r = await avaliarResposta(perguntaFake, 'resposta do usuario');

    expect(r.origem).toBe('FALHOU');
    expect(r.feedback).toMatch(/indispon[ií]vel/i);
    expect(r.feedback).not.toMatch(/sem conex[aã]o/i);
  });

  it('abort/network classico continua casando (nao regrediu)', async () => {
    (M3.avaliarResposta as jest.Mock).mockRejectedValue(new Error('network request failed'));
    (OpenAI.avaliarResposta as jest.Mock).mockRejectedValue(new Error('AbortError: aborted'));

    const r = await avaliarResposta(perguntaFake, 'resposta do usuario');

    expect(r.feedback).toMatch(/sem conex[aã]o/i);
  });
});
