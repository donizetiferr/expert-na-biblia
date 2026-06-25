import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../../constants/colors';
import { PersonagemLivro } from '../../../../components/PersonagemLivro';
import { GradienteLaranjaForte } from '../../../../components/Gradiente';
import { playAcerto, playErro } from '../../../../lib/sound';

/**
 * V9 M2.4: Tela Feedback Licao dedicada.
 * V14 M15.8:
 *   - PersonagemLivro 150 -> 200 (briefing diz grande)
 *   - Fundo laranja (ja estava) — usado em AMBOS os casos (acerto E erro) conforme briefing
 *   - Balao de fala em AMBOS os casos (acerto E erro)
 *   - Bounce animation (scale 1 -> 1.1 -> 1) no personagem
 */
type Resultado = 'acerto' | 'erro';

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    resultado: Resultado;
    resposta_correta: string;
    moduloId: string;
    licaoId: string;
    indice: string;
    total: string;
    acertos_atual: string;
    total_perguntas: string;
  }>();

  const isAcerto = params.resultado === 'acerto';

  const indice = parseInt(params.indice ?? '0', 10);
  const total = parseInt(params.total ?? '1', 10);
  const acertos = parseInt(params.acertos_atual ?? '0', 10);
  const totalPerguntas = parseInt(params.total_perguntas ?? String(total), 10);

  // V14 M15.8: bounce animation no personagem (scale 1 -> 1.15 -> 1)
  const bounceAnim = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.15,
        duration: 250,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1.0,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceAnim]);

  // V18.3 (16.4): tocar o SFX 1x em useEffect (antes estava no body -> re-disparava
  // o som a cada re-render do componente).
  useEffect(() => {
    const fn = isAcerto ? playAcerto : playErro;
    fn().catch((e: unknown) => console.warn('[audio] feedback falhou:', e));
  }, [isAcerto]);

  const handleProsseguir = () => {
    const isLast = indice >= total - 1;
    if (isLast) {
      // Calcular score final: acertos / total_perguntas * 100
      const scoreFinal = Math.round((acertos / Math.max(totalPerguntas, 1)) * 100);
      router.replace({
        pathname: `/licoes/${params.moduloId}/${params.licaoId}/final`,
        params: { score: String(scoreFinal), moduloId: String(params.moduloId), licaoId: String(params.licaoId) },
      });
    } else {
      // Avancar para proxima pergunta.
      // V19 BUG-1 (release-blocker): REPASSA `acertos` acumulado. Antes este
      // router.replace omitia `acertos`, entao a tela de licao remontava com
      // useState(0) e o placar nunca passava de 1 -> 100% impossivel -> progressao
      // de licoes morta. Agora o placar atravessa toda a jornada.
      router.replace({
        pathname: `/licoes/${params.moduloId}/${params.licaoId}`,
        params: {
          indice: String(indice + 1),
          moduloId: String(params.moduloId),
          licaoId: String(params.licaoId),
          acertos: String(acertos),
        },
      });
    }
  };

  const handleVoltar = () => {
    // Mesma pergunta (re-tentar). V19 BUG-1: preserva o placar acumulado.
    // Ao re-tentar, descontamos o acerto desta pergunta (se houve), pois o usuario
    // vai responde-la de novo e o placar sera recontado no envio.
    const acertosBase = Math.max(0, acertos - (isAcerto ? 1 : 0));
    router.replace({
      pathname: `/licoes/${params.moduloId}/${params.licaoId}`,
      params: {
        indice: String(indice),
        moduloId: String(params.moduloId),
        licaoId: String(params.licaoId),
        acertos: String(acertosBase),
      },
    });
  };

  // V18.3: fundo em degrade laranja (briefing unifica o feedback visual).
  return (
    <GradienteLaranjaForte style={styles.container}>
      <Animated.View
        style={{
          transform: [{ scale: bounceAnim }],
          alignItems: 'center',
        }}
      >
        {/* V14 M15.8: PersonagemLivro 150 -> 200 */}
        <PersonagemLivro pose={isAcerto ? 'FELIZ' : 'ASSUSTADO'} size={200} />
      </Animated.View>

      {/* V14 M15.8: balao de fala em AMBOS os casos (acerto E erro) */}
      <View style={styles.balaoFala}>
        <Text style={styles.balaoTexto}>{isAcerto ? 'Correto!' : 'Errado!'}</Text>
      </View>

      <View style={styles.quadroResposta}>
        <Text style={styles.quadroLabel}>Resposta correta:</Text>
        <Text style={styles.quadroTexto}>{params.resposta_correta || '(não disponível)'}</Text>
      </View>

      <View style={styles.indicador}>
        <Text style={styles.indicadorTexto}>
          {indice + 1} de {total} · Acertos: {acertos}
        </Text>
      </View>

      {isAcerto ? (
        <View style={styles.botoesContainer}>
          <Pressable style={[styles.botaoRedondo, styles.botaoSolido]} onPress={handleProsseguir}>
            <Text style={styles.botaoTexto}>PROSSEGUIR ›</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.botoesContainer}>
          <Pressable
            style={[styles.botaoRedondo, styles.botaoSecundario]}
            onPress={handleVoltar}
          >
            <Text style={[styles.botaoTexto, styles.botaoTextoPreto]}>‹ VOLTAR</Text>
          </Pressable>
          <Pressable
            style={[styles.botaoRedondo, styles.botaoSolido]}
            onPress={handleProsseguir}
          >
            <Text style={styles.botaoTexto}>PROSSEGUIR ›</Text>
          </Pressable>
        </View>
      )}
    </GradienteLaranjaForte>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: ESPACAMENTOS.lg,
  },
  balaoFala: {
    // V14 M15.8: balao unificado (acerto E erro), borda mais grossa, com sombra
    backgroundColor: COLORS.roxoPrimario,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioGrande,
    borderWidth: 5,
    borderColor: COLORS.branco,
    transform: [{ rotate: '-3deg' }],
    shadowColor: COLORS.preto,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  balaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 56,
    color: COLORS.branco,
    letterSpacing: 2,
  },
  quadroResposta: {
    width: '90%',
    backgroundColor: COLORS.branco,
    padding: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioMedio,
    alignItems: 'center',
    gap: ESPACAMENTOS.sm,
  },
  quadroLabel: {
    fontFamily: FONTES.bodyBold,
    fontSize: 14,
    color: COLORS.preto,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quadroTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 22,
    color: COLORS.roxoEscuro,
    textAlign: 'center',
  },
  indicador: {
    paddingVertical: ESPACAMENTOS.xs,
  },
  indicadorTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.branco,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: ESPACAMENTOS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoRedondo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: COLORS.laranjaEscuro,
  },
  botaoSolido: {
    backgroundColor: COLORS.roxoPrimario,
  },
  botaoSecundario: {
    backgroundColor: COLORS.branco,
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 18,
    color: COLORS.branco,
    textAlign: 'center',
  },
  botaoTextoPreto: {
    color: COLORS.preto,
  },
});
