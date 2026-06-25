import { View, Text, Pressable, StyleSheet } from 'react-native';
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
  // V19 BUG-5: le acertos + total para exibir "Voce acertou X de N" (briefing).
  const { score, acertos, total } = useLocalSearchParams<{
    score?: string;
    acertos?: string;
    total?: string;
  }>();
  const s = parseInt(score ?? '0', 10);
  const nAcertos = parseInt(acertos ?? '0', 10);
  const nTotal = parseInt(total ?? '20', 10);

  const variante = s >= 100 ? 'vitoria' : s >= 50 ? 'quase' : 'nao_deu';

  // V19 BUG-5: copy alinhada ao briefing — "NAO DEU" (<50%) / "QUASE LA" (50-99%) /
  // "VOCE PASSOU!" (100%). Antes era "PARABENS!"/"CONTINUE ESTUDANDO" (divergente).
  const configs = {
    vitoria: {
      pose: 'EXCLAMANDO' as Pose,
      titulo: 'VOCÊ PASSOU!',
      subtitulo: 'Você é um Expert!',
    },
    quase: {
      pose: 'PENSATIVO' as Pose,
      titulo: 'QUASE LÁ',
      subtitulo: 'Tente novamente para melhorar',
    },
    nao_deu: {
      pose: 'TRISTE' as Pose,
      titulo: 'NÃO DEU',
      subtitulo: 'Reforce os módulos com mais erros',
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

      {/* V19 BUG-5: quadro branco "Voce acertou X de N" (briefing) */}
      <View style={styles.quadroAcertos}>
        <Text style={styles.quadroAcertosTexto}>
          Você acertou {nAcertos} de {nTotal}
        </Text>
      </View>

      <Text style={styles.subtitulo}>{cfg.subtitulo}</Text>

      <Pressable style={styles.botao} onPress={() => router.replace('/modos')}>
        <Text style={styles.botaoTexto}>VOLTAR AO MENU</Text>
      </Pressable>

      <Pressable
        style={[styles.botao, styles.botaoSecundario]}
        onPress={() => router.replace('/quiz')}
      >
        <Text style={styles.botaoSecundarioTexto}>RECOMEÇAR</Text>
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
  // V19 BUG-5: quadro branco do placar "Voce acertou X de N".
  quadroAcertos: {
    backgroundColor: COLORS.branco,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
  },
  quadroAcertosTexto: {
    fontFamily: FONTES.bodyExtraBold,
    fontSize: 22,
    color: COLORS.roxoEscuro,
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