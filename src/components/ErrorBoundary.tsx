import { Component, type ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { registrarErro } from '../lib/analytics';

/**
 * V23.G.2: Error Boundary com fallback amigavel.
 *
 * Sem isso, um erro de render em qualquer tela fecha o app inteiro (tela branca / crash).
 * Aqui capturamos o erro, registramos (analytics/console — preparado para crash reporting
 * externo futuro) e mostramos uma tela on-brand com "Tentar novamente" em vez do crash.
 *
 * `fallbackTitle`/`fallbackAcao` permitem personalizar por area (ex.: "Voltar aos modulos").
 */
interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackAcao?: { rotulo: string; onPress: () => void };
}

interface State {
  erro: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null };

  static getDerivedStateFromError(erro: Error): State {
    return { erro };
  }

  componentDidCatch(erro: Error, info: { componentStack?: string }): void {
    // Registra para diagnostico (console + analytics local; futuro: Sentry).
    registrarErro(erro, info?.componentStack ?? undefined);
  }

  private reiniciar = () => {
    this.setState({ erro: null });
  };

  render(): ReactNode {
    if (this.state.erro) {
      const { fallbackTitle, fallbackAcao } = this.props;
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>🙏</Text>
          <Text style={styles.titulo}>{fallbackTitle ?? 'Algo deu errado'}</Text>
          <Text style={styles.subtitulo}>
            Tivemos um probleminha nesta tela. Seu progresso está salvo — é só tentar de novo.
          </Text>
          <Pressable
            style={styles.botao}
            onPress={fallbackAcao ? fallbackAcao.onPress : this.reiniciar}
            accessibilityRole="button"
            accessibilityLabel={fallbackAcao ? fallbackAcao.rotulo : 'Tentar novamente'}
          >
            <Text style={styles.botaoTexto}>{fallbackAcao ? fallbackAcao.rotulo : 'TENTAR NOVAMENTE'}</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.creme,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.xl,
    gap: ESPACAMENTOS.md,
  },
  emoji: { fontSize: 56 },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 32,
    color: COLORS.roxoEscuro,
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 16,
    color: COLORS.preto,
    textAlign: 'center',
    lineHeight: 23,
  },
  botao: {
    marginTop: ESPACAMENTOS.md,
    backgroundColor: COLORS.roxoPrimario,
    paddingHorizontal: ESPACAMENTOS.xl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    borderWidth: 3,
    borderColor: COLORS.laranjaEscuro,
    minHeight: 48,
    justifyContent: 'center',
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.branco,
    letterSpacing: 1,
  },
});
