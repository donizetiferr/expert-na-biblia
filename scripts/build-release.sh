#!/usr/bin/env bash
# scripts/build-release.sh — helper EAS build production (V6, ITEM-44)
#
# Pre-requisitos:
# - npm install
# - eas-cli instalado e logado (`npm install -g eas-cli && eas login`)
# - eas.json configurado (V1)
# - Variavel EXPO_TOKEN definida (em Tokens API e acessos/expo/)
#
# Uso:
#   ./scripts/build-release.sh android     # build APK production
#   ./scripts/build-release.sh ios         # build IPA production
#   ./scripts/build-release.sh both        # ambos

set -e

PLATFORM=${1:-android}

case "$PLATFORM" in
  android)
    echo "[build-release] Building Android APK production..."
    eas build --platform android --profile production --non-interactive
    ;;
  ios)
    echo "[build-release] Building iOS IPA production..."
    eas build --platform ios --profile production --non-interactive
    ;;
  both)
    echo "[build-release] Building both platforms..."
    eas build --platform android --profile production --non-interactive
    eas build --platform ios --profile production --non-interactive
    ;;
  *)
    echo "Uso: $0 [android|ios|both]"
    exit 1
    ;;
esac

echo "[build-release] Done. Acesse https://expo.dev/accounts/[usuario]/projects/expert-na-biblia para baixar."