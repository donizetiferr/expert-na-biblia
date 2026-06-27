import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { HeaderProgresso } from '../components/HeaderProgresso';
import { PersonagemLivro } from '../components/PersonagemLivro';
import { BADGES, listarBadgesDesbloqueadas } from '../lib/badges';
import { listarRankings, contarModulosPorArea, obterRecordes } from '../lib/db-queries';
import { obterResumoXp } from '../lib/xp';
import { obterCorAura } from '../lib/cosmeticos';

/**
 * V23.B.2: Tela de Perfil / "Meu Progresso". Centraliza o "porque continuar":
 * streak + XP/nivel + meta + % global (via HeaderProgresso), galeria de badges,
 * detalhamento por area e historico de pontuacoes (le user_rankings — antes morto).
 */
const AREA_NOMES: Record<string, string> = {
  FB: 'Fundamentos Bíblicos',
  AT: 'Antigo Testamento',
  NT: 'Novo Testamento',
  TE: 'Teologia',
};

export default function PerfilScreen() {
  const router = useRouter();
  const [desbloqueadas, setDesbloqueadas] = useState<Set<string>>(new Set());
  const [areas, setAreas] = useState<Array<{ area: string; total: number; concluidos: number }>>([]);
  const [historico, setHistorico] = useState<Array<{ data: string; score: number; tipo: string }>>([]);
  // V23.B.6: nivel do mascote | V23.B.4: recordes pessoais.
  const [nivel, setNivel] = useState(1);
  const [recordes, setRecordes] = useState<{ quiz: number; licoes: number }>({ quiz: 0, licoes: 0 });
  // V23.8 (H.3): aura cosmetica equipada do mascote.
  const [auraCor, setAuraCor] = useState('#fded48');

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          const [badges, areasData, rankings, resumo, recs, aura] = await Promise.all([
            listarBadgesDesbloqueadas(),
            contarModulosPorArea(),
            listarRankings(10),
            obterResumoXp(),
            obterRecordes(),
            obterCorAura(),
          ]);
          if (!ativo) return;
          setDesbloqueadas(new Set(badges.map((b) => b.tipo)));
          setAreas(areasData);
          setHistorico(rankings);
          setNivel(resumo.nivel);
          setRecordes(recs);
          setAuraCor(aura);
        } catch {
          // silencioso
        }
      })();
      return () => {
        ativo = false;
      };
    }, []),
  );

  const todosBadges = Object.values(BADGES);
  const totalDesbloqueadas = todosBadges.filter((b) => desbloqueadas.has(b.tipo)).length;

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} style={styles.voltar} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.tituloTela}>Meu Progresso</Text>
        <View style={styles.voltar} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* V23.B.6: mascote evolui com o nivel (aura dourada cresce). */}
        <View style={styles.mascoteWrapper}>
          <PersonagemLivro pose="EXCLAMANDO" size={120} variante="licoes" nivel={nivel} auraCor={auraCor} />
          <Text style={styles.mascoteNivel}>Nível {nivel}</Text>
        </View>

        <HeaderProgresso />

        {/* V23.B.4: recordes pessoais (meta a superar) */}
        {recordes.quiz > 0 || recordes.licoes > 0 ? (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Recordes</Text>
            <View style={styles.areaLinha}>
              <Text style={styles.areaNome}>🎲 Melhor Quiz</Text>
              <Text style={styles.areaValor}>{Math.round(recordes.quiz * 100)}%</Text>
            </View>
          </View>
        ) : null}

        {/* Detalhamento por area */}
        {areas.length > 0 ? (
          <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>Por área</Text>
            {areas.map((a) => (
              <View key={a.area} style={styles.areaLinha}>
                <Text style={styles.areaNome}>{AREA_NOMES[a.area] ?? a.area}</Text>
                <Text style={styles.areaValor}>
                  {a.concluidos}/{a.total}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Galeria de badges */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>
            Conquistas ({totalDesbloqueadas}/{todosBadges.length})
          </Text>
          <View style={styles.badgesGrid}>
            {todosBadges.map((b) => {
              const ativo = desbloqueadas.has(b.tipo);
              return (
                <View
                  key={b.tipo}
                  style={[styles.badge, ativo ? styles.badgeAtivo : styles.badgeBloqueado]}
                  accessibilityLabel={`${b.titulo}: ${ativo ? 'desbloqueada' : 'bloqueada'}. ${b.descricao}`}
                >
                  <Text style={[styles.badgeEmoji, !ativo && styles.badgeEmojiBloqueado]}>
                    {ativo ? b.emoji : '🔒'}
                  </Text>
                  <Text style={styles.badgeTitulo}>{b.titulo}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Historico */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Histórico</Text>
          {historico.length === 0 ? (
            <Text style={styles.vazio}>Jogue um quiz ou conclua uma lição para ver seu histórico aqui.</Text>
          ) : (
            historico.map((h, i) => (
              <View key={`${h.data}-${i}`} style={styles.histLinha}>
                <Text style={styles.histTipo}>{h.tipo === 'QUIZ' ? '🎲 Quiz' : '📖 Lições'}</Text>
                <Text style={styles.histData}>{h.data}</Text>
                <Text style={styles.histScore}>{Math.round(h.score * 100)}%</Text>
              </View>
            ))
          )}
        </View>
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
  scroll: { paddingBottom: ESPACAMENTOS.xxl, gap: ESPACAMENTOS.md },
  mascoteWrapper: { alignItems: 'center', paddingTop: ESPACAMENTOS.sm, gap: ESPACAMENTOS.xs },
  mascoteNivel: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.laranjaForte,
    letterSpacing: 1,
  },
  secao: {
    marginHorizontal: ESPACAMENTOS.lg,
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.preto,
    padding: ESPACAMENTOS.md,
    gap: ESPACAMENTOS.sm,
  },
  secaoTitulo: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.laranjaForte,
    letterSpacing: 1,
  },
  areaLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaNome: { fontFamily: FONTES.bodyBold, fontSize: 15, color: COLORS.roxoEscuro },
  areaValor: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.preto },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ESPACAMENTOS.sm,
    justifyContent: 'space-between',
  },
  badge: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: ESPACAMENTOS.sm,
    borderRadius: BORDAS.raioPequeno,
    borderWidth: BORDAS.larguraMedia,
    gap: ESPACAMENTOS.xs,
  },
  badgeAtivo: { backgroundColor: COLORS.laranjaClaro, borderColor: COLORS.laranjaForte },
  badgeBloqueado: { backgroundColor: COLORS.cinzaClaro, borderColor: COLORS.cinzaMedio },
  badgeEmoji: { fontSize: 30 },
  badgeEmojiBloqueado: { opacity: 0.6 },
  badgeTitulo: {
    fontFamily: FONTES.bodyBold,
    fontSize: 11,
    color: COLORS.preto,
    textAlign: 'center',
  },
  histLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ESPACAMENTOS.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cinzaClaro,
  },
  histTipo: { fontFamily: FONTES.bodyBold, fontSize: 14, color: COLORS.roxoEscuro, flex: 1 },
  histData: { fontFamily: FONTES.bodyRegular, fontSize: 13, color: COLORS.cinzaEscuro, flex: 1, textAlign: 'center' },
  histScore: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.laranjaForte, flex: 1, textAlign: 'right' },
  vazio: { fontFamily: FONTES.bodyRegular, fontSize: 14, color: COLORS.cinzaEscuro, textAlign: 'center' },
});
