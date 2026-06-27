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
import { obterConteudoLicao, type ConteudoLicao } from '../../../lib/conteudo';
import { registrarRevisao } from '../../../lib/revisao';
import { falar, pararFala } from '../../../lib/tts';
import { lightTap } from '../../../lib/haptics';
import { useFontScale } from '../../../lib/a11y';
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
  const params = useLocalSearchParams<{ moduloId: string; licaoId: string; indice?: string; acertos?: string; erradas?: string; somente?: string }>();
  const { moduloId, licaoId } = params;
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  // V23.A.6: IDs das perguntas erradas acumulados na jornada (para "refazer so as que
  // faltaram"). Vem por param (CSV) e cresce a cada erro.
  const [erradas, setErradas] = useState<string[]>(() =>
    params.erradas ? params.erradas.split(',').filter(Boolean) : [],
  );
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
  // V23.5 (D.1): conteudo didatico da licao (mini-ensino + versiculo-chave) e o card
  // "Aprenda" exibido ANTES das perguntas (so na entrada normal — indice 0, sem subset).
  const [conteudo, setConteudo] = useState<ConteudoLicao | null>(null);
  const inicioNormal = (params.indice ?? '0') === '0' && !params.somente;
  const [mostrarAprenda, setMostrarAprenda] = useState(inicioNormal);
  // V23.E.1: multiplicador de fonte do toggle "Texto grande" (a11y idosos/baixa visao).
  const fontScale = useFontScale();

  // V23.E.4: interrompe qualquer leitura em voz alta ao sair da tela.
  useEffect(() => () => pararFala(), []);

  // V14 M15.5: animacao fade-in/zoom de entrada do personagem
  const personagemFade = useRef(new Animated.Value(0)).current;
  const personagemZoom = useRef(new Animated.Value(0.7)).current;

  // V10 M5.4: deps incluem [licaoId, moduloId] (não só licaoId) para garantir reset
  // ao trocar de módulo/lição (evita o looping infinito que ocorria antes).
  useEffect(() => {
    if (!licaoId) return;
    listarPerguntas(licaoId).then((todas) => {
      // V23.A.6: modo "refazer so as que faltaram" — filtra para os IDs em `somente`.
      const somente = params.somente ? params.somente.split(',').filter(Boolean) : null;
      setPerguntas(somente && somente.length > 0 ? todas.filter((p) => somente.includes(p.id)) : todas);
    });
  }, [licaoId, moduloId, params.somente]);

  // V23.A.6: sincroniza `erradas` vindo dos params ao reusar a tela.
  useEffect(() => {
    setErradas(params.erradas ? params.erradas.split(',').filter(Boolean) : []);
  }, [params.erradas]);

  // V23.5 (D.1): carrega o conteudo didatico da licao. Se nao houver (licao sem
  // conteudo gerado), o card "Aprenda" simplesmente nao aparece.
  useEffect(() => {
    if (!licaoId) return;
    obterConteudoLicao(licaoId).then((c) => {
      setConteudo(c);
      if (!c) setMostrarAprenda(false);
    });
  }, [licaoId]);

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
    lightTap().catch(() => {}); // V23.E.6: feedback tatil no envio
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

    // V23.5 (D.2): agenda a pergunta no sistema de revisao espacada (Leitner). Acerto
    // sobe a caixa (revisao mais espacada); erro volta para a caixa 1 (revisa em breve).
    registrarRevisao(perguntaAtual.id, String(licaoId), resultado.correto).catch((e: unknown) =>
      console.warn('[revisao] registrar falhou:', e),
    );

    // V19 BUG-1: placar acumulado = `acertos` (vindo dos params via state) + acerto atual.
    const acertosAtual = acertos + (resultado.correto ? 1 : 0);
    if (resultado.correto) setAcertos(acertosAtual);

    // V23.A.6: mantem o conjunto de perguntas AINDA nao dominadas. Acerto remove o ID;
    // erro adiciona. Assim "refazer so as que faltaram" foca no que de fato falta.
    let erradasAtual = erradas;
    if (resultado.correto) {
      erradasAtual = erradas.filter((id) => id !== perguntaAtual.id);
    } else if (!erradas.includes(perguntaAtual.id)) {
      erradasAtual = [...erradas, perguntaAtual.id];
    }
    if (erradasAtual !== erradas) setErradas(erradasAtual);

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
        erradas: erradasAtual.join(','),
        // V23.5 (D.4): referencia biblica da licao (versiculo-chave) para o feedback.
        referencia: conteudo?.versiculoChave ?? '',
      },
    });
  };

  // V23.5 (D.1): card "Aprenda" — mini-ensino didatico ANTES das perguntas (Brilliant:
  // apresenta o conceito, depois testa). Opcional: "Comecar" segue para as perguntas.
  if (mostrarAprenda && conteudo) {
    return (
      <GradienteRoxo style={styles.fundo}>
        <View style={styles.aprendaContainer}>
          <View style={styles.headerAprenda}>
            <IconeHome />
          </View>
          <ScrollView contentContainerStyle={styles.aprendaScroll} showsVerticalScrollIndicator={false}>
            <PersonagemLivro pose="PENSATIVO" size={180} variante="licoes" />
            <Text style={styles.aprendaTitulo}>APRENDA</Text>
            <View style={styles.aprendaQuadro}>
              <Text style={[styles.aprendaTexto, { fontSize: 17 * fontScale, lineHeight: 25 * fontScale }]}>
                {conteudo.explicacao}
              </Text>
              {conteudo.versiculoChave ? (
                <Text style={styles.aprendaVersiculo}>📖 {conteudo.versiculoChave}</Text>
              ) : null}
              {/* V23.E.4: ouvir o mini-ensino em voz alta. */}
              <Pressable
                style={styles.ouvirBtn}
                onPress={() => falar(conteudo.explicacao)}
                accessibilityRole="button"
                accessibilityLabel="Ouvir o conteúdo em voz alta"
              >
                <Text style={styles.ouvirTexto}>🔊 Ouvir</Text>
              </Pressable>
            </View>
            <Pressable
              style={styles.aprendaBotao}
              onPress={() => {
                lightTap().catch(() => {});
                setMostrarAprenda(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Começar as perguntas"
            >
              <Text style={styles.aprendaBotaoTexto}>COMEÇAR ›</Text>
            </Pressable>
          </ScrollView>
        </View>
      </GradienteRoxo>
    );
  }

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
          <Text style={[styles.pergunta, { fontSize: 18 * fontScale }]}>{perguntaAtual.texto}</Text>
          {/* V23.E.4: ouvir a pergunta em voz alta (TTS pt-BR). */}
          <Pressable
            style={styles.ouvirBtn}
            onPress={() => falar(perguntaAtual.texto)}
            accessibilityRole="button"
            accessibilityLabel="Ouvir a pergunta em voz alta"
          >
            <Text style={styles.ouvirTexto}>🔊 Ouvir</Text>
          </Pressable>
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
          accessibilityRole="button"
          accessibilityLabel={avaliando ? 'Avaliando resposta' : 'Enviar resposta'}
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
  // V23.5 (D.1): card "Aprenda".
  aprendaContainer: {
    flex: 1,
    padding: ESPACAMENTOS.lg,
  },
  headerAprenda: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: ESPACAMENTOS.md,
  },
  aprendaScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACAMENTOS.lg,
    paddingBottom: ESPACAMENTOS.xl,
  },
  aprendaTitulo: {
    fontFamily: FONTES.display,
    fontSize: 40,
    color: COLORS.laranjaClaro,
    letterSpacing: 2,
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  aprendaQuadro: {
    width: '100%',
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaEscuro,
    padding: ESPACAMENTOS.lg,
    gap: ESPACAMENTOS.md,
  },
  aprendaTexto: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 17,
    color: COLORS.preto,
    lineHeight: 25,
    textAlign: 'left',
  },
  aprendaVersiculo: {
    fontFamily: FONTES.bodyExtraBold,
    fontSize: 16,
    color: COLORS.roxoEscuro,
    textAlign: 'right',
  },
  aprendaBotao: {
    backgroundColor: COLORS.laranjaEscuro,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: 3,
    borderColor: COLORS.preto,
  },
  aprendaBotaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 24,
    color: COLORS.branco,
    letterSpacing: 1,
  },
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
  // V23.E.4: botao "ouvir" (TTS) discreto dentro dos quadros de texto.
  ouvirBtn: {
    alignSelf: 'center',
    marginTop: ESPACAMENTOS.sm,
    paddingVertical: 6,
    paddingHorizontal: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioPequeno,
    backgroundColor: COLORS.roxoCard,
    minHeight: 44,
    justifyContent: 'center',
  },
  ouvirTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 14,
    color: COLORS.branco,
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