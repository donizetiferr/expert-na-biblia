# Plan Investigation — Expert Na Bíblia (2026-06-23 V8-RETOMADA)

## Modo

Escopo: ATUALIZACAO | Profundidade: FOCADO — razao: MODO_ORQUESTRADO invocado pelo orquestrador com 10 apontamentos acionaveis + contexto previo rico (V8-RETOMADA-APK-FIX.md). FOCADO aproveita o contexto previo (input rico) e roda investigacao independente calibrada (gate G1).

## Arquivos lidos (piso minimo 1.1)

- `CLAUDE.md` — objetivo, regras de negocio, decisoes arquiteturais, anti-AI-slop, paleta visual
- `package.json` — 22 deps + 3 devDeps; scripts: `android`, `ios`, `start`, `prebuild`, `build:android` (FALTA `type-check`, `lint`, `format:check` que o CI chama)
- `app.json` — package name `com.donizetiferr.expertnabiblia` (correto), label `Expert Na Bíblia` (correto), `expo.ads.admob.androidAppId = PLACEHOLDER_ANDROID_APP_ID` (ainda placeholder)
- `tsconfig.json` — strict mode completo, alias paths para @/ @assets/ @components/ @lib/ @db/ @types/ @constants/
- `babel.config.js` — babel-preset-expo + module-resolver com aliases + react-native-reanimated/plugin
- `metro.config.js` — default Expo config
- `eas.json` — profiles development/preview/production; submit.production.android.track=`internal`
- `.github/workflows/ci.yml` — 3 jobs: lint-type-check, test-unit, build-preview (EAS cloud com EXPO_TOKEN)
- `orchestration/V8-RETOMADA-APK-FIX.md` — diagnostico completo do APK atual
- `orchestration/evolution_plan.md` — plano V1-V7 (47/47 itens entregues), 2 BLOQUEADAS_POR_USUARIO (P0-11, P3-6)
- `src/app/_layout.tsx` — root layout com expo-router, useFonts, SplashScreen, 6 Stack.Screen

## Comandos executados (com resultado resumido)

- `find . -type f -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" -not -path "./whatsapp_media/*"` → 122 arquivos (porte PEQUENO/MEDIO com docs)
- `find src/ -type f` → 36 source files
- `find __tests__ src/ -name "*.test.*"` → 5 test files (matching, matching-coverage, settings, smoke, database)
- `node --version` → v22.22.2
- `java -version` → 1.8.0_491 (DEFAULT — INCOMPATIVEL com gradle 8+; JDK 17 em `C:/Users/Donizeti/scoop/apps/temurin17-jdk/current/`)
- `ls C:/Android/Sdk/` → SDK completo (build-tools 35/36, emulator, NDK, platform-tools, system-images API 34)
- `C:/Users/Donizeti/scoop/apps/temurin17-jdk/current/bin/java.exe -version` → openjdk 17.0.18 (Temurin-17)
- `ls node_modules/expo-router` → OK 6.0.24
- `ls node_modules/expo-sqlite` → OK 16.0.10
- `ls node_modules/expo-font` → OK 14.0.12
- `ls node_modules/@expo-google-fonts/bangers` → OK 0.4.1
- `ls assets/` → icon.png, splash.png, adaptive-icon.png, favicon.png (criados V8); audio/ VAZIO
- `ls data/` → db.sqlite (798KB)
- `ls -la dist/*.apk` → 19 APKs gerados, 1 FINAL de 85MB
- `npx expo prebuild --platform android` → FALHA: "withAndroidDangerousBaseMod: Project file MainApplication does not exist"
- `C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 shell pm path com.anonymous.testapp` → confirma APK instalado

## Saude do projeto (veredito em cada linha) — gate G0

- **Testes**: EXISTEM (provavelmente passando — 5 test files; CI job test-unit roda `npm test -- --ci --coverage`; NAO foram rodados nesta sessao) — evidencia: `__tests__/matching.test.ts`, `__tests__/settings.test.ts`, `__tests__/smoke.test.ts`, `__tests__/e2e/splash.spec.ts`, `src/db/__tests__/database.test.ts`, `src/lib/__tests__/matching-coverage.test.ts`
- **Build**: QUEBRADO (APK final nao roda por completo) — APK final instala + abre splash + crasha em `renderElement` do RootLayout — evidencia: `orchestration/V8-RETOMADA-APK-FIX.md` linhas 19-22
- **CI/CD**: CONFIGURADO (parcial) — `.github/workflows/ci.yml` com 3 jobs; build-preview usa EAS cloud (depende de EXPO_TOKEN) e roda `continue-on-error: true`; NAO roda build nativo local — evidencia: `.github/workflows/ci.yml` linhas 62-87
- **Deps**: ATUALIZADAS (mas com ressalvas) — 22 deps restauradas; faltam @expo/metro-runtime, babel-preset-expo, babel-plugin-module-resolver (devDeps adicionados nesta sessao); expo-ads-admob~13.0.0 (versao antiga); `package.json` tem scripts `type-check`/`lint`/`format:check` que o CI chama mas nao estao definidos — evidencia: `package.json` linhas 66-103
- **Docs (CLAUDE.md/README/changelog)**: COMPLETAS — CLAUDE.md 161 linhas, README, CHANGELOG, evolution_plan.md, 8 docs em `docs/`, `orchestration/` rico (V1-V7, audit, qa_verdict, etc.) — evidencia: `CLAUDE.md`, `docs/README.md`, `orchestration/session_summary.md`

## Sinais de codigo

- **TODO/FIXME/HACK**: 0 ocorrencias
- **Arquivos >500 linhas**: 1 (`database.ts` com ~170 linhas; nada > 500)
- **Duplicacao obvia**: SIM — `_layout.tsx` chama `SplashScreen.preventAutoHideAsync()` no top-level (linha 11), efeito colateral na importacao
- **Pontos de risco identificados em src/**:
  - `_layout.tsx` linha 11: `SplashScreen.preventAutoHideAsync()` no module scope (deveria ser em useEffect) — pode causar problema de ordem de inicializacao
  - `PersonagemLivro.tsx` usa EMOJIS (🤔, 😄, 😱) em vez das imagens reais em `whatsapp_media/images/`
  - `assets/audio/` VAZIO (P0-7 marcado como entregue mas diretorio vazio)
  - `app.json` ainda tem `PLACEHOLDER_ANDROID_APP_ID` em expo-ads-admob

## Pesquisa externa (FOCADO — quando relevante)

Nao foi realizada pesquisa externa nova. FOCADO nao exige pesquisa externa (opcional). A pesquisa do dominio ja foi feita em docs/02_mensagens_whatsapp e docs/05_conteudo_pedagogico (V1-V7).

## Objetivos do produto -> cobertura -> gaps (gate G1)

**OBJ-1**: Ensinar a Biblia de forma ludica e progressiva (2 modos: Licoes + Quiz)
- Cobertura: PARCIAL — 14 telas em `src/app/`; db.sqlite (798KB) embarcado; 5 testes Jest
- Gaps: APK nao roda 100% (V8); 46 resources faltando resolvidos via patch; `__DEV__=true` codificado resolve via patch; conteudo real das 4345 perguntas precisa ser injetado no SQLite embarcado
- Fonte: CLAUDE.md:13

**OBJ-2**: Avaliacao de respostas por IA generativa (Minimax M2.7)
- Cobertura: PARCIAL — `src/lib/m3.ts`, `src/lib/openai.ts`, `src/lib/avaliador.ts`, `src/lib/matching.ts` implementados
- Gaps: precisa de credencial `MINIMAX_API_KEY` em `Tokens API e acessos/minimax/`; fallback OpenAI precisa de `OPENAI_API_KEY`
- Fonte: CLAUDE.md:28-32

**OBJ-3**: Progresso gamificado (cadeado sequencial, 100% para liberar, trofeu final)
- Cobertura: TOTAL em codigo — `src/lib/streak.ts`, `src/app/trofeu.tsx`, regras em `src/app/licoes/[moduloId]/[licaoId]/final.tsx`
- Fonte: CLAUDE.md:74-91

**OBJ-4**: Privacidade LGPD (privacy policy publica)
- Cobertura: TOTAL — `privacy.html` em `https://donizetiferr.github.io/expert-na-biblia/privacy.html` (HTTP 200); `app.json.extra.privacyPolicyUrl` configurado
- Fonte: CLAUDE.md:129, V7 (orchestration/audit_report.md)

## Historico do plano (ATUALIZACAO)

- **Categorias recorrentes**: INFRA (20), EVOLUCAO (32), MANUTENCAO (2), MELHORIA (2), CORRECAO (1) — V1-V7 entregaram 47/47 itens
- **Areas nunca tocadas**: nenhuma (V1-V7 cobriu todas as 4 fases)
- **Rejeitados que continuam rejeitados**: P3-5 (iOS), Backend Node.js dedicado, iOS obrigatorio no MVP, "luxury/refined" estetica, Multi-idioma no MVP, Dominio proprio Privacy

## Cobertura por dimensao (gate G1)

- **CORRECAO_BUGS**: 1 achado — APK nao roda (V8) | varrida com (Read codigo + adb logcat) | Fonte: CONTEXTO_PREVIO + INVESTIGACAO
- **MELHORIA**: 1 achado — PersonagemLivro.tsx usa emojis em vez de imagens reais (P0-5 pendente) | varrida com (Read component) | Fonte: INVESTIGACAO
- **EVOLUCAO_FEATURES**: 0 achados alem dos apontamentos (rebuild e correcao estrutural) | varrida com (Read src/) | Fonte: G1
- **MANUTENCAO_REFACTOR**: 1 achado — `_layout.tsx` linha 11 chama `preventAutoHideAsync()` no module scope | varrida com (Read _layout.tsx) | Fonte: INVESTIGACAO
- **INFRAESTRUTURA**: 3 achados — scripts `type-check`/`lint`/`format:check` faltando; gradle nao instalado globalmente; Java 17 nao no PATH padrao | varrida com (Bash env checks) | Fonte: INVESTIGACAO
- **UX_UI**: 0 achados (rebuild do APK e infra) | varrida com (Read CLAUDE.md) | Fonte: G1
- **PERFORMANCE**: 0 achados | varrida com (Read _layout.tsx) | Fonte: G1
- **SEGURANCA**: 0 achados | varrida com (Read app.json) | Fonte: G1

## Achados independentes (gate G1 — FOCADO)

Investigacao INDEPENDENTE alem dos apontamentos do input (com contexto previo rico, ainda assim FASE 1 rodada):

1. **`PersonagemLivro.tsx` usa emojis em vez das imagens reais** — briefing especificou livro-personagem animado com poses. Codigo tem `EMOCAO_EMOJI = { PENSATIVO: '🤔', FELIZ: '😄', ASSUSTADO: '😱' }`. 17 imagens reais estao em `whatsapp_media/images/` mas nao sao usadas.
2. **`_layout.tsx` linha 11 chama `SplashScreen.preventAutoHideAsync()` no module scope** — efeito colateral na importacao, deveria ser em useEffect. Pode causar problema de ordem de inicializacao no native module loading.
3. **Scripts `type-check`/`lint`/`format:check` faltando no package.json** — CI chama esses scripts mas eles nao estao definidos. CI vai falhar em qualquer PR ate isso ser resolvido.
4. **`app.json` ainda tem `PLACEHOLDER_ANDROID_APP_ID`** — o plugin expo-ads-admob precisa do ID real do AdMob (ou pelo menos um ID de teste). Hipotese forte: este placeholder pode ser a causa do `withAndroidDangerousBaseMod` crash no prebuild.
5. **Assets de audio (`assets/audio/`) VAZIO** — P0-7 marcado como entregue mas o diretorio esta vazio. 5 sons esperados: splash, acerto, erro, transicao, musica_fundo.
6. **db.sqlite (798KB) tem 77 modulos mock ou 4345 perguntas reais?** — preciso verificar se o conteudo embarcado e o conteudo real das planilhas ou so mock.
7. **Java 17 NAO esta no PATH padrao do sistema** — `java -version` retorna 1.8.0. Gradle 8+ requer 17+. Scripts de build precisam setar `JAVA_HOME=C:/Users/Donizeti/scoop/apps/temurin17-jdk/current`.
8. **Gradle NAO esta instalado globalmente** — nao ha gradlew no projeto ainda (sera criado pelo prebuild).

## Autonomia por item (1.9 — pre-check leve de acessos)

| Item | Autonomia | Justificativa |
|---|---|---|
| A1 — Garantir app.json com package name correto | JA_RESOLVIDO | ja esta `com.donizetiferr.expertnabiblia` no app.json |
| A2 — Garantir label correto | JA_RESOLVIDO | ja esta `Expert Na Bíblia` no app.json expo.name |
| A3 — Restaurar package.json com todas as deps | JA_RESOLVIDO | `npm install` retornou `added 193 packages` nesta sessao V8 |
| A4 — Resolver bug do prebuild (withAndroidDangerousBaseMod) | AUTONOMO | investigar se e `expo-ads-admob` com PLACEHOLDER; remover ou corrigir |
| A5 — Rodar gradle assembleRelease | AUTONOMO | depende de A4; precisa `JAVA_HOME=C:/Users/Donizeti/scoop/apps/temurin17-jdk/current` |
| A6 — Resolver __DEV__=true (signing release) | AUTONOMO | gradle assembleRelease gera bundle com `__DEV__=false` se for signed release, nao debug |
| A7 — Validar APK no emulador | AUTONOMO | emulator-5554 ja disponivel em C:/Android/Sdk |
| A8 — Verificar instalacao, abertura, navegacao | AUTONOMO | apos APK rodar, adb shell input + screencap |
| A9 — Garantir assets visuais corretos | JA_RESOLVIDO | icon/splash/adaptive-icon/favicon criados em V8 |
| A10 — Renomear app para "Expert Na Bíblia" no launcher | AUTONOMO | rebuild nativo tem label correto no app.json |
| Achado 1 (PersonagemLivro com emojis) | AUTONOMO | substituir emojis por imagens reais de `whatsapp_media/images/` |
| Achado 2 (SplashScreen.preventAutoHideAsync no module scope) | AUTONOMO | mover para useEffect em RootLayout |
| Achado 3 (scripts type-check/lint/format:check faltando) | AUTONOMO | adicionar scripts em package.json |
| Achado 5 (assets audio vazio) | DESTRAVAVEL: 5 sons royalty-free | pesquisar Pixabay/Freesound e baixar |
| Achado 6 (db.sqlite com mock ou real) | AUTONOMO | inspecionar contagem de tabelas/registros |
| Achado 7 (JAVA_HOME 17) | AUTONOMO | exportar antes de gradle |
| Achado 8 (gradle nao instalado) | AUTONOMO | `npx expo prebuild` cria gradlew |

## Itens apontados pelo usuario (10) — validacao FASE 2

1. `Garantir app.json com package name correto: com.donizetiferr.expertnabiblia` → **JA_RESOLVIDO** (ja esta correto no app.json)
2. `Garantir label correto: "Expert Na Bíblia"` → **JA_RESOLVIDO** (ja esta no app.json expo.name)
3. `Restaurar package.json com todas as deps` → **JA_RESOLVIDO** (foi feito no V8 — `npm install` adicionou 193 packages)
4. `Resolver o bug do prebuild (withAndroidDangerousBaseMod)` → **VALIDO** (causa raiz a investigar; hipotese forte: plugin `expo-ads-admob` com `PLACEHOLDER_ANDROID_APP_ID` causando crash)
5. `Rodar gradle assembleRelease` → **VALIDO** (depende de #4; precisa JAVA_HOME=Java 17)
6. `Resolver __DEV__=true (gradle properties ou signing release)` → **VALIDO** (precisa signing release, nao debug)
7. `Validar APK final no emulador` → **VALIDO** (emulator-5554 ja disponivel)
8. `Verificar instalacao, abertura, navegação em todas as 13 telas` → **VALIDO** (apos APK rodar, fazer adb shell input)
9. `Garantir que assets visuais (icon, splash, adaptive-icon) estejam corretos` → **JA_RESOLVIDO** (criados em V8 a partir de `whatsapp_media/images/image_20260622_205222.jpg`)
10. `Renomear o app para "Expert Na Bíblia" no launcher` → **VALIDO** (rebuild nativo tem label correto no app.json)

## Segundo turno critico (FASE 3.5 — gate G5)

### Lentes aplicadas: 7/7

1. **Profundidade rasa?** — item A4 "Resolver o bug do prebuild" estava generico. Detalhar com hipotese especifica.
2. **Falta a melhor versao? (POLISH)** — A5 "Rodar gradle assembleRelease" precisa sub-passos explicitos (JAVA_HOME, gradle.properties, validar 4 ABIs).
3. **Algo se perdeu?** — achados independentes 1, 2, 3, 5, 6 nao estavam nos apontamentos do usuario. MANTER como milestones paralelos.
4. **Priorizacao errada?** — A1, A2, A3, A9 ja foram resolvidos nesta sessao. Rebaixar para `JA_RESOLVIDO`.
5. **Premissas verificadas** — emulator-5554 precisa estar online. Confirmar via `adb devices` antes de A7.
6. **Falta o adjacente obvio?** — apos rebuild, faltam 2 acoes logicas: limpar `dist/*.apk` (19 APKs antigos); atualizar `CHANGELOG.md` com V8.
7. **Item redundante/inflado?** — A7 (validar) + A8 (navegacao em 13 telas) sao a mesma coisa. Consolidar.

### Ajustes apos segundo turno

1. **DETALHADO (lente 1)**: A4 "Resolver o bug do prebuild" — hipotese forte: `expo-ads-admob` com `PLACEHOLDER_ANDROID_APP_ID` causa o crash `withAndroidDangerousBaseMod`. Acao: REMOVER o plugin `expo-ads-admob` do `app.json` temporariamente OU substituir placeholder por um ID de teste real.
2. **ENRIQUECIDO (POLISH, lente 2)**: A5 "Rodar gradle assembleRelease" — adicionar sub-passos: setar `JAVA_HOME=C:/Users/Donizeti/scoop/apps/temurin17-jdk/current`, validar 4 ABIs no output, validar `app.json.android.package` = `com.donizetiferr.expertnabiblia`.
3. **RECUPERADO (lente 3)**: achado 1 (PersonagemLivro com emojis) — MANTER como milestone paralelo.
4. **RECUPERADO (lente 3)**: achado 2 (`SplashScreen.preventAutoHideAsync()` no module scope) — MANTER como item de manutencao.
5. **RECUPERADO (lente 3)**: achado 3 (scripts `type-check`/`lint`/`format:check` faltando) — MANTER como pre-requisito para CI funcionar.
6. **RECUPERADO (lente 3)**: achado 5 (assets audio vazio) e 6 (db.sqlite com mock ou real) — MANTER como pre-requisitos.
7. **RE-PRIORIZADO (lente 4)**: A1, A2, A3, A9 — rebaixar para `JA_RESOLVIDO` e remover do escopo ativo.
8. **CONSOLIDADO (lente 7)**: A7 + A8 — unificar em "validacao completa no emulador" com script reproduzivel (install + launch + 5 screenshots + smoke test).
9. **PREMISSA VERIFICADA (lente 5)**: `adb devices` confirma emulator-5554 device ANTES de A7.
10. **ADJACENTE OBVIO (lente 6)**: apos rebuild, faltam 2 acoes: limpar `dist/*.apk` (19 antigos); atualizar `CHANGELOG.md` com V8.
- Ajustes totais: 1 detalhado, 1 enriquecido, 4 recuperados, 1 re-priorizado (cobre 4 itens), 1 consolidado, 1 premissa verificada, 1 adjacente obvio = **9 ajustes**

### Re-ataque (gate G5 — guarda anti-superficialidade)

Plano com >= 3 itens. Segundo turno encontrou 9 ajustes >> 0. NAO e necessario re-ataque.

### Top 3 ajustes mais relevantes

1. **A4 detalhado**: investigar a hipotese do `expo-ads-admob` PLACEHOLDER causando o crash do prebuild (REMOVER temporariamente OU substituir por ID de teste)
2. **A8/A7 consolidado**: unificar em "validacao completa no emulador" com script reproduzivel
3. **Achado 2 recuperado**: mover `SplashScreen.preventAutoHideAsync()` para useEffect (causa raiz potencial do crash do app.js thread no APK final)
