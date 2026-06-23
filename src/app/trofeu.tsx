import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { resetarProgresso } from '../lib/db-queries';

/**
 * Tela Final de Vitoria: Trofeu Expert.
 * Acionada quando TODOS os modulos estao concluida = true.
 * Trofeu dourado + confetes roxos/dourados + texto "Parabens, voce e um Expert!".
 */
export default function TrofeuScreen() {
  const router = useRouter();

  const handleRestart = async () => {
    await resetarProgresso();
    router.replace('/modos');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.confete}>🎊 ✨ 🎉</Text>

      <View style={styles.trofeu}>
        <Text style={styles.trofeuEmoji}>🏆</Text>
      </View>

      <Text style={styles.titulo}>Parabéns,</Text>
      <Text style={styles.titulo}>você é um Expert!</Text>

      <Text style={styles.subtitulo}>
        Concluiu todos os 77 módulos da Bíblia
      </Text>

      <Pressable style={styles.botao} onPress={handleRestart}>
        <Text style={styles.botaoTexto}>RECOMEÇAR</Text>
      </Pressable>
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
    gap: ESPACAMENTOS.md,
  },
  confete: {
    fontSize: 48,
    marginBottom: ESPACAMENTOS.lg,
  },
  trofeu: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.laranjaEscuro,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: COLORS.laranjaClaro,
    marginVertical: ESPACAMENTOS.xl,
  },
  trofeuEmoji: {
    fontSize: 120,
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 42,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitulo: {
    fontFamily: FONTES.bodyBold,
    fontSize: 18,
    color: COLORS.branco,
    textAlign: 'center',
    marginVertical: ESPACAMENTOS.md,
  },
  botao: {
    backgroundColor: COLORS.laranjaEscuro,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    marginTop: ESPACAMENTOS.lg,
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.branco,
  },
});