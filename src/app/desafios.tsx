import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { lightTap, successBuzz } from '../lib/haptics';
import { desafiosAtivos, progressoDesafio, desafioResgatado, resgatarDesafio, type Desafio } from '../lib/desafios';

/**
 * V23.11 (K.1/K.2): Desafios — eventos sazonais litúrgicos + missões rotativas diária e
 * semanal. Cada um tem uma meta de XP no período; ao bater a meta, o usuário resgata um
 * bônus de XP (1x). Tom encorajador, recompensa só positiva.
 */
interface DesafioEstado {
  desafio: Desafio;
  progresso: number;
  resgatado: boolean;
}

const ROTULO_TIPO: Record<string, string> = { sazonal: 'EVENTO ESPECIAL', diario: 'DESAFIO DO DIA', semanal: 'DESAFIO DA SEMANA' };

export default function DesafiosScreen() {
  const router = useRouter();
  const [estados, setEstados] = useState<DesafioEstado[]>([]);

  const carregar = useCallback(async () => {
    const ativos = desafiosAtivos();
    const out = await Promise.all(
      ativos.map(async (desafio) => ({
        desafio,
        progresso: await progressoDesafio(desafio),
        resgatado: await desafioResgatado(desafio.id),
      })),
    );
    return out;
  }, []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      carregar().then((e) => {
        if (ativo) setEstados(e);
      });
      return () => {
        ativo = false;
      };
    }, [carregar]),
  );

  const resgatar = async (e: DesafioEstado) => {
    if (e.resgatado || e.progresso < e.desafio.metaXp) return;
    lightTap().catch(() => {});
    const ganho = await resgatarDesafio(e.desafio);
    if (ganho > 0) {
      successBuzz().catch(() => {});
      const novos = await carregar();
      setEstados(novos);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} style={styles.voltar} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.tituloTela}>Desafios</Text>
        <View style={styles.voltar} />
      </View>

      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitulo}>Complete missões e ganhe bônus de XP. Toda prática conta!</Text>

        {estados.map((e) => {
          const fracao = Math.min(1, e.progresso / Math.max(1, e.desafio.metaXp));
          const completo = e.progresso >= e.desafio.metaXp;
          const podeResgatar = completo && !e.resgatado;
          return (
            <View key={e.desafio.id} style={[styles.card, e.desafio.tipo === 'sazonal' && styles.cardSazonal]}>
              <Text style={styles.rotulo}>{ROTULO_TIPO[e.desafio.tipo] ?? 'DESAFIO'}</Text>
              <View style={styles.cardTopo}>
                <Text style={styles.cardEmoji}>{e.desafio.emoji}</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitulo}>{e.desafio.titulo}</Text>
                  <Text style={styles.cardDesc}>{e.desafio.descricao}</Text>
                </View>
              </View>
              <View style={styles.barraFundo}>
                <View style={[styles.barra, { width: `${Math.round(fracao * 100)}%` }, completo && styles.barraCompleta]} />
              </View>
              <View style={styles.cardRodape}>
                <Text style={styles.progressoTexto}>
                  {Math.min(e.progresso, e.desafio.metaXp)}/{e.desafio.metaXp} XP
                </Text>
                <Text style={styles.recompensa}>🎁 +{e.desafio.recompensa} XP</Text>
              </View>
              {e.resgatado ? (
                <View style={[styles.botao, styles.botaoFeito]}>
                  <Text style={styles.botaoTexto}>✓ Resgatado</Text>
                </View>
              ) : (
                <Pressable
                  style={[styles.botao, !podeResgatar && styles.botaoDesabilitado]}
                  onPress={() => resgatar(e)}
                  disabled={!podeResgatar}
                  accessibilityRole="button"
                  accessibilityLabel={podeResgatar ? `Resgatar ${e.desafio.recompensa} XP` : 'Continue praticando para completar'}
                >
                  <Text style={styles.botaoTexto}>{podeResgatar ? `Resgatar +${e.desafio.recompensa} XP` : 'Em andamento'}</Text>
                </Pressable>
              )}
            </View>
          );
        })}
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
  lista: { paddingHorizontal: ESPACAMENTOS.lg, paddingBottom: ESPACAMENTOS.xxl, gap: ESPACAMENTOS.md },
  subtitulo: { fontFamily: FONTES.bodyRegular, fontSize: 14, color: COLORS.cinzaEscuro, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaForte,
    padding: ESPACAMENTOS.md,
    gap: ESPACAMENTOS.sm,
  },
  cardSazonal: { borderColor: COLORS.roxoPrimario, backgroundColor: '#faf5ff' },
  rotulo: { fontFamily: FONTES.display, fontSize: 14, color: COLORS.laranjaForte, letterSpacing: 1 },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: ESPACAMENTOS.md },
  cardEmoji: { fontSize: 38 },
  cardInfo: { flex: 1, gap: 2 },
  cardTitulo: { fontFamily: FONTES.bodyExtraBold, fontSize: 18, color: COLORS.roxoEscuro },
  cardDesc: { fontFamily: FONTES.bodyRegular, fontSize: 13, color: COLORS.cinzaEscuro },
  barraFundo: {
    height: 14,
    backgroundColor: COLORS.cinzaClaro,
    borderRadius: BORDAS.raioPequeno,
    borderWidth: BORDAS.larguraFina,
    borderColor: COLORS.preto,
    overflow: 'hidden',
  },
  barra: { height: '100%', backgroundColor: COLORS.laranjaForte },
  barraCompleta: { backgroundColor: COLORS.acertoVerde },
  cardRodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressoTexto: { fontFamily: FONTES.bodyExtraBold, fontSize: 14, color: COLORS.roxoEscuro },
  recompensa: { fontFamily: FONTES.bodyExtraBold, fontSize: 14, color: COLORS.laranjaForte },
  botao: {
    backgroundColor: COLORS.laranjaForte,
    borderRadius: BORDAS.raioPequeno,
    paddingVertical: ESPACAMENTOS.sm,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  botaoFeito: { backgroundColor: COLORS.acertoVerde },
  botaoDesabilitado: { backgroundColor: COLORS.cinzaMedio },
  botaoTexto: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.branco },
});
