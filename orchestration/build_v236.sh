#!/usr/bin/env bash
# build_v236.sh — pipeline de build V23.6 (milestone E, sem batch M2.7).
set -e
SRC="/c/Users/Donizeti/Downloads/Projetos_VSCode/Pessoal/Expert Na Bíblia"
ENB="/c/ENB"
COFRE="/c/Users/Donizeti/Downloads/Projetos_VSCode/Tokens API e acessos"
VER="23.6.0"
cd "$SRC"

echo "[build] (1) tsc..."
npx tsc --noEmit

echo "[build] (2) sync -> C:\\ENB..."
bash orchestration/sync_to_enb.sh

echo "[build] (3) keys + gradle assembleRelease..."
export MINIMAX_API_KEY=$(grep -oE 'sk-cp-[A-Za-z0-9_-]+' "$COFRE/minimax/credentials.env" | head -1)
export OPENAI_API_KEY=$(grep -oE 'sk-proj-[A-Za-z0-9_-]+' "$COFRE/openai/credentials.md" | head -1)
echo "[build] MINIMAX_API_KEY len=${#MINIMAX_API_KEY} OPENAI_API_KEY len=${#OPENAI_API_KEY}"
if [ -z "$MINIMAX_API_KEY" ]; then echo "[build] ERRO: MINIMAX_API_KEY vazio"; exit 1; fi
cd "$ENB/android"
./gradlew assembleRelease --no-daemon

APK_OUT="$ENB/android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_OUT" ]; then echo "[build] ERRO: APK nao gerado"; exit 1; fi

echo "[build] (4) copiando p/ dist + regra das 5..."
cd "$SRC"
cp -f "$APK_OUT" "dist/ExpertNaBiblia-v${VER}.apk"
mkdir -p "$ENB/dist"
cp -f "$APK_OUT" "$ENB/dist/ExpertNaBiblia-v${VER}.apk"
ls -t dist/*.apk 2>/dev/null | tail -n +6 | xargs -r rm -f
SIZE=$(du -m "dist/ExpertNaBiblia-v${VER}.apk" | cut -f1)
echo "[build] DONE_OK apk=dist/ExpertNaBiblia-v${VER}.apk size=${SIZE}MB"
ls -t dist/*.apk
