import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { listarModulos } from '../../lib/db-queries';
import type { Modulo } from '../../types';

const MAX_MODULOS = 20;

/**
 * Tela 4: Quiz Biblico - customizar modulos (max 20).
 */
export default function CustomizarQuiz() {
  const router = useRouter();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  useEffect(() => {
    listarModulos().then(setModulos);
  }, []);

  const toggle = (id: string) => {
    const novo = new Set(selecionados);
    if (novo.has(id)) {
      novo.delete(id);
    } else if (novo.size < MAX_MODULOS) {
      novo.add(id);
    } else {
      return; // Max atingido
    }
    setSelecionados(novo);
  };

  const iniciar = () => {
    const ids = Array.from(selecionados).join(',');
    router.push(`/quiz/jogar?modo=custom&modulos=${ids}`);
  };

  const renderItem = ({ item }: { item: Modulo }) => {
    const sel = selecionados.has(item.id);
    return (
      <Pressable
        style={[styles.linha, sel && styles.linhaSelecionada]}
        onPress={() => toggle(item.id)}
      >
        <View style={[styles.checkbox, sel && styles.checkboxMarcado]}>
          {sel && <Text style={styles.check}>✓</Text>}
        </View>
        <Text style={styles.numero}>{item.ordem.toString().padStart(2, '0')}</Text>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.area}>{item.area}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Escolha os módulos</Text>
      <Text style={styles.contador}>
        {selecionados.size}/{MAX_MODULOS} selecionados
      </Text>

      <FlatList
        data={modulos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
      />

      <Pressable
        style={[styles.botaoIniciar, selecionados.size === 0 && styles.botaoDesabilitado]}
        onPress={iniciar}
        disabled={selecionados.size === 0}
      >
        <Text style={styles.botaoTexto}>INICIAR ({selecionados.size})</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.roxoEscuro, padding: ESPACAMENTOS.md },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 28,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
  },
  contador: {
    fontFamily: FONTES.bodyBold,
    fontSize: 14,
    color: COLORS.branco,
    textAlign: 'center',
    marginVertical: ESPACAMENTOS.sm,
  },
  lista: { gap: ESPACAMENTOS.xs, paddingBottom: ESPACAMENTOS.xl },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.roxoPrimario,
    padding: ESPACAMENTOS.sm,
    borderRadius: BORDAS.raioPequeno,
    gap: ESPACAMENTOS.sm,
  },
  linhaSelecionada: { backgroundColor: COLORS.laranjaEscuro },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: COLORS.laranjaClaro,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMarcado: { backgroundColor: COLORS.laranjaClaro },
  check: { color: COLORS.preto, fontWeight: 'bold', fontSize: 18 },
  numero: { fontFamily: FONTES.display, fontSize: 18, color: COLORS.branco, width: 30 },
  nome: { fontFamily: FONTES.bodyBold, fontSize: 14, color: COLORS.branco, flex: 1 },
  area: { fontFamily: FONTES.bodyRegular, fontSize: 12, color: COLORS.cinzaClaro },
  botaoIniciar: {
    backgroundColor: COLORS.laranjaEscuro,
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    alignItems: 'center',
  },
  botaoDesabilitado: { backgroundColor: COLORS.cinzaEscuro },
  botaoTexto: { fontFamily: FONTES.display, fontSize: 22, color: COLORS.branco },
});