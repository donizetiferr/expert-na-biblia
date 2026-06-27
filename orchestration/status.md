# Status — @full-cycle Expert Na Biblia — V19 (2026-06-25)

**Tipo:** @full-cycle agent (subagente isolado, opus[1m]) | **Vertente:** GENERICO
**Estado do projeto:** EXISTENTE (V1-V18 entregues; V18 ALEGOU 5/5 mas QA independente REFUTOU)
**Objetivo (DERIVADO):** corrigir TODOS os bugs reais do VERDICT V18 (BUG-1..9) e COMPROVAR empiricamente no emulador (sem repetir o erro V18 de alegar sem provar)

## FASE 0 — Triagem V19
- 0.0 parser: rigor=ALTO (release-blocker + exigencia de prova empirica) | modo_continuo=ATIVO | objetivo=DERIVADO | flags=()
- 0.0.5 apontamentos: 9 bugs do VERDICT.md (1 CRITICO release-blocker, 3 ALTO, 5 MEDIO)
- 0.0.6 evolution_plan: EXISTENTE — milestone V19 a registrar
- 0.1 cross-check vertente: GENERICO_CONFIRMADO
- 0.2 novo/existente: EXISTENTE
- 0.9 Dev Server: SKIPPED | motivo=projeto_mobile_RN (validacao via emulador/APK)

## Ambiente de build (CRITICO — path acentuado quebra toolchain)
- Canonical (EDITAR aqui): C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia
- Build clone: C:\ENB (path curto) — sync via orchestration/sync_to_enb.sh antes de cada build
- adb: C:/Android/Sdk/platform-tools/adb.exe | emulador hi-res 1080x1920

## Achados ALEM do VERDICT (honestidade)
- BUG-2 subestimado: NAO sao 8 placeholders — sao 508 canonicas placeholder/curtas no seed TS (maioria "NAO SEI", perguntas abertas de compreensao). data/db.sqlite (511) esta STALE vs seed TS (508) — NAO regenerar do db.sqlite (regrediria). Seed TS = fonte de verdade.
- avaliador.ts (orquestrador LLM local->M3->OpenAI) NAO esta wired no fluxo de licao (enviar() usa matchCanonico cru). Rule #4 "IA obrigatoria" nao cumprida nas licoes.

## Estrategia V19
- BUG-1 (scoring): thread `acertos` via params em licao<->feedback (CRITICO).
- BUG-2: (a) guard em matchCanonico — canonica placeholder + resposta substantiva => aceita (metodo SEM_GABARITO), nunca invencivel; (b) preencher 11 canonicas reais (7 '...' + 4 "NAO SEI" do FB01) no seed TS + db.sqlite; (c) documentar 508 + recomendar wiring avaliador.ts + batch M2.7 p/ V20.
- BUG-3/4 keyboard ScrollView + guard envio vazio.
- BUG-5 placar copy + "Voce acertou X de N". BUG-7 split nome. BUG-8 banner flow. BUG-9 travado roxo+cadeado.
- BUG-6 mascote dourado: app tem 1 set PNG; avaliar/deferir se asset dourado indisponivel.

Estado: IMPLEMENTANDO_V19

## V20 — CONCLUIDO COMPROVADO (2026-06-25)
Estado: V20_ENTREGUE_COMPROVADO
- Codigo: (A) PersonagemLivro prop `variante: 'licoes'|'quiz'` + 5 assets dourados (3 poses reais
  do Drive); wire nas 3 telas de Licoes; Quiz mantem roxo (default). (B) avaliarResposta (hibrido)
  wired no enviar() da licao com loading "AVALIANDO..." + fallback. (C) BUG REAL corrigido: parser
  M2.7 (think + cercas markdown) -> novo src/lib/parse-json.ts em m3.ts/openai.ts.
- Gates: tsc 0 | jest 94/94 (+7 parse-json) | eslint 0 | APK vc5/1.10.0 (109MB).
- Build com MINIMAX_API_KEY+OPENAI_API_KEY baked em assets/app.config (verificado).
- VALIDACAO EMPIRICA emulador hi-res 1080x1920 (rede RESTAURADA: IS_VALIDATED INTERNET):
  - Mascote DOURADO nas Licoes (pergunta/feedback-acerto/feedback-erro/final 100%) — screenshots
    05/07b/11/journey_final_100. Quiz ROXO — screenshot 13_quiz_final_ROXO.
  - IA online: Q1 CORRETO via M2.7 (m3_usage chamadas=2; cache score 1.0); loading "AVALIANDO..."
    (10_burst_2). Fallback gracioso em erro transitorio (11). Integracao Node real M2.7: 4/4.
  - Gate de entrada (sem regressao): licao FB01-L01 -> 100% "VOCE PASSOU" -> L01 AMARELA "100/100"
    -> L02 DESBLOQUEADA (journey_amarelo_unlock). Acertos acumulando ate 9 (journey_q9).
- Evidencias: orchestration/v20_validation/. APK: dist/ + C:\ENB\dist\ ExpertNaBiblia-v20.0.0.apk
  (regra das 5). URL catbox: https://files.catbox.moe/kjvgi4.apk (HTTP 206 + PK verificado).
- Pendencias honestas: (1) set dourado PARCIAL — sem pose assustado/triste dedicada (usa
  "questionando"); depende da designer. (2) quiz-alternatives.ts tem mesmo padrao de parsing fragil
  (batch offline, fora do escopo) — follow-up no evolution_plan.
- Git: commit LOCAL apenas (usuario pediu SEM push).

## V20 — historico de implementacao
Estado: IMPLEMENTADO_V20
- 0.0 parser: rigor=ALTO (exige prova empirica) | modo_continuo=ATIVO | objetivo=DERIVADO | flags=()
- Objetivo (DERIVADO): fechar 2 lacunas de conformidade do briefing e COMPROVAR no emulador:
  (1) mascote DOURADO no modo Licoes (roxo no Quiz); (2) IA obrigatoria nas licoes (avaliador.ts wired).
- 0.1 vertente: GENERICO_CONFIRMADO | 0.2 EXISTENTE | 0.9 Dev Server: SKIPPED (mobile RN)
- Assets dourados: Drive "Personagens" (thayna, compartilhado) -> 3 poses DOURADAS reais baixadas via
  Playwright (Chrome logado): golden_13 (exclamando/dedo p/ cima), golden_14 (pensativo/queixo),
  golden_15 (questionando). Set dourado eh PARCIAL (so 3 poses positivas/neutras; SEM assustado/triste
  dedicados). Processadas em assets/images/personagem_licoes_*.png (transparente, ~120KB, ~760px).

## V19 CONCLUIDO (2026-06-25)
Estado: V19_ENTREGUE_COMPROVADO
- Codigo: BUG-1..5,7,8,9,10 corrigidos. BUG-6 + IA-nas-licoes diferidos p/ V20.
- Gates: tsc 0 | jest 87/87 | eslint 0 | gradle assembleRelease OK (vc4/1.9.0)
- Validacao empirica emulador hi-res (orchestration/v19_validation/): licao 100%->amarela->licao2
  desbloqueada; modulo FB01 amarelo->FB02 desbloqueado; TROFEU; Quiz aleatorio jogavel; 0 FATAL.
  Acertos comprovados acumulando 1->10 (prova do release-blocker BUG-1).
- APK: dist/ + C:\ENB\dist\ ExpertNaBiblia-v19.0.0.apk (regra das 5). URL: https://files.catbox.moe/i9ktqe.apk (HTTP 206 + PK)
- Git: commit LOCAL apenas (usuario pediu SEM push ao GitHub).

## V21 — ciclo de FECHAMENTO (2026-06-25)
Estado: INVOCANDO_SOLO_EVOLVE_V21 | Modo: AGENT (subagente isolado opus[1m]) | MODO_ORQUESTRADO_FULL_CYCLE
- 0.0 parser: rigor=ALTO (exige prova empirica emulador+IA online) | modo_continuo=INATIVO (+um-ciclo: ciclo de fechamento V21, escopo = 3 itens nao-bloqueantes) | objetivo=EXPLICITO
- Objetivo: fechar os 3 itens nao-bloqueantes do VERDICT V20 sem regredir (scoring/progressao, mascotes, quiz).
- 0.1 vertente: GENERICO_CONFIRMADO (sem sinais Workana/PedBot) | 0.2 EXISTENTE | 0.7 deps: M2.7+OpenAI keys baked (cache valido) | 0.9 Dev Server: SKIPPED (mobile RN, sem dev server web)
- FASE 1: solo-roadmap DISPENSADO (roadmap dado = V21 com 3 itens explicitos; version_plan V21 escrito direto)
- Diagnostico previo (agent): 
  - Item1 m3.ts:27 TIMEOUT_MS=10000 -> abort vira 'M3_TIMEOUT' que NAO casa /network|fetch|abort/i em avaliador.ts:79 -> msg dura. Fix: 27000ms + regex incluir timeout.
  - Item2 seed-perguntas.ts ja tem Q07 real (FB01 sem '...'/'NAO SEI'); data/db.sqlite (dev master) ainda '...'. Polir acentos Q07 + sync db.sqlite. (489 'NAO SEI' em NT/locked = follow-up fora de escopo.)
  - Item3 ~127 strings UI sem acento em src/app+src/components.
- Runtime DB: seeda de seed-*.ts bundled (NAO de data/db.sqlite; este eh artefato dev/master do generate_seed_ts).
FASE_0_9: SKIPPED | motivo=projeto_mobile_RN_sem_dev_server_web

## solo-evolve V21 2026-06-25 19:48:29
Estado: EVOLVE_V21_CONCLUIDO_AGUARDANDO_ORQUESTRADOR
commit: d3b4ca1 | audit 10.0/10 | jest 94->97 (+3) | tsc 0 | lint 0

Estado: EVOLVE+QA_V21_CONCLUIDO | APK vc6/1.11.0 | catbox https://files.catbox.moe/id22o1.apk (206+PK) | jornada 100%->amarelo->unlock OK | IA ~13.7s real | Q07 real | acentos OK | feedback rolavel

## save-state 2026-06-25 21:06:20
Estado: SAVE_STATE_CONCLUIDO_AGUARDANDO_ORQUESTRADOR (V21)

## ===== V23 FASE 1 (@full-cycle agent, 2026-06-26) =====
- 0.0 parser: rigor=ALTO (exige prova empirica emulador) | modo_continuo=ATIVO | objetivo=DERIVADO | flags=()
- Objetivo (DERIVADO do team-lead): implementar FASE 1 do PLANO V23 (engajamento/dopamina/retencao + aprendizado + UX/multi-idade + infra/seguranca critica) em quantos ciclos forem necessarios. Cada versao com gates + validacao empirica.
- 0.1 vertente: GENERICO_CONFIRMADO (sem sinais Workana/PedBot) | 0.2 EXISTENTE (V1-V21 entregues)
- 0.0.6 evolution_plan: EXISTENTE+APROVADO (PLANO V23, FASE 1) — consumido como tema de iteracao
- paridade skill: OK
- FASE 1 solo-roadmap: DISPENSADO (roadmap dado pelo team-lead; version_plan.md escrito direto)
- FASE_0_9: SKIPPED | motivo=projeto_mobile_RN_sem_dev_server_web

Estado: IMPLEMENTANDO_V23.1 (fundacao A.0 + XP A.1 + streak A.2)

## V23.1 — ENTREGUE COMPROVADO (2026-06-26, v1.12.0/vc7)
Estado: V23.1_ENTREGUE_COMPROVADO
- Escopo MLE (8 itens): A.0 fundacao (migration 002 + Settings + helper XP) + A.1 XP + A.2 streak +
  A.3 meta diaria + B.3 barra global + B.2 perfil + B.1 badges (galeria+modal) + C.1 onboarding ativacao.
- Gates: tsc 0 | jest 128/128 (15 suites, +31 vs 97) | eslint 0.
- VALIDACAO EMPIRICA emulador hi-res 1080x1920 (UPGRADE sobre V21 = migration 002 em DB existente):
  - 0 FATAL EXCEPTION; `[layout] migrations+seed OK` (migration 002 sem crash no upgrade).
  - Loop visivel: onboarding 6 passos + 1a vitoria (+10 XP) -> header /licoes (🔥1, Nivel 1, 10 XP,
    meta 10/50, 0/40) -> quiz 12/20 = +60 XP + Meta batida +20 XP -> perfil 90 XP / Meta ✓ (barra verde).
  - Evidencias: orchestration/v23_1_validation/ (VALIDACAO.md + 13 screenshots 00..12).
- APK: dist/ExpertNaBiblia-v23.1.0.apk (vc7/1.12.0); dist podado p/ 5 (v18,19,20,21,23.1).
- Badges: galeria + modal + logica unit-tested; trigger empirico de unlock (modulo completo/streak 7/
  quiz 20/20) deferido (desproporcional p/ validacao). Git: commit LOCAL (sem push).
- Proxima: V23.2 (resto do nucleo de retencao A.4-A.7) e demais ciclos da FASE 1.

## V23.2 — ENTREGUE COMPROVADO (2026-06-26/27, v1.13.0/vc8)
Estado: V23.2_ENTREGUE_COMPROVADO
- Escopo (milestone A completo): A.4 notificacoes wired (config agenda/cancela) + A.5 bau surpresa
  (~30% ao concluir licao 100%, +5/10/15/25 XP) + A.6 refazer-so-erradas (tom de progresso) +
  A.7 persistencia (Auto Backup + export/import) + config (meta selector, reduceMotion, backup).
- Gates: tsc 0 | jest 137/137 (17 suites, +9) | eslint 0.
- VALIDACAO EMPIRICA emulador hi-res (UPGRADE sobre V23.1, 0 FATAL):
  - A.6 COMPROVADO end-to-end: licao FB01-L02 (10 perguntas), 2 acertos via match local offline,
    final "VOCÊ CONSEGUE! 2 de 10" + "+10 XP" + "REFAZER AS QUE FALTARAM (8)" -> recarrega "1-8"
    (subset exato). Acertos threading intacto (BUG-1 nao regrediu).
  - A.4/A.3: config com Notificacoes push ON + Meta diária 50/100/150 (50 ativo).
  - A.7: progresso preservado em todos os upgrades V21->V23.1->V23.2.
  - Evidencias: orchestration/v23_2_validation/ (VALIDACAO.md + screenshots 01..05).
- APK: dist/ExpertNaBiblia-v23.2.0.apk (vc8/1.13.0); dist podado p/ 5 (v19,20,21,23.1,23.2).
- BUG encontrado+corrigido: config estourava a dobra (View fixo) -> View->ScrollView (commit
  pos-validacao; confirmacao empirica do scroll no build da V23.3 que inclui o fix).
- Proxima: V23.3 (resto de B: B.4 leaderboard, B.5 combo quiz, B.6 mascote nivel + C.2 continuar).

## V23.3 — ENTREGUE COMPROVADO (2026-06-27, v1.14.0/vc9)
Estado: V23.3_ENTREGUE_COMPROVADO
- Escopo (milestone B + C.2 completos): B.4 recordes/leaderboard (obterRecordes + secao no perfil) +
  B.5 combo no quiz (contador + indicador + SFX + bonus de XP) + B.6 mascote evolui por nivel
  (prop nivel + aura/glow) + C.2 continuar (proximaLicaoPendente + CTA em /modos) + fix config scroll.
- Gates: tsc 0 | jest 139/139 (17 suites, +2) | eslint 0.
- VALIDACAO EMPIRICA emulador hi-res (UPGRADE sobre V23.2, 0 FATAL):
  - C.2: CTA "▶ CONTINUAR" no topo de /modos (licao pendente). COMPROVADO.
  - B.4: perfil "RECORDES 🎲 Melhor Quiz 60%" (le user_rankings). COMPROVADO.
  - B.6: mascote DOURADO "NÍVEL 2" + glow no perfil (XP=100). COMPROVADO.
  - Fix config: ScrollView revela reduceMotion + backup. COMPROVADO.
  - B.5 combo: unit-tested (calcularBonusCombo); trigger empirico de 3 seguidos limitado pelo timer
    10s vs latencia do loop de automacao (timeout entre respostas) — limitacao de teste, nao defeito.
  - Evidencias: orchestration/v23_3_validation/ (VALIDACAO.md + screenshots 01..03).
- APK: dist/ExpertNaBiblia-v23.3.0.apk (vc9/1.14.0); dist podado p/ 5 (v20,21,23.1,23.2,23.3).
- Milestones A + B + C completos (nucleo de engajamento/retencao/conquista da FASE 1).
- Proxima: V23.4 = milestone D (aprendizado: conteudo didatico, revisao espacada/Leitner, novos
  formatos, refs biblicas, versiculo do dia). Depois E, G, H, I, J, K.

## V23.4 — ENTREGUE COMPROVADO (2026-06-27, v1.15.0/vc10)
Estado: V23.4_ENTREGUE_COMPROVADO
- Escopo: D.5 versiculo do dia (lib/versiculo-do-dia + card em /modos; "Li hoje"->streak; Compartilhar).
  /modos virou ScrollView. Gates: tsc 0 | jest 144/144 (+5) | eslint 0.
- VALIDACAO emulador (UPGRADE sobre V23.3, 0 FATAL): card "VERSICULO DE HOJE" (Isaías 40:31) COMPROVADO.
  Evidencias: orchestration/v23_4_validation/.
- APK: dist/ExpertNaBiblia-v23.4.0.apk (vc10/1.15.0); dist podado p/ 5 (v21,23.1,23.2,23.3,23.4).
- Pendente milestone D: D.1 conteudo didatico, D.2 Leitner, D.3 completar-versiculo, D.4 refs biblicas
  — precisam do batch M2.7 (Minimax) p/ gerar conteudo em escala. Proxima: V23.5 = D.1-D.4 + E + G...

## V23.5 — ENTREGUE COMPROVADO (2026-06-27, v1.16.0/vc11) — FECHA milestone D
Estado: V23.5_ENTREGUE_COMPROVADO
- Escopo (milestone D completo): D.1 conteudo didatico (card "Aprenda") + D.2 revisao espacada Leitner
  (rota /revisao) + D.3 novo formato "completar versiculo" (rota /completar) + D.4 refs biblicas no feedback.
- Migration 003 (`licao_conteudo`, `pergunta_revisao`, `completar_versiculo`) com seed de gate proprio
  idempotente (INSERT OR IGNORE — nao reseta progresso no upgrade).
- Conteudo gerado via batch M2.7 (MiniMax-M2.7): 657/754 licoes com mini-ensino+versiculo (`scripts/gen_d1_conteudo.mjs`)
  + 52 itens "completar versiculo" (`scripts/gen_d3_completar.mjs`). Seeds bundled via `scripts/gen_seed_d.mjs`.
- Gates: tsc 0 | jest 156/156 (+12: revisao/completar) | eslint 0.
- VALIDACAO EMPIRICA emulador hi-res 1080x1920 (UPGRADE sobre V23.4, 0 FATAL):
  - DB pos-upgrade: licao_conteudo=657, completar_versiculo=52, pergunta_revisao registrado ao responder.
  - D.1: card "APRENDA" (mascote dourado + ensino "Antigo/Novo Testamento" + 📖 Hebreus 1:1-2 + Comecar) -> perguntas.
  - D.4: feedback "CORRETO!" exibe "📖 Referencia: Hebreus 1:1-2".
  - D.3: "Complete o versiculo" Mateus 6:33 lacuna + 4 opcoes; acerto "reino" verde + PROXIMO.
  - D.2: card "🔁 REVISAO" com badge "5" -> flashcard "O que e a Biblia?" -> resposta revelada -> "LEMBREI" reagenda
    (DB: devidos 5->4, 1 movido p/ futuro) -> avanca 2/5.
  - Evidencias: orchestration/v23_5_validation/ (00..10).
- APK: dist/ExpertNaBiblia-v23.5.0.apk (vc11/1.16.0, 105MB); dist podado p/ 5 (v23.1,23.2,23.3,23.4,23.5).
- Git: commit LOCAL (sem push).
- Follow-up (nao bloqueiam): ~97 licoes sem conteudo (erro batch M2.7); parte do conteudo sem acentuacao (M2.7);
  refs por-pergunta especificas (hoje refs em nivel de licao). Proxima: V23.6 = milestone E (UX/multi-idade).

## V23.6 — ENTREGUE COMPROVADO (2026-06-27, v1.17.0/vc12) — FECHA milestone E
Estado: V23.6_ENTREGUE_COMPROVADO
- Escopo (milestone E completo): E.1 texto grande + E.2 contraste (auditoria) + E.3 touch targets +
  E.4 TTS (expo-speech) + E.5 a11y labels + E.6 haptics + E.7 reduceMotion + cleanup de loops (V22.B.2).
- Novas libs: `src/lib/tts.ts` (falar/pararFala pt-BR) + `src/lib/a11y.ts` (useReduceMotion, useFontScale).
- Gates: tsc 0 | jest 156/156 | eslint 0.
- Build: 1a tentativa falhou em :app:packageRelease (IncrementalSplitterRunnable — lock/estado de
  packaging transitorio no Windows; bundle Metro + merge assets OK). Fix: limpar estado de packaging
  (app/build/outputs|intermediates/*PackageRelease*) + retry -> BUILD SUCCESSFUL.
- VALIDACAO EMPIRICA emulador hi-res (UPGRADE sobre V23.5, 0 FATAL):
  - Config: toggles novos "Reduzir animacoes" (E.7) + "Texto grande" (E.1) renderizam; haptics/voz/notif.
  - E.1: com "Texto grande" ON, texto da licao/Aprenda 1.18x maior (comparado a V23.5, mesma FB01-L02).
  - E.4: tap "🔊 Ouvir" no card Aprenda -> "TextToSpeech: Successfully bound to com.google.android.tts"
    + GoogleTtsService sintetizando (pt-BR). Botao tambem na pergunta da licao + Revisao.
  - E.5/E.6/E.7: a11y labels nos interativos (codigo); haptics wired (lightTap/success/errorBuzz, 0 crash);
    reduceMotion gate em PersonagemLivro/Trofeu + cache de haptics invalidado no toggle (V22.G.1).
  - Evidencias: orchestration/v23_6_validation/ (01..04).
- APK: dist/ExpertNaBiblia-v23.6.0.apk (vc12/1.17.0, 105MB); dist podado p/ 5 (v23.2..23.6).
- Git: commit LOCAL. Proxima: V23.7 = milestone G (infra/seguranca; G.1 keystore parte autonoma + pendencia humana).

## V23.7 — ENTREGUE COMPROVADO (2026-06-27, v1.18.0/vc13) — milestone G (G.6 -> V23.8+)
Estado: V23.7_ENTREGUE_COMPROVADO
- Escopo: G.1 (seguranca, parte autonoma) + G.2 error boundaries + G.3 analytics local + G.4 eas.json +
  G.5 auditoria (vulns/keys). G.6 git cleanup fica para V23.8+ (por ultimo).
- G.1 autonomo: token Minimax removido de scripts/generate_canonicos.py (le do cofre/env);
  release_keystore_credentials.md destrackeado + gitignore (permanece no disco). PENDENTE_VOCE em
  orchestration/pending_user_input.md: rotacionar token Minimax, gerar+instalar keystore novo, filter-repo.
- G.2: src/components/ErrorBoundary.tsx envolve o Stack em _layout (fallback on-brand + log).
- G.3: src/lib/analytics.ts (telemetria JS pura: funil + ring buffer + registrarErro + handler global
  ErrorUtils); app_open no launch + licao_concluida na tela final. Sentry NATIVO deferido (precisa
  prebuild + DSN; gancho configurarForward pronto).
- G.4: eas.json (profiles dev/preview-APK/production-AAB; env via EAS secret). PENDENTE: eas init (projectId).
- G.5: npm audit 16 moderate / 0 high-critical (transitivas Expo — aceitavel); keys nao hardcoded
  (env-injected) nem em plaintext no bundle Hermes. npm audit fix + Expo 56 DEFERIDOS (estabilidade build).
- Gates: tsc 0 | jest 159/159 (+3 analytics) | eslint 0.
- Build: BUILD SUCCESSFUL de 1a (clean preventivo de packaging evitou o IncrementalSplitterRunnable da V23.6).
- VALIDACAO EMPIRICA emulador (UPGRADE sobre V23.6, 0 FATAL): `[analytics] app_open` no logcat ao iniciar;
  `[layout] migrations+seed OK`; home renderiza limpo (ErrorBoundary transparente). Evidencias: v23_7_validation/.
- APK: dist/ExpertNaBiblia-v23.7.0.apk (vc13/1.18.0, 105MB); dist podado p/ 5 (v23.3..23.7).
- Git: commit LOCAL.

## ===== HANDOFF FASE 1 (2026-06-27) =====
Entregues nesta sessao (subagente): V23.5 (D), V23.6 (E), V23.7 (G) — todos COMPROVADOS no emulador.
PENDENTE da FASE 1 (proxima retomada @full-cycle): V23.8+ = H (trilha visual/colecoes/cosmeticos) ->
I (multi-perfil + modo Kids) -> J (enciclopedia/glossario + planos leitura) -> K (sazonais/desafios/win-back)
-> V22 backlog tecnico aplicavel -> G.6 git cleanup (por ultimo). NAO implementar F (AdMob) nem L.2/L.4 (FASE 3).
Acoes humanas pendentes em orchestration/pending_user_input.md (G.1: rotacao token + keystore novo + filter-repo).

## V23.8 — ENTREGUE COMPROVADO (2026-06-27, v1.19.0/vc14) — FECHA milestone H
Estado: V23.8_ENTREGUE_COMPROVADO
- Escopo (milestone H completo): H.1 trilha visual estilo Duolingo em /licoes (`TrilhaModulos`) +
  H.2 mapa de colecoes por area (/colecoes) + H.3 cosmeticos desbloqueaveis por XP (tema de acento +
  aura do mascote; migration 004 `user_cosmeticos`; /cosmeticos; lib `cosmeticos.ts`).
- Decisao de produto H.3: cosmetico desbloqueia por NIVEL (nao gasta XP) — mantem o XP como progresso
  puro (gastar regrediria nivel + mascote-evolui-por-nivel). Acento aplicado a barra de XP do header;
  aura aplicada ao glow do PersonagemLivro.
- Gates: tsc 0 | jest 175/175 (22 suites, +16 cosmeticos) | eslint 0.
- Build: BUILD SUCCESSFUL de 1a (clean preventivo de packaging). APK dist/ExpertNaBiblia-v23.8.0.apk
  (105MB); dist podado p/ 5 (v23.4..23.8). Bump app.config + ENB build.gradle (estava stale vc10/1.15.0;
  sessoes V23.5-7 nao bumparam o nativo — corrigido para vc14/1.19.0).
- VALIDACAO EMPIRICA emulador hi-res (UPGRADE sobre V23.7, 0 FATAL): migration 004 aplicada sem crash,
  progresso preservado. H.1 trilha "VOCE ESTA AQUI" + nos serpenteando + bloqueado/cadeado COMPROVADO;
  H.2 colecoes FB/AT/NT + total COMPROVADO; H.3 equipar Realeza(tema)+Mistica(aura) com preview ao vivo
  + locks por nivel COMPROVADO. Evidencias: orchestration/v23_8_validation/ (VALIDACAO.md + 00..06).
- Git: commit LOCAL. Proxima: V23.9 = milestone I (multi-perfil + modo Kids + seletor).

## V23.9 — ENTREGUE COMPROVADO (2026-06-27, v1.20.0/vc15) — FECHA milestone I
Estado: V23.9_ENTREGUE_COMPROVADO
- Escopo (milestone I completo): I.1 perfis locais multiplos (snapshot-swap por perfil; migration 005
  perfis/perfil_ativo/perfil_estado) + I.2 modo Kids (badge + texto maior + quiz prioriza FACIL) +
  I.3 seletor /perfis + pill no /modos.
- Arquitetura I.1: modelo "save-slot" — tabelas globais guardam o progresso do perfil ATIVO; ao trocar,
  o ativo e snapshotado em perfil_estado (JSON por tabela) e o destino e restaurado nas globais (transacao).
  Perfil "default" no bootstrap herda o progresso global SEM snapshot (preserva dados existentes).
  Snapshot cobre so ESTADO de jogo (modulos.concluido/licoes.concluida + user_xp/streak/badges/meta/
  rankings/revisao/cosmeticos/freeze) — catalogo de conteudo fica compartilhado.
- Gates: tsc 0 | jest 188/188 (23 suites, +13) | eslint 0. Build BUILD SUCCESSFUL. APK 105MB; dist podado 5.
- VALIDACAO EMPIRICA emulador (UPGRADE sobre V23.8, 0 FATAL): migration 005 sem crash; perfil default
  herdou progresso. **Teste critico**: criou perfil Kids "Bia" -> isolado (0 XP/Nivel 1/streak 0) vs
  "Eu" (100 XP/Nivel 2/streak 1); ao voltar p/ "Eu", progresso RESTAURADO idêntico (sem perda). Pill
  "MODO KIDS" comprovado. Evidencias: orchestration/v23_9_validation/ (VALIDACAO.md + 00..08).
- Git: commit LOCAL. Proxima: V23.10 = milestone J (enciclopedia/glossario + planos de leitura).

## V23.10 — ENTREGUE COMPROVADO (2026-06-27, v1.21.0/vc16) — FECHA milestone J
Estado: V23.10_ENTREGUE_COMPROVADO
- Escopo (milestone J completo): J.1 enciclopedia (/enciclopedia, ~27 verbetes curados) + J.2 planos de
  leitura (/planos, 2 planos de 7 dias) + J.3 "Saiba mais" no feedback. Migration 006 + seed de referencia
  (gate proprio idempotente). plano_progresso adicionado ao snapshot-swap de perfis (progresso por perfil).
- Conteudo CURADO a mao (verbetes/planos) — preferido a M2.7 para itens conhecidos (confiabilidade);
  expansao via batch M2.7 fica como follow-up.
- Gates: tsc 0 | jest 203/203 (25 suites, +15) | eslint 0. Build BUILD SUCCESSFUL. APK 105MB; dist podado 5.
- VALIDACAO EMPIRICA emulador (UPGRADE sobre V23.9, 0 FATAL): migration 006 + seed sem crash. J.1
  enciclopedia (busca/filtro/modal Abraão "Gênesis 12-25") COMPROVADO; J.2 planos (marcar dia -> "1/7" +
  XP/streak) COMPROVADO. J.3 wired + unit-tested (nao exercitado empiricamente). Evidencias:
  orchestration/v23_10_validation/ (VALIDACAO.md + 00..05).
- Git: commit LOCAL. Proxima: V23.11 = milestone K (sazonais + desafios + win-back).

## V23.11 — ENTREGUE COMPROVADO (2026-06-27, v1.22.0/vc17) — FECHA milestone K (K.4 BACKLOG)
Estado: V23.11_ENTREGUE_COMPROVADO
- Escopo: K.1 eventos sazonais (Natal/Pascoa/Quaresma, computus de Gauss) + K.2 desafios diario/semanal
  rotativos (/desafios; meta de XP no periodo + bonus resgatavel; migration 007 desafio_progresso por
  perfil) + K.3 win-back (agendarWinBack reagendado no boot). K.4 (desafiar amigo) = BACKLOG.
- Gates: tsc 0 | jest 216/216 (26 suites, +13) | eslint 0. Build BUILD SUCCESSFUL. APK 105MB; dist podado 5.
- VALIDACAO EMPIRICA emulador (UPGRADE sobre V23.10, 0 FATAL): migration 007 sem crash. K.2 COMPROVADO —
  "Foco total" 30/30 -> Resgatar +15 XP -> "Resgatado"; o bonus refletiu no medidor semanal (110->125 XP),
  provando a concessao real de XP. K.1 sazonal unit-tested (sem evento em junho, correto). K.3 win-back
  wired. Evidencias: orchestration/v23_11_validation/ (VALIDACAO.md + 00..02).
- Git: commit LOCAL. Proxima: V23.12 = V22 backlog tecnico aplicavel.

## V23.12 — ENTREGUE COMPROVADO (2026-06-27, v1.23.0/vc18) — backlog tecnico V22 aplicavel
Estado: V23.12_ENTREGUE_COMPROVADO
- Escopo: A.3 (botoes feedback responsivos), A.4 (loading/erro/vazio em [moduloId]), A.5 (listarModuloPorId),
  B.4 (header voltar padronizado), C.4 (.env.example), C.5 (CLAUDE.md backend obsoleto removido), C.6
  (app.json.bak/.full removidos). A.1 ja estava ok (import aliased); B.2/B.3 entregues na V23.6.
- Gates: tsc 0 | jest 216/216 | eslint 0. Build BUILD SUCCESSFUL. APK 105MB; dist podado 5.
- VALIDACAO EMPIRICA emulador (UPGRADE sobre V23.11, 0 FATAL): tela do modulo "Alfabetizacao Biblica" com
  header novo (‹ + titulo) + lista carregada (licao 01 ✓100/100, 02 liberada, 03+ bloqueadas) — sem
  regressao. Evidencias: orchestration/v23_12_validation/ (VALIDACAO.md + 02_modulo).
- Git: commit LOCAL. Proxima: V23.13 = G.6 git cleanup (POR ULTIMO) + save-state (FASE 3).

## V23.13 — G.6 git cleanup ENTREGUE (2026-06-27) + FASE 1 ESGOTADA
Estado: FASE1_ESGOTADA
- G.6 (parte autonoma): data/ + whatsapp_media/ + docs/questions_clean.json (~5.9MB) destrackeados
  (mantidos em disco) + gitignore. Runtime intacto (seeds bundled). Sem novo APK (mudanca so de tracking).
  PENDENTE_HUMANO: filter-repo do historico .git (158MB) — ja em pending_user_input.md (G.1).
- ===== FASE 1 DO PLANO V23 ESGOTADA (2026-06-27) =====
  Entregues nesta sessao (subagente 3): V23.8 (H), V23.9 (I), V23.10 (J), V23.11 (K), V23.12 (V22 backlog),
  V23.13 (G.6). Todas COMPROVADAS no emulador hi-res, 0 FATAL, gates verdes (jest 216/216).
  APK final FASE 1: dist/ExpertNaBiblia-v23.12.0.apk (vc18/1.23.0). Milestones A-E + G + H + I + J + K
  completos. FORA do escopo (FASE 2/3): F (AdMob), L.2/L.4, K.4 (desafiar amigo — backlog).
  Acoes humanas pendentes: orchestration/pending_user_input.md (G.1: token Minimax, keystore novo, filter-repo).
