import { useEffect, useRef, useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../../../constants/colors';
import { PersonagemLivro } from '../../../../components/PersonagemLivro';
import { GradienteLaranjaForte } from '../../../../components/Gradiente';
import { playCombo, playShake } from '../../../../lib/sound';
import {
  licaoJaConcluida,
  marcarLicaoConcluida,
  marcarModuloConcluido,
  moduloEstaCompleto,
  todosModulosConcluidos,
} from '../../../../lib/db-queries';
import { calcularXpLicao, concederXp } from '../../../../lib/xp';
import { registrarAtividade } from '../../../../lib/streak';
import { verificarMetaEConcederBonus } from '../../../../lib/meta';
import { verificarBadgesLicao, type BadgeDef } from '../../../../lib/badges';
import { abrirBau } from '../../../../lib/bau';
import { ModalBadges } from '../../../../components/ModalBadges';

/**
 * V9 M2.6 + M2.2: Tela Final da Atividade (3 variantes <50%/>50%/100%) com PersonagemLivro pose
 * contextual (EXCLAMANDO para 100% / TRISTE para <50% / PENSATIVO para quase) e navegacao
 * para Trofeu quando TODOS os modulos estao concluidos (M2.6).
 * Regra: 100% necessario para liberar proxima licao.
 */
export default function FinalAtividadeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    moduloId: string;
    licaoId: string;
    score?: string;
    acertos?: string;
    total?: string;
    erradas?: string;
  }>();
  const score = parseInt(params.score ?? '0', 10);
  const acertos = parseInt(params.acertos ?? '0', 10);
  const total = parseInt(params.total ?? '0', 10);
  // V23.A.6: IDs das perguntas ainda nao dominadas (para "refazer so as que faltaram").
  const erradas = params.erradas ? params.erradas.split(',').filter(Boolean) : [];

  const variante =
    score >= 100 ? 'vitoria' : score >= 50 ? 'quase' : 'nao_deu';

  // V23.A.1/A.2/A.3/A.5/B.1: XP ganho, bonus de meta, baú surpresa, badges.
  const [xpGanho, setXpGanho] = useState(0);
  const [metaBonus, setMetaBonus] = useState(0);
  const [bauXp, setBauXp] = useState(0);
  const [badgesNovos, setBadgesNovos] = useState<BadgeDef[]>([]);
  const recompensaAplicadaRef = useRef(false);
  // Navegacao adiada: quando ha modal de badge, navega so apos o usuario fechar.
  const navPendenteRef = useRef<null | (() => void)>(null);

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

  // V23.A.1/A.2: concede XP por esforco (5/acerto + 50 se 100%, com anti-farm em
  // revisita) e registra a atividade do dia (mantem o streak — qualquer pratica conta,
  // nao exige 100%). Roda UMA vez por montagem (ref guard) e ANTES de marcar a licao
  // como concluida, para o anti-farm distinguir 1a conclusao de revisita.
  useEffect(() => {
    if (recompensaAplicadaRef.current) return;
    recompensaAplicadaRef.current = true;
    let ativo = true;
    (async () => {
      try {
        const licaoId = params.licaoId ? String(params.licaoId) : '';
        const jaConcluida = licaoId ? await licaoJaConcluida(licaoId) : false;
        const xp = calcularXpLicao(acertos, score, jaConcluida);
        if (xp > 0) {
          await concederXp(xp, score >= 100 ? 'LICAO' : 'ACERTO');
          if (ativo) setXpGanho(xp);
        }
        // Concluir uma tentativa de licao = praticou hoje -> mantem o streak.
        await registrarAtividade();
        // V23.A.3: se a meta diaria foi batida agora, concede o bonus (1x/dia).
        const bonus = await verificarMetaEConcederBonus();
        if (ativo && bonus > 0) setMetaBonus(bonus);
        // V23.A.5: ao concluir a licao 100%, chance de baú surpresa com bonus de XP.
        if (score >= 100) {
          const bau = await abrirBau();
          if (ativo && bau > 0) setBauXp(bau);
        }
      } catch (e) {
        console.warn('[xp] concessao na tela final falhou:', e);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [acertos, score, params.licaoId]);

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
      titulo: 'QUASE LÁ!',
      // V23.A.6: tom de PROGRESSO (nao de punicao) — mostra o que ja acertou.
      subtitulo: total > 0 ? `Faltou pouco! Você acertou ${acertos} de ${total}.` : `Você fez ${score}%. Faltou pouco!`,
      botao: 'TENTAR DE NOVO',
      proxima: false,
    },
    nao_deu: {
      // V10 M5.6: laranja forte (briefing usa laranja, nao vermelho)
      fundo: COLORS.laranjaForte,
      pose: 'PENSATIVO' as const,
      titulo: 'VOCÊ CONSEGUE!',
      // V23.A.6: encorajador, nunca "NÃO DEU" seco.
      subtitulo: total > 0 ? `Você acertou ${acertos} de ${total}. Bora reforçar!` : `Você fez ${score}%. Bora reforçar!`,
      botao: 'RECOMEÇAR',
      proxima: false,
    },
  };

  const cfg = configs[variante];

  const handleAvancar = async () => {
    // Destino padrao (calculado depois de marcar conclusao).
    let destino: () => void = () => {
      if (cfg.proxima && params.moduloId && params.licaoId) {
        router.replace(`/licoes/${params.moduloId}`);
      } else if (params.moduloId && params.licaoId) {
        router.replace(`/licoes/${params.moduloId}/${params.licaoId}`);
      }
    };

    let novosBadges: BadgeDef[] = [];

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
      // V23.B.1: agora que o modulo/streak estao atualizados, verifica conquistas.
      novosBadges = await verificarBadgesLicao();
      // V9 M2.6: checa se todos modulos foram concluidos -> Trofeu
      const todos = await todosModulosConcluidos();
      if (todos) {
        destino = () => router.replace('/trofeu');
      }
    }

    // V23.B.1: se desbloqueou badge(s), celebra primeiro; navega ao fechar o modal.
    if (novosBadges.length > 0) {
      navPendenteRef.current = destino;
      setBadgesNovos(novosBadges);
      return;
    }
    destino();
  };

  const fecharModalBadges = () => {
    setBadgesNovos([]);
    const nav = navPendenteRef.current;
    navPendenteRef.current = null;
    if (nav) nav();
  };

  // V23.A.6: refazer SO as perguntas ainda nao dominadas (caminho curto e positivo
  // ate o 100%, sem refazer a licao inteira).
  const refazerFaltaram = () => {
    if (!params.moduloId || !params.licaoId || erradas.length === 0) return;
    router.replace({
      pathname: `/licoes/${params.moduloId}/${params.licaoId}`,
      params: {
        moduloId: String(params.moduloId),
        licaoId: String(params.licaoId),
        indice: '0',
        acertos: '0',
        somente: erradas.join(','),
      },
    });
  };

  return (
    <GradienteLaranjaForte style={styles.container}>
      <PersonagemLivro pose={cfg.pose} size={160} variante="licoes" />
      <Text style={styles.titulo}>{cfg.titulo}</Text>
      <Text style={styles.subtitulo}>{cfg.subtitulo}</Text>

      {/* V23.A.1: recompensa de XP visivel (esforco sempre recompensado). */}
      {xpGanho > 0 ? (
        <Text style={styles.xpBadge} accessibilityLabel={`Você ganhou ${xpGanho} pontos de experiência`}>
          +{xpGanho} XP
        </Text>
      ) : null}

      {/* V23.A.3: celebracao do bonus de meta diaria. */}
      {metaBonus > 0 ? (
        <Text style={styles.metaBonus} accessibilityLabel={`Meta diária batida! Bônus de ${metaBonus} pontos de experiência`}>
          🎯 Meta diária batida! +{metaBonus} XP
        </Text>
      ) : null}

      {/* V23.A.5: baú surpresa (recompensa variavel). */}
      {bauXp > 0 ? (
        <Text style={styles.bauBonus} accessibilityLabel={`Baú surpresa! Bônus de ${bauXp} pontos de experiência`}>
          🎁 Baú surpresa! +{bauXp} XP
        </Text>
      ) : null}

      {/* V23.A.6: em nao-vitoria com erradas, oferece refazer SO as que faltaram (caminho
          curto ate o 100%) + refazer tudo. Na vitoria, segue o botao unico padrao. */}
      {variante !== 'vitoria' && erradas.length > 0 ? (
        <>
          <Pressable style={styles.botao} onPress={refazerFaltaram}>
            <Text style={styles.botaoTexto}>REFAZER AS QUE FALTARAM ({erradas.length})</Text>
          </Pressable>
          <Pressable style={[styles.botao, styles.botaoSecundario]} onPress={handleAvancar}>
            <Text style={[styles.botaoTexto, styles.botaoTextoSecundario]}>REFAZER TUDO</Text>
          </Pressable>
        </>
      ) : (
        <Pressable style={styles.botao} onPress={handleAvancar}>
          <Text style={styles.botaoTexto}>{cfg.botao}</Text>
        </Pressable>
      )}

      {/* V23.B.1: modal de conquistas (navega ao fechar). */}
      <ModalBadges badges={badgesNovos} onClose={fecharModalBadges} />
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
  // V23.A.1: pílula de XP com destaque (fundo preto, texto amarelo — paleta oficial).
  xpBadge: {
    fontFamily: FONTES.display,
    fontSize: 30,
    color: COLORS.laranjaClaro,
    backgroundColor: COLORS.preto,
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingVertical: ESPACAMENTOS.xs,
    borderRadius: BORDAS.raioMedio,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  // V23.A.3: faixa de bonus de meta diaria.
  metaBonus: {
    fontFamily: FONTES.bodyExtraBold,
    fontSize: 16,
    color: COLORS.preto,
    backgroundColor: COLORS.laranjaClaro,
    paddingHorizontal: ESPACAMENTOS.md,
    paddingVertical: ESPACAMENTOS.xs,
    borderRadius: BORDAS.raioMedio,
    overflow: 'hidden',
    textAlign: 'center',
  },
  // V23.A.5: faixa do baú surpresa.
  bauBonus: {
    fontFamily: FONTES.bodyExtraBold,
    fontSize: 16,
    color: COLORS.branco,
    backgroundColor: COLORS.roxoPrimario,
    paddingHorizontal: ESPACAMENTOS.md,
    paddingVertical: ESPACAMENTOS.xs,
    borderRadius: BORDAS.raioMedio,
    overflow: 'hidden',
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
    textAlign: 'center',
  },
  // V23.A.6: botao secundario "refazer tudo".
  botaoSecundario: {
    marginTop: ESPACAMENTOS.sm,
    backgroundColor: 'transparent',
    borderColor: COLORS.branco,
  },
  botaoTextoSecundario: {
    fontSize: 18,
    color: COLORS.branco,
  },
});
