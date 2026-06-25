import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../constants/colors';
import { PersonagemLivro } from '../../../components/PersonagemLivro';
import { GradienteRoxo } from '../../../components/Gradiente';
import { IconeSom } from '../../../components/IconeSom';
import { IconeHome } from '../../../components/IconeHome';
import { listarPerguntas, registrarRespostaUsuario } from '../../../lib/db-queries';
import { avaliarResposta } from '../../../lib/avaliador';
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
  const params = useLocalSearchParams<{ moduloId: string; licaoId: string; indice?: string; acertos?: string }>();
  const { moduloId, licaoId } = params;
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  // V9 M2.4: indice vem do param (feedback avanca via ?indice=N); default 0
  const [indice, setIndice] = useState(parseInt(params.indice ?? '0', 10));
  const [resposta, setResposta] = useState('');
  const [pose, setPose] = useState<Pose>('PENSATIVO');
  // V19 BUG-1 (release-blocker): o placar agora EH propagado por params em toda a
  // jornada licao->feedback->licao. Antes `acertos` reiniciava em 0 a cada
  // remontagem (feedback fazia router.replace SEM repassar acertos), entao o score
  // final nunca passava de 1/total. Inicializa do param e mantem sincronizado.
  const [acertos, setAcertos] = useState(parseInt(params.acertos ?? '0', 10));
  // V19 BUG-4: mensagem de validacao para envio de resposta vazia (antes navegava
  // para fora/feedback silenciosamente).
  const [erroValidacao, setErroValidacao] = useState('');
  // V20: "IA obrigatoria" (regra #4). Estado de LOADING enquanto o avaliador hibrido
  // (match local -> M2.7 -> OpenAI) processa a resposta aberta. Bloqueia duplo-envio.
  const [avaliando, setAvaliando] = useState(false);

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
    setErroValidacao('');
    setPose('PENSATIVO');
    setIndice(p);
  }, [params.indice, indice]);

  // V19 BUG-1: sincroniza o placar acumulado vindo do feedback (caso a tela seja
  // REUTILIZADA em vez de remontada — alem da init via useState). Garante que
  // `acertos` reflita o total real ao longo da jornada.
  useEffect(() => {
    const a = parseInt(params.acertos ?? '0', 10);
    if (Number.isNaN(a)) return;
    setAcertos(a);
  }, [params.acertos]);

  if (perguntas.length === 0 || !moduloId || !licaoId) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

  const perguntaAtual = perguntas[indice];
  if (!perguntaAtual) return null;

  const enviar = async () => {
    // V19 BUG-4: bloqueia envio de resposta vazia (antes navegava para feedback/fora
    // silenciosamente). Mostra validacao e NAO sai da licao.
    if (!resposta.trim()) {
      setErroValidacao('Digite uma resposta antes de enviar.');
      return;
    }
    if (avaliando) return; // guard anti duplo-envio enquanto a IA processa
    setErroValidacao('');

    // V20 (regra #4 "IA obrigatoria"): a avaliacao das licoes agora passa pelo
    // orquestrador HIBRIDO `avaliarResposta`:
    //   match local canonico (>=85%) -> cache SQLite -> M2.7 (LLM) -> OpenAI (fallback).
    // Perguntas abertas/sem gabarito (~497 "NAO SEI"/placeholder) tem match local 0.7
    // (< 0.85), entao caem para a IA quando ha rede; offline, o avaliador devolve um
    // veredito amigavel (nunca lanca excecao, nunca trava a licao).
    setAvaliando(true);
    let resultado;
    try {
      resultado = await avaliarResposta(perguntaAtual, resposta);
    } catch {
      // Defesa extra: o avaliador ja trata tudo internamente, mas garantimos que um
      // erro inesperado NAO trave a licao — cai para "nao confirmado" e segue.
      resultado = {
        correto: false,
        resposta_esperada: perguntaAtual.resposta_canonica,
        score: 0,
        feedback: 'Não foi possível avaliar agora. Confira a resposta exibida.',
        origem: 'FALHOU' as const,
      };
    } finally {
      setAvaliando(false);
    }

    // Log local da resposta do usuario (para revisao posterior / debug)
    registrarRespostaUsuario(perguntaAtual.id, resposta, resultado.correto, resultado.score || 0);

    // V19 BUG-1: placar acumulado = `acertos` (vindo dos params via state) + acerto atual.
    const acertosAtual = acertos + (resultado.correto ? 1 : 0);
    if (resultado.correto) setAcertos(acertosAtual);

    // Navega para Tela Feedback dedicada em vez de mudar pose inline.
    // V20: repassa o feedback da IA + a resposta esperada (que pode vir do LLM) e a
    // origem da avaliacao (CACHE/M3/OPENAI/FALHOU) para exibir na tela de feedback.
    router.push({
      pathname: `/licoes/${moduloId}/${licaoId}/feedback`,
      params: {
        resultado: resultado.correto ? 'acerto' : 'erro',
        resposta_correta: resultado.resposta_esperada || perguntaAtual.resposta_canonica,
        feedback_ia: resultado.feedback ?? '',
        origem: resultado.origem ?? '',
        moduloId: String(moduloId),
        licaoId: String(licaoId),
        indice: String(indice),
        total: String(perguntas.length),
        total_perguntas: String(perguntas.length),
        acertos_atual: String(acertosAtual),
      },
    });
  };

  return (
    <GradienteRoxo style={styles.fundo}>
    <KeyboardAvoidingView
      style={styles.container}
      // V19 BUG-3: no Android o AndroidManifest ja usa adjustResize; combinar com
      // behavior 'height' do KAV conflitava e mantinha o botao ENVIAR atras do
      // teclado. Deixamos o KAV so para iOS ('padding') e usamos ScrollView no
      // Android para garantir que ENVIAR sempre seja alcancavel (scroll ate ele).
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.centro}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* V18.2 MB.4: personagem PNG transparente SEM moldura (a caixa creme+borda
            duplicava a moldura e dava o efeito de "imagem com fundo"). Mantem so a
            animacao de entrada (fade + zoom). */}
        <Animated.View
          style={[
            styles.personagemWrapper,
            { opacity: personagemFade, transform: [{ scale: personagemZoom }] },
          ]}
        >
          <PersonagemLivro pose={pose} size={240} variante="licoes" />
        </Animated.View>

        <View style={styles.quadro}>
          <Text style={styles.pergunta}>{perguntaAtual.texto}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.prefixo}>R:</Text>
          <TextInput
            style={styles.input}
            value={resposta}
            onChangeText={(t) => {
              setResposta(t);
              if (erroValidacao) setErroValidacao('');
            }}
            placeholder="Digite sua resposta..."
            placeholderTextColor={COLORS.cinzaMedio}
            autoCapitalize="sentences"
            autoCorrect={false}
            returnKeyType="send"
            editable={!avaliando}
            onSubmitEditing={enviar}
          />
        </View>

        {/* V19 BUG-4: validacao de resposta vazia (sem sair da licao) */}
        {erroValidacao ? <Text style={styles.erroValidacao}>{erroValidacao}</Text> : null}

        {/* V20: botao com estado de LOADING enquanto a IA avalia a resposta aberta. */}
        <Pressable
          style={[styles.botaoEnviar, avaliando && styles.botaoEnviarDesabilitado]}
          onPress={enviar}
          disabled={avaliando}
        >
          {avaliando ? (
            <View style={styles.botaoLoadingRow}>
              <ActivityIndicator color={COLORS.branco} />
              <Text style={styles.botaoTexto}>AVALIANDO...</Text>
            </View>
          ) : (
            <Text style={styles.botaoTexto}>ENVIAR</Text>
          )}
        </Pressable>
      </ScrollView>

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
  // V19 BUG-3: ScrollView ocupa o espaco; o content centraliza quando ha espaco e
  // permite rolar ate o botao ENVIAR quando o teclado reduz a area visivel.
  scroll: {
    flex: 1,
  },
  centro: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: ESPACAMENTOS.lg,
    paddingBottom: ESPACAMENTOS.xl,
  },
  erroValidacao: {
    fontFamily: FONTES.bodyBold,
    fontSize: 14,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
    marginTop: -ESPACAMENTOS.sm,
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
  botaoEnviarDesabilitado: {
    opacity: 0.7,
  },
  botaoLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACAMENTOS.sm,
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.branco,
  },
});