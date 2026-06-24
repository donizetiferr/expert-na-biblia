import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../constants/colors';
import { PersonagemLivro } from '../../../components/PersonagemLivro';
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

  useEffect(() => {
    if (licaoId) listarPerguntas(licaoId).then(setPerguntas);
  }, [licaoId]);

  // Quando params.indice muda (deep link do feedback), sincroniza estado
  useEffect(() => {
    const p = parseInt(params.indice ?? '0', 10);
    if (!Number.isNaN(p) && p !== indice) {
      setIndice(p);
      setResposta('');
      setPose('PENSATIVO');
    }
  }, [params.indice]);

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
        <PersonagemLivro pose={pose} size={110} />

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.roxoEscuro,
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
  quadro: {
    backgroundColor: COLORS.branco,
    padding: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioMedio,
    minHeight: 120,
    justifyContent: 'center',
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