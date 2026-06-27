import { View, Text, Pressable, StyleSheet, Image, ScrollView, Share } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { GradienteRoxo } from '../components/Gradiente';
import { proximaLicaoPendente } from '../lib/db-queries';
import { versiculoDeHoje, textoCompartilhavel } from '../lib/versiculo-do-dia';
import { registrarAtividade } from '../lib/streak';
import { contarRevisaoPendente } from '../lib/revisao';
import { contarCompletar } from '../lib/completar';
import { obterPerfilAtivo, type Perfil } from '../lib/perfis';

/**
 * Tela 2: Selecao de modo (Quiz Biblico / Licoes).
 * V10 M5.2: cores oficiais do briefing (pixel analysis).
 * - Fundo creme #f7f4ed
 * - Cards roxo #4d0a7d com borda laranja #f9ea59
 * - Logo grande no topo
 * - "BÍBLICO" e "LIÇÕES" em laranjaEscuro (resto branco)
 */
export default function ModosScreen() {
  const router = useRouter();
  // V23.C.2: proxima licao pendente para o CTA "Continuar" (recarrega ao focar).
  const [pendente, setPendente] = useState<{ moduloId: string; licaoId: string } | null>(null);
  // V23.D.5: versiculo do dia (deterministico por dia do ano).
  const versiculo = versiculoDeHoje();
  const [liHoje, setLiHoje] = useState(false);
  // V23.5 (D.2/D.3): revisao pendente (badge) + disponibilidade do "completar versiculo".
  const [revisaoPendente, setRevisaoPendente] = useState(0);
  const [temCompletar, setTemCompletar] = useState(false);
  // V23.9 (I): perfil ativo (nome + tipo) para o seletor de perfis.
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  const compartilharVersiculo = () => {
    Share.share({ message: textoCompartilhavel(versiculo) }).catch((e: unknown) =>
      console.warn('[modos] compartilhar versiculo falhou:', e),
    );
  };

  const marcarLiVersiculo = () => {
    if (liHoje) return;
    setLiHoje(true);
    // Ler o versiculo conta como pratica do dia (mantem o streak — qualquer pratica vale).
    registrarAtividade().catch((e: unknown) => console.warn('[modos] registrar atividade falhou:', e));
  };

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      proximaLicaoPendente().then((p) => {
        if (ativo) setPendente(p);
      });
      // V23.5: atualiza badge de revisao + disponibilidade do completar ao focar.
      contarRevisaoPendente().then((n) => {
        if (ativo) setRevisaoPendente(n);
      });
      contarCompletar().then((n) => {
        if (ativo) setTemCompletar(n > 0);
      });
      obterPerfilAtivo().then((p) => {
        if (ativo) setPerfil(p);
      });
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      {/* V23.B.2: acesso ao perfil/"Meu Progresso" (canto superior esquerdo). */}
      <Pressable
        style={styles.botaoPerfil}
        onPress={() => router.push('/perfil')}
        accessibilityRole="button"
        accessibilityLabel="Meu Progresso"
      >
        <Text style={styles.textoPerfil}>📊</Text>
      </Pressable>

      <Pressable
        style={styles.botaoConfig}
        onPress={() => router.push('/config')}
        accessibilityRole="button"
        accessibilityLabel="Configurações"
      >
        <Text style={styles.textoConfig}>≡</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* V23.9 (I.3): perfil ativo + acesso ao seletor (trocar em 1-2 toques). */}
        {perfil ? (
          <Pressable
            style={styles.perfilPill}
            onPress={() => router.push('/perfis')}
            accessibilityRole="button"
            accessibilityLabel={`Perfil ativo: ${perfil.nome}. Tocar para trocar de perfil`}
          >
            <Text style={styles.perfilPillTexto}>
              {perfil.tipo === 'kids' ? '🧒' : '👤'} {perfil.nome}
            </Text>
            {perfil.tipo === 'kids' ? <Text style={styles.kidsBadge}>MODO KIDS</Text> : null}
            <Text style={styles.perfilPillTrocar}>⇄</Text>
          </Pressable>
        ) : null}

        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* V23.C.2: continuar de onde parou (1 toque -> proxima licao pendente). */}
        {pendente ? (
          <Pressable
            style={styles.continuarBtn}
            onPress={() => router.push(`/licoes/${pendente.moduloId}/${pendente.licaoId}`)}
            accessibilityRole="button"
            accessibilityLabel="Continuar de onde parou"
          >
            <Text style={styles.continuarTexto}>▶  CONTINUAR</Text>
          </Pressable>
        ) : null}

        <View style={styles.cards}>
          <Pressable style={styles.cardShadow} onPress={() => router.push('/quiz')}>
            <GradienteRoxo diagonal style={styles.card}>
              <Text style={styles.cardTitulo}>
                <Text style={styles.palavraChave}>QUIZ </Text>
                <Text style={styles.palavraChave}>BÍBLICO</Text>
              </Text>
              <Text style={styles.cardSubtitulo}>20 perguntas · Timer 10s</Text>
            </GradienteRoxo>
          </Pressable>

          <Pressable style={styles.cardShadow} onPress={() => router.push('/licoes')}>
            <GradienteRoxo diagonal style={styles.card}>
              <Text style={styles.cardTitulo}>
                <Text style={styles.palavraChave}>LIÇÕES</Text>
              </Text>
              <Text style={styles.cardSubtitulo}>40 módulos progressivos</Text>
            </GradienteRoxo>
          </Pressable>
        </View>

        {/* V23.5 (D.2/D.3): modos de aprendizado — Revisão (Leitner) e Completar Versículo. */}
        <View style={styles.cardsSecundarios}>
          <Pressable
            style={styles.cardMenor}
            onPress={() => router.push('/revisao')}
            accessibilityRole="button"
            accessibilityLabel={
              revisaoPendente > 0 ? `Revisão, ${revisaoPendente} pendentes` : 'Revisão'
            }
          >
            <Text style={styles.cardMenorEmoji}>🔁</Text>
            <Text style={styles.cardMenorTitulo}>REVISÃO</Text>
            {revisaoPendente > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>{revisaoPendente}</Text>
              </View>
            ) : null}
          </Pressable>

          {temCompletar ? (
            <Pressable
              style={styles.cardMenor}
              onPress={() => router.push('/completar')}
              accessibilityRole="button"
              accessibilityLabel="Completar versículo"
            >
              <Text style={styles.cardMenorEmoji}>✍️</Text>
              <Text style={styles.cardMenorTitulo}>COMPLETAR</Text>
              <Text style={styles.cardMenorSub}>versículo</Text>
            </Pressable>
          ) : null}
        </View>

        {/* V23.8 (H.2/H.3): Coleções (mapa de áreas) + Cosméticos (personalização por XP). */}
        <View style={styles.cardsSecundarios}>
          <Pressable
            style={styles.cardMenor}
            onPress={() => router.push('/colecoes')}
            accessibilityRole="button"
            accessibilityLabel="Coleções por área"
          >
            <Text style={styles.cardMenorEmoji}>🗂️</Text>
            <Text style={styles.cardMenorTitulo}>COLEÇÕES</Text>
            <Text style={styles.cardMenorSub}>por área</Text>
          </Pressable>

          <Pressable
            style={styles.cardMenor}
            onPress={() => router.push('/cosmeticos')}
            accessibilityRole="button"
            accessibilityLabel="Cosméticos"
          >
            <Text style={styles.cardMenorEmoji}>🎨</Text>
            <Text style={styles.cardMenorTitulo}>VISUAL</Text>
            <Text style={styles.cardMenorSub}>cosméticos</Text>
          </Pressable>
        </View>

        {/* V23.D.5: versiculo do dia (devocional leve + compartilhavel). */}
        <View style={styles.versiculoCard}>
          <Text style={styles.versiculoTitulo}>📖 Versículo de hoje</Text>
          <Text style={styles.versiculoTexto}>"{versiculo.texto}"</Text>
          <Text style={styles.versiculoRef}>— {versiculo.referencia}</Text>
          <View style={styles.versiculoAcoes}>
            <Pressable
              style={[styles.versiculoBtn, liHoje && styles.versiculoBtnLido]}
              onPress={marcarLiVersiculo}
              accessibilityRole="button"
              accessibilityLabel={liHoje ? 'Versículo lido hoje' : 'Marcar como lido hoje'}
            >
              <Text style={styles.versiculoBtnTexto}>{liHoje ? '✓ Lido hoje' : 'Li hoje'}</Text>
            </Pressable>
            <Pressable
              style={styles.versiculoBtn}
              onPress={compartilharVersiculo}
              accessibilityRole="button"
              accessibilityLabel="Compartilhar versículo"
            >
              <Text style={styles.versiculoBtnTexto}>Compartilhar</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creme,
    padding: ESPACAMENTOS.lg,
  },
  botaoConfig: {
    position: 'absolute',
    top: ESPACAMENTOS.xl,
    right: ESPACAMENTOS.lg,
    padding: ESPACAMENTOS.sm,
    zIndex: 10,
  },
  textoConfig: {
    fontSize: 36,
    color: COLORS.laranjaEscuro,
    fontWeight: 'bold',
  },
  // V23.B.2: botao de perfil (canto superior esquerdo).
  botaoPerfil: {
    position: 'absolute',
    top: ESPACAMENTOS.xl,
    left: ESPACAMENTOS.lg,
    padding: ESPACAMENTOS.sm,
    zIndex: 10,
  },
  textoPerfil: {
    fontSize: 30,
  },
  // V23.C.2: CTA continuar (destaque amarelo on-brand).
  continuarBtn: {
    backgroundColor: COLORS.laranjaForte,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.preto,
    paddingVertical: ESPACAMENTOS.md,
    alignItems: 'center',
    marginBottom: ESPACAMENTOS.md,
  },
  continuarTexto: {
    fontFamily: FONTES.display,
    fontSize: 24,
    color: COLORS.branco,
    letterSpacing: 1,
  },
  // V23.D.5: scroll content (logo + continuar + cards + versiculo).
  scroll: {
    paddingTop: ESPACAMENTOS.xl,
    paddingBottom: ESPACAMENTOS.xl,
  },
  // V23.9 (I.3): pill do perfil ativo (centralizada acima do logo).
  perfilPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: ESPACAMENTOS.sm,
    backgroundColor: COLORS.roxoEscuro,
    borderRadius: BORDAS.raioGrande,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaBorda,
    paddingHorizontal: ESPACAMENTOS.md,
    paddingVertical: ESPACAMENTOS.xs,
    marginBottom: ESPACAMENTOS.sm,
  },
  perfilPillTexto: { fontFamily: FONTES.bodyExtraBold, fontSize: 15, color: COLORS.branco },
  kidsBadge: {
    fontFamily: FONTES.display,
    fontSize: 13,
    color: COLORS.roxoEscuro,
    backgroundColor: COLORS.laranjaClaro,
    borderRadius: BORDAS.raioPequeno,
    paddingHorizontal: ESPACAMENTOS.sm,
    letterSpacing: 1,
  },
  perfilPillTrocar: { fontSize: 18, color: COLORS.laranjaClaro },
  logo: {
    // V23.D.5: logo menor (280 -> 200) para o conteudo (cards + versiculo) caber melhor.
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: ESPACAMENTOS.md,
  },
  cards: {
    gap: ESPACAMENTOS.lg,
  },
  // V23.5: linha de modos de aprendizado (cards menores).
  cardsSecundarios: {
    flexDirection: 'row',
    gap: ESPACAMENTOS.md,
    marginTop: ESPACAMENTOS.md,
  },
  cardMenor: {
    flex: 1,
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaForte,
    paddingVertical: ESPACAMENTOS.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 92,
  },
  cardMenorEmoji: {
    fontSize: 30,
  },
  cardMenorTitulo: {
    fontFamily: FONTES.display,
    fontSize: 20,
    color: COLORS.roxoEscuro,
    letterSpacing: 1,
    marginTop: ESPACAMENTOS.xs,
  },
  cardMenorSub: {
    fontFamily: FONTES.bodyBold,
    fontSize: 12,
    color: COLORS.laranjaForte,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.laranjaForte,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeTexto: {
    fontFamily: FONTES.bodyExtraBold,
    fontSize: 13,
    color: COLORS.branco,
  },
  // V23.D.5: card do versiculo do dia.
  versiculoCard: {
    marginTop: ESPACAMENTOS.lg,
    backgroundColor: COLORS.branco,
    borderRadius: BORDAS.raioMedio,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaForte,
    padding: ESPACAMENTOS.md,
    gap: ESPACAMENTOS.sm,
  },
  versiculoTitulo: {
    fontFamily: FONTES.display,
    fontSize: 20,
    color: COLORS.laranjaForte,
    letterSpacing: 1,
  },
  versiculoTexto: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 15,
    color: COLORS.preto,
    lineHeight: 21,
  },
  versiculoRef: {
    fontFamily: FONTES.bodyExtraBold,
    fontSize: 14,
    color: COLORS.roxoEscuro,
    textAlign: 'right',
  },
  versiculoAcoes: {
    flexDirection: 'row',
    gap: ESPACAMENTOS.sm,
    marginTop: ESPACAMENTOS.xs,
  },
  versiculoBtn: {
    flex: 1,
    paddingVertical: ESPACAMENTOS.sm,
    borderRadius: BORDAS.raioPequeno,
    backgroundColor: COLORS.roxoEscuro,
    alignItems: 'center',
  },
  versiculoBtnLido: {
    backgroundColor: COLORS.acertoVerde,
  },
  versiculoBtnTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 14,
    color: COLORS.branco,
  },
  // V18.3 MC.2/MD.2: sombra fica no Pressable externo; o degrade roxo + borda
  // laranja ficam no card interno (overflow hidden para o degrade respeitar o raio).
  cardShadow: {
    borderRadius: BORDAS.raioGrande,
    shadowColor: COLORS.preto,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  card: {
    padding: ESPACAMENTOS.xl,
    borderRadius: BORDAS.raioGrande,
    borderWidth: 4,
    borderColor: COLORS.laranjaBorda,        // #f9ea59 (briefing): borda laranja
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardTitulo: {
    fontFamily: FONTES.display,
    fontSize: 36,
    color: COLORS.branco,
    textShadowColor: COLORS.preto,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  palavraChave: {
    color: COLORS.laranjaClaro,              // amarelo-laranja sobre o degrade roxo
    fontFamily: FONTES.bodyExtraBold,
  },
  cardSubtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 16,
    color: COLORS.branco,
    marginTop: ESPACAMENTOS.xs,
    opacity: 0.9,
  },
});
