import { useEffect, useRef } from 'react';
import { BackHandler, Alert } from 'react-native';
import { isOnline, getNetworkStats } from '../lib/network';

/**
 * BackHandlerOffline - V9 M4.7 (polish)
 *
 * Intercepta o botao Back do Android SOMENTE quando o app esta em modo offline.
 * Mostra um Alert explicando a limitacao antes de permitir a saida.
 *
 * Em modo online, o botao Back funciona normalmente (delega ao default handler).
 *
 * M4.7 polish:
 *  - So intercepta apos 5s em offline consecutivo (evita friccao em flicker de rede)
 *  - Mostra tempo offline no Alert para contextualizar
 *  - Opcao "Continuar no app" deixa explicito que app continua funcional
 *
 * Sem deps extras. Usa Alert.alert() nativo do RN.
 */

const OFFLINE_GRACE_MS = 5000;

export function BackHandlerOffline() {
  // Marca o timestamp em que ficamos offline pela primeira vez
  const offlineSinceRef = useRef<number | null>(null);

  useEffect(() => {
    const onBack = () => {
      if (isOnline()) {
        // Online: reseta marker offline + delega ao default handler
        offlineSinceRef.current = null;
        return false;
      }

      // Offline: so intercepta se passou grace period
      const stats = getNetworkStats();
      const now = Date.now();
      if (offlineSinceRef.current === null) {
        offlineSinceRef.current = stats.lastChange;
      }
      const offlineDuration = now - offlineSinceRef.current;
      if (offlineDuration < OFFLINE_GRACE_MS) {
        // Ainda dentro do grace — delega ao default (permite sair sem friccao)
        return false;
      }

      const minutos = Math.floor(offlineDuration / 60_000);
      const offlineLabel = minutos < 1 ? 'alguns segundos' : `${minutos} min`;

      Alert.alert(
        'Modo Offline',
        `Voce esta sem internet ha ${offlineLabel}. O conteudo do app (licoes, quiz) funciona normalmente, mas a avaliacao por IA de respostas abertas pode estar limitada.\n\nDeseja sair do app?`,
        [
          { text: 'Continuar no app', style: 'cancel', onPress: () => {} },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: true },
      );
      return true; // interceptou
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);
  return null;
}