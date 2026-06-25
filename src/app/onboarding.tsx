import { View, Text, Pressable, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { PersonagemLivro, type Pose } from '../components/PersonagemLivro';
import { GradienteRoxo } from '../components/Gradiente';

interface Slide {
  pose: Pose;
  titulo: string;
  subtitulo: string;
}

const SLIDES: Slide[] = [
  {
    pose: 'FELIZ',
    titulo: 'Bem-vindo!',
    subtitulo: 'Torne-se um Expert na Bíblia de forma ludica e progressiva.',
  },
  {
    pose: 'PENSATIVO',
    titulo: 'Como funciona',
    subtitulo: '2 modos: Licoes progressivas (40 modulos) + Quiz Biblico rapido (20 perguntas).',
  },
  {
    pose: 'EXCLAMANDO',
    titulo: 'Vamos comecar!',
    subtitulo: 'Conclua cada licao com 100% para liberar a proxima e ganhar o trofeu Expert!',
  },
];

const ONBOARDING_KEY = '@onboarding:completed';

export default function Onboarding() {
  const router = useRouter();
  const [indice, setIndice] = useState(0);
  // V18.3 (16.5): useWindowDimensions atualiza em rotacao (antes Dimensions.get no
  // module scope nao atualizava -> slides cortados em landscape).
  const { width } = useWindowDimensions();

  const proximo = async () => {
    if (indice < SLIDES.length - 1) {
      setIndice(indice + 1);
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, '1');
      router.replace('/');
    }
  };

  const slide = SLIDES[indice];
  if (!slide) return null;

  return (
    <GradienteRoxo style={styles.container}>
      <FlatList
        data={[slide]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <PersonagemLivro pose={item.pose} size={180} />
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.subtitulo}>{item.subtitulo}</Text>
          </View>
        )}
        keyExtractor={(_, i) => `slide-${i}`}
      />

      <View style={styles.indicadores}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.indicador, i === indice && styles.indicadorAtivo]}
          />
        ))}
      </View>

      <Pressable style={styles.botao} onPress={proximo}>
        <Text style={styles.botaoTexto}>
          {indice < SLIDES.length - 1 ? 'PROXIMO' : 'COMECAR!'}
        </Text>
      </Pressable>

      {indice < SLIDES.length - 1 && (
        <Pressable onPress={async () => {
          await AsyncStorage.setItem(ONBOARDING_KEY, '1');
          router.replace('/');
        }}>
          <Text style={styles.pular}>Pular</Text>
        </Pressable>
      )}
    </GradienteRoxo>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.lg,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACAMENTOS.xl,
    gap: ESPACAMENTOS.lg,
  },
  titulo: {
    fontFamily: FONTES.display,
    fontSize: 42,
    color: COLORS.laranjaClaro,
    textAlign: 'center',
    marginBottom: ESPACAMENTOS.lg,
  },
  subtitulo: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 18,
    color: COLORS.branco,
    textAlign: 'center',
    maxWidth: 320,
  },
  indicadores: {
    flexDirection: 'row',
    gap: ESPACAMENTOS.sm,
    marginBottom: ESPACAMENTOS.lg,
  },
  indicador: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cinzaMedio,
  },
  indicadorAtivo: { backgroundColor: COLORS.laranjaEscuro, width: 30 },
  botao: {
    backgroundColor: COLORS.laranjaEscuro,
    paddingHorizontal: ESPACAMENTOS.xxl,
    paddingVertical: ESPACAMENTOS.md,
    borderRadius: BORDAS.raioMedio,
    marginBottom: ESPACAMENTOS.md,
  },
  botaoTexto: {
    fontFamily: FONTES.display,
    fontSize: 22,
    color: COLORS.branco,
  },
  pular: {
    fontFamily: FONTES.bodyRegular,
    fontSize: 14,
    color: COLORS.cinzaClaro,
    marginTop: ESPACAMENTOS.sm,
  },
});

export const ONBOARDING_FLAG_KEY = ONBOARDING_KEY;