import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';

/**
 * V9 M2.5: IconeHome para voltar a /modos (raiz do app).
 * Render: emoji 🏠 com fundo translucido.
 */
export function IconeHome() {
  const router = useRouter();
  return (
    <Pressable
      style={styles.botao}
      onPress={() => router.replace('/modos')}
      accessibilityLabel="Voltar para tela de modos"
      accessibilityRole="button"
    >
      <Text style={styles.icone}>🏠</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.laranjaEscuro,
    borderWidth: 2,
    borderColor: COLORS.branco,
  },
  icone: {
    fontSize: 20,
  },
});
