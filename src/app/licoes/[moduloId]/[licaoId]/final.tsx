import { useEffect } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../../constants/colors';
import { PersonagemLivro } from '../../../../components/PersonagemLivro';
import { GradienteLaranjaForte } from '../../../../components/Gradiente';
import { playCombo, playShake } from '../../../../lib/sound';
import {
  marcarLicaoConcluida,
  marcarModuloConcluido,
  moduloEstaCompleto,
  todosModulosConcluidos,
} from '../../../../lib/db-queries';

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
      // V13 14.1.2: 100% merece playCombo (combo de 3+ acertos seguidos).
      playCombo().catch((e: unknown) =>
        console.warn('[audio] final vitoria playCombo falhou:', e),
      );
    } else if (variante === 'nao_deu') {
      // V13 14.1.2: <50% merece playShake (mais expressivo que playErro generico).
      playShake().catch((e: unknown) =>
        console.warn('[audio] final nao_deu playShake falhou:', e),
      );
    }
    // 'quase' (50-99%): sem SFX especifico, mantem silencio (briefing nao define).
  }, [variante]);

  const configs = {
    vitoria: {
      // V10 M5.6: briefing diz laranja forte #fe8917, nao erroVermelho
      fundo: COLORS.laranjaForte,
      pose: 'EXCLAMANDO' as const,
      titulo: 'VOCÊ PASSOU!',
      subtitulo: `Lição concluída com ${score}%`,
      botao: 'PRÓXIMA LIÇÃO',
      proxima: true,
    },
    quase: {
      // V10 M5.6: laranja medio #fea726
      fundo: COLORS.laranjaMedio,
      pose: 'PENSATIVO' as const,
      titulo: 'QUASE LÁ',
      subtitulo: `Você fez ${score}% — Reforce os pontos fracos`,
      botao: 'TENTAR DE NOVO',
      proxima: false,
    },
    nao_deu: {
      // V10 M5.6: laranja forte (briefing usa laranja, nao vermelho)
      fundo: COLORS.laranjaForte,
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
      // V18.1 MA.5: se TODAS as licoes do modulo ficaram concluidas, marca o MODULO
      // como concluido — isso desbloqueia o proximo modulo (licoes/index liberado())
      // e habilita o trofeu (todosModulosConcluidos). Antes nada gravava modulo=1.
      if (params.moduloId) {
        const completo = await moduloEstaCompleto(params.moduloId);
        if (completo) {
          await marcarModuloConcluido(params.moduloId);
        }
      }
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
    <GradienteLaranjaForte style={styles.container}>
      <PersonagemLivro pose={cfg.pose} size={160} variante="licoes" />
      <Text style={styles.titulo}>{cfg.titulo}</Text>
      <Text style={styles.subtitulo}>{cfg.subtitulo}</Text>

      <Pressable style={styles.botao} onPress={handleAvancar}>
        <Text style={styles.botaoTexto}>{cfg.botao}</Text>
      </Pressable>
    </GradienteLaranjaForte>
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
