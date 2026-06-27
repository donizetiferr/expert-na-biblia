import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { playMusicaFundo, stopMusicaFundo } from '../lib/sound';
import { initSoundRuntime, stopSoundRuntime } from '../lib/sound-runtime';
import { startMonitoring, stopMonitoring } from '../lib/network';
import { BannerOffline } from '../components/BannerOffline';
import { useBackHandlerRoot } from '../hooks/useBackHandlerRoot';
import { runMigrations } from '../db/database';
import { garantirFreezeSemanal } from '../lib/streak';

export default function RootLayout() {
  // V12 7.2: hook de back handler que mostra modal "Deseja sair?" SOMENTE em /modos.
  // Substitui o BackHandlerOffline global.
  useBackHandlerRoot();

  const [fontsLoaded, fontError] = useFonts({
    Bangers_400Regular,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  // V9.2.1: roda migrations + seed na PRIMEIRA execucao do app
  // (idempotente: aplica seed uma vez via flag _seed_applied)
  useEffect(() => {
    if (fontsLoaded || fontError) {
      runMigrations().then(() => {
        console.debug('[layout] migrations+seed OK');
        // V23.A.2: garante o token de freeze semanal (idempotente, 1x/semana) apos as
        // migrations (a tabela streak_freeze ja existe). Protege o streak contra 1 falta.
        garantirFreezeSemanal().catch((e: unknown) =>
          console.warn('[layout] garantirFreezeSemanal falhou:', e),
        );
      }).catch((e) => {
        console.warn('[layout] migrations falharam:', e && e.stack ? e.stack : e);
      });
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // V13 14.1.4: log quando musica fundo falha em vez de silenciar
      playMusicaFundo().catch((e: unknown) =>
        console.warn('[audio] layout playMusicaFundo falhou:', e),
      );
      // V9 M3.1: inicia runtime watcher para reagir a mudancas de settings
      initSoundRuntime();
      // V9 M4.7: inicia monitor de conectividade para o BannerOffline
      startMonitoring();
    }
    return () => {
      stopMusicaFundo().catch((e: unknown) =>
        console.warn('[audio] layout stopMusicaFundo falhou:', e),
      );
      stopSoundRuntime();
      stopMonitoring();
    };
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {/* V19 BUG-8: o BannerOffline era `position: absolute; top: 0` e cobria os
            titulos/icone ≡ das telas (Configuracoes, "Escolher modulos"). Agora ele
            vive no FLUXO normal (coluna), acima do Stack: quando offline empurra o
            conteudo para baixo (sem sobrepor); quando online retorna null (zero
            altura) e o Stack ocupa tudo como antes. */}
        <View style={{ flex: 1, backgroundColor: '#3c026d' }}>
          <BannerOffline />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#3c026d' },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="modos" />
            <Stack.Screen name="licoes" />
            <Stack.Screen name="quiz" />
            <Stack.Screen name="config" />
            <Stack.Screen name="perfil" />
            <Stack.Screen name="trofeu" />
          </Stack>
        </View>
        {/* V12 7.2: BackHandlerOffline removido. Modal "Sair" agora vive em useBackHandlerRoot (só em /modos). */}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}