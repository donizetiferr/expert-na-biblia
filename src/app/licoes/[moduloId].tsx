import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { listarLicoes, listarModuloPorId } from '../../lib/db-queries';
import { GradienteRoxo } from '../../components/Gradiente';
import type { Licao, Modulo } from '../../types';

/**
 * Tela Licoes 2: Lista de licoes dentro do modulo (cadeado sequencial).
 * V10 M5.3: header mostra o NOME do modulo (ex: "Alfabetização Bíblica") em vez do codigo (FB01).
 * V10 M5.5: container com fundo creme (briefing), nao roxo.
 * V23.12 (V22.A.4/A.5/B.4): estado loading/erro/vazio + listarModuloPorId (query leve) +
 * header de voltar padronizado.
 */
export default function ModuloScreen() {
  const router = useRouter();
  const { moduloId } = useLocalSearchParams<{ moduloId: string }>();
  const [licoes, setLicoes] = useState<Licao[]>([]);
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!moduloId) return;
    let ativo = true;
    setCarregando(true);
    setErro(false);
    Promise.all([listarLicoes(moduloId), listarModuloPorId(moduloId)])
      .then(([ls, m]) => {
        if (!ativo) return;
        setLicoes(ls);
        setModulo(m);
      })
      .catch(() => {
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [moduloId]);

  const liberado = (index: number): boolean => {
    if (index === 0) return true;
    return licoes[index - 1]?.concluida === true;
  };

  const renderItem = ({ item, index }: { item: Licao; index: number }) => {
    const livre = liberado(index);
    const concluida = item.concluida === true;
    const onPress = () => livre && moduloId && router.push(`/licoes/${moduloId}/${item.id}`);

    const numero = (
      <Text
        style={[
          styles.numero,
          concluida ? styles.numeroConcluida : livre ? styles.numeroLiberado : styles.numeroBloqueado,
        ]}
      >
        {item.ordem.toString().padStart(2, '0')}
      </Text>
    );
    const nome = (
      <Text style={[styles.nome, concluida && styles.nomeConcluida]}>{item.nome}</Text>
    );

    // V18.3 MD.1: licao concluida = AMARELA com borda/texto pretos.
    if (concluida) {
      return (
        <Pressable style={[styles.card, styles.cardConcluida]} onPress={onPress}>
          {numero}
          {nome}
          <View style={styles.badgeConcluida}>
            <Text style={styles.badgeTexto}>✓ {item.score_max}/100</Text>
          </View>
        </Pressable>
      );
    }
    // Liberada: degrade roxo + borda laranja.
    if (livre) {
      return (
        <Pressable style={styles.cardShadow} onPress={onPress}>
          <GradienteRoxo diagonal style={styles.card}>
            {numero}
            {nome}
          </GradienteRoxo>
        </Pressable>
      );
    }
    // V19 BUG-9: bloqueada = roxo (degrade) escurecido + cadeado (mock), nao cinza.
    return (
      <Pressable style={styles.cardShadow} disabled>
        <GradienteRoxo diagonal style={[styles.card, styles.cardBloqueado]}>
          {numero}
          {nome}
          <Text style={styles.cadeado}>🔒</Text>
        </GradienteRoxo>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* V23.12 (V22.B.4): header de voltar padronizado (‹ + titulo centralizado). */}
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} style={styles.voltar} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        {/* M5.3: header mostra NOME do modulo em vez de codigo */}
        <Text style={styles.titulo} numberOfLines={1}>{modulo?.nome ?? moduloId}</Text>
        <View style={styles.voltar} />
      </View>

      {/* V23.12 (V22.A.4): estados de loading / erro / vazio — a tela nunca fica em branco. */}
      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={COLORS.roxoPrimario} />
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Text style={styles.mensagem}>Não foi possível carregar as lições.</Text>
          <Pressable style={styles.botaoVoltar} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar aos módulos">
            <Text style={styles.botaoVoltarTexto}>Voltar aos módulos</Text>
          </Pressable>
        </View>
      ) : licoes.length === 0 ? (
        <View style={styles.centro}>
          <Text style={styles.mensagem}>Nenhuma lição encontrada neste módulo.</Text>
          <Pressable style={styles.botaoVoltar} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Voltar aos módulos">
            <Text style={styles.botaoVoltarTexto}>Voltar aos módulos</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={licoes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creme,  // M5.5: briefing diz creme, nao roxo
    padding: ESPACAMENTOS.md,
  },
  // V23.12 (V22.B.4): header padronizado (‹ a esquerda + titulo centralizado).
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ESPACAMENTOS.md,
  },
  voltar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  voltarTexto: {
    fontFamily: FONTES.display,
    fontSize: 40,
    color: COLORS.roxoEscuro,
  },
  titulo: {
    flex: 1,
    fontFamily: FONTES.display,
    fontSize: 28,
    color: COLORS.roxoEscuro,
    textAlign: 'center',
  },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: ESPACAMENTOS.md, padding: ESPACAMENTOS.lg },
  mensagem: { fontFamily: FONTES.bodyBold, fontSize: 16, color: COLORS.cinzaEscuro, textAlign: 'center' },
  botaoVoltar: {
    backgroundColor: COLORS.roxoEscuro,
    borderRadius: BORDAS.raioMedio,
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingVertical: ESPACAMENTOS.sm,
  },
  botaoVoltarTexto: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.laranjaClaro },
  lista: {
    gap: ESPACAMENTOS.sm,
  },
  cardShadow: {
    borderRadius: BORDAS.raioMedio,
    shadowColor: COLORS.preto,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaBorda,
    gap: ESPACAMENTOS.md,
    overflow: 'hidden',
  },
  // V18.3 MD.1: licao concluida amarela.
  cardConcluida: {
    backgroundColor: COLORS.laranjaClaro,
    borderColor: COLORS.preto,
  },
  // V19 BUG-9: roxo (degrade) escurecido + borda laranja + cadeado.
  cardBloqueado: {
    borderColor: COLORS.laranjaBorda,
    opacity: 0.5,
  },
  numero: {
    fontFamily: FONTES.display,
    fontSize: 28,
    width: 50,
    textAlign: 'center',
  },
  numeroLiberado: { color: COLORS.laranjaClaro },
  numeroBloqueado: { color: COLORS.laranjaClaro },
  numeroConcluida: { color: COLORS.preto },
  nome: {
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.branco,
    flex: 1,
  },
  nomeConcluida: { color: COLORS.preto, fontFamily: FONTES.bodyExtraBold },
  cadeado: { fontSize: 22 },
  badgeConcluida: {
    backgroundColor: COLORS.laranjaEscuro,
    paddingHorizontal: ESPACAMENTOS.sm,
    paddingVertical: ESPACAMENTOS.xs,
    borderRadius: BORDAS.raioPequeno,
  },
  badgeTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 12,
    color: COLORS.branco,
  },
});
