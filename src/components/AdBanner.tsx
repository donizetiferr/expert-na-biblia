import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

/**
 * Banner AdMob inferior (V6, ITEM-46).
 * Aparece em telas NAO-criticas (Modos, Licoes 1, Quiz).
 * NUNCA em: splash, Tela Final, Tela Feedback.
 *
 * ATENCAO: em ambiente sem AdMob configurado, renderiza placeholder invisivel.
 * Para ativar, configurar AdMob App ID em app.json plugin expo-ads-admob.
 */

interface Props {
  visivel: boolean;
}

export function AdBanner({ visivel }: Props) {
  if (!visivel) return null;

  // TODO: integrar com <BannerAd unitId="..." size="BANNER" />
  return (
    <View style={styles.placeholder}>
      {/* Slot reservado para banner AdMob */}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 60,
    backgroundColor: COLORS.preto,
    opacity: 0.1,
  },
});

export default AdBanner;