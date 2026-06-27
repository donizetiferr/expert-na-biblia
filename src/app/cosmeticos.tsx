import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { PersonagemLivro } from '../components/PersonagemLivro';
import { obterResumoXp } from '../lib/xp';
import { lightTap } from '../lib/haptics';
import {
  listarPorCategoria,
  cosmeticoDesbloqueado,
  corDoCosmetico,
  obterEquipado,
  equiparCosmetico,
  type CategoriaCosmetico,
  type Cosmetico,
} from '../lib/cosmeticos';

/**
 * V23.8 (H.3): Cosméticos — personalizacao desbloqueavel por XP. O usuario sobe de
 * nivel e desbloqueia temas de acento e auras do mascote (puro estilo, on-palette).
 * Decisao de produto: desbloqueio por NIVEL (nao gasta XP) — mantem o XP como progresso.
 */
export default function CosmeticosScreen() {
  const router = useRouter();
  const [nivel, setNivel] = useState(1);
  const [equipTema, setEquipTema] = useState('tema_classico');
  const [equipAura, setEquipAura] = useState('aura_aurea');

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      (async () => {
        try {
          const [resumo, t, a] = await Promise.all([
            obterResumoXp(),
            obterEquipado('tema'),
            obterEquipado('aura'),
          ]);
          if (!ativo) return;
          setNivel(resumo.nivel);
          setEquipTema(t);
          setEquipAura(a);
        } catch {
          // silencioso
        }
      })();
      return () => {
        ativo = false;
      };
    }, []),
  );

  const equipar = async (cat: CategoriaCosmetico, c: Cosmetico) => {
    if (!cosmeticoDesbloqueado(c, nivel)) return;
    lightTap().catch(() => {});
    const ok = await equiparCosmetico(cat, c.id, nivel);
    if (ok) {
      if (cat === 'tema') setEquipTema(c.id);
      else setEquipAura(c.id);
    }
  };

  const accent = corDoCosmetico('tema', equipTema, nivel);
  const auraCor = corDoCosmetico('aura', equipAura, nivel);

  const renderGrade = (cat: CategoriaCosmetico, equipadoId: string) => (
    <View style={styles.grade}>
      {listarPorCategoria(cat).map((c) => {
        const liberado = cosmeticoDesbloqueado(c, nivel);
        const equipado = c.id === equipadoId;
        return (
          <Pressable
            key={c.id}
            style={[styles.item, equipado && styles.itemEquipado, !liberado && styles.itemBloqueado]}
            onPress={() => equipar(cat, c)}
            disabled={!liberado}
            accessibilityRole="button"
            accessibilityLabel={`${c.nome}: ${!liberado ? `bloqueado, nível ${c.nivelRequisito}` : equipado ? 'equipado' : 'tocar para equipar'}`}
          >
            <View style={[styles.swatch, { backgroundColor: c.cor }]}>
              {!liberado ? <Text style={styles.cadeado}>🔒</Text> : equipado ? <Text style={styles.check}>✓</Text> : null}
            </View>
            <Text style={styles.itemNome} numberOfLines={1}>{c.nome}</Text>
            <Text style={styles.itemReq}>{liberado ? (equipado ? 'Equipado' : 'Disponível') : `Nível ${c.nivelRequisito}`}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topo}>
        <Pressable onPress={() => router.back()} style={styles.voltar} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={styles.voltarTexto}>‹</Text>
        </Pressable>
        <Text style={styles.tituloTela}>Cosméticos</Text>
        <View style={styles.voltar} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Preview ao vivo: mascote com a aura + acento equipados. */}
        <View style={[styles.preview, { borderColor: accent }]}>
          <PersonagemLivro pose="EXCLAMANDO" size={110} variante="licoes" nivel={6} auraCor={auraCor} />
          <View style={[styles.accentChip, { backgroundColor: accent }]}>
            <Text style={styles.accentChipTexto}>Nível {nivel}</Text>
          </View>
        </View>
        <Text style={styles.dica}>Suba de nível para desbloquear novos temas e auras.</Text>

        <Text style={styles.secaoTitulo}>🎨 Tema de cor</Text>
        {renderGrade('tema', equipTema)}

        <Text style={styles.secaoTitulo}>✨ Aura do mascote</Text>
        {renderGrade('aura', equipAura)}
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
  scroll: { paddingHorizontal: ESPACAMENTOS.lg, paddingBottom: ESPACAMENTOS.xxl, gap: ESPACAMENTOS.sm },
  preview: {
    alignItems: 'center',
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraGrossa,
    paddingVertical: ESPACAMENTOS.md,
    gap: ESPACAMENTOS.sm,
  },
  accentChip: {
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingVertical: ESPACAMENTOS.xs,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.preto,
  },
  accentChipTexto: { fontFamily: FONTES.display, fontSize: 18, color: COLORS.branco, letterSpacing: 1 },
  dica: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 13,
    color: COLORS.cinzaEscuro,
    textAlign: 'center',
    marginBottom: ESPACAMENTOS.xs,
  },
  secaoTitulo: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.laranjaForte,
    letterSpacing: 1,
    marginTop: ESPACAMENTOS.sm,
  },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACAMENTOS.sm, justifyContent: 'space-between' },
  item: {
    width: '31%',
    alignItems: 'center',
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.cinzaMedio,
    paddingVertical: ESPACAMENTOS.sm,
    gap: ESPACAMENTOS.xs,
  },
  itemEquipado: { borderColor: COLORS.laranjaForte, borderWidth: BORDAS.larguraGrossa, backgroundColor: COLORS.laranjaClaro },
  itemBloqueado: { opacity: 0.7 },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.preto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cadeado: { fontSize: 22 },
  check: { fontSize: 26, color: COLORS.branco, fontWeight: 'bold' },
  itemNome: { fontFamily: FONTES.bodyExtraBold, fontSize: 13, color: COLORS.roxoEscuro },
  itemReq: { fontFamily: FONTES.bodyBold, fontSize: 11, color: COLORS.cinzaEscuro },
});
