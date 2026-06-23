import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTES, ESPACAMENTOS } from '../../constants/colors';

/**
 * Tela Licoes (placeholder V1 - implementacao completa: V4)
 */
export default function LicoesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>LIÇÕES</Text>
      <Text style={styles.mensagem}>77 módulos progressivos (em construção)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.roxoEscuro,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.lg,
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 48,
    color: COLORS.laranjaClaro,
  },
  mensagem: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 16,
    color: COLORS.branco,
    marginTop: ESPACAMENTOS.md,
    opacity: 0.8,
  },
});