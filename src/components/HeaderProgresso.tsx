import { View, Text, StyleSheet } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { obterResumoXp } from '../lib/xp';
import { obterStreak } from '../lib/streak';
import { obterMetaStatus, type MetaStatus } from '../lib/meta';
import { contarModulos } from '../lib/db-queries';
import { obterCorTema } from '../lib/cosmeticos';
import type { XpResumo } from '../types';

/**
 * V23.A.1/A.2/A.3/B.3: faixa de progresso reutilizavel:
 * - streak (dias seguidos) + nivel (pills)
 * - barra de XP do nivel atual
 * - meta diaria (XP de hoje / meta) + progresso GLOBAL de modulos (X/40)
 * Recarrega ao FOCAR a tela (useFocusEffect) — atualiza ao voltar de uma licao/quiz.
 * Read-only (sem efeitos colaterais).
 */
export function HeaderProgresso() {
  const [xp, setXp] = useState<XpResumo | null>(null);
  const [dias, setDias] = useState(0);
  const [meta, setMeta] = useState<MetaStatus | null>(null);
  const [modulos, setModulos] = useState<{ total: number; concluidos: number }>({ total: 40, concluidos: 0 });
  // V23.8 (H.3): cor de acento do tema cosmetico equipado (default laranjaForte).
  const [accent, setAccent] = useState<string>(COLORS.laranjaForte);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          const [resumo, streak, metaStatus, mods, cor] = await Promise.all([
            obterResumoXp(),
            obterStreak(),
            obterMetaStatus(),
            contarModulos(),
            obterCorTema(),
          ]);
          if (!ativo) return;
          setXp(resumo);
          setDias(streak.dias_consecutivos);
          setMeta(metaStatus);
          setModulos(mods);
          setAccent(cor);
        } catch {
          // silencioso — header e' informativo, nao critico
        }
      })();
      return () => {
        ativo = false;
      };
    }, []),
  );

  const nivel = xp?.nivel ?? 1;
  const total = xp?.total ?? 0;
  const progresso = xp?.progresso ?? 0;
  const metaFracao = meta?.fracao ?? 0;
  const metaBatida = meta?.batida ?? false;
  const modFracao = modulos.total > 0 ? modulos.concluidos / modulos.total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.linhaTopo}>
        <View style={styles.pill} accessibilityRole="text" accessibilityLabel={`${dias} dias seguidos`}>
          <Text style={styles.pillTexto}>🔥 {dias}</Text>
        </View>
        <View style={styles.pill} accessibilityRole="text" accessibilityLabel={`Nível ${nivel}`}>
          <Text style={styles.pillTexto}>NÍVEL {nivel}</Text>
        </View>
      </View>

      <View style={styles.barraFundo}>
        <View style={[styles.barraPreenchida, { width: `${Math.round(progresso * 100)}%`, backgroundColor: accent }]} />
      </View>
      <Text style={styles.xpTexto} accessibilityLabel={`${total} pontos de experiência, nível ${nivel}`}>
        {total} XP · Nível {nivel}
      </Text>

      {/* V23.A.3: meta diaria */}
      <View style={styles.linhaMeta}>
        <Text style={styles.metaLabel} accessibilityLabel={`Meta de hoje: ${meta?.progresso ?? 0} de ${meta?.meta ?? 0} XP`}>
          🎯 Meta de hoje {metaBatida ? '✓' : ''}
        </Text>
        <Text style={styles.metaValor}>
          {meta?.progresso ?? 0}/{meta?.meta ?? 0} XP
        </Text>
      </View>
      <View style={styles.barraMetaFundo}>
        <View
          style={[
            styles.barraMetaPreenchida,
            { width: `${Math.round(metaFracao * 100)}%` },
            metaBatida && styles.barraMetaBatida,
          ]}
        />
      </View>

      {/* V23.B.3: progresso global de modulos */}
      <View style={styles.linhaMeta}>
        <Text style={styles.metaLabel}>📚 Módulos</Text>
        <Text style={styles.metaValor}>
          {modulos.concluidos}/{modulos.total}
        </Text>
      </View>
      <View style={styles.barraMetaFundo}>
        <View style={[styles.barraModulos, { width: `${Math.round(modFracao * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingBottom: ESPACAMENTOS.md,
    gap: ESPACAMENTOS.xs,
  },
  linhaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ESPACAMENTOS.xs,
  },
  pill: {
    backgroundColor: COLORS.roxoEscuro,
    paddingHorizontal: ESPACAMENTOS.md,
    paddingVertical: ESPACAMENTOS.xs,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaBorda,
  },
  pillTexto: {
    fontFamily: FONTES.display,
    fontSize: 20,
    color: COLORS.laranjaClaro,
    letterSpacing: 1,
  },
  barraFundo: {
    height: 14,
    backgroundColor: COLORS.cinzaClaro,
    borderRadius: BORDAS.raioPequeno,
    borderWidth: BORDAS.larguraFina,
    borderColor: COLORS.preto,
    overflow: 'hidden',
  },
  barraPreenchida: {
    height: '100%',
    backgroundColor: COLORS.laranjaForte,
  },
  xpTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 13,
    color: COLORS.roxoEscuro,
    textAlign: 'center',
    marginBottom: ESPACAMENTOS.xs,
  },
  linhaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontFamily: FONTES.bodyBold,
    fontSize: 13,
    color: COLORS.roxoEscuro,
  },
  metaValor: {
    fontFamily: FONTES.bodyExtraBold,
    fontSize: 13,
    color: COLORS.roxoEscuro,
  },
  barraMetaFundo: {
    height: 10,
    backgroundColor: COLORS.cinzaClaro,
    borderRadius: BORDAS.raioPequeno,
    borderWidth: BORDAS.larguraFina,
    borderColor: COLORS.preto,
    overflow: 'hidden',
  },
  barraMetaPreenchida: {
    height: '100%',
    backgroundColor: COLORS.roxoPrimario,
  },
  barraMetaBatida: {
    backgroundColor: COLORS.acertoVerde,
  },
  barraModulos: {
    height: '100%',
    backgroundColor: COLORS.laranjaEscuro,
  },
});
