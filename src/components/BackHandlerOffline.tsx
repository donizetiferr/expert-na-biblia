import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { isOnline } from '../lib/network';

/**
 * BackHandlerOffline - V9 M4.7
 *
 * Intercepta o botao Back do Android SOMENTE quando o app esta em modo offline.
 * Mostra um Alert explicando a limitacao antes de permitir a saida.
 *
 * Em modo online, o botao Back funciona normalmente (delega ao default handler).
 *
 * Sem deps extras. Usa Alert.alert() nativo do RN.
 */
export function BackHandlerOffline() {
  useEffect(() => {
    const onBack = () => {
      if (isOnline()) {
        // Modo online: delega ao default handler (sai ou navega)
        return false;
      }
      // Modo offline: confirma antes de sair
      Alert.alert(
        'Modo Offline',
        'Voce esta sem internet. O conteudo do app (licoes, quiz) funciona normalmente, mas a avaliacao por IA de respostas abertas pode estar limitada.\n\nDeseja sair do app?',
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => {} },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: true },
      );
      return true; // indica que interceptou
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);
  return null;
}