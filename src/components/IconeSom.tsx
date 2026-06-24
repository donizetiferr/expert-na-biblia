import { useEffect, useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { loadSettings, saveSetting } from '../lib/settings';

/**
 * V9 M2.5: IconeSom toggle (som on/off) para Tela Licao.
 * Le settings.efeitos, inverte e salva em runtime (AppState/useFocusEffect ja cuida).
 * Render: emoji 🔊 (on) / 🔇 (off) com fundo translucido para visibilidade.
 */
export function IconeSom() {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    loadSettings().then((s) => setOn(s.efeitos !== false)); // default true
  }, []);

  const toggle = async () => {
    const novoValor = !(on ?? true);
    setOn(novoValor);
    await saveSetting('efeitos', novoValor);
  };

  if (on === null) return null;

  return (
    <Pressable
      style={[styles.botao, { backgroundColor: on ? COLORS.laranjaEscuro : COLORS.cinzaMedio }]}
      onPress={toggle}
      accessibilityLabel={on ? 'Desativar som' : 'Ativar som'}
      accessibilityRole="button"
    >
      <Text style={styles.icone}>{on ? '🔊' : '🔇'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.branco,
  },
  icone: {
    fontSize: 22,
  },
});
