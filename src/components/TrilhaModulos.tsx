import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useRef } from 'react';
import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../constants/colors';
import { GradienteRoxo } from './Gradiente';
import { moduloLiberado } from '../lib/progressao';
import { playCadeiraDesbloqueia } from '../lib/sound';
import type { Modulo } from '../types';

/**
 * V23.8 (H.1): Mapa de jornada — trilha sinuosa estilo Duolingo.
 *
 * Substitui o grid plano de cards por uma TRILHA vertical de NOS circulares que serpenteia
 * (offset horizontal em onda) ligados por uma sequencia de pontos (o "caminho"). O no atual
 * (1o liberado nao concluido) e destacado com "VOCE ESTA AQUI". Reusa os mesmos estados do
 * grid (concluido=amarelo, liberado=roxo, bloqueado=roxo escurecido + cadeado) e a mesma
 * regra de cadeado sequencial (lib/progressao). Sem dependencia de SVG (Views + degrade).
 */

// Onda horizontal (translateX, px) — periodo 8. Amplitude moderada cabe em 1080px hi-res
// e em telas estreitas (no = 84px; |offset| max 72 -> 84/2+72 = 114 < metade de 320px).
const OFFSETS = [0, 48, 72, 48, 0, -48, -72, -48];
function offsetDe(i: number): number {
  return OFFSETS[i % OFFSETS.length]!;
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface Props {
  modulos: Modulo[];
  onSelecionar: (moduloId: string) => void;
}

export function TrilhaModulos({ modulos, onSelecionar }: Props) {
  // Toca o som de "cadeado abriu" uma unica vez quando um modulo vira livre.
  const unlockSoundOnceRef = useRef<Set<string>>(new Set());

  // Indice do no ATUAL: 1o modulo liberado e nao concluido (onde o usuario "esta").
  const atualIdx = modulos.findIndex(
    (m, i) => moduloLiberado(i, modulos) && m.concluido !== true,
  );

  const renderItem = ({ item, index }: { item: Modulo; index: number }) => {
    const livre = moduloLiberado(index, modulos);
    const concluido = item.concluido === true;
    const atual = index === atualIdx;
    const thisOffset = offsetDe(index);
    const prevOffset = index > 0 ? offsetDe(index - 1) : thisOffset;

    if (livre && index > 0 && !unlockSoundOnceRef.current.has(item.id)) {
      unlockSoundOnceRef.current.add(item.id);
      playCadeiraDesbloqueia().catch((e: unknown) =>
        console.warn('[audio] trilha cadeira falhou:', e),
      );
    }

    const numero = item.ordem.toString().padStart(2, '0');
    const onPress = () => livre && onSelecionar(item.id);

    // Conteudo do no (numero, check ou cadeado).
    const conteudoNo = concluido ? (
      <Text style={styles.noCheck}>✓</Text>
    ) : (
      <Text style={[styles.noNumero, !livre && styles.noNumeroBloqueado]}>{numero}</Text>
    );

    return (
      <View style={styles.row}>
        {/* Caminho (pontos) ligando o no anterior a este. */}
        {index > 0 ? (
          <View style={styles.connector} pointerEvents="none">
            <View style={[styles.dot, { transform: [{ translateX: lerp(prevOffset, thisOffset, 0.33) }] }]} />
            <View style={[styles.dot, { transform: [{ translateX: lerp(prevOffset, thisOffset, 0.66) }] }]} />
          </View>
        ) : null}

        {atual ? <Text style={[styles.aqui, { transform: [{ translateX: thisOffset }] }]}>VOCÊ ESTÁ AQUI</Text> : null}

        <View style={{ transform: [{ translateX: thisOffset }], alignItems: 'center' }}>
          {concluido ? (
            <Pressable
              style={[styles.no, styles.noConcluido]}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={`Módulo ${item.nome}, concluído`}
            >
              {conteudoNo}
            </Pressable>
          ) : (
            <Pressable
              style={[styles.noShadow, atual && styles.noAtualShadow]}
              onPress={onPress}
              disabled={!livre}
              accessibilityRole="button"
              accessibilityLabel={`Módulo ${item.nome}, ${livre ? (atual ? 'atual, toque para continuar' : 'liberado') : 'bloqueado'}`}
            >
              <GradienteRoxo
                diagonal
                style={[styles.no, atual && styles.noAtual, !livre && styles.noBloqueado]}
              >
                {conteudoNo}
              </GradienteRoxo>
              {!livre ? <Text style={styles.cadeado}>🔒</Text> : null}
            </Pressable>
          )}
          <Text
            style={[styles.nome, concluido ? styles.nomeConcluido : !livre && styles.nomeBloqueado, { transform: [{ translateX: 0 }] }]}
            numberOfLines={2}
          >
            {item.nome}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={modulos}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.lista}
      showsVerticalScrollIndicator={false}
      initialNumToRender={12}
    />
  );
}

const NO = 84;
const styles = StyleSheet.create({
  lista: {
    paddingHorizontal: ESPACAMENTOS.lg,
    paddingTop: ESPACAMENTOS.sm,
    paddingBottom: ESPACAMENTOS.xxl,
  },
  row: {
    alignItems: 'center',
  },
  connector: {
    alignItems: 'center',
    gap: ESPACAMENTOS.sm,
    paddingVertical: ESPACAMENTOS.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.laranjaForte,
    opacity: 0.7,
  },
  aqui: {
    fontFamily: FONTES.display,
    fontSize: 16,
    color: COLORS.laranjaForte,
    letterSpacing: 1,
    marginBottom: ESPACAMENTOS.xs,
  },
  noShadow: {
    borderRadius: NO / 2,
    shadowColor: COLORS.preto,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  noAtualShadow: {
    shadowColor: COLORS.laranjaForte,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  no: {
    width: NO,
    height: NO,
    borderRadius: NO / 2,
    borderWidth: BORDAS.larguraGrossa,
    borderColor: COLORS.laranjaBorda,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  noAtual: {
    borderColor: COLORS.laranjaForte,
    borderWidth: 5,
  },
  noConcluido: {
    backgroundColor: COLORS.laranjaClaro,
    borderColor: COLORS.preto,
  },
  noBloqueado: {
    opacity: 0.5,
  },
  noNumero: {
    fontFamily: FONTES.display,
    fontSize: 34,
    color: COLORS.laranjaClaro,
  },
  noNumeroBloqueado: {
    color: COLORS.laranjaClaro,
  },
  noCheck: {
    fontSize: 38,
    color: COLORS.preto,
    fontWeight: 'bold',
  },
  cadeado: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    fontSize: 22,
  },
  nome: {
    fontFamily: FONTES.bodyBold,
    fontSize: 13,
    color: COLORS.roxoEscuro,
    textAlign: 'center',
    marginTop: ESPACAMENTOS.xs,
    maxWidth: 160,
  },
  nomeConcluido: {
    color: COLORS.preto,
    fontFamily: FONTES.bodyExtraBold,
  },
  nomeBloqueado: {
    color: COLORS.cinzaMedio,
  },
});
