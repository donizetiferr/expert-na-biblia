import { View, Text, Pressable, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { loadSettings, saveSetting, SETTINGS_DEFAULTS } from '../lib/settings';
import { resetarProgresso } from '../lib/db-queries';
import { notifySettingsChanged } from '../lib/sound-runtime';
import type { Settings } from '../types';

/**
 * Tela de Configuracoes (modal).
 * V10 M6.2: sliders de volume independentes (musica + efeitos).
 * V10 M6.5/6.6: toggles hapticos + voz TTS.
 * Dispara notifySettingsChanged() apos cada save (M6.3) para reacao IMEDIATA.
 */
export default function ConfigScreen() {
  const router = useRouter();
  // V23.A.0: usa SETTINGS_DEFAULTS (fonte unica) em vez de literal — evita ficar
  // dessincronizado quando o tipo Settings ganha campos novos.
  const [settings, setSettings] = useState<Settings>({ ...SETTINGS_DEFAULTS });

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const toggle = async (key: keyof Settings, value: boolean) => {
    await saveSetting(key, value);
    setSettings((s) => ({ ...s, [key]: value }));
    notifySettingsChanged().catch(() => {});
  };

  const setVolume = async (key: 'volumeMusica' | 'volumeEfeitos', value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    await saveSetting(key, clamped);
    setSettings((s) => ({ ...s, [key]: clamped }));
    notifySettingsChanged().catch(() => {});
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

  // Componente de slider simples (4 botoes: 0, 33, 66, 100)
  const VolumeSlider = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <View style={styles.volumeRow}>
      {[0, 0.33, 0.66, 1].map((v) => (
        <Pressable
          key={v}
          style={[styles.volumeBtn, Math.abs(value - v) < 0.05 && styles.volumeBtnActive]}
          onPress={() => onChange(v)}
        >
          <Text style={[styles.volumeBtnText, Math.abs(value - v) < 0.05 && styles.volumeBtnTextActive]}>
            {v === 0 ? '🔇' : v === 0.33 ? '🔈' : v === 0.66 ? '🔉' : '🔊'}
          </Text>
        </Pressable>
      ))}
    </View>
  );

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
        {settings.musica && (
          <View style={styles.subLinha}>
            <Text style={styles.subLabel}>Volume da música</Text>
            <VolumeSlider value={settings.volumeMusica} onChange={(v) => setVolume('volumeMusica', v)} />
          </View>
        )}

        <View style={styles.linha}>
          <Text style={styles.label}>Efeitos sonoros</Text>
          <Switch
            value={settings.efeitos}
            onValueChange={(v) => toggle('efeitos', v)}
            trackColor={{ false: COLORS.cinzaEscuro, true: COLORS.laranjaEscuro }}
            thumbColor={settings.efeitos ? COLORS.laranjaClaro : COLORS.cinzaMedio}
          />
        </View>
        {settings.efeitos && (
          <View style={styles.subLinha}>
            <Text style={styles.subLabel}>Volume dos efeitos</Text>
            <VolumeSlider value={settings.volumeEfeitos} onChange={(v) => setVolume('volumeEfeitos', v)} />
          </View>
        )}

        <View style={styles.linha}>
          <Text style={styles.label}>Vibração (haptics)</Text>
          <Switch
            value={settings.hapticos}
            onValueChange={(v) => toggle('hapticos', v)}
            trackColor={{ false: COLORS.cinzaEscuro, true: COLORS.laranjaEscuro }}
            thumbColor={settings.hapticos ? COLORS.laranjaClaro : COLORS.cinzaMedio}
          />
        </View>

        <View style={styles.linha}>
          <Text style={styles.label}>Voz nas perguntas (TTS)</Text>
          <Switch
            value={settings.voz}
            onValueChange={(v) => toggle('voz', v)}
            trackColor={{ false: COLORS.cinzaEscuro, true: COLORS.laranjaEscuro }}
            thumbColor={settings.voz ? COLORS.laranjaClaro : COLORS.cinzaMedio}
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
  subLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.roxoCard,
    padding: ESPACAMENTOS.sm,
    paddingHorizontal: ESPACAMENTOS.lg,
    borderRadius: BORDAS.raioPequeno,
    marginLeft: ESPACAMENTOS.lg,
  },
  subLabel: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 14,
    color: COLORS.cinzaClaro,
  },
  label: {
    fontFamily: FONTES.bodyBold,
    fontSize: 16,
    color: COLORS.branco,
  },
  volumeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  volumeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cinzaEscuro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeBtnActive: {
    backgroundColor: COLORS.laranjaEscuro,
  },
  volumeBtnText: {
    fontSize: 16,
  },
  volumeBtnTextActive: {
    fontSize: 18,
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
