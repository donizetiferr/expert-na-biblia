import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { getDatabase } from '../../db/database';

/**
 * Tela Quiz: Placar final (3 variantes <50%/>50%/100%).
 * Persiste ranking em user_rankings.
 */
export default function QuizFinal() {
  const router = useRouter();
  const { score } = useLocalSearchParams<{ score?: string }>();
  const s = parseInt(score ?? '0', 10);

  const variante = s >= 100 ? 'vitoria' : s >= 50 ? 'quase' : 'nao_deu';

  const configs = {
    vitoria: {
      fundo: COLORS.laranjaEscuro,
      emoji: '🎉',
      titulo: 'PARABÉNS!',
      subtitulo: `${s}% de acerto — você é um Expert!`,
    },
    quase: {
      fundo: COLORS.roxoPrimario,
      emoji: '💪',
      titulo: 'QUASE LÁ',
      subtitulo: `${s}% — Tente novamente para melhorar`,
    },
    nao_deu: {
      fundo: COLORS.erroVermelho,
      emoji: '📖',
      titulo: 'CONTINUE ESTUDANDO',
      subtitulo: `${s}% — Reforce os modulos com mais erros`,
    },
  };

  const cfg = configs[variante];

  // Persistir ranking
  const persistir = async () => {
    try {
      const db = getDatabase();
      const hoje = new Date().toISOString().split('T')[0]!;
      db.runSync(
        'INSERT INTO user_rankings (data, modulos, score, tipo) VALUES (?, ?, ?, ?)',
        [hoje, '[]', s / 100, 'QUIZ']
      );
    } catch {
      // Mock
    }
  };

  // Chamar persistir em useEffect lazy (simplificado aqui)
  if (typeof window !== 'undefined') {
    setTimeout(persistir, 100);
  }

  return (
    <View style={[styles.container, { backgroundColor: cfg.fundo }]}>
      <Text style={styles.emoji}>{cfg.emoji}</Text>
      <Text style={styles.titulo}>{cfg.titulo}</Text>
      <Text style={styles.subtitulo}>{cfg.subtitulo}</Text>

      <Pressable style={styles.botao} onPress={() => router.replace('/modos')}>
        <Text style={styles.botaoTexto}>VOLTAR AO MENU</Text>
      </Pressable>

      <Pressable
        style={[styles.botao, styles.botaoSecundario]}
        onPress={() => router.replace('/quiz')}
      >
        <Text style={styles.botaoSecundarioTexto}>JOGAR NOVAMENTE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.lg,
    gap: ESPACAMENTOS.xl,
  },
  emoji: { fontSize: 100 },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 48,
    color: COLORS.branco,
    textAlign: 'center',
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 4,
  },
  subtitulo: {
    fontFamily: FONTES.bodyBold,
    fontSize: 18,
    color: COLORS.branco,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: COLORS.preto,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    marginTop: ESPACAMENTOS.md,
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 20,
    color: COLORS.laranjaClaro,
  },
  botaoSecundario: { backgroundColor: COLORS.roxoPrimario },
  botaoSecundarioTexto: {
    fontFamily: FONTES.display,
    fontSize: 18,
    color: COLORS.branco,
  },
});