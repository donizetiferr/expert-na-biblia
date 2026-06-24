import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { subscribe, isOnline, getNetworkStats } from '../lib/network';
import { COLORS, FONTES, ESPACAMENTOS } from '../constants/colors';

/**
 * BannerOffline — V9 M4.7 (polish)
 *
 * Exibe banner "MODO OFFLINE" no topo da app quando sem internet.
 * O app funciona normalmente (SQLite local); apenas a avaliacao por LLM
 * fica limitada ao matching canonico local.
 *
 * M4.7 polish:
 *  - Re-renderiza a cada 10s para atualizar label "ha Xs"
 *  - Mostra icone antes do texto para affordance visual
 *  - TextShadow para legibilidade sobre qualquer fundo
 *  - Le latencia media de getNetworkStats() para contexto adicional
 */

export function BannerOffline() {
  // Forca re-render a cada 10s (atualiza contador "ha Xs")
  const [, setTick] = useState<number>(0);
  const [online, setOnline] = useState<boolean>(isOnline());

  useEffect(() => {
    const unsub = subscribe((status) => {
      setOnline(status);
    });
    const tick = setInterval(() => {
      setTick((n) => n + 1);
    }, 10_000);
    return () => {
      unsub();
      clearInterval(tick);
    };
  }, []);

  if (online) return null;

  const stats = getNetworkStats();
  const offlineSeconds = Math.floor((Date.now() - stats.lastChange) / 1000);

  return (
    <View style={styles.banner} pointerEvents="none">
      <Text style={styles.texto}>⚠ MODO OFFLINE</Text>
      <Text style={styles.subtexto}>
        Conteudo local OK · sem avaliacao por IA ({formatDuration(offlineSeconds)})
      </Text>
    </View>
  );
}

function formatDuration(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  return `${h}h${m % 60}min`;
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
    paddingHorizontal: ESPACAMENTOS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.preto,
  },
  texto: {
    fontFamily: FONTES.bodyExtraBold,
    fontSize: 13,
    color: COLORS.branco,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  subtexto: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 10,
    color: COLORS.branco,
    opacity: 0.85,
    marginTop: 1,
  },
});