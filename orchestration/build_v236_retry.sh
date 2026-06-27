#!/usr/bin/env bash
set -e
SRC="/c/Users/Donizeti/Downloads/Projetos_VSCode/Pessoal/Expert Na Bíblia"
ENB="/c/ENB"
COFRE="/c/Users/Donizeti/Downloads/Projetos_VSCode/Tokens API e acessos"
VER="23.6.0"
export MINIMAX_API_KEY=$(grep -oE 'sk-cp-[A-Za-z0-9_-]+' "$COFRE/minimax/credentials.env" | head -1)
export OPENAI_API_KEY=$(grep -oE 'sk-proj-[A-Za-z0-9_-]+' "$COFRE/openai/credentials.md" | head -1)
echo "[retry] keys MINIMAX=${#MINIMAX_API_KEY} OPENAI=${#OPENAI_API_KEY}"
cd "$ENB/android"
./gradlew assembleRelease --no-daemon
APK_OUT="$ENB/android/app/build/outputs/apk/release/app-release.apk"
[ -f "$APK_OUT" ] || { echo "[retry] ERRO: APK nao gerado"; exit 1; }
cd "$SRC"
cp -f "$APK_OUT" "dist/ExpertNaBiblia-v${VER}.apk"
cp -f "$APK_OUT" "$ENB/dist/ExpertNaBiblia-v${VER}.apk"
ls -t dist/*.apk 2>/dev/null | tail -n +6 | xargs -r rm -f
echo "[retry] DONE_OK size=$(du -m dist/ExpertNaBiblia-v${VER}.apk | cut -f1)MB"
