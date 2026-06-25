#!/usr/bin/env bash
# Sync canonical source -> C:\ENB for gradle builds (causa-raiz fix: accented path breaks native toolchain)
# Keeps ENB's android/ (proven native build) + node_modules untouched unless --deps passed.
set -e
SRC="/c/Users/Donizeti/Downloads/Projetos_VSCode/Pessoal/Expert Na Bíblia"
DST="/c/ENB"

# JS/TS/asset/config layers that affect the JS bundle (NOT android/ native, NOT node_modules, NOT .git, NOT dist)
robocopy_dir() {
  # robocopy mirror a dir; tolerate robocopy exit codes (0-7 are success)
  powershell.exe -NoProfile -Command "robocopy '$(cygpath -w "$SRC/$1")' '$(cygpath -w "$DST/$1")' /MIR /NFL /NDL /NJH /NJS /NP /XD node_modules .git android ios dist .expo build; if (\$LASTEXITCODE -lt 8) { exit 0 } else { exit \$LASTEXITCODE }"
}
copy_file() {
  cp -f "$SRC/$1" "$DST/$1" 2>/dev/null || true
}

for d in src assets data scripts __tests__ docs; do
  [ -d "$SRC/$d" ] && robocopy_dir "$d"
done
for f in package.json package-lock.json app.config.ts app.json tsconfig.json jest.config.ts jest.config.js babel.config.js metro.config.js .eslintrc.js eas.json CHANGELOG.md; do
  copy_file "$f"
done
echo "[sync_to_enb] source synced canonical -> C:\\ENB (android/ + node_modules preserved)"
