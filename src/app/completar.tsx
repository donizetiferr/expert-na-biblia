import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { GradienteRoxo } from '../components/Gradiente';
import { IconeHome } from '../components/IconeHome';
import { listarCompletar, type ItemCompletar } from '../lib/completar';
import { concederXp, XP_POR_ACERTO } from '../lib/xp';
import { registrarAtividade } from '../lib/streak';
import { playAcerto, playErro } from '../lib/sound';
import { successBuzz, errorBuzz } from '../lib/haptics';

const TOTAL = 8;

/**
 * V23.5 (D.3): novo formato "Completar Versiculo".
 * Mostra um versiculo conhecido com uma lacuna e 4 opcoes; o jogador escolhe a palavra
 * que completa. Recall ativo (reforca memorizacao) — recompensa XP e mantem o streak.
 */
export default function CompletarScreen() {
  const router = useRouter();
  const [itens, setItens] = useState<ItemCompletar[]>([]);
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fim, setFim] = useState(false);

  useEffect(() => {
    listarCompletar(TOTAL)
      .then((lista) => setItens(lista))
      .finally(() => setLoading(false));
  }, []);

  const item = itens[indice];

  const escolher = (opcao: string) => {
    if (escolha !== null) return;
    setEscolha(opcao);
    const certo = opcao === item?.resposta;
    if (certo) {
      setAcertos((a) => a + 1);
      playAcerto().catch(() => {});
      successBuzz().catch(() => {}); // V23.E.6
    } else {
      playErro().catch(() => {});
      errorBuzz().catch(() => {}); // V23.E.6
    }
  };

  const avancar = async () => {
    if (indice + 1 >= itens.length) {
      // Recompensa: XP por acerto + conta como pratica do dia (mantem o streak).
      const ganho = acertos * XP_POR_ACERTO;
      if (ganho > 0) await concederXp(ganho, 'QUIZ');
      await registrarAtividade().catch(() => {});
      setFim(true);
    } else {
      setEscolha(null);
      setIndice((i) => i + 1);
    }
  };

  if (loading) {
    return (
      <GradienteRoxo style={styles.fundoCentro}>
        <ActivityIndicator size="large" color={COLORS.laranjaClaro} />
      </GradienteRoxo>
    );
  }

  if (itens.length === 0) {
    return (
      <GradienteRoxo style={styles.fundoCentro}>
        <Text style={styles.vazioTitulo}>Em breve!</Text>
        <Text style={styles.vazioTexto}>Os versículos para completar ainda estão sendo preparados.</Text>
        <Pressable style={styles.botao} onPress={() => router.replace('/modos')}>
          <Text style={styles.botaoTexto}>VOLTAR</Text>
        </Pressable>
      </GradienteRoxo>
    );
  }

  if (fim) {
    const score = Math.round((acertos / itens.length) * 100);
    return (
      <GradienteRoxo style={styles.fundoCentro}>
        <Text style={styles.fimTitulo}>{score >= 70 ? 'MUITO BEM!' : 'CONTINUE!'}</Text>
        <Text style={styles.fimTexto}>
          Você completou {acertos} de {itens.length} versículos.
        </Text>
        {acertos > 0 ? <Text style={styles.fimXp}>+{acertos * XP_POR_ACERTO} XP</Text> : null}
        <Pressable
          style={styles.botao}
          onPress={() => {
            setLoading(true);
            setFim(false);
            setIndice(0);
            setEscolha(null);
            setAcertos(0);
            listarCompletar(TOTAL)
              .then((lista) => setItens(lista))
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.botaoTexto}>JOGAR DE NOVO</Text>
        </Pressable>
        <Pressable style={[styles.botao, styles.botaoSecundario]} onPress={() => router.replace('/modos')}>
          <Text style={[styles.botaoTexto, styles.botaoTextoSecundario]}>VOLTAR</Text>
        </Pressable>
      </GradienteRoxo>
    );
  }

  if (!item) return null;

  return (
    <GradienteRoxo style={styles.fundo}>
      <View style={styles.header}>
        <Text style={styles.indicador}>
          {indice + 1}/{itens.length}
        </Text>
        <Text style={styles.titulo}>COMPLETE O VERSÍCULO</Text>
        <IconeHome />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.quadro}>
          <Text style={styles.versiculo}>{item.textoComLacuna}</Text>
          <Text style={styles.referencia}>— {item.referencia}</Text>
        </View>

        <View style={styles.opcoes}>
          {item.opcoes.map((op, i) => {
            const selecionada = escolha === op;
            const revela = escolha !== null;
            const correta = op === item.resposta;
            return (
              <Pressable
                key={i}
                style={[
                  styles.opcao,
                  (!revela || (!correta && !selecionada)) && styles.opcaoNormal,
                  revela && correta && styles.opcaoCerta,
                  revela && selecionada && !correta && styles.opcaoErrada,
                ]}
                onPress={() => escolher(op)}
                disabled={revela}
                accessibilityRole="button"
                accessibilityLabel={op}
              >
                <Text style={[styles.opcaoLetra, (revela && (correta || selecionada)) && styles.opcaoTextoForte]}>
                  {String.fromCharCode(65 + i)}
                </Text>
                <Text style={[styles.opcaoTexto, (revela && (correta || selecionada)) && styles.opcaoTextoForte]}>
                  {op}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {escolha !== null ? (
          <Pressable style={styles.botao} onPress={avancar}>
            <Text style={styles.botaoTexto}>{indice + 1 >= itens.length ? 'FINALIZAR' : 'PRÓXIMO ›'}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </GradienteRoxo>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, padding: ESPACAMENTOS.lg },
  fundoCentro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.lg,
    gap: ESPACAMENTOS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: ESPACAMENTOS.md,
  },
  indicador: { fontFamily: FONTES.bodyBold, fontSize: 18, color: COLORS.laranjaClaro, width: 48 },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 20,
    color: COLORS.branco,
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  scroll: { flexGrow: 1, justifyContent: 'center', gap: ESPACAMENTOS.lg, paddingVertical: ESPACAMENTOS.lg },
  quadro: {
    backgroundColor: COLORS.branco,
    padding: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
    gap: ESPACAMENTOS.sm,
  },
  versiculo: { fontFamily: FONTES.bodyBold, fontSize: 18, color: COLORS.preto, lineHeight: 26, textAlign: 'center' },
  referencia: { fontFamily: FONTES.bodyExtraBold, fontSize: 14, color: COLORS.roxoEscuro, textAlign: 'right' },
  opcoes: { gap: ESPACAMENTOS.sm },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    gap: ESPACAMENTOS.md,
  },
  opcaoNormal: {
    backgroundColor: COLORS.roxoPrimario,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaEscuro,
  },
  opcaoCerta: {
    backgroundColor: COLORS.acertoVerde,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
  },
  opcaoErrada: {
    backgroundColor: COLORS.erroVermelho,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
  },
  opcaoLetra: { fontFamily: FONTES.display, fontSize: 22, color: COLORS.laranjaClaro, width: 28, textAlign: 'center' },
  opcaoTexto: { fontFamily: FONTES.bodyRegular, fontSize: 16, color: COLORS.branco, flex: 1 },
  opcaoTextoForte: { color: COLORS.preto, fontFamily: FONTES.bodyBold },
  botao: {
    backgroundColor: COLORS.laranjaEscuro,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: 3,
    borderColor: COLORS.preto,
    alignItems: 'center',
  },
  botaoSecundario: { backgroundColor: 'transparent', borderColor: COLORS.branco },
  botaoTexto: { fontFamily: FONTES.display, fontSize: 22, color: COLORS.branco, letterSpacing: 1 },
  botaoTextoSecundario: { color: COLORS.branco },
  vazioTitulo: { fontFamily: FONTES.display, fontSize: 36, color: COLORS.laranjaClaro },
  vazioTexto: { fontFamily: FONTES.bodyRegular, fontSize: 16, color: COLORS.branco, textAlign: 'center' },
  fimTitulo: { fontFamily: FONTES.display, fontSize: 44, color: COLORS.laranjaClaro, textAlign: 'center' },
  fimTexto: { fontFamily: FONTES.bodyBold, fontSize: 18, color: COLORS.branco, textAlign: 'center' },
  fimXp: {
    fontFamily: FONTES.display,
    fontSize: 28,
    color: COLORS.laranjaClaro,
    backgroundColor: COLORS.preto,
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingVertical: ESPACAMENTOS.xs,
    borderRadius: BORDAS.raioMedio,
    overflow: 'hidden',
  },
});
