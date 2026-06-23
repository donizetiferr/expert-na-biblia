import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../../constants/colors';
import { playAcerto, playErro } from '../../../../lib/sound';

/**
 * Tela Final da Atividade (3 variantes <50%/>50%/100%).
 * Regra estrita: 100% necessario para liberar proxima licao.
 */
export default function FinalAtividadeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ moduloId: string; licaoId: string; score?: string }>();
  const score = parseInt(params.score ?? '0', 10);

  const variante =
    score >= 100 ? 'vitoria' : score >= 50 ? 'quase' : 'nao_deu';

  // Tocar som baseado no score ao montar
  useEffect(() => {
    if (variante === 'vitoria') {
      playAcerto().catch(() => {});
    } else if (variante === 'nao_deu') {
      playErro().catch(() => {});
    }
    // variante 'quase' nao toca (nem acerto nem erro - meio termo)
  }, [variante]);

  const configs = {
    vitoria: {
      fundo: COLORS.laranjaEscuro,
      titulo: 'VOCÊ PASSOU!',
      subtitulo: `Lição concluída com ${score}%`,
      botao: 'PRÓXIMA LIÇÃO',
      proxima: true,
    },
    quase: {
      fundo: COLORS.roxoPrimario,
      titulo: 'QUASE LÁ',
      subtitulo: `Você fez ${score}% — Reforce os pontos fracos`,
      botao: 'TENTAR DE NOVO',
      proxima: false,
    },
    nao_deu: {
      fundo: COLORS.erroVermelho,
      titulo: 'NÃO DEU',
      subtitulo: `Apenas ${score}% — Continue estudando`,
      botao: 'RECOMEÇAR',
      proxima: false,
    },
  };

  const cfg = configs[variante];

  return (
    <View style={[styles.container, { backgroundColor: cfg.fundo }]}>
      <Text style={styles.titulo}>{cfg.titulo}</Text>
      <Text style={styles.subtitulo}>{cfg.subtitulo}</Text>

      <Pressable
        style={styles.botao}
        onPress={() => {
          if (cfg.proxima && params.moduloId && params.licaoId) {
            // Avanca para proxima licao
            router.replace(`/licoes/${params.moduloId}`);
          } else if (params.moduloId && params.licaoId) {
            // Recomeca licao atual
            router.replace(`/licoes/${params.moduloId}/${params.licaoId}`);
          }
        }}
      >
        <Text style={styles.botaoTexto}>{cfg.botao}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.lg,
    gap: ESPACAMENTOS.xl,
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 56,
    color: COLORS.branco,
    textAlign: 'center',
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 4,
  },
  subtitulo: {
    fontFamily: FONTES.bodyBold,
    fontSize: 20,
    color: COLORS.branco,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: COLORS.preto,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.laranjaClaro,
  },
});