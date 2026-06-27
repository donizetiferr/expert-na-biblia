import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { lightTap, successBuzz } from '../lib/haptics';
import { listarPlanos, obterDias, diasConcluidos, marcarDiaLido, type Plano, type PlanoDia } from '../lib/planos';

/**
 * V23.10 (J.2): planos de leitura / devocional. Lista os planos; ao abrir um, mostra os
 * dias (passagem + reflexao) com "Marcar como lido" — que mantem o streak + concede XP.
 */
export default function PlanosScreen() {
  const router = useRouter();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [aberto, setAberto] = useState<Plano | null>(null);
  const [dias, setDias] = useState<PlanoDia[]>([]);
  const [concluidos, setConcluidos] = useState<Set<number>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      listarPlanos().then((p) => {
        if (ativo) setPlanos(p);
      });
      return () => {
        ativo = false;
      };
    }, []),
  );

  const abrir = async (p: Plano) => {
    lightTap().catch(() => {});
    const [d, c] = await Promise.all([obterDias(p.id), diasConcluidos(p.id)]);
    setDias(d);
    setConcluidos(c);
    setAberto(p);
  };

  const marcar = async (dia: number) => {
    if (!aberto || concluidos.has(dia)) return;
    lightTap().catch(() => {});
    const ok = await marcarDiaLido(aberto.id, dia);
    if (ok) {
      successBuzz().catch(() => {});
      setConcluidos((prev) => new Set(prev).add(dia));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Pressable
          onPress={() => (aberto ? setAberto(null) : router.back())}
          style={styles.voltar}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.tituloTela}>{aberto ? aberto.titulo : 'Planos de Leitura'}</Text>
        <View style={styles.voltar} />
      </View>

      {!aberto ? (
        <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitulo}>
            Devocionais curtos para criar o hábito diário. Ler um dia mantém sua streak.
          </Text>
          {planos.map((p) => (
            <Pressable key={p.id} style={styles.card} onPress={() => abrir(p)} accessibilityRole="button" accessibilityLabel={`Plano ${p.titulo}: ${p.descricao}`}>
              <Text style={styles.cardEmoji}>📅</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNome}>{p.titulo}</Text>
                <Text style={styles.cardDesc}>{p.descricao}</Text>
                <Text style={styles.cardDias}>{p.dias} dias</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
          <Text style={styles.progresso}>
            {concluidos.size}/{dias.length} dias concluídos
          </Text>
          {dias.map((d) => {
            const feito = concluidos.has(d.dia);
            return (
              <View key={d.dia} style={[styles.diaCard, feito && styles.diaFeito]}>
                <View style={styles.diaTopo}>
                  <Text style={styles.diaNum}>Dia {d.dia}</Text>
                  {feito ? <Text style={styles.diaCheck}>✓</Text> : null}
                </View>
                <Text style={styles.diaTitulo}>{d.titulo}</Text>
                <Text style={styles.diaPassagem}>📖 {d.passagem}</Text>
                {d.reflexao ? <Text style={styles.diaReflexao}>{d.reflexao}</Text> : null}
                <Pressable
                  style={[styles.diaBtn, feito && styles.diaBtnFeito]}
                  onPress={() => marcar(d.dia)}
                  disabled={feito}
                  accessibilityRole="button"
                  accessibilityLabel={feito ? 'Dia concluído' : `Marcar dia ${d.dia} como lido`}
                >
                  <Text style={styles.diaBtnTexto}>{feito ? '✓ Lido' : 'Marcar como lido'}</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
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
  tituloTela: { fontFamily: FONTES.display, fontSize: 26, color: COLORS.roxoEscuro, letterSpacing: 1, flex: 1, textAlign: 'center' },
  lista: { paddingHorizontal: ESPACAMENTOS.lg, paddingBottom: ESPACAMENTOS.xxl, gap: ESPACAMENTOS.md },
  subtitulo: { fontFamily: FONTES.bodyRegular, fontSize: 14, color: COLORS.cinzaEscuro, textAlign: 'center' },
  progresso: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.laranjaForte, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACAMENTOS.md,
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaForte,
    padding: ESPACAMENTOS.md,
  },
  cardEmoji: { fontSize: 36 },
  cardInfo: { flex: 1, gap: 2 },
  cardNome: { fontFamily: FONTES.bodyExtraBold, fontSize: 17, color: COLORS.roxoEscuro },
  cardDesc: { fontFamily: FONTES.bodyRegular, fontSize: 13, color: COLORS.cinzaEscuro },
  cardDias: { fontFamily: FONTES.bodyBold, fontSize: 12, color: COLORS.laranjaForte },
  diaCard: {
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.cinzaMedio,
    padding: ESPACAMENTOS.md,
    gap: ESPACAMENTOS.xs,
  },
  diaFeito: { borderColor: COLORS.acertoVerde, backgroundColor: '#f0fdf4' },
  diaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diaNum: { fontFamily: FONTES.display, fontSize: 20, color: COLORS.laranjaForte, letterSpacing: 1 },
  diaCheck: { fontSize: 24, color: COLORS.acertoVerde, fontWeight: 'bold' },
  diaTitulo: { fontFamily: FONTES.bodyExtraBold, fontSize: 17, color: COLORS.roxoEscuro },
  diaPassagem: { fontFamily: FONTES.bodyBold, fontSize: 14, color: COLORS.roxoPrimario },
  diaReflexao: { fontFamily: FONTES.bodyRegular, fontSize: 14, color: COLORS.preto, lineHeight: 20 },
  diaBtn: {
    marginTop: ESPACAMENTOS.sm,
    backgroundColor: COLORS.laranjaForte,
    borderRadius: BORDAS.raioPequeno,
    paddingVertical: ESPACAMENTOS.sm,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  diaBtnFeito: { backgroundColor: COLORS.acertoVerde },
  diaBtnTexto: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.branco },
});
