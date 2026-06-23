import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { listarModulos } from '../../lib/db-queries';
import type { Modulo } from '../../types';

/**
 * Tela Licoes 1: Lista de 77 modulos com cadeado sequencial.
 * Modulo 1 sem cadeado; demais bloqueados ate conclusao 100% do anterior.
 */
export default function LicoesIndex() {
  const router = useRouter();
  const [modulos, setModulos] = useState<Modulo[]>([]);

  useEffect(() => {
    listarModulos().then(setModulos);
  }, []);

  const liberado = (index: number, modulosList: Modulo[]): boolean => {
    if (index === 0) return true;
    return modulosList[index - 1]?.concluido === true;
  };

  const renderItem = ({ item, index }: { item: Modulo; index: number }) => {
    const livre = liberado(index, modulos);
    return (
      <Pressable
        style={[
          styles.card,
          livre ? styles.cardLiberado : styles.cardBloqueado,
        ]}
        disabled={!livre}
        onPress={() => livre && router.push(`/licoes/${item.id}`)}
      >
        <Text style={[styles.numero, livre ? styles.numeroLiberado : styles.numeroBloqueado]}>
          {item.ordem.toString().padStart(2, '0')}
        </Text>
        <View style={styles.info}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.area}>{item.area}</Text>
        </View>
        {!livre && <Text style={styles.cadeado}>🔒</Text>}
        {item.concluido && <Text style={styles.check}>✓</Text>}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Módulos</Text>
      <FlatList
        data={modulos}
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
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 32,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
    marginBottom: ESPACAMENTOS.md,
  },
  lista: {
    gap: ESPACAMENTOS.sm,
    paddingBottom: ESPACAMENTOS.lg,
  },
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
    opacity: 0.6,
  },
  numero: {
    fontFamily: FONTES.display,
    fontSize: 28,
    width: 50,
    textAlign: 'center',
  },
  numeroLiberado: { color: COLORS.laranjaClaro },
  numeroBloqueado: { color: COLORS.cinzaMedio },
  info: { flex: 1 },
  nome: {
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.branco,
  },
  area: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 12,
    color: COLORS.cinzaClaro,
    marginTop: 2,
  },
  cadeado: { fontSize: 24 },
  check: { fontSize: 28, color: COLORS.acertoVerde, fontWeight: 'bold' },
});