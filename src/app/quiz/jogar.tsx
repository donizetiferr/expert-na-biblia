import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { carregarPerguntasQuiz } from '../../lib/quiz-loader';
import { embaralharAlternativas } from '../../lib/quiz-questions';
import { obterAlternativas } from '../../lib/quiz-alternatives-db';
import { IconeHome } from '../../components/IconeHome';
import { playCombo } from '../../lib/sound';
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
  // V19 BUG-5: placar mantido em ref (nao em state — nao eh renderizado). proxima()
  // pode rodar via setTimeout cujo closure capturaria `acertos` ANTES de um setState
  // aplicar, subcontando o ultimo acerto. O ref evita essa defasagem e da o total exato.
  const acertosRef = useRef(0);
  // V23.B.5: combo de acertos consecutivos no quiz. comboRef = sequencia atual;
  // comboMaxRef = maior sequencia (vira bonus de XP no final). `combo` (state) so para o
  // indicador visual "Nx COMBO!".
  const comboRef = useRef(0);
  const comboMaxRef = useRef(0);
  const [combo, setCombo] = useState(0);
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
          // V23.B.5: timeout = errou -> zera o combo.
          comboRef.current = 0;
          setCombo(0);
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
      acertosRef.current += 1;
      // V23.B.5: acerto -> combo cresce; marcos 3/5/10 tocam SFX de combo.
      comboRef.current += 1;
      if (comboRef.current > comboMaxRef.current) comboMaxRef.current = comboRef.current;
      setCombo(comboRef.current);
      if (comboRef.current === 3 || comboRef.current === 5 || comboRef.current === 10) {
        playCombo().catch((e: unknown) => console.warn('[audio] quiz combo falhou:', e));
      }
    } else {
      // Errou -> zera o combo.
      comboRef.current = 0;
      setCombo(0);
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
      // V19 BUG-5: usa o ref (exato) e passa acertos + total para o placar exibir
      // "Voce acertou X de N" conforme o briefing.
      const acertosFinais = acertosRef.current;
      const score = Math.round((acertosFinais / TOTAL_PERGUNTAS) * 100);
      // V23.B.5: passa o maior combo para a tela final conceder bonus.
      router.replace(`/quiz/final?score=${score}&acertos=${acertosFinais}&total=${TOTAL_PERGUNTAS}&combo=${comboMaxRef.current}`);
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
        <Text style={styles.erroTitulo}>Não foi possível carregar o quiz</Text>
        <Text style={styles.erroTexto}>
          Nenhuma pergunta encontrada. Tente novamente ou escolha outros módulos.
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
        {/* V18.3 MD.8: icone home no header do quiz */}
        <IconeHome />
      </View>

      {/* V23.B.5: indicador de combo (a partir de 2 acertos seguidos). */}
      {combo >= 2 ? (
        <View style={styles.comboBadge} accessibilityLabel={`${combo} acertos seguidos`}>
          <Text style={styles.comboTexto}>🔥 {combo}x COMBO!</Text>
        </View>
      ) : null}

      <View style={styles.quadro}>
        <Text style={styles.pergunta}>{p.pergunta.texto}</Text>
      </View>

      <View style={styles.alternativas}>
        {p.alternativas.map((alt, i) => {
          const isSel = selecionada === i;
          // V18.3 MD.3: alternativa selecionada = amarelo, borda preta grossa, letra preta.
          return (
            <Pressable
              key={i}
              style={[styles.alternativa, isSel ? styles.alternativaSelecionada : styles.alternativaNormal]}
              onPress={() => selecionar(i)}
              disabled={selecionada !== null}
            >
              <Text style={[styles.altLetra, isSel && styles.altTextoSelecionado]}>
                {String.fromCharCode(65 + i)}
              </Text>
              <Text style={[styles.altTexto, isSel && styles.altTextoSelecionado]}>{alt.texto}</Text>
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
  // V23.B.5: badge de combo.
  comboBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.laranjaForte,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaClaro,
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingVertical: ESPACAMENTOS.xs,
  },
  comboTexto: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.branco,
    letterSpacing: 1,
  },
  quadro: {
    backgroundColor: COLORS.branco,
    padding: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioMedio,
    minHeight: 100,
    justifyContent: 'center',
    // V18.3 MD.6: quadro branco da pergunta com borda preta.
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
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
    gap: ESPACAMENTOS.md,
  },
  alternativaNormal: {
    backgroundColor: COLORS.roxoPrimario,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaEscuro,
  },
  // V18.3 MD.3: selecionada = amarelo + borda preta grossa.
  alternativaSelecionada: {
    backgroundColor: COLORS.laranjaClaro,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
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
  // V18.3 MD.3: texto/letra pretos quando selecionada (sobre o amarelo).
  altTextoSelecionado: {
    color: COLORS.preto,
    fontFamily: FONTES.bodyBold,
  },
});