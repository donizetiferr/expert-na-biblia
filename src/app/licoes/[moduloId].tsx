import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { listarLicoes, listarModulos } from '../../lib/db-queries';
import type { Licao, Modulo } from '../../types';

/**
 * Tela Licoes 2: Lista de licoes dentro do modulo (cadeado sequencial).
 * V10 M5.3: header mostra o NOME do modulo (ex: "Alfabetização Bíblica") em vez do codigo (FB01).
 * V10 M5.5: container com fundo creme (briefing), nao roxo.
 */
export default function ModuloScreen() {
  const router = useRouter();
  const { moduloId } = useLocalSearchParams<{ moduloId: string }>();
  const [licoes, setLicoes] = useState<Licao[]>([]);
  const [modulo, setModulo] = useState<Modulo | null>(null);

  useEffect(() => {
    if (moduloId) listarLicoes(moduloId).then(setLicoes);
  }, [moduloId]);

  // M5.3: carregar o modulo pelo ID para mostrar o NOME no header
  useEffect(() => {
    if (moduloId) {
      listarModulos().then((mods) => {
        const m = mods.find((x) => x.id === moduloId);
        if (m) setModulo(m);
      });
    }
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
      {/* M5.3: header mostra NOME do modulo em vez de codigo */}
      <Text style={styles.titulo}>{modulo?.nome ?? moduloId}</Text>
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
    backgroundColor: COLORS.creme,  // M5.5: briefing diz creme, nao roxo
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
    color: COLORS.roxoEscuro,
    textAlign: 'center',
    marginBottom: ESPACAMENTOS.md,
  },
  lista: {
    gap: ESPACAMENTOS.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    gap: ESPACAMENTOS.md,
  },
  cardLiberado: {
    backgroundColor: COLORS.roxoCard,           // M5.5: briefing diz roxo
    borderColor: COLORS.laranjaBorda,
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
  numeroLiberado: { color: COLORS.laranjaEscuro },
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
