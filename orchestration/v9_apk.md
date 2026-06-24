# V9 APK — Build + Upload Artifacts

> Data: 2026-06-24
> Status: **PUBLICADO E VERIFICADO** (HTTP 200 em catbox.moe)

## Artefato final

- **URL publica**: https://files.catbox.moe/ptegco.apk
- **SHA256**: `ad96d36b64ac386783b56320c60d2ae106b96ee16ec294f15840f23d6b941eee`
- **Tamanho**: 100.611.027 bytes (~96 MB)
- **Versao**: V9 (`versionCode 1`, `versionName "0.1.0"`)
- **Package**: `com.donizetiferr.expertnabiblia`

## Comando de upload executado

```bash
curl -F "fileToUpload=@app-release.apk" https://catbox.moe/user/api.php -F "reqtype=fileupload"
# Response: https://files.catbox.moe/ptegco.apk
```

## Comando de build executado

```bash
export JAVA_HOME="C:/Users/Donizeti/scoop/apps/temurin17-jdk/current"
export ANDROID_HOME="C:/Android/Sdk"
export PATH="$JAVA_HOME/bin:$PATH"
cd /c/ENB/android    # junction C:\ENB -> C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia
./gradlew assembleRelease --no-daemon
# Resultado: BUILD SUCCESSFUL in 1m 29s, 571 tasks (56 executed, 515 up-to-date)
```

## Por que usar junction C:\ENB

O caminho real do projeto contem caractere nao-ASCII "í" (Bíblia). O Android Gradle Plugin (AGP) 9.0
aborta com `Failed to apply plugin 'com.android.internal.application' — Your project path contains non-ASCII
characters` mesmo com `android.overridePathCheck=true` em `gradle.properties`. A solucao foi criar
um **directory junction** (link simbolico de diretorio do Windows):

```cmd
mklink /D C:\ENB "C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia"
```

Quando o build roda em `C:\ENB`, todos os paths internos sao ASCII. O junction ja estava pre-existente
de V8-REBUILD. O fix completo:

1. `android/gradle.properties`: adicionado `android.overridePathCheck=true` + `enableJetifier=true` + `useShortFileNames=true`
2. Build sempre via `C:\ENB` (junction) em vez do path com "í"

## APK anteriores (referencia)

| Versao | URL catbox.moe | SHA256 | Data | Notas |
|--------|-----------------|--------|------|-------|
| V9 (atual) | https://files.catbox.moe/ptegco.apk | ad96d36b64ac3867... | 2026-06-24 | Polish completo: 5 poses, splash logo, feedback dedicada, offline mode, secure-store |
| V8 | https://files.catbox.moe/r0kku0.apk | d2b86abd269eec23... | 2026-06-23 | Build base pos-retomada V8-REBUILD (3 poses, splash PersonagemLivro) |

## Status M1.1 (conteudo pedagogico)

**NAO INCLUSAO** no APK V9: o APK foi buildado com o DB SQLite em `data/db.sqlite` contendo
2318/4345 respostas canonicas preenchidas (53.4%) e 2027 ainda com `[GERAR]` (46.6%).
A UI esta 100% pronta para o conteudo real, mas:
- Licoes dos primeiros modulos FB01..AT12 respondem corretamente
- Licoes dos modulos FB13+, AT13+, NT, TE exibem placeholder `[GERAR] {id}` ate M1.1 destravar

Ver `orchestration/blocked_versions.md` V[M1.1] BLOQUEADA_POR_USUARIO (HTTP 429 quota M2.7).