import { View, Text, FlatList, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { listarModulos } from '../../lib/db-queries';
import { moduloLiberado } from '../../lib/progressao';
import { playCadeiraDesbloqueia } from '../../lib/sound';
import { GradienteRoxo } from '../../components/Gradiente';
import type { Modulo } from '../../types';

/**
 * Tela Licoes 1: Lista de modulos (40 no MVP) com cadeado sequencial.
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
    const nomePartes = item.nome.split(' ', 1);
    const palavraChave = nomePartes[0] || item.nome;
    const complemento = item.nome.slice(palavraChave.length + 1);
    const concluido = item.concluido === true;

    // V18.3 MD.1 (regra de negocio #3): modulo concluido fica AMARELO com borda/texto pretos.
    const numero = (
      <Text
        style={[
          styles.numero,
          concluido ? styles.numeroConcluido : livre ? styles.numeroLiberado : styles.numeroBloqueado,
        ]}
      >
        {item.ordem.toString().padStart(2, '0')}
      </Text>
    );
    const info = concluido ? (
      <View style={styles.info}>
        <Text style={[styles.nome, styles.nomeConcluido]}>{item.nome}</Text>
      </View>
    ) : (
      <View style={styles.info}>
        <Text style={styles.nome}>
          <Text style={styles.palavraChave}>{palavraChave}</Text>
          <Text>{complemento}</Text>
        </Text>
      </View>
    );
    const onPress = () => livre && router.push(`/licoes/${item.id}`);

    // Concluido: amarelo solido.
    if (concluido) {
      return (
        <Pressable style={[styles.card, styles.cardConcluido]} onPress={onPress}>
          {numero}
          {info}
          <Text style={styles.checkConcluido}>✓</Text>
        </Pressable>
      );
    }
    // Liberado (nao concluido): degrade roxo + borda laranja.
    if (livre) {
      return (
        <Pressable style={styles.cardShadow} onPress={onPress}>
          <GradienteRoxo diagonal style={styles.card}>
            {numero}
            {info}
          </GradienteRoxo>
        </Pressable>
      );
    }
    // Bloqueado: cinza com cadeado.
    return (
      <Pressable style={[styles.card, styles.cardBloqueado]} disabled>
        {numero}
        {info}
        <Text style={styles.cadeado}>🔒</Text>
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
  // V18.3 MC.2: sombra no wrapper externo dos cards com degrade.
  cardShadow: {
    borderRadius: BORDAS.raioGrande,
    shadowColor: COLORS.preto,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ESPACAMENTOS.lg,
    paddingHorizontal: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaBorda,
    gap: ESPACAMENTOS.md,
    minHeight: 96,
    overflow: 'hidden',
  },
  // V18.3 MD.1: modulo concluido = amarelo com borda + texto pretos (regra de negocio #3).
  cardConcluido: {
    backgroundColor: COLORS.laranjaClaro,     // amarelo
    borderColor: COLORS.preto,
  },
  cardBloqueado: {
    backgroundColor: COLORS.cinzaMedio,       // #9ca3af
    borderColor: COLORS.cinzaEscuro,
    opacity: 0.85,
  },
  numero: {
    fontFamily: FONTES.display,
    fontSize: 40,
    width: 64,
    textAlign: 'center',
  },
  numeroLiberado: { color: COLORS.laranjaClaro },
  numeroBloqueado: { color: COLORS.preto },
  numeroConcluido: { color: COLORS.preto },
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
  nomeConcluido: { color: COLORS.preto, fontFamily: FONTES.bodyExtraBold },
  palavraChave: {
    color: COLORS.laranjaClaro,
    fontFamily: FONTES.bodyExtraBold,
  },
  cadeado: { fontSize: 28 },
  checkConcluido: { fontSize: 32, color: COLORS.preto, fontWeight: 'bold' },
});
