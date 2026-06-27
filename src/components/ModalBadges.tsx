import { Modal, View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import type { BadgeDef } from '../lib/badges';

/**
 * V23.B.1: modal de celebracao de conquistas. Aparece quando 1+ badges sao
 * desbloqueados. Animacao ONE-SHOT (scale de entrada, sem loop) — respeita a decisao
 * de a11y de movimento (V23.E.7 liga o reduceMotion depois). SFX fica a cargo da tela
 * chamadora (que ja toca o som de vitoria).
 */
export function ModalBadges({ badges, onClose }: { badges: BadgeDef[]; onClose: () => void }) {
  const visivel = badges.length > 0;
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (visivel) {
      scale.setValue(0.6);
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    }
  }, [visivel, scale]);

  if (!visivel) return null;

  return (
    <Modal transparent animationType="fade" visible={visivel} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.titulo}>CONQUISTA!</Text>
          {badges.map((b) => (
            <View key={b.tipo} style={styles.badgeLinha} accessibilityLabel={`Conquista desbloqueada: ${b.titulo}. ${b.descricao}`}>
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeTitulo}>{b.titulo}</Text>
                <Text style={styles.badgeDescricao}>{b.descricao}</Text>
              </View>
            </View>
          ))}
          <Pressable style={styles.botao} onPress={onClose} accessibilityRole="button" accessibilityLabel="Continuar">
            <Text style={styles.botaoTexto}>CONTINUAR</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11,0,18,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.creme,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaForte,
    padding: ESPACAMENTOS.lg,
    gap: ESPACAMENTOS.md,
    alignItems: 'center',
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 36,
    color: COLORS.laranjaForte,
    letterSpacing: 2,
  },
  badgeLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACAMENTOS.md,
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.preto,
    padding: ESPACAMENTOS.md,
    width: '100%',
  },
  badgeEmoji: { fontSize: 40 },
  badgeInfo: { flex: 1 },
  badgeTitulo: {
    fontFamily: FONTES.bodyExtraBold,
    fontSize: 18,
    color: COLORS.roxoEscuro,
  },
  badgeDescricao: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 14,
    color: COLORS.preto,
  },
  botao: {
    marginTop: ESPACAMENTOS.sm,
    backgroundColor: COLORS.preto,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: 3,
    borderColor: COLORS.laranjaEscuro,
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 20,
    color: COLORS.laranjaClaro,
  },
});
