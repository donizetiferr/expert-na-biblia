# Status — @full-cycle Expert Na Biblia (2026-06-25, V17 + bugs pendentes)

**Finalizado em:** 2026-06-25 (V17 — Play Store prep + EAS build)
**Tipo:** @full-cycle agent (subagente isolado, opus[1m])
**Vertente:** GENERICO (cross-check OK)
**Estado do projeto:** **V17 entregue (6/6 tarefas)** + AAB v17.0.0 + APK universal + keystore release + EAS config + docs atualizadas
**Bugs conhecidos:** 7 bugs visuais/de layout + 1 looping ainda presentes (catalogados, NAO corrigidos por pedido explicito do usuario)
**Toggle file:** `orchestration/.delegated_to_subagent` criado no spawn (limpo apos conclusao)

## Bugs pendentes (catalogados em 2026-06-25, NAO corrigidos por pedido do usuario)

Detalhamento completo em `evolution_plan.md` (Milestone 16 + 17). Resumo:

1. **quiz/jogar.tsx:87-106** — `carregarPerguntas()` faz loop sequencial `for...await` em 20 chamadas `listarPerguntas()`. Pode causar lentidao + race condition se usuario trocar de aba antes do load terminar.
2. **quiz/jogar.tsx:23-24** — `router.push('/quiz/jogar?modo=aleatorio')` passa param `modo`, mas a tela NAO le `useLocalSearchParams` — modo customizado (com modulos selecionados) eh ignorado, sempre carrega M001-M004 fixos.
3. **quiz/final.tsx:56-58** — `setTimeout(persistir, 100)` dentro do body do componente (NAO em useEffect). Em React Native (sem `window`), a persistencia nunca roda; mesmo se rodasse, executaria em cada re-render.
4. **feedback.tsx:57-65** — `playAcerto()`/`playErro()` chamados FORA de useEffect no body do componente. Em cada re-render do componente, o som eh tocado novamente (potencial flood de audio).
5. **onboarding.tsx:31** — `const { width } = Dimensions.get('window')` calculado no module scope. NAO atualiza em rotacao de tela — slides podem ficar fora de viewport em landscape.
6. **licoes/[moduloId].tsx:131** — card bloqueado tem `opacity: 0.5` em cima de `cinzaEscuro` (#4b5563). Resultado: cinza escuro + 50% opacity = quase invisivel. Briefing exige cards bloqueados claramente distintos mas visiveis (V12 7.4 ajustou licoes/index.tsx mas nao tocou [moduloId].tsx).
7. **licoes/index.tsx:31-40** — `playCadeiraDesbloqueia()` eh chamado DENTRO do `renderItem` do FlatList. Guarda `unlockSoundOnceRef` protege contra re-tocadas, MAS na primeira renderizacao pode tocar para varios modulos em sequencia (todos os liberados processados em batch).
8. **LOOPING INFINITO**: foi reportado pelo usuario mas nao consegui localizar a causa exata via code review estatico. Provavelmente em alguma combinacao de useEffect + parametros deep link em `licoes/[moduloId]/[licaoId].tsx` (linhas 43-66 tem 2 useEffects com deps [licaoId, moduloId] e [params.indice, indice] — possivel loop quando feedback avanca com `params.indice=N` enquanto estado `indice` eh atualizado). Requer investigacao runtime (Playwright + adb logcat) para confirmar.

Proximo passo: despachar `@full-cycle` para V18 (bug fixes de layout) ou V19 (debug do looping) — quando o usuario autorizar.

## V17 — execucao (2026-06-25)

Status final: **V17_ENTREGA_COMPLETA** (6/6 tarefas [x])
Modo de limite: UNLIMITED (concluiu em 1 iter — escopo fechado de 6 tarefas sequenciais)
Itens entregues:
- 17.1 [CRITICA] — Keystore release dedicado (RSA 2048, 10000 dias)
- 17.2 [CRITICA] — Gradle signing.release configurado (NAO mais debug)
- 17.3 [CRITICA] — eas.json verificado (ja em ordem)
- 17.4 [ALTA] — Doc Play Store atualizada (asset checklist oficial)
- 17.5 [CRITICA] — AAB v17.0.0 gerado (73MB, BUILD SUCCESSFUL 8m54s)
- 17.6 [ALTA] — AAB validado com bundletool (exit 0) + APK universal extraido

## AAB V17

- **Local**: `C:\ENB\dist\ExpertNaBiblia-v17.0.0.aab`
- **Size**: 73.432.746 bytes (~70 MB)
- **SHA256**: `1bbcef4fe3a8787d5fc6d26813aefcdae28796913dca6dabbb9d46b10d715e34`
- **versionCode**: 2 (incrementado de 1)
- **versionName**: 1.7.0
- **Build**: `gradlew :app:bundleRelease` — BUILD SUCCESSFUL em 8m 54s

## APK Universal V17

- **Local**: `C:\ENB\dist\ExpertNaBiblia-v17.0.0-universal.apk`
- **Size**: 45.026.598 bytes (~43 MB)
- **SHA256**: `35d83415acbb25d1bd08d74a8c3d74a4b62c3e1961bdee20bb78b617c261ddef`
- **Extraido via**: `bundletool extract-apks --device-spec` (arm64-v8a + pt-BR + xxhdpi)

## Commit
`2721dc4` — V17: Play Store prep + EAS build config (18 files, +286/-148)

## V14 — execucao (2026-06-25)

Status final: **V14_ENTREGA_COMPLETA** (8/8 itens [x] M15 + 15.9 rejeitado)
Modo de limite: UNLIMITED (concluiu em 1 iter)
Itens entregues:
- 15.1 [CRITICA] — Splash com logo grande: SplashScreen.hideAsync() em ~500ms, log de onboarding
- 15.2 [CRITICA] — Identidade visual /quiz: fundo creme, emoji size 48->64, palavra-chave laranja/preto
- 15.3 [CRITICA] — Onboarding 1x so: log `[onboarding] key:`, validado E2E (`key: '1'` apos force-stop+relaunch)
- 15.4 [CRITICA] — Fix loop quiz: timerRef + transitionTimeoutRef + transicionandoRef guard
- 15.5 [ALTA] — Personagem livro grande 280px com moldura creme + borda laranja + shadow + fade/zoom Animated
- 15.6 [ALTA] — KeyboardAvoidingView behavior 'height' no Android + offset 64
- 15.7 [ALTA] — Musica fundo v3 (regenerada via ElevenLabs SFX chunks 5s + ffmpeg crossfade-concat, 20s, 128kbps, fade in 1s + fade out 0.5s)
- 15.8 [MEDIA] — Feedback briefing: fundo laranja unificado, personagem 200px, balao de fala em AMBOS casos (acerto/erro), bounce spring animation
- 15.9 [REJEITADO] — emojis do briefing (15.2 mantem emojis com tamanho ajustado)

## APK V14

- **Local**: `C:\ENB\dist\ExpertNaBiblia-v14.0.0.apk`
- **Size**: 107.512.140 bytes (~102 MB)
- **SHA256**: `49344e07d9904df2a7514ed69621facb0a2bae48d780a81080250860dd59a0ed`
- **URL publica**: https://files.catbox.moe/i56993.apk
- **Build**: `gradlew assembleRelease --no-daemon` — BUILD SUCCESSFUL em 2m 51s (612 tasks)

## Validacao E2E (emulator-5554)

- App instalou com Success (Performing Streamed Install)
- App iniciou sem FATAL EXCEPTION (PID 25545)
- `[onboarding] key: null` -> redirecionou para /onboarding (M15.3 OK)
- Force-stop + relaunch: `[onboarding] key: '1'` -> redirecionou direto para /modos (M15.3 OK)
- ZERO erros de audio no logcat (`[audio]` / `[sound]`)
- ZERO FATAL EXCEPTION
- Screenshots em `C:\ENB\orchestration\v14\` (01..06)

## Type-check
- 5 erros pre-existentes (V12/V13, nao relacionados): app.config.ts newArchEnabled, settings.ts (2x), haptics.ts (expo-haptics), sound-runtime.ts lastEfeitos
- 0 erros introduzidos por V14

## Tests
- matching: 8/8 PASS (regressao mantida)
- Jest: 55/58 PASS (3 falhas pre-existentes: settings.ts expo-secure-store ESM, e2e splash Playwright, matching-coverage)

## Commit
`0308a11` — V14 (M15): 8 fixes UX profundos

## FASE 0 — Triagem V14

- FASE 0.0 parser: rigor=NORMAL | modo_continuo=INATIVO (+um-ciclo: escopo fechado) | objetivo=EXPLICITO | flags=(+um-ciclo implicito)
- FASE 0.0.5 apontamentos: 8 (definidos pelo escopo M15.1-M15.8; 15.9 rejeitado documentado)
- FASE 0.1 cross-check vertente: GENERICO_CONFIRMADO
- FASE 0.2 deteccao novo/existente: EXISTENTE (retomada apos V13)
- FASE 0.6 evolution_plan: V15 PLANEJADO em evolution_plan.md (M15.1-15.8 detalhados, 15.9 rejeitado)
- FASE 0.7 deps: M3 token OK em Tokens API e acessos/minimax/credentials.env | ElevenLabs MCP disponivel

## Flags propagadas

- rigor: NORMAL
- modo_continuo: INATIVO (escopo bem definido: 8 fixes + rejeitar 1)
- objetivo: Entregar M15 (8 fixes UX profundos) + APK V14 + upload catbox
- flags: +um-ciclo (escopo fechado, 1 iter suficiente)
- apontamentos_count: 8

## Historico consolidado

- V1-V7 (47/47 itens, codigo pronto)
- V8-RETOMADA (APK bloqueado por Hermes)
- V8-SDK55 (Expo SDK 55 + RN 0.83.6 — BUILD SUCCESSFUL)
- V9 (M0-M6 polish + importacao)
- V10 (M5 + M6 — 7 SFX + observer reativo)
- V11 (correcoes de cor + modal back)
- V12 (M7 5 fixes UX + matching tolerante)
- V13 (M14 5 fixes de bugs reais)
- **V14 (M15 8 fixes UX profundos) — ESTE**

## Proximo passo

Nenhum bloqueante. Para publicar na Play Store, seguir `orchestration/play_store_checklist.md` (2FA Google irredutivel — escopo de execucao humana).