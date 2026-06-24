import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { listarPerguntas } from '../../lib/db-queries';
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
 */
export default function JogarQuiz() {
  const router = useRouter();
  const [perguntas, setPerguntas] = useState<PerguntaQuiz[]>([]);
  const [indice, setIndice] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [tempo, setTempo] = useState(TEMPO_POR_PERGUNTA);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPerguntas();
  }, []);

  useEffect(() => {
    if (loading || selecionada !== null) return;
    const timer = setInterval(() => {
      setTempo((t) => {
        if (t <= 1) {
          clearInterval(timer);
          proxima();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [indice, loading, selecionada]);

  const carregarPerguntas = async () => {
    // MOCK: pega 20 perguntas aleatorias das 8x25=200 mock
    const mock: Pergunta[] = [];
    for (let m = 1; m <= 4; m++) {
      const modId = `M${String(m).padStart(3, '0')}`;
      for (let l = 1; l <= 5; l++) {
        const lista = await listarPerguntas(`${modId}-L${String(l).padStart(2, '0')}`);
        mock.push(...lista);
      }
    }
    const selecionadas = mock.slice(0, TOTAL_PERGUNTAS);
    const quiz: PerguntaQuiz[] = selecionadas.map((p) => ({
      pergunta: p,
      // V9 M1.1: usa alternativas REAIS do DB (tabela quiz_alternatives populada pelo batch M2.7)
      // Fallback para mock so se a tabela estiver vazia (defensivo)
      alternativas: embaralharAlternativas(obterAlternativas(p.id, p.resposta_canonica)),
    }));
    setPerguntas(quiz);
    setLoading(false);
  };

  const selecionar = (i: number) => {
    if (selecionada !== null) return;
    setSelecionada(i);
    if (perguntas[indice]?.alternativas[i]?.correta) {
      setAcertos((a) => a + 1);
    }
    setTimeout(proxima, 1200);
  };

  const proxima = () => {
    setSelecionada(null);
    setTempo(TEMPO_POR_PERGUNTA);
    const prox = indice + 1;
    if (prox >= TOTAL_PERGUNTAS) {
      const score = Math.round((acertos / TOTAL_PERGUNTAS) * 100);
      router.replace(`/quiz/final?score=${score}`);
    } else {
      setIndice(prox);
    }
  };

  if (loading || !perguntas[indice]) {
    return (
      <View style={styles.container}>
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