import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { carregarPerguntasQuiz } from '../../lib/quiz-loader';
import { embaralharAlternativas } from '../../lib/quiz-questions';
import { obterAlternativas } from '../../lib/quiz-alternatives-db';
import type { Pergunta } from '../../types';

const TOTAL_PERGUNTAS = 20;
const TEMPO_POR_PERGUNTA = 10; // segundos

interface PerguntaQuiz {
  pergunta: Pergunta;
  alternativas: Array<{ texto: string; correta: boolean }>;
}

/**
 * Tela Quiz: Pergunta + timer 10s + 4 respostas multiplas.
 * V14 M15.4: previne loop infinito com refs + guards:
 *   - timerRef + transitionTimeoutRef (cleanup garantido)
 *   - transicionandoRef: impede `proxima()` em re-entrada (selecionar + timer expirado ao mesmo tempo)
 *   - guard `if (transicionandoRef.current) return;` em `proxima()`
 */
export default function JogarQuiz() {
  const router = useRouter();
  // V18.1 MA.2: le modo/modulos do deep link (antes ignorados — sempre M001-M004).
  const { modo, modulos } = useLocalSearchParams<{ modo?: string; modulos?: string }>();
  const [perguntas, setPerguntas] = useState<PerguntaQuiz[]>([]);
  const [indice, setIndice] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [tempo, setTempo] = useState(TEMPO_POR_PERGUNTA);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  // V18.1 MA.3: estado de erro/vazio para nunca prender o usuario num spinner.
  const [erro, setErro] = useState(false);

  // V14 M15.4: refs para cleanup + guard contra re-entrada
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transicionandoRef = useRef<boolean>(false);

  useEffect(() => {
    carregarPerguntas();
    return () => {
      // V14 M15.4: cleanup completo no unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading || selecionada !== null) return;

    // V14 M15.4: limpa timer anterior antes de criar novo (evita timers duplicados)
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTempo((t) => {
        if (t <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // V14 M15.4: chama proxima direto (timerRef.current ja foi limpo)
          proxima();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, loading, selecionada]);

  const carregarPerguntas = async () => {
    setLoading(true);
    setErro(false);
    try {
      // V18.1 MA.1/MA.2: IDs reais via carregarPerguntasQuiz (custom = modulos escolhidos;
      // aleatorio = amostra global ORDER BY RANDOM). Sem mais M001-M004 hardcoded.
      const selecionadas: Pergunta[] = await carregarPerguntasQuiz(
        TOTAL_PERGUNTAS,
        modo,
        modulos,
      );
      const quiz: PerguntaQuiz[] = selecionadas.map((p) => ({
        pergunta: p,
        // V9 M1.1: alternativas REAIS do DB (quiz_alternatives); fallback defensivo se vazio.
        alternativas: embaralharAlternativas(obterAlternativas(p.id, p.resposta_canonica)),
      }));
      setPerguntas(quiz);
      // V18.1 MA.3: zero perguntas = estado de erro, nunca spinner eterno.
      setErro(quiz.length === 0);
    } catch (e) {
      console.warn('[quiz] falha ao carregar perguntas:', e);
      setPerguntas([]);
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  const selecionar = (i: number) => {
    // V14 M15.4: guard contra re-entrada (timer expirando + clique do usuario ao mesmo tempo)
    if (selecionada !== null) return;
    if (transicionandoRef.current) return;

    setSelecionada(i);
    if (perguntas[indice]?.alternativas[i]?.correta) {
      setAcertos((a) => a + 1);
    }

    // V14 M15.4: usa ref para o timeout de transicao (cleanup garantido)
    transitionTimeoutRef.current = setTimeout(() => {
      transitionTimeoutRef.current = null;
      proxima();
    }, 1200);
  };

  const proxima = () => {
    // V14 M15.4: guard contra re-entrada multipla (timer expirado + selecionar no mesmo frame)
    if (transicionandoRef.current) return;
    transicionandoRef.current = true;

    // limpa timer de transicao pendente (se chegou aqui via timer expirado)
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    setSelecionada(null);
    setTempo(TEMPO_POR_PERGUNTA);
    const prox = indice + 1;
    if (prox >= TOTAL_PERGUNTAS) {
      const score = Math.round((acertos / TOTAL_PERGUNTAS) * 100);
      router.replace(`/quiz/final?score=${score}`);
      // nao reseta transicionandoRef aqui (sai da tela mesmo)
    } else {
      setIndice(prox);
      // libera transicao apos o estado ser aplicado (proxima renderizacao)
      setTimeout(() => {
        transicionandoRef.current = false;
      }, 50);
    }
  };

  // V18.1 MA.3: estado de erro/vazio com saida — nunca prende o usuario num spinner.
  if (erro) {
    return (
      <View style={[styles.container, styles.centro]}>
        <Text style={styles.erroTitulo}>Nao foi possivel carregar o quiz</Text>
        <Text style={styles.erroTexto}>
          Nenhuma pergunta encontrada. Tente novamente ou escolha outros modulos.
        </Text>
        <Pressable style={styles.botaoVoltar} onPress={() => router.replace('/quiz')}>
          <Text style={styles.botaoVoltarTexto}>VOLTAR</Text>
        </Pressable>
      </View>
    );
  }

  if (loading || !perguntas[indice]) {
    return (
      <View style={[styles.container, styles.centro]}>
        <ActivityIndicator size="large" color={COLORS.laranjaEscuro} />
      </View>
    );
  }

  const p = perguntas[indice];
  const corTempo = tempo <= 3 ? COLORS.erroVermelho : COLORS.laranjaClaro;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.indicador}>
          {indice + 1}/{TOTAL_PERGUNTAS}
        </Text>
        <Text style={[styles.timer, { color: corTempo }]}>{tempo}s</Text>
      </View>

      <View style={styles.quadro}>
        <Text style={styles.pergunta}>{p.pergunta.texto}</Text>
      </View>

      <View style={styles.alternativas}>
        {p.alternativas.map((alt, i) => {
          const isSel = selecionada === i;
          const isCorreta = alt.correta;
          const bg = isSel
            ? isCorreta ? COLORS.acertoVerde : COLORS.erroVermelho
            : COLORS.roxoPrimario;
          return (
            <Pressable
              key={i}
              style={[styles.alternativa, { backgroundColor: bg }]}
              onPress={() => selecionar(i)}
              disabled={selecionada !== null}
            >
              <Text style={styles.altLetra}>{String.fromCharCode(65 + i)}</Text>
              <Text style={styles.altTexto}>{alt.texto}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.roxoEscuro,
    padding: ESPACAMENTOS.lg,
    gap: ESPACAMENTOS.lg,
  },
  centro: { alignItems: 'center', justifyContent: 'center' },
  erroTitulo: {
    fontFamily: FONTES.display,
    fontSize: 28,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
  },
  erroTexto: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 16,
    color: COLORS.branco,
    textAlign: 'center',
  },
  botaoVoltar: {
    marginTop: ESPACAMENTOS.lg,
    backgroundColor: COLORS.laranjaEscuro,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
  },
  botaoVoltarTexto: {
    fontFamily: FONTES.display,
    fontSize: 20,
    color: COLORS.branco,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicador: { fontFamily: FONTES.bodyBold, fontSize: 18, color: COLORS.laranjaClaro },
  timer: { fontFamily: FONTES.display, fontSize: 32 },
  quadro: {
    backgroundColor: COLORS.branco,
    padding: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioMedio,
    minHeight: 100,
    justifyContent: 'center',
  },
  pergunta: {
    fontFamily: FONTES.bodyBold,
    fontSize: 18,
    color: COLORS.preto,
    textAlign: 'center',
  },
  alternativas: { gap: ESPACAMENTOS.sm },
  alternativa: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaEscuro,
    gap: ESPACAMENTOS.md,
  },
  altLetra: {
    fontFamily: FONTES.display,
    fontSize: 24,
    color: COLORS.laranjaClaro,
    width: 30,
    textAlign: 'center',
  },
  altTexto: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 14,
    color: COLORS.branco,
    flex: 1,
  },
});