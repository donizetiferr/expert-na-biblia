/**
 * V18.1 (MA.1 + MA.2) — regressao do "spinner eterno" do Quiz.
 *
 * Causa-raiz: a tela quiz/jogar.tsx montava IDs hardcoded M001..M004 (inexistentes
 * no DB real FB##/AT##/NT##); a query voltava [] sem lancar -> ActivityIndicator
 * infinito. A logica foi extraida para lib/quiz-loader e agora:
 *  - aleatorio usa amostra GLOBAL (mockListarPerguntasAleatorias) — sem nenhum ID fixo;
 *  - custom usa APENAS os modulos escolhidos.
 *
 * Estes testes travam contra a volta do bug.
 */

const mockListarLicoes = jest.fn();
const mockListarPerguntas = jest.fn();
const mockListarPerguntasAleatorias = jest.fn();

jest.mock('../src/lib/db-queries', () => ({
  __esModule: true,
  listarLicoes: (...a: unknown[]) => mockListarLicoes(...a),
  listarPerguntas: (...a: unknown[]) => mockListarPerguntas(...a),
  listarPerguntasAleatorias: (...a: unknown[]) => mockListarPerguntasAleatorias(...a),
}));

import {
  carregarPerguntasQuiz,
  parseModulosCsv,
} from '../src/lib/quiz-loader';

function fakePergunta(id: string, licaoId: string) {
  return {
    id,
    licao_id: licaoId,
    ordem: 1,
    texto: '?',
    resposta_canonica: 'r',
    tipo: 'ABERTA' as const,
    dificuldade: 'MEDIO' as const,
  };
}

beforeEach(() => {
  mockListarLicoes.mockReset();
  mockListarPerguntas.mockReset();
  mockListarPerguntasAleatorias.mockReset();
  // aleatorio: devolve N perguntas globais
  mockListarPerguntasAleatorias.mockImplementation(async (n: number) =>
    Array.from({ length: n }, (_, i) => fakePergunta(`RAND-Q${i}`, 'GLOBAL')),
  );
  // custom: 2 licoes por modulo, 2 perguntas por licao
  mockListarLicoes.mockImplementation(async (moduloId: string) => [
    { id: `${moduloId}-L01`, modulo_id: moduloId, ordem: 1, nome: 'L1', total_perguntas: 2, concluida: false, score_max: 0 },
    { id: `${moduloId}-L02`, modulo_id: moduloId, ordem: 2, nome: 'L2', total_perguntas: 2, concluida: false, score_max: 0 },
  ]);
  mockListarPerguntas.mockImplementation(async (licaoId: string) => [
    fakePergunta(`${licaoId}-Q01`, licaoId),
    fakePergunta(`${licaoId}-Q02`, licaoId),
  ]);
});

describe('parseModulosCsv', () => {
  it('parseia CSV, faz trim e descarta vazios', () => {
    expect(parseModulosCsv('FB01, FB02 ,, FB03')).toEqual(['FB01', 'FB02', 'FB03']);
  });
  it('aceita array (expo-router pode entregar string[])', () => {
    expect(parseModulosCsv(['FB01', 'FB02'])).toEqual(['FB01', 'FB02']);
  });
  it('vazio/undefined -> []', () => {
    expect(parseModulosCsv(undefined)).toEqual([]);
    expect(parseModulosCsv('')).toEqual([]);
  });
});

describe('carregarPerguntasQuiz - aleatorio (REGRESSAO do spinner eterno)', () => {
  it('usa amostra global e NAO depende de IDs de modulo hardcoded', async () => {
    const out = await carregarPerguntasQuiz(20, 'aleatorio');
    expect(out).toHaveLength(20);
    // a prova anti-regressao: o caminho aleatorio NAO varre modulos/licoes fixos
    expect(mockListarPerguntasAleatorias).toHaveBeenCalledWith(20);
    expect(mockListarLicoes).not.toHaveBeenCalled();
    expect(mockListarPerguntas).not.toHaveBeenCalled();
  });
  it('modo undefined cai em aleatorio (default seguro)', async () => {
    const out = await carregarPerguntasQuiz(5);
    expect(out).toHaveLength(5);
    expect(mockListarPerguntasAleatorias).toHaveBeenCalledWith(5);
  });
});

describe('carregarPerguntasQuiz - custom (MA.2)', () => {
  it('retorna perguntas APENAS dos modulos escolhidos', async () => {
    const out = await carregarPerguntasQuiz(50, 'custom', 'FB01,FB02');
    expect(out.length).toBeGreaterThan(0);
    // toda pergunta pertence a uma licao de FB01 ou FB02
    for (const p of out) {
      expect(p.licao_id.startsWith('FB01-') || p.licao_id.startsWith('FB02-')).toBe(true);
    }
    expect(mockListarLicoes).toHaveBeenCalledWith('FB01');
    expect(mockListarLicoes).toHaveBeenCalledWith('FB02');
    expect(mockListarPerguntasAleatorias).not.toHaveBeenCalled();
  });
  it('respeita o limite total', async () => {
    const out = await carregarPerguntasQuiz(3, 'custom', 'FB01,FB02');
    expect(out).toHaveLength(3);
  });
  it('custom sem modulos degrada para aleatorio (nunca trava)', async () => {
    const out = await carregarPerguntasQuiz(7, 'custom', '');
    expect(out).toHaveLength(7);
    expect(mockListarPerguntasAleatorias).toHaveBeenCalledWith(7);
  });
});
