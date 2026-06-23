import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Nunito_400Regular, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Bangers_400Regular,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    // M4.2 (V8-RETOMADA): mover SplashScreen.preventAutoHideAsync() para useEffect
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#3c026d' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="modos" />
          <Stack.Screen name="licoes" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="config" />
          <Stack.Screen name="trofeu" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}