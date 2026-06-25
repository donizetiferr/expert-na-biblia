import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../../constants/colors';
import { TEMA } from '../../../../lib/design-tokens';
import { PersonagemLivro } from '../../../../components/PersonagemLivro';
import { playAcerto, playErro } from '../../../../lib/sound';

/**
 * V9 M2.4: Tela Feedback Licao dedicada.
 * - Variante 'acerto': fundo verde, PersonagemLivro pose FELIZ, "Acertou!", quadro branco com resposta correta,
 *                      1 botao redondo roxo "PROSSEGUIR".
 * - Variante 'erro':   fundo laranja, PersonagemLivro pose ASSUSTADO, balao "Errado!", quadro branco com resposta correta,
 *                      2 botoes redondos (voltar + prosseguir).
 *
 * Apos PROSSEGUIR:
 * - Se indice === total-1 (ultima pergunta): navega para /final?score=... (final.tsx cuida do resto)
 * - Senão: navega para /licoes/{m}/{l}?indice=indice+1 (proxima pergunta)
 *
 * Apos VOLTAR (erro): navega para /licoes/{m}/{l}?indice=indice (mesma pergunta)
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

  if (isAcerto) {
    playAcerto().catch((e: unknown) =>
      console.warn('[audio] feedback acerto falhou:', e),
    );
  } else {
    playErro().catch((e: unknown) =>
      console.warn('[audio] feedback erro falhou:', e),
    );
  }

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
      // Avancar para proxima pergunta
      router.replace({
        pathname: `/licoes/${params.moduloId}/${params.licaoId}`,
        params: { indice: String(indice + 1), moduloId: String(params.moduloId), licaoId: String(params.licaoId) },
      });
    }
  };

  const handleVoltar = () => {
    // Mesma pergunta (re-tentar)
    router.replace({
      pathname: `/licoes/${params.moduloId}/${params.licaoId}`,
      params: { indice: String(indice), moduloId: String(params.moduloId), licaoId: String(params.licaoId) },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isAcerto
            ? TEMA.feedback.acerto.fundo
            : TEMA.feedback.erro.fundo,
        },
      ]}
    >
      {isAcerto ? (
        <>
          <PersonagemLivro pose="FELIZ" size={150} />
          <Text style={styles.titulo}>Acertou!</Text>
        </>
      ) : (
        <>
          <PersonagemLivro pose="ASSUSTADO" size={150} />
          <View style={styles.balaoFala}>
            <Text style={styles.balaoTexto}>Errado!</Text>
          </View>
        </>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: ESPACAMENTOS.lg,
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 64,
    color: COLORS.branco,
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  balaoFala: {
    backgroundColor: COLORS.roxoPrimario,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioGrande,
    borderWidth: 4,
    borderColor: COLORS.branco,
    transform: [{ rotate: '-3deg' }],
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
