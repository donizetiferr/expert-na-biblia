import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { contarModulosPorArea } from '../lib/db-queries';

/**
 * V23.8 (H.2): Mapa de colecoes por area. Cada uma das 4 areas (FB/AT/NT/TE) e uma
 * "colecao" a completar — senso de completude ("complete o NT"). Mostra progresso por
 * area (concluidos/total + barra + %), com um trofeu quando a area chega a 100%.
 */
const AREA_INFO: Record<string, { nome: string; emoji: string; cor: string }> = {
  FB: { nome: 'Fundamentos Bíblicos', emoji: '📘', cor: COLORS.roxoPrimario },
  AT: { nome: 'Antigo Testamento', emoji: '📜', cor: COLORS.laranjaForte },
  NT: { nome: 'Novo Testamento', emoji: '✝️', cor: COLORS.roxoCard },
  TE: { nome: 'Teologia', emoji: '🕊️', cor: COLORS.laranjaEscuro },
};

export default function ColecoesScreen() {
  const router = useRouter();
  const [areas, setAreas] = useState<Array<{ area: string; total: number; concluidos: number }>>([]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      contarModulosPorArea().then((a) => {
        if (ativo) setAreas(a);
      });
      return () => {
        ativo = false;
      };
    }, []),
  );

  const totalGeral = areas.reduce((s, a) => s + a.total, 0);
  const feitoGeral = areas.reduce((s, a) => s + a.concluidos, 0);

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} style={styles.voltar} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.tituloTela}>Coleções</Text>
        <View style={styles.voltar} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitulo}>
          Complete cada área da Bíblia e colecione todas as {totalGeral || 40} jornadas.
        </Text>

        {areas.length === 0 ? (
          <Text style={styles.vazio}>Carregando coleções…</Text>
        ) : (
          areas.map((a) => {
            const info = AREA_INFO[a.area] ?? { nome: a.area, emoji: '📖', cor: COLORS.roxoPrimario };
            const fracao = a.total > 0 ? a.concluidos / a.total : 0;
            const completo = a.total > 0 && a.concluidos === a.total;
            return (
              <Pressable
                key={a.area}
                style={[styles.card, completo && styles.cardCompleto]}
                onPress={() => router.push('/licoes')}
                accessibilityRole="button"
                accessibilityLabel={`${info.nome}: ${a.concluidos} de ${a.total} módulos${completo ? ', coleção completa' : ''}`}
              >
                <View style={styles.cardTopo}>
                  <Text style={styles.cardEmoji}>{completo ? '🏆' : info.emoji}</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardNome}>{info.nome}</Text>
                    <Text style={styles.cardContagem}>
                      {a.concluidos}/{a.total} módulos · {Math.round(fracao * 100)}%
                    </Text>
                  </View>
                </View>
                <View style={styles.barraFundo}>
                  <View style={[styles.barra, { width: `${Math.round(fracao * 100)}%`, backgroundColor: completo ? COLORS.acertoVerde : info.cor }]} />
                </View>
                {completo ? <Text style={styles.completoTag}>COLEÇÃO COMPLETA!</Text> : null}
              </Pressable>
            );
          })
        )}

        {areas.length > 0 ? (
          <View style={styles.totalCard}>
            <Text style={styles.totalTexto}>
              Total: {feitoGeral}/{totalGeral} módulos colecionados
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.creme },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: ESPACAMENTOS.xl,
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingBottom: ESPACAMENTOS.sm,
  },
  voltar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  voltarTexto: { fontFamily: FONTES.display, fontSize: 40, color: COLORS.roxoEscuro },
  tituloTela: { fontFamily: FONTES.display, fontSize: 30, color: COLORS.roxoEscuro, letterSpacing: 1 },
  scroll: { paddingHorizontal: ESPACAMENTOS.lg, paddingBottom: ESPACAMENTOS.xxl, gap: ESPACAMENTOS.md },
  subtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 14,
    color: COLORS.cinzaEscuro,
    textAlign: 'center',
    marginBottom: ESPACAMENTOS.xs,
  },
  vazio: { fontFamily: FONTES.bodyRegular, fontSize: 14, color: COLORS.cinzaEscuro, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaForte,
    padding: ESPACAMENTOS.md,
    gap: ESPACAMENTOS.sm,
  },
  cardCompleto: { borderColor: COLORS.acertoVerde },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: ESPACAMENTOS.md },
  cardEmoji: { fontSize: 38 },
  cardInfo: { flex: 1, gap: 2 },
  cardNome: { fontFamily: FONTES.bodyExtraBold, fontSize: 17, color: COLORS.roxoEscuro },
  cardContagem: { fontFamily: FONTES.bodyBold, fontSize: 13, color: COLORS.cinzaEscuro },
  barraFundo: {
    height: 14,
    backgroundColor: COLORS.cinzaClaro,
    borderRadius: BORDAS.raioPequeno,
    borderWidth: BORDAS.larguraFina,
    borderColor: COLORS.preto,
    overflow: 'hidden',
  },
  barra: { height: '100%' },
  completoTag: {
    fontFamily: FONTES.display,
    fontSize: 16,
    color: COLORS.acertoVerde,
    letterSpacing: 1,
    textAlign: 'center',
  },
  totalCard: {
    backgroundColor: COLORS.roxoEscuro,
    borderRadius: BORDAS.raioMedio,
    padding: ESPACAMENTOS.md,
    alignItems: 'center',
    marginTop: ESPACAMENTOS.xs,
  },
  totalTexto: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.laranjaClaro },
});
