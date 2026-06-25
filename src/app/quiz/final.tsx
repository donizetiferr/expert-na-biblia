import { Text, Pressable, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../../constants/colors';
import { getDatabase } from '../../db/database';
import { PersonagemLivro, type Pose } from '../../components/PersonagemLivro';
import { GradienteLaranjaForte } from '../../components/Gradiente';

/**
 * Tela Quiz: Placar final (3 variantes <50%/>50%/100%).
 * Persiste ranking em user_rankings.
 */
export default function QuizFinal() {
  const router = useRouter();
  const { score } = useLocalSearchParams<{ score?: string }>();
  const s = parseInt(score ?? '0', 10);

  const variante = s >= 100 ? 'vitoria' : s >= 50 ? 'quase' : 'nao_deu';

  // V10 M5.6: briefing usa laranja forte, nao roxo/vermelho
  // V18.3 MD.5: pose do PersonagemLivro por faixa (em vez de emoji gigante).
  const configs = {
    vitoria: {
      pose: 'EXCLAMANDO' as Pose,
      titulo: 'PARABÉNS!',
      subtitulo: `${s}% de acerto — você é um Expert!`,
    },
    quase: {
      pose: 'PENSATIVO' as Pose,
      titulo: 'QUASE LÁ',
      subtitulo: `${s}% — Tente novamente para melhorar`,
    },
    nao_deu: {
      pose: 'TRISTE' as Pose,
      titulo: 'CONTINUE ESTUDANDO',
      subtitulo: `${s}% — Reforce os modulos com mais erros`,
    },
  };

  const cfg = configs[variante];

  // V18.1 MA.4: persistir ranking em useEffect (1x). Antes estava no body com guard
  // `typeof window` — que e' sempre undefined em React Native, entao NUNCA gravava;
  // e se rodasse (web) gravaria a cada re-render.
  useEffect(() => {
    const persistir = () => {
      try {
        const db = getDatabase();
        const hoje = new Date().toISOString().split('T')[0]!;
        db.runSync(
          'INSERT INTO user_rankings (data, modulos, score, tipo) VALUES (?, ?, ?, ?)',
          [hoje, '[]', s / 100, 'QUIZ'],
        );
      } catch {
        // Mock
      }
    };
    const t = setTimeout(persistir, 100);
    return () => clearTimeout(t);
  }, [s]);

  return (
    <GradienteLaranjaForte style={styles.container}>
      <PersonagemLivro pose={cfg.pose} size={160} />
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
    </GradienteLaranjaForte>
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