/**
 * Deep link para compartilhar licao especifica (V6, ITEM-48 — P3-7).
 *
 * URL scheme: expertnabiblia://licao/FB01-L05
 * Ao tocar: abre a licao especifica (ou App Store/Play Store se nao instalado).
 */

import * as Linking from 'expo-linking';
import { COLORS } from '../constants/colors';

export const URL_SCHEME = 'expertnabiblia://';

export function gerarLinkLicao(moduloId: string, licaoId: string): string {
  return `${URL_SCHEME}licao/${moduloId}-${licaoId}`;
}

export function gerarLinkCompartilhamento(moduloId: string, licaoId: string, mensagem?: string): string {
  const link = gerarLinkLicao(moduloId, licaoId);
  const texto = mensagem ?? `Estou estudando Expert Na Bíblia. Veja esta licao: ${link}`;
  return texto;
}

export async function compartilharLicao(moduloId: string, licaoId: string): Promise<void> {
  const link = gerarLinkLicao(moduloId, licaoId);
  try {
    await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(link)}`);
  } catch {
    // Fallback: openURL simples
    await Linking.openURL(link);
  }
}

export async function obterLinkInicial(): Promise<string | null> {
  const url = await Linking.getInitialURL();
  return url;
}

export function extrairLicaoId(url: string): string | null {
  const match = url.match(/\/licao\/([A-Z0-9-]+)/i);
  return match?.[1] ?? null;
}