import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { listarVerbetes, obterVerbete, normalizar, type Verbete, type TipoVerbete } from '../lib/enciclopedia';

/**
 * V23.10 (J.1): Enciclopedia leve — navegar personagens, termos e eventos biblicos offline.
 * Busca por texto + filtro por tipo + detalhe em modal. Param `focus` (do "Saiba mais",
 * J.3) abre direto um verbete.
 */
const TIPOS: Array<{ chave: TipoVerbete | 'todos'; rotulo: string }> = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'personagem', rotulo: 'Personagens' },
  { chave: 'termo', rotulo: 'Termos' },
  { chave: 'evento', rotulo: 'Eventos' },
];

const EMOJI_TIPO: Record<string, string> = { personagem: '👤', termo: '📘', evento: '⭐' };

export default function EnciclopediaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ focus?: string }>();
  const [verbetes, setVerbetes] = useState<Verbete[]>([]);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<TipoVerbete | 'todos'>('todos');
  const [selecionado, setSelecionado] = useState<Verbete | null>(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        const todos = await listarVerbetes();
        if (!ativo) return;
        setVerbetes(todos);
        // J.3: abre direto o verbete do "Saiba mais" (1x).
        if (params.focus) {
          const v = await obterVerbete(String(params.focus));
          if (ativo && v) setSelecionado(v);
        }
      })();
      return () => {
        ativo = false;
      };
    }, [params.focus]),
  );

  const q = normalizar(busca).trim();
  const filtrados = verbetes.filter((v) => {
    if (filtro !== 'todos' && v.tipo !== filtro) return false;
    if (q && !normalizar(`${v.nome} ${v.resumo}`).includes(q)) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} style={styles.voltar} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.tituloTela}>Enciclopédia</Text>
        <View style={styles.voltar} />
      </View>

      <TextInput
        style={styles.busca}
        placeholder="Buscar (ex.: Moisés, Graça)"
        placeholderTextColor={COLORS.cinzaMedio}
        value={busca}
        onChangeText={setBusca}
        accessibilityLabel="Buscar na enciclopédia"
      />

      <View style={styles.filtros}>
        {TIPOS.map((t) => (
          <Pressable
            key={t.chave}
            style={[styles.chip, filtro === t.chave && styles.chipAtivo]}
            onPress={() => setFiltro(t.chave)}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar: ${t.rotulo}`}
          >
            <Text style={[styles.chipTexto, filtro === t.chave && styles.chipTextoAtivo]}>{t.rotulo}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {filtrados.length === 0 ? (
          <Text style={styles.vazio}>Nenhum verbete encontrado.</Text>
        ) : (
          filtrados.map((v) => (
            <Pressable
              key={v.id}
              style={styles.card}
              onPress={() => setSelecionado(v)}
              accessibilityRole="button"
              accessibilityLabel={`${v.nome}: ${v.resumo}`}
            >
              <Text style={styles.cardEmoji}>{EMOJI_TIPO[v.tipo] ?? '📖'}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardNome}>{v.nome}</Text>
                <Text style={styles.cardResumo} numberOfLines={2}>{v.resumo}</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal visible={selecionado !== null} transparent animationType="fade" onRequestClose={() => setSelecionado(null)}>
        <Pressable style={styles.modalFundo} onPress={() => setSelecionado(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selecionado ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalEmoji}>{EMOJI_TIPO[selecionado.tipo] ?? '📖'}</Text>
                <Text style={styles.modalNome}>{selecionado.nome}</Text>
                <Text style={styles.modalResumo}>{selecionado.resumo}</Text>
                <Text style={styles.modalDetalhe}>{selecionado.detalhe}</Text>
                {selecionado.referencias ? (
                  <Text style={styles.modalRef}>📖 {selecionado.referencias}</Text>
                ) : null}
                <Pressable style={styles.modalFechar} onPress={() => setSelecionado(null)} accessibilityRole="button" accessibilityLabel="Fechar">
                  <Text style={styles.modalFecharTexto}>Fechar</Text>
                </Pressable>
              </ScrollView>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
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
  tituloTela: { fontFamily: FONTES.display, fontSize: 28, color: COLORS.roxoEscuro, letterSpacing: 1 },
  busca: {
    marginHorizontal: ESPACAMENTOS.lg,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaInput,
    borderRadius: BORDAS.raioPequeno,
    paddingHorizontal: ESPACAMENTOS.md,
    paddingVertical: ESPACAMENTOS.sm,
    fontFamily: FONTES.bodyBold,
    fontSize: 15,
    color: COLORS.preto,
  },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACAMENTOS.xs, paddingHorizontal: ESPACAMENTOS.lg, paddingVertical: ESPACAMENTOS.sm },
  chip: {
    paddingHorizontal: ESPACAMENTOS.md,
    paddingVertical: ESPACAMENTOS.xs,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.cinzaMedio,
  },
  chipAtivo: { backgroundColor: COLORS.laranjaForte, borderColor: COLORS.laranjaForte },
  chipTexto: { fontFamily: FONTES.bodyBold, fontSize: 13, color: COLORS.cinzaEscuro },
  chipTextoAtivo: { color: COLORS.branco },
  lista: { paddingHorizontal: ESPACAMENTOS.lg, paddingBottom: ESPACAMENTOS.xxl, gap: ESPACAMENTOS.sm },
  vazio: { fontFamily: FONTES.bodyRegular, fontSize: 14, color: COLORS.cinzaEscuro, textAlign: 'center', marginTop: ESPACAMENTOS.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACAMENTOS.md,
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaForte,
    padding: ESPACAMENTOS.md,
  },
  cardEmoji: { fontSize: 32 },
  cardInfo: { flex: 1, gap: 2 },
  cardNome: { fontFamily: FONTES.bodyExtraBold, fontSize: 17, color: COLORS.roxoEscuro },
  cardResumo: { fontFamily: FONTES.bodyRegular, fontSize: 13, color: COLORS.cinzaEscuro },
  modalFundo: { flex: 1, backgroundColor: 'rgba(11,0,18,0.6)', justifyContent: 'center', padding: ESPACAMENTOS.lg },
  modalCard: {
    backgroundColor: COLORS.creme,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaForte,
    padding: ESPACAMENTOS.lg,
    maxHeight: '80%',
  },
  modalEmoji: { fontSize: 44, textAlign: 'center' },
  modalNome: { fontFamily: FONTES.display, fontSize: 30, color: COLORS.roxoEscuro, textAlign: 'center', letterSpacing: 1 },
  modalResumo: { fontFamily: FONTES.bodyExtraBold, fontSize: 16, color: COLORS.laranjaForte, textAlign: 'center', marginVertical: ESPACAMENTOS.sm },
  modalDetalhe: { fontFamily: FONTES.bodyRegular, fontSize: 16, color: COLORS.preto, lineHeight: 24 },
  modalRef: { fontFamily: FONTES.bodyBold, fontSize: 14, color: COLORS.roxoEscuro, marginTop: ESPACAMENTOS.md },
  modalFechar: {
    marginTop: ESPACAMENTOS.lg,
    backgroundColor: COLORS.roxoEscuro,
    borderRadius: BORDAS.raioMedio,
    paddingVertical: ESPACAMENTOS.sm,
    alignItems: 'center',
  },
  modalFecharTexto: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.laranjaClaro },
});
