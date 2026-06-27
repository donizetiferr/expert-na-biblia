import { View, Text, Pressable, StyleSheet, Switch, Alert, Share, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { loadSettings, saveSetting, SETTINGS_DEFAULTS } from '../lib/settings';
import { resetarProgresso } from '../lib/db-queries';
import { notifySettingsChanged } from '../lib/sound-runtime';
import { agendarLembreteDiario, cancelarTodos } from '../lib/notifications';
import { invalidateHapticsCache, lightTap } from '../lib/haptics';
import { OPCOES_META } from '../lib/meta';
import { exportarProgresso, importarProgresso } from '../lib/backup';
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
    // V23.E.6: o cache de haptics precisa ser invalidado para o toggle ter efeito imediato
    // (antes o cache de `hapticos` ficava preso ate reiniciar o app — V22.G.1).
    if (key === 'hapticos') {
      invalidateHapticsCache();
      if (value) lightTap().catch(() => {});
    }
    // V23.A.4: ligar/desligar notificacoes agenda/cancela o lembrete diario de fato.
    if (key === 'notificacoes') {
      if (value) {
        const [h, m] = (settings.horarioLembrete || '19:00').split(':').map((n) => parseInt(n, 10));
        agendarLembreteDiario(Number.isFinite(h) ? h : 19, Number.isFinite(m) ? m : 0).catch((e: unknown) =>
          console.warn('[config] agendar lembrete falhou:', e),
        );
      } else {
        cancelarTodos().catch((e: unknown) => console.warn('[config] cancelar lembrete falhou:', e));
      }
    }
  };

  // V23.A.3: meta diaria ajustavel em config (alem do onboarding).
  const escolherMeta = async (valor: number) => {
    await saveSetting('metaDiaria', valor);
    setSettings((s) => ({ ...s, metaDiaria: valor }));
  };

  const setVolume = async (key: 'volumeMusica' | 'volumeEfeitos', value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    await saveSetting(key, clamped);
    setSettings((s) => ({ ...s, [key]: clamped }));
    notifySettingsChanged().catch(() => {});
  };

  // V23.A.7: export/import manual do progresso (rede de seguranca alem do Auto Backup).
  const [mostrarImport, setMostrarImport] = useState(false);
  const [importTexto, setImportTexto] = useState('');

  const handleExportar = async () => {
    try {
      const json = await exportarProgresso();
      await Share.share({ message: json, title: 'Backup Expert Na Bíblia' });
    } catch (e) {
      console.warn('[config] exportar falhou:', e);
      Alert.alert('Não foi possível exportar', 'Tente novamente.');
    }
  };

  const handleImportar = async () => {
    const ok = await importarProgresso(importTexto.trim());
    if (ok) {
      setImportTexto('');
      setMostrarImport(false);
      Alert.alert('Progresso restaurado', 'Seu backup foi importado com sucesso.');
    } else {
      Alert.alert('Backup inválido', 'Confira o texto colado e tente novamente.');
    }
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

      {/* V23.A.7: ScrollView — o config cresceu (meta + reduzir animacoes + backup) e
          os itens passavam da dobra sem rolagem. */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
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

        {/* V23.A.3: meta diaria ajustavel */}
        <View style={styles.linhaColuna}>
          <Text style={styles.label}>Meta diária</Text>
          <View style={styles.metaOpcoes}>
            {OPCOES_META.map((o) => {
              const ativo = settings.metaDiaria === o.valor;
              return (
                <Pressable
                  key={o.valor}
                  style={[styles.metaBtn, ativo && styles.metaBtnAtivo]}
                  onPress={() => escolherMeta(o.valor)}
                  accessibilityRole="button"
                  accessibilityLabel={`Meta ${o.rotulo}, ${o.descricao}`}
                >
                  <Text style={[styles.metaBtnTexto, ativo && styles.metaBtnTextoAtivo]}>{o.descricao}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* V23.E.7: reduzir movimento (acessibilidade) */}
        <View style={styles.linha}>
          <Text style={styles.label}>Reduzir animações</Text>
          <Switch
            value={settings.reduceMotion}
            onValueChange={(v) => toggle('reduceMotion', v)}
            trackColor={{ false: COLORS.cinzaEscuro, true: COLORS.laranjaEscuro }}
            thumbColor={settings.reduceMotion ? COLORS.laranjaClaro : COLORS.cinzaMedio}
            accessibilityLabel="Reduzir animações"
          />
        </View>

        {/* V23.E.1: texto grande (idosos/baixa visao) — reforca o fontScale do sistema. */}
        <View style={styles.linha}>
          <Text style={styles.label}>Texto grande</Text>
          <Switch
            value={settings.textoGrande}
            onValueChange={(v) => toggle('textoGrande', v)}
            trackColor={{ false: COLORS.cinzaEscuro, true: COLORS.laranjaEscuro }}
            thumbColor={settings.textoGrande ? COLORS.laranjaClaro : COLORS.cinzaMedio}
            accessibilityLabel="Texto grande"
          />
        </View>

        {/* V23.A.7: backup do progresso */}
        <View style={styles.linhaColuna}>
          <Text style={styles.label}>Backup do progresso</Text>
          <Text style={styles.subLabel}>
            Seu progresso é salvo no backup do Android. Você também pode exportar/importar manualmente.
          </Text>
          <View style={styles.metaOpcoes}>
            <Pressable style={styles.backupBtn} onPress={handleExportar} accessibilityRole="button" accessibilityLabel="Exportar progresso">
              <Text style={styles.backupBtnTexto}>Exportar</Text>
            </Pressable>
            <Pressable
              style={styles.backupBtn}
              onPress={() => setMostrarImport((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel="Importar progresso"
            >
              <Text style={styles.backupBtnTexto}>Importar</Text>
            </Pressable>
          </View>
          {mostrarImport ? (
            <View style={styles.importBox}>
              <TextInput
                style={styles.importInput}
                value={importTexto}
                onChangeText={setImportTexto}
                placeholder="Cole aqui o texto do backup..."
                placeholderTextColor={COLORS.cinzaMedio}
                multiline
              />
              <Pressable style={styles.backupBtn} onPress={handleImportar}>
                <Text style={styles.backupBtnTexto}>Restaurar</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <Pressable style={styles.botaoReset} onPress={handleReset}>
          <Text style={styles.botaoResetTexto}>Resetar progresso</Text>
        </Pressable>
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  lista: {
    padding: ESPACAMENTOS.lg,
    gap: ESPACAMENTOS.md,
    paddingBottom: ESPACAMENTOS.xxl,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.roxoPrimario,
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
  },
  // V23.A.3: linha em coluna (label + opcoes de meta).
  linhaColuna: {
    backgroundColor: COLORS.roxoPrimario,
    padding: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    gap: ESPACAMENTOS.sm,
  },
  metaOpcoes: {
    flexDirection: 'row',
    gap: ESPACAMENTOS.sm,
  },
  metaBtn: {
    flex: 1,
    paddingVertical: ESPACAMENTOS.sm,
    borderRadius: BORDAS.raioPequeno,
    backgroundColor: COLORS.roxoCard,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.roxoCard,
    alignItems: 'center',
  },
  metaBtnAtivo: {
    borderColor: COLORS.laranjaClaro,
    backgroundColor: COLORS.roxoEscuro,
  },
  metaBtnTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 13,
    color: COLORS.cinzaClaro,
  },
  metaBtnTextoAtivo: {
    color: COLORS.laranjaClaro,
  },
  // V23.A.7: botoes de backup.
  backupBtn: {
    flex: 1,
    paddingVertical: ESPACAMENTOS.sm,
    borderRadius: BORDAS.raioPequeno,
    backgroundColor: COLORS.roxoCard,
    borderWidth: BORDAS.larguraMedia,
    borderColor: COLORS.laranjaBorda,
    alignItems: 'center',
  },
  backupBtnTexto: {
    fontFamily: FONTES.bodyBold,
    fontSize: 14,
    color: COLORS.laranjaClaro,
  },
  importBox: {
    gap: ESPACAMENTOS.sm,
    marginTop: ESPACAMENTOS.sm,
  },
  importInput: {
    backgroundColor: COLORS.roxoEscuro,
    borderRadius: BORDAS.raioPequeno,
    borderWidth: BORDAS.larguraFina,
    borderColor: COLORS.laranjaBorda,
    color: COLORS.branco,
    fontFamily: FONTES.bodyRegular,
    fontSize: 13,
    padding: ESPACAMENTOS.sm,
    minHeight: 60,
    maxHeight: 120,
    textAlignVertical: 'top',
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
