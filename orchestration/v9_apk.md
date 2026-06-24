# V9 APK — Build + Upload Artifacts

> Data: 2026-06-24 (atualizado 03:38 UTC-3 — rebuild com polish)
> Status: **PUBLICADO E VERIFICADO** (HTTP 200 em catbox.moe)

## Artefato final (V9 + polish)

- **URL publica**: https://files.catbox.moe/2ybe0j.apk
- **SHA256**: `dc21715fea790b95da1cf24f71d03b2cb54369655984dcd96b2c7542ee89c75b`
- **Tamanho**: 100.612.491 bytes (~96 MB)
- **Versao**: V9 (`versionCode 1`, `versionName "0.1.0"`)
- **Package**: `com.donizetiferr.expertnabiblia`
- **Encoding path**: build via `C:\ENB` (copia real do projeto — path com "í" quebra AGP 9.0)
- **Inclui polish**: M4.1 (countWhere regex-safe), M4.2 (design tokens semanticos),
  M4.4 (sound-runtime via settings.ts), M4.7 (offline robusto: network metrics + BackHandler grace 5s)

## Artefato V9 inicial (substituido)

- **URL antiga**: https://files.catbox.moe/ptegco.apk
- **SHA256**: `ad96d36b64ac386783b56320c60d2ae106b96ee16ec294f15840f23d6b941eee`
- **Tamanho**: 100.611.027 bytes
- **Nota**: APK SEM polish M4.1/M4.2/M4.4/M4.7 (codigo V9 base antes do polish desta task)

## Comando de upload executado (2026-06-24)

```bash
curl -s -F "fileToUpload=@dist/ExpertNaBiblia-v9.0.0.apk" https://catbox.moe/user/api.php -F "reqtype=fileupload"
# Response: https://files.catbox.moe/2ybe0j.apk
# Verificacao: curl -sI https://files.catbox.moe/2ybe0j.apk -> HTTP/1.1 200 OK
# SHA256 local = SHA256 catbox: dc21715fea790b95da1cf24f71d03b2cb54369655984dcd96b2c7542ee89c75b
```

## Comando de build executado (2026-06-24)

```bash
export JAVA_HOME="C:/Users/Donizeti/scoop/apps/temurin17-jdk/current"
export ANDROID_HOME="C:/Android/Sdk"
export PATH="$JAVA_HOME/bin:$PATH"
cd /c/ENB/android    # copia real em C:\ENB (NAO mklink /J — v8_apk.md workaround notes)
./gradlew assembleRelease --no-daemon
# Resultado: BUILD SUCCESSFUL in 1m 57s, 571 tasks (60 executed, 511 up-to-date)
```

## Por que usar C:\ENB

O caminho real do projeto contem caractere nao-ASCII "í" (Bíblia). O Android Gradle Plugin (AGP) 9.0
aborta com `Failed to apply plugin 'com.android.internal.application' — Your project path contains non-ASCII
characters` mesmo com `android.overridePathCheck=true` em `gradle.properties`.

**Encoding do path do projeto:**
- Folder name real: `Expert Na Bíblia` (lowercase "i" com acento — UTF-8 0xC3 0xAD)
- Caso "BÍBLIA" (uppercase "Í" — UTF-8 0xC3 0x8D) eh uma variante ortografica NAO presente no path real
- O problema eh o caractere nao-ASCII em si, NAO o case

**Solucao adotada em V8/V9**: copia REAL em `C:\ENB\` (NAO `mklink /J` junction — o workaround
de V8 tentou junction, mas `require.resolve` segue o target junction e retorna path com espacos,
entao a solucao funcional eh copia fisica):

```powershell
Copy-Item -Path "C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia" -Destination "C:\ENB" -Recurse -Force
```

Apos cada mudanca nos arquivos-fonte, sincronizar para C:\ENB antes de rebuildar:

```powershell
Copy-Item -Path "C:\...\Expert Na Bíblia\src" -Destination "C:\ENB\src" -Recurse -Force
Copy-Item -Path "C:\...\Expert Na Bíblia\tsconfig.json" -Destination "C:\ENB\tsconfig.json" -Force
Copy-Item -Path "C:\...\Expert Na Bíblia\app.config.ts" -Destination "C:\ENB\app.config.ts" -Force
```

Quando o build roda em `C:\ENB`, todos os paths internos sao ASCII. O fix completo:

1. `android/gradle.properties`: `android.overridePathCheck=true` + `enableJetifier=true` + `useShortFileNames=true`
2. Build sempre via `C:\ENB` (copia) em vez do path com "í"
3. `node_modules` ja esta em C:\ENB (copia completa nao parcial — autolinking Expo precisa de build/ pre-compilado)

## APK anteriores (referencia)

| Versao | URL catbox.moe | SHA256 | Data | Notas |
|--------|-----------------|--------|------|-------|
| V9 + polish (atual) | https://files.catbox.moe/2ybe0j.apk | dc21715fea790b9... | 2026-06-24 03:38 | polish M4.1/M4.2/M4.4/M4.7 + V9 base (5 poses, splash logo, feedback dedicada, offline mode, secure-store) |
| V9 base (substituido) | https://files.catbox.moe/ptegco.apk | ad96d36b64ac3867... | 2026-06-24 03:09 | 5 poses, splash logo, feedback dedicada, offline mode, secure-store (sem polish M4.1+) |
| V8 | https://files.catbox.moe/r0kku0.apk | d2b86abd269eec23... | 2026-06-23 | Build base pos-retomada V8-REBUILD (3 poses, splash PersonagemLivro) |

## Status M1.1 (conteudo pedagogico)

**NAO INCLUSAO** no APK V9: o APK foi buildado com o DB SQLite em `data/db.sqlite` contendo
2318/4345 respostas canonicas preenchidas (53.4%) e 2027 ainda com `[GERAR]` (46.6%).
A UI esta 100% pronta para o conteudo real, mas:
- Licoes dos primeiros modulos FB01..AT12 respondem corretamente
- Licoes dos modulos FB13+, AT13+, NT, TE exibem placeholder `[GERAR] {id}` ate M1.1 destravar

Ver `orchestration/blocked_versions.md` V[M1.1] BLOQUEADA_POR_USUARIO (HTTP 429 quota M2.7).