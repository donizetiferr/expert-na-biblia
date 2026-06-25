# Version Plan — Expert Na Biblia — V18 (2026-06-25)

> FASE 1 satisfeita pelo PLANO V18 aprovado em evolution_plan.md (milestones MA-MF).
> Outer loop: ATIVO. Objetivo de parada (BREAK_SUCESSO): MF concluido (app fiel ao briefing + validacao empirica em emulador hi-res sem FATAL/spinner + modulo completavel + trofeu alcancavel).

## V18.1 — Foundation (build-ability + logica core) — CRITICA
Itens: ME.1 (instalar expo-haptics, expo-speech, expo-linear-gradient, @react-native-community/slider) [cobre MC.1] | ME.2 (5 erros tsc) | MA.1 (IDs reais em carregarPerguntas + listarPerguntasAleatorias + teste regressao IDs reais) | MA.2 (useLocalSearchParams modo/modulos) | MA.3 (guard anti-spinner empty/error) | MA.4 (persistir em useEffect quiz/final) | MA.5 (marcarModuloConcluido + desbloqueio + trofeu)
DoD: tsc 0 erros; npm ci limpo builda; Quiz carrega 20 perguntas reais (sem spinner); Personalizado filtra modulos; concluir todas licoes do modulo 1 marca modulo concluido + desbloqueia modulo 2 + trofeu alcancavel; teste de regressao verde com IDs reais.

## V18.2 — Assets transparentes — CRITICA
Itens: MB.1 (obter PNGs transparentes do Drive via Playwright; fallback media-generation provisorio) | MB.2 (logo.png real) | MB.3 (PersonagemLivro sem moldura) | MB.4 (remover moldura dupla tela pergunta) | MB.5 (trofeu PNG)
DoD: assets PNG com alfa real; personagem/logo/trofeu sem caixa/fundo.

## V18.3 — Gradientes + fidelidade tela-a-tela — ALTA
Itens: MC.2 (GradienteRoxo/GradienteLaranja + ~12 superficies) | MD.1 (regra amarelo concluido) | MD.2 (cards roxo+borda laranja) | MD.3 (alternativa selecionada amarela borda preta) | MD.4 (titulos resultado + Expert degrade roxo borda preta) | MD.5 (quiz/final PersonagemLivro) | MD.6 (quadro branco borda preta) | MD.7 (icones desenhados — dep MB.1) | MD.8 (header quiz home) | MD.9 (arte on-palette/confetes) | MD.10 (splash logo + contraste) | MD.11 (copy 77->40)
DoD: degrades onde briefing pede; regra amarelo implementada; telas batem com mocks.

## V18.4 — Saude / regressoes — MEDIA
Itens: ME.3 (suites jest + matching-coverage) | ME.4 (lint cleanup) | ME.5 (backfill 4 perguntas sem alternativas)
DoD: jest verde; 0 warnings relevantes; toda pergunta tem alternativas.

## V18.5 — Validacao empirica mock-a-mock + entrega (MF) — CRITICA
Itens: MF.1 (AVD hi-res ~1080x1920; screenshot das 14 telas vs mock, score>=4, iterar <4) | MF.2 (E2E: Quiz aleatorio 20q->placar sem spinner; Quiz personalizado; COMPLETAR modulo 1 inteiro->licao amarela->modulo 2 desbloqueia->trofeu; adb logcat sem FATAL) | MF.3 (ux-polish; APK release C:\ENB; catbox; dist regra das 5; changelog+CLAUDE.md)
DoD: 14 telas score>=4; jornada E2E completa comprovada com screenshots; APK V18 publicado; docs atualizadas.

## Dependencias
MB.1 -> MB.3/MB.4/MB.5/MD.7/MD.10. MC.1(em V18.1) -> MC.2/degrades MD. MA(V18.1) -> MF.2. MF por ultimo (MF.1 incremental apos telas tocadas).

## Dep de usuario (persistir em pending_user_input.md se bloquear)
- MB.1 PNGs transparentes do Drive (tentativa autonoma 1o; so vira pendencia se Drive bloquear ate no Chrome logado).
