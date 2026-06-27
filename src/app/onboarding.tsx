import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { PersonagemLivro, type Pose } from '../components/PersonagemLivro';
import { GradienteRoxo } from '../components/Gradiente';
import { saveSetting } from '../lib/settings';
import { OPCOES_META } from '../lib/meta';
import { concederXp } from '../lib/xp';
import { registrarAtividade } from '../lib/streak';

/**
 * V23.C.1: Onboarding de ATIVACAO (substitui os slides estaticos). A pesquisa
 * (Duolingo) mostra que a 1a vitoria rapida e o "aha moment" que ativa o usuario.
 * Fluxo: saudacao -> motivacao -> meta diaria -> 1a vitoria garantida -> streak iniciado
 * -> permissao de notificacao -> entra no app. Tom encorajador (decisao de produto V23.1).
 */
const ONBOARDING_KEY = '@onboarding:completed';

type Etapa = 'saudacao' | 'motivacao' | 'meta' | 'vitoria' | 'streak' | 'notif';
const ETAPAS: Etapa[] = ['saudacao', 'motivacao', 'meta', 'vitoria', 'streak', 'notif'];

const MOTIVACOES: ReadonlyArray<{ id: string; rotulo: string; emoji: string }> = [
  { id: 'conhecer', rotulo: 'Conhecer a Bíblia', emoji: '📖' },
  { id: 'estudar', rotulo: 'Aprofundar meus estudos', emoji: '🎓' },
  { id: 'quiz', rotulo: 'Desafio do Quiz', emoji: '🎲' },
];

export default function Onboarding() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [motivacao, setMotivacao] = useState<string | null>(null);
  const [meta, setMeta] = useState<number>(50);
  const [venceu, setVenceu] = useState(false);

  const etapa = ETAPAS[idx]!;

  const finalizar = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    router.replace('/modos');
  };

  const avancar = () => {
    if (idx < ETAPAS.length - 1) setIdx(idx + 1);
    else finalizar();
  };

  const escolherMeta = async (valor: number) => {
    setMeta(valor);
    await saveSetting('metaDiaria', valor);
  };

  // 1a vitoria garantida: concede um XP simbolico + inicia o streak (dia 1).
  const confirmarVitoria = async () => {
    if (venceu) return;
    setVenceu(true);
    try {
      await concederXp(10, 'ACERTO');
      await registrarAtividade();
    } catch {
      // nao bloqueia o onboarding
    }
  };

  const pedirNotificacao = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      await saveSetting('notificacoes', status === 'granted');
    } catch {
      // permissao negada/indisponivel — segue sem travar
    }
    finalizar();
  };

  return (
    <GradienteRoxo style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Indicador de etapas */}
        <View style={styles.indicadores}>
          {ETAPAS.map((_, i) => (
            <View key={i} style={[styles.indicador, i === idx && styles.indicadorAtivo]} />
          ))}
        </View>

        {etapa === 'saudacao' ? (
          <Passo
            pose="FELIZ"
            titulo="Olá!"
            subtitulo="Eu sou seu guia nessa jornada. Juntos vamos te tornar um Expert na Bíblia, um passo de cada vez."
            botao="VAMOS LÁ!"
            onBotao={avancar}
          />
        ) : null}

        {etapa === 'motivacao' ? (
          <View style={styles.passo}>
            <PersonagemLivro pose="PENSATIVO" size={150} />
            <Text style={styles.titulo}>O que te traz aqui?</Text>
            <View style={styles.opcoes}>
              {MOTIVACOES.map((m) => (
                <Pressable
                  key={m.id}
                  style={[styles.opcao, motivacao === m.id && styles.opcaoAtiva]}
                  onPress={() => setMotivacao(m.id)}
                  accessibilityRole="button"
                  accessibilityLabel={m.rotulo}
                >
                  <Text style={styles.opcaoEmoji}>{m.emoji}</Text>
                  <Text style={styles.opcaoTexto}>{m.rotulo}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.botao, !motivacao && styles.botaoDesabilitado]}
              onPress={avancar}
              disabled={!motivacao}
            >
              <Text style={styles.botaoTexto}>CONTINUAR</Text>
            </Pressable>
          </View>
        ) : null}

        {etapa === 'meta' ? (
          <View style={styles.passo}>
            <PersonagemLivro pose="EXCLAMANDO" size={150} />
            <Text style={styles.titulo}>Qual sua meta diária?</Text>
            <Text style={styles.subtitulo}>Você pode mudar quando quiser nas configurações.</Text>
            <View style={styles.opcoes}>
              {OPCOES_META.map((o) => (
                <Pressable
                  key={o.valor}
                  style={[styles.opcao, meta === o.valor && styles.opcaoAtiva]}
                  onPress={() => escolherMeta(o.valor)}
                  accessibilityRole="button"
                  accessibilityLabel={`${o.rotulo}, ${o.descricao}`}
                >
                  <Text style={styles.opcaoTexto}>{o.rotulo}</Text>
                  <Text style={styles.opcaoSub}>{o.descricao}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.botao} onPress={avancar}>
              <Text style={styles.botaoTexto}>DEFINIR META</Text>
            </Pressable>
          </View>
        ) : null}

        {etapa === 'vitoria' ? (
          <View style={styles.passo}>
            <PersonagemLivro pose={venceu ? 'EXCLAMANDO' : 'PENSATIVO'} size={160} />
            {!venceu ? (
              <>
                <Text style={styles.titulo}>Sua 1ª pergunta</Text>
                <View style={styles.quadro}>
                  <Text style={styles.pergunta}>A Bíblia é a Palavra de Deus inspirada?</Text>
                </View>
                <Pressable style={styles.botaoResposta} onPress={confirmarVitoria}>
                  <Text style={styles.botaoTexto}>SIM!</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.titulo}>UAU! 🎉</Text>
                <Text style={styles.subtitulo}>Você acertou e já ganhou seus primeiros 10 XP. Viu como é fácil começar?</Text>
                <Pressable style={styles.botao} onPress={avancar}>
                  <Text style={styles.botaoTexto}>CONTINUAR</Text>
                </Pressable>
              </>
            )}
          </View>
        ) : null}

        {etapa === 'streak' ? (
          <Passo
            pose="FELIZ"
            titulo="🔥 Streak iniciado!"
            subtitulo="Você praticou hoje — esse é o dia 1 da sua sequência. Volte todos os dias para mantê-la acesa!"
            botao="ENTENDI"
            onBotao={avancar}
          />
        ) : null}

        {etapa === 'notif' ? (
          <View style={styles.passo}>
            <PersonagemLivro pose="PENSATIVO" size={150} />
            <Text style={styles.titulo}>Posso te lembrar?</Text>
            <Text style={styles.subtitulo}>Um lembrete gentil por dia ajuda a manter o hábito e a sua sequência.</Text>
            <Pressable style={styles.botao} onPress={pedirNotificacao}>
              <Text style={styles.botaoTexto}>SIM, ME LEMBRE</Text>
            </Pressable>
            <Pressable onPress={finalizar} accessibilityRole="button" accessibilityLabel="Agora não">
              <Text style={styles.pular}>Agora não</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </GradienteRoxo>
  );
}

function Passo({
  pose,
  titulo,
  subtitulo,
  botao,
  onBotao,
}: {
  pose: Pose;
  titulo: string;
  subtitulo: string;
  botao: string;
  onBotao: () => void;
}) {
  return (
    <View style={styles.passo}>
      <PersonagemLivro pose={pose} size={170} />
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.subtitulo}>{subtitulo}</Text>
      <Pressable style={styles.botao} onPress={onBotao} accessibilityRole="button" accessibilityLabel={botao}>
        <Text style={styles.botaoTexto}>{botao}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.lg,
    paddingTop: ESPACAMENTOS.xxl,
  },
  passo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: ESPACAMENTOS.lg,
    width: '100%',
  },
  indicadores: {
    flexDirection: 'row',
    gap: ESPACAMENTOS.sm,
    marginBottom: ESPACAMENTOS.lg,
    justifyContent: 'center',
  },
  indicador: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cinzaMedio,
  },
  indicadorAtivo: { backgroundColor: COLORS.laranjaClaro, width: 28 },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 40,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 18,
    color: COLORS.branco,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 24,
  },
  opcoes: { width: '100%', gap: ESPACAMENTOS.md, maxWidth: 360 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACAMENTOS.md,
    backgroundColor: COLORS.roxoEscuro,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaBorda,
    borderRadius: BORDAS.raioMedio,
    paddingVertical: ESPACAMENTOS.md,
    paddingHorizontal: ESPACAMENTOS.lg,
    minHeight: 56,
  },
  opcaoAtiva: { borderColor: COLORS.laranjaClaro, backgroundColor: COLORS.roxoPrimario },
  opcaoEmoji: { fontSize: 28 },
  opcaoTexto: { fontFamily: FONTES.bodyBold, fontSize: 18, color: COLORS.branco, flex: 1 },
  opcaoSub: { fontFamily: FONTES.bodyRegular, fontSize: 14, color: COLORS.laranjaClaro },
  quadro: {
    backgroundColor: COLORS.branco,
    padding: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
    width: '100%',
    maxWidth: 360,
  },
  pergunta: {
    fontFamily: FONTES.bodyBold,
    fontSize: 18,
    color: COLORS.preto,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: COLORS.laranjaEscuro,
    paddingHorizontal: ESPACAMENTOS.xxl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    minHeight: 48,
    justifyContent: 'center',
  },
  botaoDesabilitado: { opacity: 0.5 },
  botaoResposta: {
    backgroundColor: COLORS.acertoVerde,
    paddingHorizontal: ESPACAMENTOS.xxl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
    minHeight: 48,
    justifyContent: 'center',
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.branco,
    textAlign: 'center',
  },
  pular: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 15,
    color: COLORS.cinzaClaro,
    marginTop: ESPACAMENTOS.sm,
    textAlign: 'center',
  },
});

export const ONBOARDING_FLAG_KEY = ONBOARDING_KEY;
