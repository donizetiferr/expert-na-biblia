/**
 * useBackHandlerRoot — V12 7.2
 *
 * Hook que escuta o botao "back" do Android APENAS na rota raiz (/modos)
 * e mostra um Alert "Deseja sair do app?". Em outras rotas, deixa o back
 * funcionar normalmente (router.back()).
 */
import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { usePathname } from 'expo-router';

export function useBackHandlerRoot(): void {
  const pathname = usePathname();

  useEffect(() => {
    const onBack = () => {
      // So intercepta back na rota raiz
      if (pathname === '/modos' || pathname === '/') {
        Alert.alert(
          'Sair do app?',
          'Voce esta na tela inicial. Deseja realmente sair?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => {} },
            { text: 'Sair', style: 'destructive', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true }
        );
        return true; // bloqueia back default
      }
      // Em outras rotas, deixa o Expo Router lidar (router.back)
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [pathname]);
}
