# Roadmap Draft — Expert Na Biblia (2026-06-23)

## Resumo

Projeto pessoal NOVO com 48 milestones FASE 0-3 a executar. Modo COMPLETE gera 6 versoes executaveis, balanceadas por tema (setup tecnico → bootstrap conteudo → MVP 1 modulo → quiz → publicacao → polish). Cada versao corresponde a uma rodada solo-evolve + solo-qa.

- Modo: COMPLETE
- Total de itens: 48 (P0: 14, P1: 15, P2: 10, P3: 9)
- Versoes geradas: 6
- Cobertura de objetivos (CLAUDE.md): 100% (apontamentos #1, #2, #4-15)
- Cobertura de apontamentos user_input.md (24): 24/24
- Refactor sweep: N/A (projeto NOVO, sem codigo)
- Diagnostic: N/A (projeto NOVO, sem codigo; sub-fase 2.0 pulada)

## Visao Geral por Versao

| Versao | Tema | Itens | Marcos |
|--------|------|-------|--------|
| V1 | FASE 0 setup tecnico (parte 1) | 7 | repo + Expo account + Expo SDK 54+ + TS strict + ESLint + Prettier + sounds + CHANGELOG inicial |
| V2 | FASE 0 setup tecnico (parte 2) | 7 | SQLite + migrations + prototipo fontes + aesthetic_direction + E2E setup + CI + scripts placeholder |
| V3 | FASE 0 geracao conteudo | 4 | respostas canonicas M3 + perguntas NT/Teologia + validacao teologica (P0-11 BLOQUEIA ate usuario revisar) |
| V4 | FASE 1 MVP 1 modulo (UI completa) | 9 | 13 telas (splash → trofeu) + navegacao + som + persistencia |
| V5 | FASE 1 MVP 1 modulo (logica) + FASE 2 conteudo + quiz | 12 | matching canonico + M3 + fallback + streak + import 77 modulos + quiz telas + testes + visual QA |
| V6 | FASE 2 polish + FASE 3 publicacao | 9 | gerador alternativas + monitoria + push + build release + onboarding + AdMob + privacy + iOS + store submission |

## Catalogo de Itens (48)

### V1 — FASE 0 setup tecnico parte 1 (7 itens)

- **ITEM-01: Setup repositorio local + GitHub**
  - Fonte: USER_INPUT (P0-1) | Prioridade: ALTA | Complexidade: BAIXA
  - gh repo create donizetiferr/expert-na-biblia --private --source=. --remote=origin --push; .gitignore com node_modules/, *.apk, *.aab, .expo/, dist/, ios/Pods/

- **ITEM-02: Criar conta Expo (free) + configurar EAS Build**
  - Fonte: USER_INPUT (P0-2) | Prioridade: ALTA | Complexidade: BAIXA
  - npm install -g eas-cli; eas login; eas init; eas.json com development/preview/production

- **ITEM-03: Setup Expo SDK 54+ + TypeScript strict + ESLint + Prettier**
  - Fonte: USER_INPUT (P0-3) | Prioridade: ALTA | Complexidade: MEDIA
  - npx create-expo-app@latest --template blank-typescript; tsconfig strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes; ESLint + Prettier; New Architecture habilitada; Hermes engine
  - Pesquisa externa A1: SDK 51 outdated em 2026; usar SDK 54+

- **ITEM-04: Pesquisar e baixar 5 sons royalty-free**
  - Fonte: USER_INPUT (P0-7) | Prioridade: MEDIA | Complexidade: MEDIA
  - Pixabay/Freesound: splash (~3s), acerto (~1s), erro (~1s), transicao (~0.5s), musica fundo (~3min loop)
  - assets/audio/{splash,acerto,erro,transicao,musica_fundo}.mp3 (todos <500KB)

- **ITEM-05: CHANGELOG.md inicial**
  - Fonte: USER_INPUT (P0-14) | Prioridade: BAIXA | Complexidade: BAIXA
  - Formato ## [Unreleased] com Added/Changed/Fixed/Removed; entrada inicial sobre docs + double checks

- **ITEM-06: Confirmar fontes Bangers (display) + Nunito (body) + prototipo Tela Inicial**
  - Fonte: USER_INPUT (P0-8) | Prioridade: MEDIA | Complexidade: BAIXA
  - @expo-google-fonts/bangers + @expo-google-fonts/nunito; prototipo splash+logo; validar legibilidade 360px

- **ITEM-07: Declarar aesthetic_direction + reference_visual no CLAUDE.md**
  - Fonte: USER_INPUT (P0-10) | Prioridade: MEDIA | Complexidade: BAIXA
  - editorial/magazine (comic book moderno); reference_visual: duolingo (gamificacao) + brilliant.org (UI limpa)

### V2 — FASE 0 setup tecnico parte 2 (7 itens)

- **ITEM-08: Setup SQLite local (expo-sqlite) + migrations**
  - Fonte: USER_INPUT (P0-9) | Prioridade: ALTA | Complexidade: MEDIA
  - npx expo install expo-sqlite; schema modulos/licoes/perguntas; migrations/001_initial.sql; indices; queries <5ms
  - Pesquisa externa A3: expo-sqlite + migrations manuais (sem Drizzle)

- **ITEM-09: Setup de testes E2E (Playwright + emulador Android)**
  - Fonte: USER_INPUT (P0-12) | Prioridade: ALTA | Complexidade: MEDIA
  - Android Studio + SDK API 34 + emulator; npx playwright install android; smoke E2E splash → Tela 2 → fechar
  - Pesquisa externa A6

- **ITEM-10: GitHub Actions CI basico (lint + type-check + build smoke)**
  - Fonte: USER_INPUT (P0-13) | Prioridade: ALTA | Complexidade: MEDIA
  - .github/workflows/ci.yml em push main + PRs; install → tsc → eslint → prettier → eas build --profile=preview (non-blocking)

- **ITEM-11: Setup testes unitarios Jest**
  - Fonte: USER_INPUT (apontamento #10) | Prioridade: ALTA | Complexidade: BAIXA
  - jest.config.ts; @testing-library/react-native; primeiro teste smoke (1+1=2)

- **ITEM-12: Setup Expo Router + estrutura de pastas (src/app, src/components, src/lib, src/db)**
  - Fonte: ANALISE_INTERNA | Prioridade: ALTA | Complexidade: MEDIA
  - Expo Router file-based; estrutura recomendada: src/{app,components,lib,db,assets,types}

- **ITEM-13: Script generate_canonical.ts + generate_questions.ts stubs**
  - Fonte: USER_INPUT (P0-4, P0-5, P0-6) | Prioridade: ALTA | Complexidade: BAIXA
  - Criar scripts/ com placeholders + filtro think tags; mock do M3 endpoint para teste local

- **ITEM-14: Plano de branches git (main + dev + feature/*)**
  - Fonte: USER_INPUT (apontamento #8) | Prioridade: BAIXA | Complexidade: BAIXA
  - Branch protection rules; conventional commits

### V3 — FASE 0 geracao conteudo (4 itens — BLOQUEADO em P0-11)

- **ITEM-15: Pre-gerar respostas canonicas para 4.345 perguntas via M3**
  - Fonte: USER_INPUT (P0-4) | Prioridade: ALTA | Complexidade: MUITO_ALTA
  - scripts/generate_canonical.ts; modelo MiniMax-M2.7; filtro think tags; data/canonical_responses.json (~5MB)

- **ITEM-16: Gerar perguntas 13 modulos NT faltantes (NT05-NT17) via M3**
  - Fonte: USER_INPUT (P0-5) | Prioridade: ALTA | Complexidade: MUITO_ALTA
  - ~3.000 perguntas batch M3; data/planilhas/5_a_NT_completo.xlsx

- **ITEM-17: Gerar perguntas 24 modulos Teologia via M3**
  - Fonte: USER_INPUT (P0-6) | Prioridade: ALTA | Complexidade: MUITO_ALTA
  - ~3.500 perguntas batch M3; data/planilhas/6_a_Teologia.xlsx

- **ITEM-18: Validacao teologica do conteudo gerado (PAUSAR — DEPENDE_VOCE)**
  - Fonte: USER_INPUT (P0-11) | Prioridade: ALTA | Complexidade: MEDIA
  - **BLOQUEIO IRREDUTIVEL**: DEPENDE_VOCE revisao humana de 100 amostras. Marcar como BLOQUEADA_POR_USUARIO ate input; seguir em outras versoes autonomas (regra global AUTONOMIA MAXIMA).
  - Acao ao retomar: selecao automatica via script, saida em docs/qa_conteudo_para_revisar.md, esperar revisao.

### V4 — FASE 1 MVP UI completa (9 itens)

- **ITEM-19: Tela 1: Splash screen com animacao do logo + som (3s)**
  - Fonte: USER_INPUT (P1-1) | Prioridade: ALTA | Complexidade: MEDIA
  - expo-splash-screen + expo-av; scale-up 0.8x→1.0x + fade-in ~600ms

- **ITEM-20: Tela 2: Selecao de modo (Quiz Biblico / Licoes)**
  - Fonte: USER_INPUT (P1-2) | Prioridade: ALTA | Complexidade: MEDIA
  - 2 cards grandes; botao hamburguer → modal Configuracoes (som on/off)

- **ITEM-21: Tela Licoes 1: Lista de 77 modulos com cadeado sequencial**
  - Fonte: USER_INPUT (P1-3) | Prioridade: ALTA | Complexidade: MEDIA
  - FlatList renderItem customizado; modulo 1 sem cadeado, demais bloqueados

- **ITEM-22: Tela Licoes 2: Lista de licoes dentro do modulo (cadeado sequencial)**
  - Fonte: USER_INPUT (P1-4) | Prioridade: ALTA | Complexidade: MEDIA
  - Query WHERE modulo_id; progresso amarelo se concluida=true

- **ITEM-23: Tela Licao: Pergunta (quadro branco + campo de resposta + personagem)**
  - Fonte: USER_INPUT (P1-5) | Prioridade: ALTA | Complexidade: ALTA
  - Layout: indicator topo, personagem livro, quadro branco, TextInput roxo com borda laranja prefixo "R:"

- **ITEM-24: Tela Feedback (acerto/erro)**
  - Fonte: USER_INPUT (P1-6) | Prioridade: ALTA | Complexidade: MEDIA
  - Variantes certo/errado; 2 botoes (voltar/prosseguir)

- **ITEM-25: Tela Final da Atividade (3 variantes <50%/>50%/100%)**
  - Fonte: USER_INPUT (P1-7) | Prioridade: ALTA | Complexidade: MEDIA
  - Regra estrita: 100% necessario para liberar proxima licao

- **ITEM-26: Tela Final de Vitoria: Trofeu Expert**
  - Fonte: USER_INPUT (P1-8) | Prioridade: MEDIA | Complexidade: BAIXA
  - Trofeu dourado + confetes; botao RECOMECAR

- **ITEM-27: Botao de configuracao (≡) com toggle som/musica**
  - Fonte: USER_INPUT (P1-9) | Prioridade: BAIXA | Complexidade: BAIXA
  - Modal com 2 toggles; AsyncStorage @settings:musica, @settings:efeitos

### V5 — FASE 1 logica + FASE 2 conteudo + quiz (12 itens)

- **ITEM-28: Algoritmo de matching canonico (TF-IDF + sinonimos)**
  - Fonte: USER_INPUT (P1-10) | Prioridade: ALTA | Complexidade: ALTA
  - 2 camadas: match exato (Levenshtein >0.85) + semantico (TF-IDF cosine >0.75 com sinonimos)
  - scripts/calibrate_threshold.ts; testes Jest com 100 perguntas-teste

- **ITEM-29: Integracao M3 com filtro tags think (consolidado)**
  - Fonte: USER_INPUT (P1-11) | Prioridade: ALTA | Complexidade: ALTA
  - HTTPS direto app → https://api.minimax.io/v1/chat/completions; system prompt avaliador JSON; cache score>=0.85
  - **ATENCAO pesquisa A4**: API keys em expo-secure-store (NAO AsyncStorage)
  - Monitoria quota Token Plan

- **ITEM-30: Fallback OpenAI GPT-4o-mini (se M3 falhar)**
  - Fonte: USER_INPUT (P1-12) | Prioridade: ALTA | Complexidade: BAIXA
  - Mesmo formato JSON; gpt-4o-mini; acionado por 429/timeout/erro de rede

- **ITEM-31: Streak de dias consecutivos (gamificacao)**
  - Fonte: USER_INPUT (P1-13) | Prioridade: MEDIA | Complexidade: MEDIA
  - user_streak(dia, licoes_concluidas); icone chama "🔥 N dias seguidos!"; freeze semanal

- **ITEM-32: Smoke test E2E completo (Playwright em emulador)**
  - Fonte: USER_INPUT (P1-14) | Prioridade: ALTA | Complexidade: MEDIA
  - Fluxo splash → Tela 2 → Licoes → FB01 → Licao 1 → Pergunta → resposta → acerto → licao amarela

- **ITEM-33: Validacao visual final (Playwright + screenshots 13 telas)**
  - Fonte: USER_INPUT (P1-15) | Prioridade: ALTA | Complexidade: MEDIA
  - docs/screenshots/v1/ com 13 PNGs; comparar com mockups originais whatsapp_media/images/

- **ITEM-34: Importar 77 modulos + ~10.850 perguntas para SQLite**
  - Fonte: USER_INPUT (P2-1) | Prioridade: ALTA | Complexidade: ALTA
  - scripts/import_all.ts le planilhas 1-6; validar contagem por area, FKs, indices

- **ITEM-35: Modo Quiz Biblico: Telas 3-5 (selecao aleatorio vs custom)**
  - Fonte: USER_INPUT (P2-2) | Prioridade: ALTA | Complexidade: MEDIA
  - Tela 3 opcoes; Tela 4 scroll 77 modulos + checkboxes max 20; Tela 5 INICIAR + resumo

- **ITEM-36: Tela Quiz: Pergunta + timer 10s + respostas multiplas**
  - Fonte: USER_INPUT (P2-3) | Prioridade: ALTA | Complexidade: ALTA
  - 4 alternativas (1 certa + 3 distrators); timer regressivo; cache alternativas SQLite

- **ITEM-37: Tela Quiz: Feedback rapido (acerto/erro/tempo esgotado)**
  - Fonte: USER_INPUT (P2-4) | Prioridade: ALTA | Complexidade: MEDIA
  - 3 variantes; transicoes corretas

- **ITEM-38: Tela Quiz: Placar final (3 variantes)**
  - Fonte: USER_INPUT (P2-5) | Prioridade: ALTA | Complexidade: MEDIA
  - Variantes A/B/C; persistir user_rankings(data, modulos, score)

- **ITEM-39: Testes de unidade para logica matching (P1-10)**
  - Fonte: USER_INPUT (P2-10) | Prioridade: ALTA | Complexidade: MEDIA
  - Jest 50 casos; cobertura >90% em src/lib/matching.ts

### V6 — FASE 2 polish + FASE 3 publicacao (9 itens)

- **ITEM-40: Cache canonico organico (salvar respostas M3 com score>=0.85)**
  - Fonte: USER_INPUT (P2-6) | Prioridade: ALTA | Complexidade: MEDIA
  - respostas_canonicas_cache(pergunta_id, texto, score, criado_em); limpeza >90 dias

- **ITEM-41: Gerador de alternativas plausiveis para Quiz**
  - Fonte: USER_INPUT (P2-7) | Prioridade: ALTA | Complexidade: ALTA
  - Script batch M3: 3 distrators plausiveis por pergunta; 10.850 perguntas × 4 = 43.400 alternativas

- **ITEM-42: Notificacoes push diarias (Lembrete de estudo)**
  - Fonte: USER_INPUT (P2-8) | Prioridade: MEDIA | Complexidade: MEDIA
  - expo-notifications; 3 mensagens variantes; opt-in onboarding ou config

- **ITEM-43: Monitoria de quota M3 + alerta**
  - Fonte: USER_INPUT (P2-9) | Prioridade: ALTA | Complexidade: MEDIA
  - Dashboard simples % Token Plan; alerta Telegram se >80%; m3_usage(data, chamadas, tokens_estimados)

- **ITEM-44: Build release APK via EAS Build + assinatura propria**
  - Fonte: USER_INPUT (P3-1) | Prioridade: ALTA | Complexidade: MEDIA
  - eas build --platform android --profile production; keystore local; v1.0.0 semver

- **ITEM-45: Onboarding primeira vez + Privacy Policy (P3-2 + P3-4 juntos)**
  - Fonte: USER_INPUT (P3-2 + P3-4) | Prioridade: ALTA | Complexidade: MEDIA
  - react-native-onboarding-swiper 3 telas; privacy policy LGPD
  - **ATENCAO**: P3-4 eh DESTRAVAVEL — usuario escolhe GitHub Pages vs dominio proprio. PERSISTIR em pending_user_input.md; BLOQUEADA_POR_USUARIO ate escolha.

- **ITEM-46: Integracao AdMob balanceada (banner + interstitial)**
  - Fonte: USER_INPUT (P3-3) | Prioridade: ALTA | Complexidade: ALTA
  - expo-ads-admob; banner em Telas NAO-criticas; interstitial max 1/3 conclusoes; GDPR consent
  - **NUNCA** em: splash, Tela Final, Tela Feedback

- **ITEM-47: TestFlight + App Store (iOS) — OPCIONAL**
  - Fonte: USER_INPUT (P3-5) | Prioridade: MEDIA | Complexidade: ALTA
  - **PAUSAR**: DEPENDE_VOCE (conta Apple Developer $99/ano). Marcar BLOQUEADA_POR_USUARIO ate conta criada.

- **ITEM-48: Google Play Console setup + submissao + Sentry + Deep link + Criptografia SQLite**
  - Fonte: USER_INPUT (P3-6 + P3-7 + P3-8 + P3-9 consolidados) | Prioridade: ALTA | Complexidade: ALTA
  - **ATENCAO**: P3-6 eh DEPENDE_VOCE (Google Play Developer $25). PERSISTIR e BLOQUEAR ate input.
  - P3-7 (deep link), P3-8 (SQLCipher), P3-9 (Sentry) implementados autonomamente em paralelo.

## Backlog out-of-scope (NAO mapear)

Nenhum apontamento foi rejeitado. Todos os 24 estao cobertos via 48 itens do roadmap.

- FASE V2 (V2-1 a V2-5): EXPLICITAMENTE FORA DO ESCOPO pelo user_input #2 (NAO invadir V2).
- Backend Node.js dedicado: ja REJEITADO no evolution_plan.md (decisao #5).

## Notas

- Pesquisa externa A1-A6 integradas em 4 itens (ITEM-03, ITEM-08, ITEM-09, ITEM-29).
- 4 dependencias de usuario persistidas:
  - P0-11 (ITEM-18): revisao teologica 100 amostras — BLOQUEIA ate input
  - P3-4 (ITEM-45): GitHub Pages vs dominio proprio — BLOQUEIA ate input
  - P3-5 (ITEM-47): Apple Developer account — BLOQUEIA ate input (OPCIONAL)
  - P3-6 (ITEM-48 parte): Google Play Developer — BLOQUEIA ate input
- Regra AUTONOMIA MAXIMA: persistir em pending_user_input.md; seguir nas versoes autonomas; consolidar no fim.