import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../constants/colors';
import { PersonagemLivro } from '../../../components/PersonagemLivro';
import { listarPerguntas, marcarLicaoConcluida } from '../../../lib/db-queries';
import { matchCanonico } from '../../../lib/matching';
import type { Pergunta } from '../../../types';

type Pose = 'PENSATIVO' | 'FELIZ' | 'ASSUSTADO';

/**
 * Tela Licao: Pergunta (quadro branco + campo de resposta + personagem).
 * Layout: indicator topo "1-30", personagem livro, quadro branco com pergunta,
 * TextInput roxo com borda laranja prefixo "R:", icone som canto inferior direito.
 */
export default function LicaoScreen() {
  const router = useRouter();
  const { moduloId, licaoId } = useLocalSearchParams<{ moduloId: string; licaoId: string }>();
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [resposta, setResposta] = useState('');
  const [pose, setPose] = useState<Pose>('PENSATIVO');
  const [acertos, setAcertos] = useState(0);

  useEffect(() => {
    if (licaoId) listarPerguntas(licaoId).then(setPerguntas);
  }, [licaoId]);

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
    setPose(resultado.correto ? 'FELIZ' : 'ASSUSTADO');
    if (resultado.correto) setAcertos((a) => a + 1);

    setTimeout(() => {
      setPose('PENSATIVO');
      setResposta('');
      const proximo = indice + 1;
      if (proximo >= perguntas.length) {
        // Final da licao
        const pct = Math.round(((acertos + (resultado.correto ? 1 : 0)) / perguntas.length) * 100);
        if (pct === 100) marcarLicaoConcluida(licaoId, pct);
        router.replace(`/licoes/${moduloId}/${licaoId}/final?score=${pct}`);
      } else {
        setIndice(proximo);
      }
    }, 1200);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.indicador}>
          {indice + 1}-{perguntas.length}
        </Text>
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
  header: { alignItems: 'center', marginTop: ESPACAMENTOS.md },
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