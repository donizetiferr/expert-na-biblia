import { View, Text, FlatList, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { listarModulos } from '../../lib/db-queries';
import { moduloLiberado } from '../../lib/progressao';
import { playCadeiraDesbloqueia } from '../../lib/sound';
import type { Modulo } from '../../types';

/**
 * Tela Licoes 1: Lista de 77 modulos com cadeado sequencial.
 * V9.2.8: visual conforme briefing (docs/04_fluxo_de_telas) — logo grande no topo
 * + cards com degradê roxo + borda laranja grossa + texto com degradê laranja
 * nas palavras-chave (nome do modulo em destaque).
 */
export default function LicoesIndex() {
  const router = useRouter();
  const [modulos, setModulos] = useState<Modulo[]>([]);
  // V13 14.1.2: toca playCadeiraDesbloqueia uma unica vez quando um modulo
  // acaba de ser desbloqueado (transicao de bloqueado -> livre).
  const unlockSoundOnceRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    listarModulos().then(setModulos);
  }, []);

  const renderItem = ({ item, index }: { item: Modulo; index: number }) => {
    // V18.1 MA.5: regra de cadeado sequencial extraida para lib/progressao (testavel).
    const livre = moduloLiberado(index, modulos);
    // V13 14.1.2: toca playCadeiraDesbloqueia na PRIMEIRA renderizacao
    // deste modulo como livre (efeito de "cadeado abriu").
    if (livre && index > 0 && !unlockSoundOnceRef.current.has(item.id)) {
      unlockSoundOnceRef.current.add(item.id);
      playCadeiraDesbloqueia().catch((e: unknown) =>
        console.warn('[audio] licoes/index cadeira falhou:', e),
      );
    }
    // Briefing: divide nome em 2 partes: palavra-chave (laranja) + complemento (branco)
    // Estrategia simples: primeira palavra em laranja, resto em branco
    const nomePartes = item.nome.split(' ', 1);
    const palavraChave = nomePartes[0] || item.nome;
    // V13 14.3: incluir o espaco removido pelo split
    const complemento = item.nome.slice(palavraChave.length + 1);

    return (
      <Pressable
        style={[styles.card, livre ? styles.cardLiberado : styles.cardBloqueado]}
        disabled={!livre}
        onPress={() => livre && router.push(`/licoes/${item.id}`)}
      >
        <Text
          style={[
            styles.numero,
            livre ? styles.numeroLiberado : styles.numeroBloqueado,
          ]}
        >
          {item.ordem.toString().padStart(2, '0')}
        </Text>
        <View style={styles.info}>
          <Text style={styles.nome}>
            <Text style={styles.palavraChave}>{palavraChave}</Text>
            <Text>{complemento}</Text>
          </Text>
        </View>
        {!livre && <Text style={styles.cadeado}>🔒</Text>}
        {item.concluido && <Text style={styles.check}>✓</Text>}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* V9.2.8: logo GRANDE no topo (briefing) */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <FlatList
        data={modulos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // V11: briefing oficial — fundo creme #f7f4ed (image_20260622_205916.jpg)
    backgroundColor: COLORS.creme,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: ESPACAMENTOS.md,
    paddingBottom: ESPACAMENTOS.lg,
  },
  logo: {
    width: 220,
    height: 220,
  },
  lista: {
    paddingHorizontal: ESPACAMENTOS.lg,
    gap: ESPACAMENTOS.lg,
    paddingBottom: ESPACAMENTOS.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ESPACAMENTOS.lg,
    paddingHorizontal: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraGrossa,
    gap: ESPACAMENTOS.md,
    minHeight: 96,
  },
  cardLiberado: {
    backgroundColor: COLORS.roxoPrimario,
    borderColor: COLORS.laranjaEscuro,
  },
  cardBloqueado: {
    // V12 7.4: cards bloqueados mais visíveis. Cor cinza médio sem opacity (era 0.6 sobre cinzaEscuro).
    backgroundColor: COLORS.cinzaMedio,       // #9ca3af — cinza claro, distinto do liberado roxo
    borderColor: COLORS.cinzaEscuro,          // #4b5563 — borda mais escura
    opacity: 0.85,                            // leve opacidade para indicar "bloqueado" sem esconder
  },
  numero: {
    fontFamily: FONTES.display,
    fontSize: 40,
    width: 64,
    textAlign: 'center',
  },
  numeroLiberado: { color: COLORS.laranjaEscuro },
  numeroBloqueado: { color: COLORS.preto },  // V12 7.4: número preto fica legível em fundo cinzaMedio
  info: {
    flex: 1,
  },
  nome: {
    fontFamily: FONTES.bodyBold,
    fontSize: 20,
    color: COLORS.branco,
    textAlign: 'center',
    lineHeight: 26,
  },
  palavraChave: {
    color: COLORS.laranjaEscuro,
    fontFamily: FONTES.bodyExtraBold,
  },
  cadeado: { fontSize: 28 },
  check: { fontSize: 32, color: COLORS.acertoVerde, fontWeight: 'bold' },
});
