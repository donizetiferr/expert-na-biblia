import { View, Text, Pressable, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { loadSettings, saveSetting } from '../lib/settings';
import { resetarProgresso } from '../lib/db-queries';
import type { Settings } from '../types';

/**
 * Tela de Configuracoes (modal).
 * Toggles: musica de fundo (default on), efeitos sonoros (default on),
 * notificacoes (default off). Botao resetar progresso (com confirmacao).
 */
export default function ConfigScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    musica: true,
    efeitos: true,
    notificacoes: false,
  });

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const toggle = async (key: keyof Settings, value: boolean) => {
    await saveSetting(key, value);
    setSettings((s) => ({ ...s, [key]: value }));
  };

  const handleReset = () => {
    Alert.alert(
      'Resetar progresso?',
      'Isso apaga todo o progresso (módulos, lições, ranking). Confirma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            await resetarProgresso();
            Alert.alert('Progresso resetado', 'Todos os dados foram apagados.');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.botaoFechar}>
          <Text style={styles.botaoFecharTexto}>✕</Text>
        </Pressable>
        <Text style={styles.titulo}>Configurações</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.lista}>
        <View style={styles.linha}>
          <Text style={styles.label}>Música de fundo</Text>
          <Switch
            value={settings.musica}
            onValueChange={(v) => toggle('musica', v)}
            trackColor={{ false: COLORS.cinzaEscuro, true: COLORS.laranjaEscuro }}
            thumbColor={settings.musica ? COLORS.laranjaClaro : COLORS.cinzaMedio}
          />
        </View>

        <View style={styles.linha}>
          <Text style={styles.label}>Efeitos sonoros</Text>
          <Switch
            value={settings.efeitos}
            onValueChange={(v) => toggle('efeitos', v)}
            trackColor={{ false: COLORS.cinzaEscuro, true: COLORS.laranjaEscuro }}
            thumbColor={settings.efeitos ? COLORS.laranjaClaro : COLORS.cinzaMedio}
          />
        </View>

        <View style={styles.linha}>
          <Text style={styles.label}>Notificações push</Text>
          <Switch
            value={settings.notificacoes}
            onValueChange={(v) => toggle('notificacoes', v)}
            trackColor={{ false: COLORS.cinzaEscuro, true: COLORS.laranjaEscuro }}
            thumbColor={settings.notificacoes ? COLORS.laranjaClaro : COLORS.cinzaMedio}
          />
        </View>

        <Pressable style={styles.botaoReset} onPress={handleReset}>
          <Text style={styles.botaoResetTexto}>Resetar progresso</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.roxoEscuro,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: ESPACAMENTOS.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cinzaEscuro,
  },
  botaoFechar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoFecharTexto: {
    fontSize: 24,
    color: COLORS.laranjaEscuro,
    fontWeight: 'bold',
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.laranjaClaro,
  },
  lista: {
    padding: ESPACAMENTOS.lg,
    gap: ESPACAMENTOS.md,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.roxoPrimario,
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
  },
  label: {
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.branco,
  },
  botaoReset: {
    marginTop: ESPACAMENTOS.xl,
    backgroundColor: COLORS.erroVermelho,
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    alignItems: 'center',
  },
  botaoResetTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.branco,
  },
});