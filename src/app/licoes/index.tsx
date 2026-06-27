import { View, StyleSheet, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { COLORS, ESPACAMENTOS } from '../../constants/colors';
import { listarModulos } from '../../lib/db-queries';
import { HeaderProgresso } from '../../components/HeaderProgresso';
import { TrilhaModulos } from '../../components/TrilhaModulos';
import type { Modulo } from '../../types';

/**
 * Tela Licoes 1: jornada dos modulos (40 no MVP) com cadeado sequencial.
 * V23.8 (H.1): o grid plano de cards virou uma TRILHA sinuosa estilo Duolingo
 * (componente TrilhaModulos) — o usuario percorre a "estrada" e ve onde esta.
 * Mantem o logo + a faixa de progresso (HeaderProgresso) no topo.
 */
export default function LicoesIndex() {
  const router = useRouter();
  const [modulos, setModulos] = useState<Modulo[]>([]);

  // V23.A.1: recarrega ao FOCAR (nao so no mount) — ao voltar de uma licao 100%, o
  // modulo recem-concluido aparece amarelo e o proximo desbloqueado sem reabrir o app.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      listarModulos().then((m) => {
        if (ativo) setModulos(m);
      });
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      {/* V9.2.8: logo compacto no topo (briefing) */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* V23.A.1/A.2: faixa de progresso (streak + nivel + XP) acima da trilha. */}
      <HeaderProgresso />

      {/* V23.8 (H.1): trilha sinuosa dos modulos. */}
      <TrilhaModulos modulos={modulos} onSelecionar={(id) => router.push(`/licoes/${id}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // V11: briefing oficial — fundo creme #f7f4ed
    backgroundColor: COLORS.creme,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: ESPACAMENTOS.sm,
    paddingBottom: ESPACAMENTOS.xs,
  },
  logo: {
    width: 110,
    height: 110,
  },
});
