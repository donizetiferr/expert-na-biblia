import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { listarLicoes, listarModulos } from '../../lib/db-queries';
import { GradienteRoxo } from '../../components/Gradiente';
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
