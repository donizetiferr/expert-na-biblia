import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../../constants/colors';
import { PersonagemLivro } from '../../../../components/PersonagemLivro';
import { playAcerto, playErro } from '../../../../lib/sound';
import { marcarLicaoConcluida, todosModulosConcluidos } from '../../../../lib/db-queries';

/**
 * V9 M2.6 + M2.2: Tela Final da Atividade (3 variantes <50%/>50%/100%) com PersonagemLivro pose
 * contextual (EXCLAMANDO para 100% / TRISTE para <50% / PENSATIVO para quase) e navegacao
 * para Trofeu quando TODOS os modulos estao concluidos (M2.6).
 * Regra: 100% necessario para liberar proxima licao.
 */
export default function FinalAtividadeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ moduloId: string; licaoId: string; score?: string }>();
  const score = parseInt(params.score ?? '0', 10);

  const variante =
    score >= 100 ? 'vitoria' : score >= 50 ? 'quase' : 'nao_deu';

  useEffect(() => {
    if (variante === 'vitoria') {
      playAcerto().catch(() => {});
    } else if (variante === 'nao_deu') {
      playErro().catch(() => {});
    }
  }, [variante]);

  const configs = {
    vitoria: {
      fundo: COLORS.laranjaEscuro,
      pose: 'EXCLAMANDO' as const,
      titulo: 'VOCÊ PASSOU!',
      subtitulo: `Lição concluída com ${score}%`,
      botao: 'PRÓXIMA LIÇÃO',
      proxima: true,
    },
    quase: {
      fundo: COLORS.avisoAmarelo,
      pose: 'PENSATIVO' as const,
      titulo: 'QUASE LÁ',
      subtitulo: `Você fez ${score}% — Reforce os pontos fracos`,
      botao: 'TENTAR DE NOVO',
      proxima: false,
    },
    nao_deu: {
      fundo: COLORS.erroVermelho,
      pose: 'TRISTE' as const,
      titulo: 'NÃO DEU',
      subtitulo: `Apenas ${score}% — Continue estudando`,
      botao: 'RECOMEÇAR',
      proxima: false,
    },
  };

  const cfg = configs[variante];

  const handleAvancar = async () => {
    if (variante === 'vitoria' && params.licaoId) {
      // Marca licao como concluida no DB
      await marcarLicaoConcluida(params.licaoId, 100);
      // V9 M2.6: checa se todos modulos foram concluidos -> Trofeu
      const todos = await todosModulosConcluidos();
      if (todos) {
        router.replace('/trofeu');
        return;
      }
    }
    if (cfg.proxima && params.moduloId && params.licaoId) {
      router.replace(`/licoes/${params.moduloId}`);
    } else if (params.moduloId && params.licaoId) {
      router.replace(`/licoes/${params.moduloId}/${params.licaoId}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: cfg.fundo }]}>
      <PersonagemLivro pose={cfg.pose} size={140} />
      <Text style={styles.titulo}>{cfg.titulo}</Text>
      <Text style={styles.subtitulo}>{cfg.subtitulo}</Text>

      <Pressable style={styles.botao} onPress={handleAvancar}>
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
    gap: ESPACAMENTOS.lg,
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
    marginTop: ESPACAMENTOS.lg,
    backgroundColor: COLORS.preto,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: 3,
    borderColor: COLORS.laranjaEscuro,
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.laranjaClaro,
  },
});
