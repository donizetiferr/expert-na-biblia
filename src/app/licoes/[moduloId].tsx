import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { listarLicoes } from '../../lib/db-queries';
import type { Licao } from '../../types';

/**
 * Tela Licoes 2: Lista de licoes dentro do modulo (cadeado sequencial).
 * Query: SELECT * FROM licoes WHERE modulo_id = ? ORDER BY ordem
 */
export default function ModuloScreen() {
  const router = useRouter();
  const { moduloId } = useLocalSearchParams<{ moduloId: string }>();
  const [licoes, setLicoes] = useState<Licao[]>([]);

  useEffect(() => {
    if (moduloId) listarLicoes(moduloId).then(setLicoes);
  }, [moduloId]);

  const liberado = (index: number): boolean => {
    if (index === 0) return true;
    return licoes[index - 1]?.concluida === true;
  };

  const renderItem = ({ item, index }: { item: Licao; index: number }) => {
    const livre = liberado(index);
    return (
      <Pressable
        style={[
          styles.card,
          livre ? styles.cardLiberado : styles.cardBloqueado,
        ]}
        disabled={!livre}
        onPress={() =>
          livre && moduloId && router.push(`/licoes/${moduloId}/${item.id}`)
        }
      >
        <Text style={[styles.numero, livre ? styles.numeroLiberado : styles.numeroBloqueado]}>
          {item.ordem.toString().padStart(2, '0')}
        </Text>
        <Text style={styles.nome}>{item.nome}</Text>
        {!livre && <Text style={styles.cadeado}>🔒</Text>}
        {item.concluida && (
          <View style={styles.badgeConcluida}>
            <Text style={styles.badgeTexto}>✓ {item.score_max}/100</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.voltar}>
        <Text style={styles.voltarTexto}>← Voltar</Text>
      </Pressable>
      <Text style={styles.titulo}>{moduloId}</Text>
      <FlatList
        data={licoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.roxoEscuro,
    padding: ESPACAMENTOS.md,
  },
  voltar: { padding: ESPACAMENTOS.sm, marginBottom: ESPACAMENTOS.sm },
  voltarTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.laranjaEscuro,
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 32,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
    marginBottom: ESPACAMENTOS.md,
  },
  lista: { gap: ESPACAMENTOS.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    gap: ESPACAMENTOS.md,
  },
  cardLiberado: {
    backgroundColor: COLORS.roxoPrimario,
    borderColor: COLORS.laranjaEscuro,
  },
  cardBloqueado: {
    backgroundColor: COLORS.cinzaEscuro,
    borderColor: COLORS.cinzaMedio,
    opacity: 0.5,
  },
  numero: {
    fontFamily: FONTES.display,
    fontSize: 28,
    width: 50,
    textAlign: 'center',
  },
  numeroLiberado: { color: COLORS.laranjaClaro },
  numeroBloqueado: { color: COLORS.cinzaMedio },
  nome: {
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.branco,
    flex: 1,
  },
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