#!/usr/bin/env bash
set -e
SRC="/c/Users/Donizeti/Downloads/Projetos_VSCode/Pessoal/Expert Na Bíblia"
ENB="/c/ENB"
COFRE="/c/Users/Donizeti/Downloads/Projetos_VSCode/Tokens API e acessos"
VER="23.7.0"
cd "$SRC"
echo "[build] (1) tsc..."; npx tsc --noEmit
echo "[build] (2) sync -> ENB..."; bash orchestration/sync_to_enb.sh
echo "[build] (3) limpa estado de packaging (evita IncrementalSplitterRunnable transitorio)..."
rm -rf "$ENB/android/app/build/outputs/apk/release" 2>/dev/null || true
rm -rf "$ENB/android/app/build/intermediates/apk/release" 2>/dev/null || true
rm -rf "$ENB"/android/app/build/intermediates/incremental/*[Pp]ackageRelease* 2>/dev/null || true
echo "[build] (4) keys + gradle..."
export MINIMAX_API_KEY=$(grep -oE 'sk-cp-[A-Za-z0-9_-]+' "$COFRE/minimax/credentials.env" | head -1)
export OPENAI_API_KEY=$(grep -oE 'sk-proj-[A-Za-z0-9_-]+' "$COFRE/openai/credentials.md" | head -1)
[ -z "$MINIMAX_API_KEY" ] && { echo "[build] ERRO: key vazia"; exit 1; }
cd "$ENB/android"
./gradlew assembleRelease --no-daemon
APK_OUT="$ENB/android/app/build/outputs/apk/release/app-release.apk"
[ -f "$APK_OUT" ] || { echo "[build] ERRO: APK nao gerado"; exit 1; }
cd "$SRC"
cp -f "$APK_OUT" "dist/ExpertNaBiblia-v${VER}.apk"
cp -f "$APK_OUT" "$ENB/dist/ExpertNaBiblia-v${VER}.apk"
ls -t dist/*.apk 2>/dev/null | tail -n +6 | xargs -r rm -f
echo "[build] DONE_OK apk=dist/ExpertNaBiblia-v${VER}.apk size=$(du -m dist/ExpertNaBiblia-v${VER}.apk | cut -f1)MB"
