import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../constants/colors';
import { PersonagemLivro } from '../../../components/PersonagemLivro';
import { GradienteRoxo } from '../../../components/Gradiente';
import { IconeSom } from '../../../components/IconeSom';
import { IconeHome } from '../../../components/IconeHome';
import { listarPerguntas, registrarRespostaUsuario } from '../../../lib/db-queries';
import { matchCanonico } from '../../../lib/matching';
import type { Pergunta } from '../../../types';

type Pose = 'PENSATIVO' | 'FELIZ' | 'ASSUSTADO' | 'TRISTE' | 'EXCLAMANDO';

/**
 * V9 M2.4+M2.5: Tela Licao com navegacao para Tela Feedback dedicada e icones globais (som/home).
 * Apos matchCanonico, em vez de mudar pose inline (V8), faz router.push para
 * /licoes/{moduloId}/{licaoId}/feedback?resultado=acerto|erro&resposta_correta=...
 * IconeSom canto inferior direito (toggle efeitos em runtime).
 * IconeHome canto superior direito (volta para /modos).
 *
 * V14 M15.5: PersonagemLivro 110 -> 280, moldura elegante (border, shadow, padding, fundo),
 *                  Animated fade-in/zoom de entrada.
 * V14 M15.6: KeyboardAvoidingView behavior 'height' no Android + keyboardVerticalOffset=64
 *                  (compensa status bar). AndroidManifest ja tem adjustResize.
 */
export default function LicaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ moduloId: string; licaoId: string; indice?: string }>();
  const { moduloId, licaoId } = params;
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  // V9 M2.4: indice vem do param (feedback avanca via ?indice=N); default 0
  const [indice, setIndice] = useState(parseInt(params.indice ?? '0', 10));
  const [resposta, setResposta] = useState('');
  const [pose, setPose] = useState<Pose>('PENSATIVO');
  const [acertos, setAcertos] = useState(0);

  // V14 M15.5: animacao fade-in/zoom de entrada do personagem
  const personagemFade = useRef(new Animated.Value(0)).current;
  const personagemZoom = useRef(new Animated.Value(0.7)).current;

  // V10 M5.4: deps incluem [licaoId, moduloId] (não só licaoId) para garantir reset
  // ao trocar de módulo/lição (evita o looping infinito que ocorria antes).
  useEffect(() => {
    if (licaoId) listarPerguntas(licaoId).then(setPerguntas);
  }, [licaoId, moduloId]);

  // V14 M15.5: dispara animacao de entrada do personagem ao montar ou trocar licao
  useEffect(() => {
    personagemFade.setValue(0);
    personagemZoom.setValue(0.7);
    Animated.parallel([
      Animated.timing(personagemFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(personagemZoom, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
  }, [licaoId, moduloId, indice, personagemFade, personagemZoom]);

  // V10 M5.4: quando params.indice muda (deep link do feedback), sincroniza estado
  // com guard contra loops (p undefined ou igual ao indice atual).
  useEffect(() => {
    const p = parseInt(params.indice ?? '0', 10);
    if (Number.isNaN(p)) return;              // guard: p inválido
    if (p === indice) return;                 // guard: já está no estado certo
    setResposta('');                          // ANTES de setIndice (estado coerente)
    setPose('PENSATIVO');
    setIndice(p);
  }, [params.indice, indice]);

  if (perguntas.length === 0 || !moduloId || !licaoId) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

  const perguntaAtual = perguntas[indice];
  if (!perguntaAtual) return null;

  const enviar = () => {
    const resultado = matchCanonico(resposta, perguntaAtual.resposta_canonica);

    // Log local da resposta do usuario (para revisao posterior / debug)
    registrarRespostaUsuario(perguntaAtual.id, resposta, resultado.correto, resultado.score || 0);

    // Atualiza acerto localmente (mantido no estado para o caso de voltar)
    if (resultado.correto) setAcertos((a) => a + 1);

    // Navega para Tela Feedback dedicada em vez de mudar pose inline
    router.push({
      pathname: `/licoes/${moduloId}/${licaoId}/feedback`,
      params: {
        resultado: resultado.correto ? 'acerto' : 'erro',
        resposta_correta: perguntaAtual.resposta_canonica,
        moduloId: String(moduloId),
        licaoId: String(licaoId),
        indice: String(indice),
        total: String(perguntas.length),
        total_perguntas: String(perguntas.length),
        acertos_atual: String(acertos + (resultado.correto ? 1 : 0)),
      },
    });
  };

  return (
    <GradienteRoxo style={styles.fundo}>
    <KeyboardAvoidingView
      style={styles.container}
      // V14 M15.6: 'height' no Android funciona (undefined NAO funcionava).
      // No iOS mantemos 'padding' (padrao Apple).
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 64}
    >
      {/* IconeHome canto superior direito */}
      <View style={styles.header}>
        <View style={styles.headerEsquerda} />
        <Text style={styles.indicador}>
          {indice + 1}-{perguntas.length}
        </Text>
        <View style={styles.headerDireita}>
          <IconeHome />
        </View>
      </View>

      <View style={styles.centro}>
        {/* V18.2 MB.4: personagem PNG transparente SEM moldura (a caixa creme+borda
            duplicava a moldura e dava o efeito de "imagem com fundo"). Mantem so a
            animacao de entrada (fade + zoom). */}
        <Animated.View
          style={[
            styles.personagemWrapper,
            { opacity: personagemFade, transform: [{ scale: personagemZoom }] },
          ]}
        >
          <PersonagemLivro pose={pose} size={240} />
        </Animated.View>

        <View style={styles.quadro}>
          <Text style={styles.pergunta}>{perguntaAtual.texto}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.prefixo}>R:</Text>
          <TextInput
            style={styles.input}
            value={resposta}
            onChangeText={setResposta}
            placeholder="Digite sua resposta..."
            placeholderTextColor={COLORS.cinzaMedio}
            autoCapitalize="sentences"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={enviar}
          />
        </View>

        <Pressable style={styles.botaoEnviar} onPress={enviar}>
          <Text style={styles.botaoTexto}>ENVIAR</Text>
        </Pressable>
      </View>

      {/* IconeSom canto inferior direito */}
      <View style={styles.rodape}>
        <IconeSom />
      </View>
    </KeyboardAvoidingView>
    </GradienteRoxo>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1 },
  container: {
    flex: 1,
    // V18.3: fundo agora e' degrade roxo (GradienteRoxo) — container transparente.
    backgroundColor: 'transparent',
    padding: ESPACAMENTOS.lg,
  },
  loading: {
    color: COLORS.branco,
    fontFamily: FONTES.bodyRegular,
    textAlign: 'center',
    marginTop: ESPACAMENTOS.xxl,
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ESPACAMENTOS.md,
    paddingHorizontal: ESPACAMENTOS.sm,
  },
  headerEsquerda: { width: 40 },
  headerDireita: { width: 40, alignItems: 'flex-end' },
  rodape: {
    position: 'absolute',
    bottom: ESPACAMENTOS.lg,
    right: ESPACAMENTOS.lg,
  },
  indicador: {
    fontFamily: FONTES.bodyBold,
    fontSize: 18,
    color: COLORS.laranjaClaro,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    gap: ESPACAMENTOS.lg,
  },
  // V18.2 MB.4: wrapper apenas para centralizar/animar (sem caixa/borda/sombra).
  personagemWrapper: {
    alignSelf: 'center',
  },
  quadro: {
    backgroundColor: COLORS.branco,
    padding: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioMedio,
    minHeight: 120,
    justifyContent: 'center',
    // V18.3 MD.6: quadro branco da pergunta com borda preta (briefing).
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
  },
  pergunta: {
    fontFamily: FONTES.bodyBold,
    fontSize: 18,
    color: COLORS.preto,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.roxoPrimario,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaEscuro,
    borderRadius: BORDAS.raioMedio,
    paddingHorizontal: ESPACAMENTOS.md,
  },
  prefixo: {
    fontFamily: FONTES.display,
    fontSize: 24,
    color: COLORS.laranjaClaro,
    marginRight: ESPACAMENTOS.sm,
  },
  input: {
    flex: 1,
    fontFamily: FONTES.bodyRegular,
    fontSize: 16,
    color: COLORS.branco,
    paddingVertical: ESPACAMENTOS.md,
  },
  botaoEnviar: {
    backgroundColor: COLORS.laranjaEscuro,
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    alignItems: 'center',
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.branco,
  },
});