import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { subscribe, isOnline } from '../lib/network';
import { COLORS, FONTES, ESPACAMENTOS } from '../constants/colors';

/**
 * BannerOffline — V9 M4.7
 * Exibe banner "MODO OFFLINE" no topo da app quando sem internet.
 * O app funciona normalmente (SQLite local); apenas a avaliacao por LLM
 * fica limitada ao matching canonico local.
 */

export function BannerOffline() {
  const [online, setOnline] = useState<boolean>(isOnline());

  useEffect(() => {
    const unsub = subscribe((status) => {
      setOnline(status);
    });
    return () => {
      unsub();
    };
  }, []);

  if (online) return null;

  return (
    <View style={styles.banner} pointerEvents="none">
      <Text style={styles.texto}>MODO OFFLINE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: COLORS.erroVermelho,
    paddingVertical: ESPACAMENTOS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 12,
    color: COLORS.branco,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
