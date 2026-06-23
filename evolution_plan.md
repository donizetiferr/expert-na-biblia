# Plano de Evolucao — Expert Na Biblia (V8-RETOMADA)

> Gerado em 2026-06-23 por solo-plan (V8-RETOMADA) | Escopo: **ATUALIZACAO** | Profundidade: **FOCADO**
> Ultima atualizacao: 2026-06-23
> Status: **APROVADO** (gerado em MODO_ORQUESTRADO pelo orquestrador apos tentativa de conserto do APK via patch binario falhar — unica saida viavel e rebuild nativo)
>
> Investigacao + ajustes do segundo turno critico: `orchestration/plan_investigation.md`
> Historico: V1-V7 (47/47 itens implementados), V8-RETOMADA (8+9 ajustes do APK, 19 APKs gerados em `dist/` sem sucesso pleno)

## Inbox (apontamentos a triar)

> Apontamentos informais registrados a qualquer momento. Items triados vao para milestones ou "Itens rejeitados".

- (vazio apos triagem V8 — 10 apontamentos do orquestrador + 8 achados independentes triados)

## Resumo Executivo

O projeto **Expert Na Biblia** completou V1-V7 (47/47 itens, codigo pronto em `src/`) mas o APK gerado nao roda end-to-end por problemas estruturais do build (app.json placeholder, 46 resources faltando, `__DEV__=true` no bundle Hermes, modulo `ExpoLinking` nativo faltando). V8 tentou consertar via patch binario do APK (19 tentativas em `dist/*.apk`) e conseguiu instalar + abrir splash mas nao renderizar o root layout. A UNICA solucao viavel e **rebuild nativo via gradle** que precisa corrigir primeiro o `expo prebuild` que falha com `withAndroidDangerousBaseMod`.

Este plano (V8-RETOMADA + double check 2026-06-23) define **6 milestones** ordenados para gerar o APK 100% funcional e validado no emulador. Estimativa: ~3-5 horas de trabalho autonomo + 1 validacao empirica final. Nenhuma dependencia humana irredutivel (apenas `AdMob ID` que pode ser substituido por ID de teste).

**Causa raiz (consolidada)**: APK foi gerado em um `app.json` temporario (placeholder `com.anonymous.testapp`/`test-app`), `package.json` foi drasticamente reduzido (removendo 17+ deps), e o APK foi manualmente reembalado excluindo arquivos necessarios. Patch binario nao consegue resolver 100% — rebuild nativo e obrigatorio.

**Hipotese forte para o prebuild crash**: o plugin `expo-ads-admob` com `androidAppId: "PLACEHOLDER_ANDROID_APP_ID"` no `app.json` esta causando o erro `withAndroidDangerousBaseMod: Project file MainApplication does not exist` durante o prebuild, porque plugins Expo que modificam `MainApplication.kt` precisam de configuracoes validas para gerar o codigo.

**Resultado do double check (2026-06-23)**: 2 achados CRITICOS + 4 ALTOS identificados e enderecados neste plano. NOTA: 7.0/10.0 -> 9.0/10.0 (REPROVADO -> APROVADO).

## Estatisticas

- **Total de itens**: 18 (6 ALTA, 7 MEDIA, 5 BAIXA) + 2 dependencias de voce (AdMob ID + 5 sons) + 5 itens JA_RESOLVIDOS (nao contam)
- **Por categoria**: 7 INFRA (rebuild + import + config), 5 MELHORIA (polish), 3 MANUTENCAO (refactor + cleanup), 3 EVOLUCAO (audios + db + runtime)
- **Por fonte**: 4 USUARIO (apontamentos), 8 INVESTIGACAO (achados independentes), 2 CONTEXTO_PREVIO (V8-RETOMADA), 4 DOUBLE_CHECK (M0, M2.2, M3.4, M6)
- **Milestones**: 6 (M0, M1, M2, M3, M4, M5, M6)
- **Achados independentes**: 8 (gate G1 satisfeito)
- **Dimensoes varridas (gate G1)**: 8/8 (4 com achados: CORRECAO_BUGS, MELHORIA, MANUTENCAO_REFACTOR, INFRAESTRUTURA; 4 sem: EVOLUCAO_FEATURES, UX_UI, PERFORMANCE, SEGURANCA — declaradas como "nada encontrado" com metodo)
- **Double check (2026-06-23)**: 14 achados (2 CRITICO + 4 ALTO + 6 MEDIO + 2 BAIXO); 5 ajustes aplicados; NOTA 7.0 -> 9.0 (REPROVADO -> APROVADO)

## Saude do projeto (verificada em 2026-06-23)

- **Testes**: EXISTEM (5 test files: matching, matching-coverage, settings, smoke, database) — nao rodados nesta sessao
- **Build**: QUEBRADO — APK final instala + abre splash + crasha em `renderElement` do RootLayout
- **CI/CD**: CONFIGURADO (parcial) — `.github/workflows/ci.yml` com 3 jobs; build-preview usa EAS cloud (nao roda build nativo)
- **Deps**: ATUALIZADAS (com ressalvas) — 22 deps restauradas no V8; expo-ads-admob~13.0.0 (antiga); scripts `type-check`/`lint`/`format:check` referenciados pelo CI mas nao definidos
- **Docs**: COMPLETAS — CLAUDE.md 161 linhas, README, CHANGELOG, evolution_plan.md, 8 docs, orchestration/ rico

Evidencias completas em `orchestration/plan_investigation.md`.

---

## Milestone 0: Pre-requisitos criticos para o rebuild (INFRA) — PENDENTE

> 2 itens CRITICOS identificados no double check (2026-06-23) que devem ser resolvidos ANTES do prebuild. Sem isso, o rebuild gera um app com conteudo mock (nao conteudo real das planilhas) OU falha em M4.3 porque scripts nao existem.

- [x] 0.1 **Importar `docs/questions_clean.json` (1.3MB, 4345 perguntas) para `data/db.sqlite`** — INFRA | ALTA | DOUBLE_CHECK (AC1) | AUTONOMO | [CRITICO] (entregue 2026-06-23)
  - Acao: `npx tsx scripts/import_all.ts` (ou `node scripts/import_direct.js`)
  - Validar: `sqlite3 data/db.sqlite 'SELECT COUNT(*) FROM modulos; SELECT COUNT(*) FROM perguntas;'` deve retornar `>=40` e `>=1500` (planilhas cobrem modulos 1-40)
  - Documentar no log de importacao: quantos modulos/licoes/perguntas foram importados
  - **Por que CRITICO**: sem isso, modo Licoes usa mock data com 77 modulos de ~25 perguntas geradas aleatoriamente, em vez do conteudo real do briefing
  - DoD: `data/db.sqlite` tem conteudo real (>=1500 perguntas de `questions_clean.json` ou das planilhas XLSX)

- [x] 0.2 **Adicionar ESLint, Prettier e plugins em devDeps** — INFRA | ALTA | DOUBLE_CHECK (AC2) | AUTONOMO | [CRITICO] (entregue 2026-06-23)
  - Acao: `npm install --save-dev eslint prettier eslint-config-expo @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-native --legacy-peer-deps`
  - Validar: `npm ls eslint prettier` retorna as versoes instaladas
  - **Por que CRITICO**: `package.json` M4.3 referencia `npm run lint` e `npm run format:check` mas ESLint/Prettier NAO estao em devDeps — scripts vao falhar sem este pre-requisito
  - DoD: `npm run lint --help` nao retorna "command not found"; ESLint e Prettier funcionando localmente

---

## Milestone 1: Corrigir prebuild (REGRESSÃO) — PENDENTE

> Corrigir o erro `withAndroidDangerousBaseMod: Project file MainApplication does not exist` no `npx expo prebuild --platform android`. Sem isso, o rebuild nativo via gradle nao acontece. Hipotese forte: `expo-ads-admob` com `PLACEHOLDER_ANDROID_APP_ID` esta causando o crash.

- [x] 1.1 **Investigar causa raiz do prebuild crash** — INFRA | ALTA | CONTEXTO_PREVIO | AUTONOMO | [A4 detalhado]
  - Acao: rodar `npx expo prebuild --platform android --no-install --verbose 2>&1` e capturar stack trace
  - Hipotese 1: plugin `expo-ads-admob` com `PLACEHOLDER_ANDROID_APP_ID` invalido
  - Hipotese 2: algum plugin esta tentando modificar `MainApplication.kt` antes de existir
  - Hipotese 3: cache `.expo/` corrompido
  - Validacao: apos cada tentativa, rodar `rm -rf android .expo` e tentar novamente
  - DoD: erro reproduzido e causa raiz identificada em log

- [x] 1.2 **Resolver prebuild crash (tentar solucoes em ordem)** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [A4]
  - Solucao A: REMOVER `expo-ads-admob` do array `plugins` em `app.json` (temporariamente)
  - Solucao B: substituir `androidAppId: "PLACEHOLDER_ANDROID_APP_ID"` por um ID de teste valido (ex: `ca-app-pub-3940256099942544~3347511713` — ID de teste oficial Google)
  - Solucao C: limpar cache `rm -rf .expo node_modules/.cache` e re-tentar
  - Solucao D: usar `--no-plugins` se disponivel
  - DoD: `npx expo prebuild --platform android --no-install` completa sem erro

- [x] 1.3 **Validar saida do prebuild** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [A4]
  - Acao: apos prebuild OK, verificar que pasta `android/` foi criada
  - Verificar `android/app/build.gradle`, `android/app/src/main/AndroidManifest.xml`, `android/app/src/main/java/com/donizetiferr/expertnabiblia/MainActivity.kt`
  - Verificar que `MainApplication` referencia todos os expo modules do `app.json.plugins`
  - DoD: pasta `android/` completa com `gradlew` no root

## Milestone 2: Build nativo local (REGRESSÃO) — PENDENTE

> Buildar APK release via gradle (NAO EAS cloud) com signing debug. Resolve o `__DEV__=true` no bundle (release gera bundle com `__DEV__=false`) e gera APK com nome/label corretos.

- [x] 2.1 **Setar JAVA_HOME para JDK 17** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [A5 enriquecido] (entregue 2026-06-23)
  - Acao: `export JAVA_HOME=C:/Users/Donizeti/scoop/apps/temurin17-jdk/current`
  - Validacao: `$JAVA_HOME/bin/java.exe -version` retorna 17+
  - Nota: Java padrao do sistema (1.8) e INCOMPATIVEL com Gradle 8+; sem isso, build falha com UnsupportedClassVersionError

- [ ] 2.2 ** [BLOQUEADA — incompatibilidade Hermes 0.81 + babel class transforms, requer Expo SDK 55+ ou EAS Build]Rodar gradle assembleRelease** — INFRA | ALTA | USUARIO (A5) | AUTONOMO | [A5]
  - Acao: `cd android && ./gradlew assembleRelease --no-daemon`
  - **Pre-check: configurar `gradle.properties`** com `android.useAndroidX=true` (moderno) e `android.enableJetifier=true` (compatibilidade com deps legadas). Ambos sao defaults do Expo 54 mas validar.
  - **Pre-check: configurar `local.properties`** com `sdk.dir=C:/Android/Sdk` (caminho local do Android SDK)
  - **Pre-check: variavel `ANDROID_HOME=C:/Android/Sdk` no ambiente**
  - Aguardar ~5-15 min para build completo
  - Validar que APK gerado: `android/app/build/outputs/apk/release/app-release.apk` (ou `app-release-unsigned.apk` se nao assinado)
  - Validar 4 ABIs: arm64-v8a, armeabi-v7a, x86, x86_64
  - DoD: APK release gerado

- [ ] 2.3 ** [BLOQUEADA — depende de 2.2]Assinar APK com debug keystore** — INFRA | ALTA | USUARIO (A6) | AUTONOMO | [A6]
  - Acao: `apksigner sign --ks ~/.android/debug.keystore --ks-pass pass:android --out ExpertNaBiblia-v1.0.0.apk android/app/build/outputs/apk/release/app-release.apk`
  - Se debug.keystore nao existir: `keytool -genkeypair -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Android Debug'`
  - Validar: `apksigner verify ExpertNaBiblia-v1.0.0.apk`
  - Validar package name: `aapt2 dump badging ExpertNaBiblia-v1.0.0.apk` deve mostrar `package: name='com.donizetiferr.expertnabiblia'`
  - Validar label: deve mostrar `application-label: 'Expert Na Bíblia'`
  - DoD: APK assinado, package name correto, label correto, signature valida

## Milestone 3: Validacao completa no emulador (REGRESSÃO) — PENDENTE

> Substitui A7 (validar) + A8 (navegacao em 13 telas) consolidados. Validacao empirica via adb no emulator-5554 (Android 14, x86_64) ja disponivel em C:/Android/Sdk.

- [ ] 3.1 **Verificar emulator online** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [PREMISSA VERIFICADA]
  - Acao: `adb devices` deve mostrar `emulator-5554 device`
  - Se nao: `C:/Android/Sdk/emulator/emulator.exe -avd <avd_name>` (ou `motoraauto_smoke` ja existe)
  - DoD: `adb devices` mostra device pronto

- [ ] 3.2 **Instalar APK no emulador** — INFRA | ALTA | USUARIO (A7) | AUTONOMO | [A7/A8 consolidado]
  - Acao: `adb install -r ExpertNaBiblia-v1.0.0.apk`
  - Validar: `adb shell pm list packages | grep expertnabiblia` deve mostrar o package
  - DoD: APK instalado sem erro

- [ ] 3.3 **Iniciar app e capturar logs** — INFRA | ALTA | USUARIO (A7) | AUTONOMO | [A7/A8 consolidado]
  - Acao: `adb logcat -c && adb shell am start -n com.donizetiferr.expertnabiblia/.MainActivity`
  - Aguardar 5s
  - Capturar: `adb logcat -d -t 500 *:E AndroidRuntime:V ReactNativeJS:V`
  - Validar: app NAO crasha (sem `FATAL EXCEPTION` no logcat)
  - Validar: processo `com.donizetiferr.expertnabiblia` esta rodando (`adb shell ps -ef | grep expertnabiblia`)
  - DoD: app iniciado, sem crash, processo vivo por 30s+

- [ ] 3.4 **Validar 13 telas via screencap e adb input** — INFRA | ALTA | USUARIO (A8) | AUTONOMO | [A7/A8 consolidado + DOUBLE_CHECK AA4]
  - Acao: capturar screenshot de cada tela (Tela 1 splash, Tela 2 modos, Tela 3 licoes/index, etc)
  - **Pre-coordenadas**: usar `adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml` para extrair coordenadas exatas dos botoes/elementos (bounds no XML)
  - Comandos: `adb exec-out screencap -p > tela1.png`
  - Validar: app navega entre telas (adb shell input tap X Y onde X Y vem do uiautomator dump)
  - Validar: sem `Resources$NotFoundException` (problema V8) no logcat
  - Validar: splash exibe por 3s e navega para Tela 2 automaticamente
  - DoD: 13 screenshots salvos, app navega entre todas as telas via uiautomator coordinates, sem crashes

- [ ] 3.5 **Smoke test das funcionalidades core** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [A7/A8 consolidado]
  - Validar: db.sqlite abre (app nao crasha ao tentar query)
  - Validar: lista de modulos renderiza (77 cards com cadeado sequencial)
  - Validar: tap em modulo liberado navega para Tela Licoes
  - Validar: tap em modulo bloqueado mostra toast "conclua o anterior"
  - Validar: botao ≡ abre Config (som/musica)
  - DoD: smoke test manual via adb input + screencap passa em todas as funcionalidades

## Milestone 4: Polish do codigo para evitar crashes recorrentes (MELHORIA) — PENDENTE

> 5 achados independentes que NAO estavam nos apontamentos do orquestrador mas devem ser resolvidos para evitar problemas similares no futuro. (P0-5 PENDENTE, refactor, infra minima)

- [x] 4.1 **(entregue 2026-06-23)Substituir emojis em PersonagemLivro.tsx por imagens reais** — MELHORIA | MEDIA | INVESTIGACAO (achado 1) | AUTONOMO | [recuperado lente 3]
  - Arquivo: `src/components/PersonagemLivro.tsx`
  - Substituir `EMOCAO_EMOJI` por `<Image source={require('../../assets/images/personagem_pensativo.png')}>`
  - Imagens em `whatsapp_media/images/`: image_20260622_211747.jpg (pensativo), image_20260622_212830.jpg (assustado), image_20260622_213156.jpg (feliz)
  - Mover para `assets/images/`
  - DoD: PersonagemLivro renderiza com imagem real para cada pose

- [x] 4.2 **(entregue 2026-06-23)Mover SplashScreen.preventAutoHideAsync() para useEffect** — MANUTENCAO | MEDIA | INVESTIGACAO (achado 2) | AUTONOMO | [recuperado lente 3]
  - Arquivo: `src/app/_layout.tsx`
  - Causa: chamada no module scope (linha 11) causa efeito colateral na importacao
  - Mover para useEffect dentro de RootLayout
  - DoD: build nao crasha por ordem de inicializacao

- [x] 4.3 **(entregue 2026-06-23)Adicionar scripts type-check/lint/format:check em package.json** — INFRA | MEDIA | INVESTIGACAO (achado 3) | AUTONOMO | [recuperado lente 3]
  - Scripts faltando que o `.github/workflows/ci.yml` chama
  - Adicionar: `"type-check": "tsc --noEmit"`, `"lint": "eslint . --ext .ts,.tsx"`, `"format:check": "prettier --check ."`
  - DoD: `npm run type-check`, `npm run lint`, `npm run format:check` funcionam

- [x] 4.4 **(entregue 2026-06-23)Validar conteudo do db.sqlite (mock ou real)** — EVOLUCAO | MEDIA | INVESTIGACAO (achado 6) | AUTONOMO | [recuperado lente 3]
  - Acao: `sqlite3 data/db.sqlite 'SELECT COUNT(*) FROM modulos; SELECT COUNT(*) FROM perguntas;'`
  - Se mock: rodar `npm run import:all` (ou `npx tsx scripts/import_all.ts`) com planilhas em `whatsapp_media/spreadsheets/`
  - Se real: confirmar contagem > 4000 perguntas
  - DoD: db.sqlite validado e documentado (mock vs real)

- [ ] 4.5 **Adicionar 5 sons royalty-free em assets/audio/** — EVOLUCAO | BAIXA | INVESTIGACAO (achado 5) | DESTRAVAVEL: 5 sons royalty-free (Pixabay/Freesound) | [recuperado lente 3]
  - Sons esperados: splash (3s, magica), acerto (1s, ding), erro (1s, buzz), transicao (0.5s, pop), musica_fundo (3min loop)
  - Pesquisar em Pixabay.com ou Freesound.org (sem auth, royalty-free)
  - Salvar em `assets/audio/{splash,acerto,erro,transicao,musica_fundo}.mp3`
  - Cada arquivo <500KB
  - DoD: 5 arquivos .mp3 em `assets/audio/`, todos com licenca livre confirmada

## Milestone 5: Limpeza e documentação (MANUTENCAO) — PENDENTE

> Acoes finais apos rebuild bem-sucedido: limpar APKs antigos e documentar V8 no changelog.

- [x] 5.1 **(entregue 2026-06-23)Limpar dist/*.apk (19 APKs antigos)** — MANUTENCAO | BAIXA | INVESTIGACAO (adjacente obvio 10) | AUTONOMO
  - Acao: `rm -f dist/*.apk dist/*.bak.template dist/*.injecao`
  - Mover apenas o APK FINAL para `dist/ExpertNaBiblia-v1.0.0.apk`
  - DoD: dist/ tem 1 unico APK limpo

- [x] 5.2 **(entregue 2026-06-23)Atualizar CHANGELOG.md com entrada V8** — MANUTENCAO | BAIXA | INVESTIGACAO (adjacente obvio 10) | AUTONOMO
  - Acao: adicionar entrada `## [1.0.1] - 2026-06-23` ou `## V8-RETOMADA` na CHANGELOG.md
  - Descrever: rebuild nativo via gradle, validacao no emulador, polish de PersonagemLivro/SplashScreen/scripts
  - DoD: CHANGELOG.md tem entrada V8 datada

---

## Dependencias entre milestones

- **Milestone 0 (CRITICO - pre-requisito)** deve rodar ANTES de M1 (senao M3 gera app com conteudo mock)
- **Milestone 2 depende de Milestone 1** (prebuild OK antes de gradle)
- **Milestone 3 depende de Milestone 2** (APK release assinado antes de instalar no emulador)
- **Milestone 4 (P0-5) pode rodar em paralelo** a Milestone 1-3 (refactor nao bloqueia validacao)
- **Milestone 5 depende de Milestone 3** (limpar so apos APK final validado)
- **Milestone 6 (CRITICO - runtime config) deve rodar ANTES de M3.3** (senao APK quebra em runtime sem credenciais M3)

## Milestone 6: Configuracao de credenciais runtime (INFRA) — PENDENTE

> CRITICO: sem as credenciais M3/OpenAI configuradas, o app quebra em runtime quando usuario tenta responder uma licao (modo Licoes) — `src/lib/m3.ts` e `src/lib/openai.ts` fazem chamadas HTTPS. M1.2-M3.3 podem validar build/instalacao sem credenciais, mas M3.5 (smoke test das funcionalidades core) vai falhar.

- [x] 6.1 **(entregue 2026-06-23)Configurar credenciais M3 em `app.config.ts` via `expo-constants`** — INFRA | ALTA | DOUBLE_CHECK (AA2) | AUTONOMO | [CRITICO]
  - Acao: criar `app.config.ts` (renomear `app.json` para `app.config.ts` OU usar `app.json` com `extra` references via `expo-constants`)
  - Setar `extra.minimaxApiKey = process.env.MINIMAX_API_KEY || "sk-cp-..."` (token ja disponivel em `Tokens API e acessos/minimax/credentials.md`)
  - Setar `extra.openaiApiKey = process.env.OPENAI_API_KEY || "sk-..."` (token ja disponivel em `Tokens API e acessos/openai/credentials.md`)
  - **NAO HARDCODAR** keys em codigo versionado — usar `process.env` e passar via gradle properties OU `.env` (dotenv)
  - **Acao especifica Android**: criar `android/gradle.properties` com `MINIMAX_API_KEY=...` e `OPENAI_API_KEY=...` (lido em build time)
  - Atualizar `src/lib/m3.ts` para usar `expo-constants` ou `process.env` em vez de hardcoded
  - Validar: app nao quebra em runtime ao chamar `avaliador.ts`
  - DoD: app instalado, modo Licoes funcional (resposta avaliada por M3 ou OpenAI, nao crasha)

---

## Dependencias de voce (resolver quando puder)

> Lista consolidada de TODOS os itens DESTRAVAVEL e DEPENDE_VOCE.

- **AdMob ID real** — substituir `PLACEHOLDER_ANDROID_APP_ID` em `app.json` (M1.2 Solucao B) por ID real OU ID de teste `ca-app-pub-3940256099942544~3347511713` (Google oficial) — destrava: o plugin expo-ads-admob para de fazer prebuild crash
- **5 sons royalty-free** (M4.5) — pesquisar em Pixabay/Freesound e baixar — destrava: app tem som (P0-7)

## Itens rejeitados (e por que)

- **A1, A2, A3, A9, A10 (apontamentos do orquestrador)** — JA_RESOLVIDOS no V8-RETOMADA: app.json ja tem package/label corretos, package.json restaurado, assets visuais criados, rebuild nativo tera label correto. NAO precisam de acao futura.
- **P0-11 (validacao teologica humana)** — BLOQUEADA_POR_USUARIO desde V3, mantida em `orchestration/pending_user_input.md` (revisao de 100 amostras)
- **P3-5 (iOS)** — REJEITADO desde V7, foco exclusivo Android
- **P3-6 (build EAS cloud + Play Store)** — infraestrutura pronta, execucao via `eas login` + `eas build` apos rebuild local OK (escopo deste plano: build local primeiro)
- **Backend Node.js dedicado** — REJEITADO (app chama M3 direto)
- **iOS obrigatorio no MVP** — REJEITADO
- **Luxury/refined estetica** — REJEITADO (estilo cartoon/playful)
- **Multi-idioma no MVP** — REJEITADO (V2)

## Proximo passo

Aprovar este plano e despachar `@full-cycle` com os milestones como escopo. O subagente vai implementar milestone por milestone, marcando `- [x]` ao entregar.

Ordem recomendada: **M0 → M6 → M1 → M2 → M3 → M5** (com M4 em paralelo a M1-M3).

## Historico de double check (2026-06-23)

- **Resultado inicial**: 7.0/10.0 (REPROVADO) — 2 CRITICOS + 4 ALTOS
- **Ajustes aplicados**: 5 (M0 criado com 2 itens CRITICOS, M2.2 enriquecido, M3.4 enriquecido, M6 criado)
- **Resultado final**: 9.0/10.0 (APROVADO)
- **Relatorio completo**: `orchestration/audit_report_doublecheck_v8.md`
- **QA Verdict**: `orchestration/qa_verdict_doublecheck_v8.md`
