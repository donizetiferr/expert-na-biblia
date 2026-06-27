/**
 * V23.6 (E.1 + E.7): hooks de acessibilidade.
 *
 * - useReduceMotion: true se o usuario ativou "Reduzir animacoes" em config OU o
 *   sistema tem reduce-motion ligado (AccessibilityInfo). Componentes usam para trocar
 *   animacoes (loops/celebracoes) por estados estaticos (a11y vestibular + CPU).
 * - useFontScale: multiplicador de fonte do toggle "Texto grande" (idosos/baixa visao).
 *   O app ja respeita o fontScale do sistema (nenhum allowFontScaling=false); este toggle
 *   e um reforco in-app aplicado aos textos de leitura.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { loadSettings } from './settings';
import { obterTipoAtivo } from './perfis';

/** true quando animacoes intensas devem ser evitadas (setting OU sistema). */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let ativo = true;
    const sysProm: Promise<boolean> = (() => {
      try {
        return Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.() ?? false).catch(() => false);
      } catch {
        return Promise.resolve(false);
      }
    })();
    Promise.all([
      loadSettings()
        .then((s) => s.reduceMotion)
        .catch(() => false),
      sysProm,
    ])
      .then(([setting, system]) => {
        if (ativo) setReduce(!!setting || !!system);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);
  return reduce;
}

/**
 * Multiplicador de fonte: 1.18 com "Texto grande" ativo OU com perfil Kids ativo (V23.9
 * I.2 — criancas leem melhor com texto maior), 1 caso contrario.
 */
export function useFontScale(): number {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    let ativo = true;
    Promise.all([
      loadSettings()
        .then((s) => s.textoGrande)
        .catch(() => false),
      obterTipoAtivo()
        .then((t) => t === 'kids')
        .catch(() => false),
    ])
      .then(([textoGrande, kids]) => {
        if (ativo) setScale(textoGrande || kids ? 1.18 : 1);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);
  return scale;
}

/** Hook simples: true se o perfil ativo e' Kids (para badges/copy/conteudo adaptado). */
export function useModoKids(): boolean {
  const [kids, setKids] = useState(false);
  useEffect(() => {
    let ativo = true;
    obterTipoAtivo()
      .then((t) => {
        if (ativo) setKids(t === 'kids');
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);
  return kids;
}
