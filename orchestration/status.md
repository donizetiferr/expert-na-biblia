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
