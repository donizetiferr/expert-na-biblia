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

## V20 — EM ANDAMENTO (2026-06-25)
Estado: IMPLEMENTANDO_V20
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
