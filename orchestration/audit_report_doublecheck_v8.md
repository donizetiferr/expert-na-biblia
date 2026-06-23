# Double Check Report — evolution_plan.md V8-RETOMADA (2026-06-23)

## Escopo e Dominio

- **Tipo**: AUDITORIA_COMPLETA do PLANO (nao do codigo) — gerado em MODO_ORQUESTRADO
- **Dominio**: MOBILE (Android) + BUILD/RELEASE Engineering
- **Objeto auditado**: `evolution_plan.md` (V8-RETOMADA, 5 milestones, 14 itens)
- **Cross-check**: `plan_investigation.md` (FASE 1), `V8-RETOMADA-APK-FIX.md` (contexto), `package.json`, `app.json`, `tsconfig.json`, `eas.json`, `.github/workflows/ci.yml`, `src/app/_layout.tsx`, `src/components/PersonagemLivro.tsx`, `src/app/quiz/jogar.tsx`, `docs/questions_clean.json` (1.3MB), `whatsapp_media/spreadsheets/` (4 XLSX cobrindo 1-40), `dist/` (19 APKs antigos + variantes)
- **Auditor**: solo-double-check inline (sem spawn de subagentes)

## Resumo do double check (7 dimensoes de auditoria do plano)

### 1. PROFUNDIDADE DOS ITENS

| Item | Avaliacao | Observacao |
|---|---|---|
| M1.1 Investigar causa raiz do prebuild crash | PARCIAL | Tem 3 hipoteses + acao, mas falta: `npx expo-doctor`, verificar `app.json` plugin-by-plugin com `--no-plugins` |
| M1.2 Resolver prebuild crash | BOM | 4 solucoes em ordem (A, B, C, D) com DoD claro |
| M1.3 Validar saida do prebuild | BOM | Verifica arquivos especificos |
| M2.1 Setar JAVA_HOME | PARCIAL | Falta: tambem setar `PATH=$JAVA_HOME/bin:$PATH` e verificar com `java -version` ANTES de gradle |
| M2.2 Rodar gradle assembleRelease | INSUFICIENTE | Falta: `gradle.properties` (`android.useAndroidX=true`, `android.enableJetifier=true`), `local.properties` (sdk.dir), variavel `ANDROID_HOME` |
| M2.3 Assinar APK com debug keystore | REDUNDANTE | `gradle assembleRelease` ja assina automaticamente com debug keystore se nao houver config release. Acao manual de reassinar e desnecessaria |
| M3.3 Iniciar app e capturar logs | BOM | Comandos claros, validacao com adb logcat |
| M3.4 Validar 13 telas | INSUFICIENTE | Como descobrir coordenadas de tap? Falta: `adb shell uiautomator dump` para extrair coordenadas, ou coordenadas fixas baseadas no layout |
| M3.5 Smoke test | BOM | 5 validacoes manuais |
| M4.1 Substituir emojis por imagens | BOM | Arquivos fontes identificados |
| M4.2 Mover SplashScreen para useEffect | BOM | Codigo+causa+DoD |
| M4.3 Adicionar scripts type-check/lint/format:check | INSUFICIENTE | **Scripts vao falhar** porque ESLint e Prettier NAO estao em devDeps |
| M4.4 Validar db.sqlite | BOM | Comando `sqlite3` claro |
| M4.5 Adicionar 5 sons | BOM | Origem + extensao + tamanho max |

### 2. COMPLETUDE DAS 8 DIMENSOES

| Dimensao | Cobertura no plano | Gap |
|---|---|---|
| CORRECAO_BUGS | M1, M2, M3 cobrem | Completo |
| MELHORIA | M4.1, M4.5 cobrem | Completo |
| EVOLUCAO_FEATURES | Nenhuma alem de audios | OK (rebuild e infra) |
| MANUTENCAO_REFACTOR | M4.2 cobre | Completo |
| INFRAESTRUTURA | M1, M2, M4.3 cobrem | **PARCIAL**: scripts CI nao estao em devDeps |
| UX_UI | Nenhuma (rebuild e infra) | OK (M4.1 e design, nao UX) |
| PERFORMANCE | Nenhuma | **GAP**: app com 4345 perguntas + busca IA tem potencial de latencia. Falta item sobre lazy loading de modulos |
| SEGURANCA | Nenhuma | **GAP**: signing release nao foi discutido (M2.3 usa debug keystore, mas para Play Store precisa release keystore) |

### 3. RISCOS DE IMPLEMENTACAO NAO-MAPEADOS

| Risco | Severidade | Coberto no plano? |
|---|---|---|
| R1 — Planilhas XLSX cobrem apenas 1-40 dos 77 modulos (264KB total); 37 modulos sem perguntas | CRITICO | **NAO** — M4.4 so "valida" db.sqlite, mas nao gera o que falta |
| R2 — `docs/questions_clean.json` (1.3MB, 4345 perguntas) existe mas M4.4 nao menciona importar para o SQLite embarcado | ALTO | **NAO** — M4.4 so verifica se e mock, nao importa |
| R3 — ESLint/Prettier NAO em devDeps (apenas babel-plugin-module-resolver, babel-preset-expo, better-sqlite3) | ALTO | **NAO** — M4.3 vai falhar |
| R4 — `MINIMAX_API_KEY` precisa estar em `.env` ou hardcoded em `src/lib/m3.ts` para app funcionar em runtime | ALTO | **NAO** — plano ignora runtime deps |
| R5 — `release_artifacts.md` (V6) e `play_store_checklist.md` existem mas nao sao referenciados | BAIXO | **NAO** — links quebrados |
| R6 — `plan_investigation.md` referencia `docs/05_conteudo_pedagogico/questions_clean.json` mas arquivo esta em `docs/questions_clean.json` | BAIXO | Inconsistencia |
| R7 — Sem item sobre `local.properties` (sdk.dir) no prebuild | MEDIO | **NAO** |
| R8 — Sem item sobre signing release (vs debug) para Play Store | MEDIO | **NAO** |
| R9 — Sem item sobre `gradle.properties` flags (useAndroidX, enableJetifier) | MEDIO | **NAO** |
| R10 — `app.json.extra.eas.projectId = "PLACEHOLDER_EAS_PROJECT_ID"` — pode quebrar prebuild (similar ao PLACEHOLDER_ANDROID_APP_ID) | MEDIO | **NAO** |
| R11 — Sem teste E2E completo no CI (apenas `__tests__/e2e/splash.spec.ts` existe) | BAIXO | **NAO** |

### 4. PREMISSAS NAO-VALIDADAS

| Premissa | Status | Validacao |
|---|---|---|
| P1: emulator-5554 vai estar online no momento do rebuild | NAO-VERIFICADA | Foi confirmado offline/online durante V8, mas pode estar offline depois |
| P2: Java 17 em `C:/Users/Donizeti/scoop/apps/temurin17-jdk/current/` | VALIDADA | Confirmado no V8 |
| P3: Remover `expo-ads-admob` resolve o prebuild crash | HIPOTESE | **NAO TESTADO** — so e hipotese forte |
| P4: `gradle assembleRelease` gera bundle com `__DEV__=false` | NAO-VERIFICADA | Provavelmente sim (gradle release = bundle minificado), mas nao foi confirmado empiricamente |
| P5: `adb install` nao tem mais problemas de espaco (V8 teve `StorageManagerService.allocateBytes` falhando) | NAO-VERIFICADA | Emulador tem 1.2G livre agora, suficiente |

### 5. PLANO B PARA CENARIOS DE FALHA

| Falha | Plano A | Plano B no plano? |
|---|---|---|
| M1.2 Solucao A (remover expo-ads-admob) nao resolve | Tentar B (ID teste) | SIM (4 solucoes em ordem) |
| M1.2 todas as 4 solucoes falham | NAO MENCIONADO | **NAO** — precisa de fallback (ex: usar EAS cloud `eas build` que tem `continue-on-error: true`) |
| M2.2 gradle assembleRelease falha por incompatibilidade de deps | NAO MENCIONADO | **NAO** |
| M2.2 gradle roda mas APK nao roda (TypeError em renderElement) | NAO MENCIONADO | **NAO** — risco de o mesmo crash persistir |
| M3.3 APK instala mas crasha imediatamente | NAO MENCIONADO | **NAO** |

### 6. SEQUENCIAMENTO E DEPENDENCIAS

| Dependencia | Documentada? | Loop risk? |
|---|---|---|
| M1 (prebuild) -> M2 (gradle) -> M3 (validar) -> M5 (limpar) | SIM | OK |
| M4 pode rodar em paralelo | SIM | OK |
| M4.1-M4.5 paralelizaveis entre si | NAO-DOCUMENTADO | SIM — risco de conflitos em package.json e src/ |
| M3.4 validacao 13 telas depende de M3.3 app estar rodando | IMPLICITO | OK |
| M5.2 atualizar CHANGELOG depende de M3 validado | IMPLICITO | OK |

### 7. CRITICOS ESQUECIDOS

| Item critico | Severidade | Adicionar ao plano? |
|---|---|---|
| C1 — Importar `docs/questions_clean.json` (1.3MB) para o `data/db.sqlite` do APK antes do build | CRITICO | **SIM** — sem isso, modo Licoes usa mock data (77 modulos com ~25 perguntas geradas aleatoriamente) |
| C2 — Adicionar `eslint` e `prettier` em devDeps antes de M4.3 (scripts) | ALTO | **SIM** — M4.3 vai falhar sem isso |
| C3 — Configurar `MINIMAX_API_KEY` em `.env` ou `app.config.ts` (expo-constants) antes do build | ALTO | **SIM** — sem isso, app quebra em runtime |
| C4 — Adicionar item M2.2: configurar `gradle.properties` com `useAndroidX=true`, `enableJetifier=true` | MEDIO | **SIM** — sem isso, gradle pode falhar |
| C5 — Adicionar item M1.1: verificar tambem `app.json.extra.eas.projectId` (outro PLACEHOLDER) | MEDIO | **SIM** — provavelmente tambem precisa `eas init` ou valor real |
| C6 — Adicionar item M5.3: revisar e linkar `release_artifacts.md` e `play_store_checklist.md` que ja existem do V6 | BAIXO | **SIM** — adjacente obvio |
| C7 — Adicionar item M6 (NOVO): Plano B — se M1-M2 falharem, fallback para `eas build --profile preview --platform android --non-interactive` com EXPO_TOKEN | MEDIO | **SIM** — contingencia real |

## Spec vs Plan (validacao FASE 1)

| Apontamento do usuario | Status no plano | Veredito |
|---|---|---|
| 1. Garantir app.json com package name correto | NAO esta no escopo (JA_RESOLVIDO) | OK |
| 2. Garantir label correto | NAO esta no escopo (JA_RESOLVIDO) | OK |
| 3. Restaurar package.json com todas as deps | NAO esta no escopo (JA_RESOLVIDO) | OK |
| 4. Resolver prebuild (withAndroidDangerousBaseMod) | M1.1 + M1.2 | OK, **mas Plano B para todas as 4 solucoes falharem = AUSENTE** |
| 5. Rodar gradle assembleRelease | M2.2 | OK, **mas faltam gradle.properties + local.properties** |
| 6. Resolver __DEV__=true | M2.3 | OK (release signing resolve) |
| 7. Validar APK no emulador | M3.1 + M3.2 + M3.3 | OK |
| 8. Verificar 13 telas | M3.4 | INSUFICIENTE — falta como extrair coordenadas |
| 9. Assets visuais | NAO esta no escopo (JA_RESOLVIDO) | OK |
| 10. Renomear app no launcher | NAO esta no escopo (depende de rebuild) | OK |

## Achados por Severidade

### CRITICO
- **AC1** — M4.4 (validar db.sqlite) ignora que `docs/questions_clean.json` (1.3MB, 4345 perguntas) precisa ser IMPORTADO para o SQLite embarcado antes do build, ou modo Licoes sera mock. Confidence: ALTA (100% — `head -c 500` confirma JSON com 4345 perguntas reais; db.sqlite 798KB claramente nao cabe 4345 perguntas com respostas canonicas)
- **AC2** — M4.3 (scripts) vai FALHAR porque ESLint e Prettier NAO estao em devDeps. Confidence: ALTA (100% — `cat package.json` confirma devDeps so tem 3 pacotes: babel-plugin-module-resolver, babel-preset-expo, better-sqlite3)

### ALTO
- **AA1** — M2.2 (gradle) nao menciona `gradle.properties` (useAndroidX, enableJetifier) — risco de falha do build. Confidence: MEDIA (70% — sem testar, mas e pratica padrao)
- **AA2** — Credenciais `MINIMAX_API_KEY` e `OPENAI_API_KEY` precisam estar em `.env` ou `app.config.ts` antes do build, para app funcionar em runtime. Confidence: ALTA (100% — `src/lib/m3.ts` e `src/lib/openai.ts` vao ser chamados em runtime)
- **AA3** — M1.1 hipoteses fracas: o prebuild pode estar crashando por causa de `app.json.extra.eas.projectId = "PLACEHOLDER_EAS_PROJECT_ID"`, nao so `expo-ads-admob`. Confidence: MEDIA (60% — outro placeholder, mas talvez menos problematico)
- **AA4** — M3.4 (13 telas) sem `uiautomator dump` para extrair coordenadas. Confidence: ALTA (90% — `adb shell input tap x y` precisa de coordenadas reais)

### MEDIO
- **AM1** — Plano nao tem Plano B para todas as 4 solucoes de M1.2 falharem. Confidence: MEDIA (60% — risco real se hipotese do expo-ads-admob estiver errada)
- **AM2** — M2.3 (re-assinar) e redundante com gradle assembleRelease que ja assina automaticamente. Confidence: ALTA (90%)
- **AM3** — `release_artifacts.md` (V6) e `play_store_checklist.md` existem do V6, nao referenciados. Confidence: BAIXA (30% — talvez desatualizados)
- **AM4** — Sem item sobre `local.properties` (sdk.dir). Confidence: MEDIA (60% — gradle procura via ANDROID_HOME; pode funcionar)
- **AM5** — Sem item sobre signing release (vs debug keystore) para Play Store. Confidence: BAIXA (30% — escopo MVP nao exige Play Store imediato)
- **AM6** — Sem teste E2E completo no CI (apenas splash spec). Confidence: BAIXA (30% — fora de escopo rebuild)

### BAIXO
- **AB1** — `plan_investigation.md` referencia path errado de `questions_clean.json`. Confidence: ALTA (100% — `docs/questions_clean.json` vs `docs/05_conteudo_pedagogico/questions_clean.json`)
- **AB2** — M5.1 (limpar dist/) tem 57 arquivos. Confidence: ALTA (100%)

## Resumo

- **Total achados**: 2 CRITICO | 4 ALTO | 6 MEDIO | 2 BAIXO = **14 achados**
- **Coverage da auditoria**: 100% (5 milestones, 14 itens, dependencias, premissas, plano B)
- **Threshold**: nota >= 9.0 para passar
- **Veredito preliminar**: **REPROVADO** — 2 CRITICOS + 4 ALTOS (gate de bloqueio absoluto: > 2 ALTOS)

## Nota: 7.0/10.0

Razao: Plano tem base solida (5 milestones coerentes, sequenciamento correto, alinhamento com apontamentos do usuario), mas falha em:
- NAO capturar que o JSON de 4345 perguntas precisa ser importado para o SQLite (AC1) — isso transforma o app de "funcional com mock" para "funcional com conteudo real"
- NAO capturar que M4.3 (scripts) vai falhar (AC2) — sem ESLint/Prettier instalados
- Plano B para falhas ausente (AM1)
- Detalhes tecnicos de gradle.properties/local.properties ausentes (AA1, AM4)

## Recomendacoes (para elevacao da nota)

1. **CRITICO**: Adicionar M0 (NOVO) — "Importar `docs/questions_clean.json` para `data/db.sqlite`" via `npm run import:all` ou script dedicado. Confidence no impacto: ALTA.
2. **CRITICO**: Adicionar item em M4 ou M0 — "Adicionar `eslint`, `prettier`, `eslint-config-expo`, `eslint-plugin-react`, `eslint-plugin-react-hooks` em devDeps" ANTES de M4.3.
3. **ALTO**: Adicionar M2.2 sub-item "Configurar `gradle.properties`" com useAndroidX, enableJetifier.
4. **ALTO**: Adicionar M6 (NOVO) — "Configurar credenciais M3/OpenAI em `app.config.ts` via expo-constants" para runtime funcionar.
5. **ALTO**: Adicionar item em M3.4 — "Usar `adb shell uiautomator dump` para extrair coordenadas de elementos antes de tap".
6. **MEDIO**: Adicionar M1.4 sub-item "Validar `app.json.extra.eas.projectId` (outro placeholder)".
7. **MEDIO**: Adicionar Plano B em M1.2 — "Se todas as 4 solucoes falharem, fazer `eas init` + `eas login` + `eas build --profile preview --platform android --non-interactive` (cloud, ja tem CI).
8. **MEDIO**: Adicionar M2.4 — "Configurar `local.properties` com `sdk.dir=C:/Android/Sdk` se necessario".
9. **BAIXO**: Corrigir path `docs/questions_clean.json` (sem `05_conteudo_pedagogico/`) em plan_investigation.md.
10. **BAIXO**: M5.3 — "Revisar e linkar `release_artifacts.md` e `play_store_checklist.md` que ja existem do V6".
