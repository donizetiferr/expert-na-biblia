# Version Plan — Expert Na Biblia (2026-06-23)

> Gerado por solo-roadmap (modo COMPLETE) invocado por @full-cycle.
> Roadmap detalhado em `orchestration/roadmap_output.md` (48 itens, 6 versoes).
> Origem: evolution_plan.md FASE 0 (14 itens) → FASE 3 (9 itens), 10 decisoes arquit. travadas em CLAUDE.md.

## Sumario

- **Versao alvo**: v1.0.0 (publicacao Google Play)
- **Total de versoes**: 6 (V1-V6)
- **Total de itens**: 48
- **Modo**: COMPLETE
- **Outer loop**: ATIVO (default — quantos ciclos forem necessarios ate atingir objetivo)
- **Hard cap**: 8 iters (default)

## V1 — FASE 0 setup tecnico parte 1 (7 itens)

**Tema**: bootstrap tecnico completo do projeto Expo + TypeScript strict.

Itens:
1. Setup repositorio local + GitHub `donizetiferr/expert-na-biblia`
2. Criar conta Expo (free) + configurar EAS Build
3. Setup Expo SDK 54+ + TypeScript strict + ESLint + Prettier + New Architecture
4. Pesquisar e baixar 5 sons royalty-free (splash/acerto/erro/transicao/musica_fundo)
5. CHANGELOG.md inicial
6. Confirmar fontes Bangers + Nunito + prototipo Tela Inicial
7. Declarar aesthetic_direction + reference_visual no CLAUDE.md

DoD V1:
- `gh repo create` executado com sucesso
- `eas login` + `eas init` + `eas.json` commitados
- `npx create-expo-app` completo; `tsc --noEmit` + `eslint .` + `prettier --check .` sem erros
- 5 arquivos mp3 em `assets/audio/`
- `CHANGELOG.md` com entrada inicial
- CLAUDE.md atualizado com aesthetic_direction + reference_visual

## V2 — FASE 0 setup tecnico parte 2 (7 itens)

**Tema**: infraestrutura de persistencia, testes, CI, scripts placeholder.

Itens:
8. Setup SQLite local (expo-sqlite) + migrations/001_initial.sql
9. Setup de testes E2E (Playwright + emulador Android)
10. GitHub Actions CI basico (lint + type-check + build smoke)
11. Setup testes unitarios Jest (jest.config.ts)
12. Setup Expo Router + estrutura de pastas (src/{app,components,lib,db,assets,types})
13. Scripts generate_canonical.ts + generate_questions.ts stubs
14. Plano de branches git (main + dev + feature/*) + conventional commits

DoD V2:
- Migrations rodam; queries <5ms
- `npm run test:e2e` smoke E2E passa em emulador Android
- CI workflow roda em PR de teste; todos steps passam
- `npm run test:unit` smoke Jest passa
- Estrutura de pastas segue convencao
- Scripts tem filtros think implementados (com mock)

## V3 — FASE 0 geracao conteudo (4 itens — BLOQUEADO em P0-11)

**Tema**: gerar respostas canonicas + perguntas dos modulos via M3 + validacao teologica humana.

Itens:
15. Pre-gerar respostas canonicas para 4.345 perguntas via M3 (~$0 Token Plan; ~4h)
16. Gerar perguntas 13 modulos NT faltantes (NT05-NT17) via M3 (~3.000)
17. Gerar perguntas 24 modulos Teologia via M3 (~3.500)
18. Validacao teologica do conteudo gerado (PAUSAR — DEPENDE_VOCE)

DoD V3:
- data/canonical_responses.json com 4.345 entradas
- data/planilhas/5_a_NT_completo.xlsx com ~3.000 perguntas
- data/planilhas/6_a_Teologia.xlsx com ~3.500 perguntas
- **ITEM-18 BLOQUEADO** ate usuario revisar 100 amostras teologicas; segue nas versoes autonomas; relatorio final consolida pendencia.

## V4 — FASE 1 MVP UI completa (9 itens)

**Tema**: 13 telas do fluxo Licoes (splash → trofeu) com 1 modulo real (FB01).

Itens:
19. Tela 1: Splash screen (3s, animacao + som)
20. Tela 2: Selecao de modo (Quiz Biblico / Licoes) + botao config
21. Tela Licoes 1: Lista de 77 modulos com cadeado sequencial
22. Tela Licoes 2: Lista de licoes dentro do modulo
23. Tela Licao: Pergunta (quadro branco + input + personagem)
24. Tela Feedback (acerto/erro)
25. Tela Final da Atividade (3 variantes <50%/>50%/100%)
26. Tela Final de Vitoria: Trofeu Expert
27. Botao de configuracao (≡) com toggle som/musica

DoD V4:
- 13 telas renderizam; navegacao funcional
- Validacao visual via Playwright + screenshots em docs/screenshots/v1/
- Modo Licoes end-to-end funciona com FB01
- Som toca em splash; toggles persistem entre sessoes

## V5 — FASE 1 logica + FASE 2 conteudo + quiz (12 itens)

**Tema**: matching canonico + integracao M3 + fallback + 77 modulos completos + modo Quiz.

Itens:
28. Algoritmo de matching canonico (TF-IDF + sinonimos)
29. Integracao M3 com filtro think tags + cache (expo-secure-store para keys)
30. Fallback OpenAI GPT-4o-mini
31. Streak de dias consecutivos (gamificacao)
32. Smoke test E2E completo (Playwright em emulador)
33. Validacao visual final (Playwright + 13 screenshots)
34. Importar 77 modulos + ~10.850 perguntas para SQLite
35. Modo Quiz Biblico: Telas 3-5 (selecao aleatorio vs custom)
36. Tela Quiz: Pergunta + timer 10s + respostas multiplas
37. Tela Quiz: Feedback rapido (acerto/erro/tempo esgotado)
38. Tela Quiz: Placar final (3 variantes)
39. Testes de unidade para logica matching (Jest, cobertura >90%)

DoD V5:
- Matching local funciona em 100 perguntas-teste (<5% falso negativo, <2% falso positivo)
- M3 + fallback funcionam; cache funciona
- 77 modulos importados no SQLite; queries <10ms
- Modo Quiz completo end-to-end funcional
- Cobertura testes Jest >90% em src/lib/matching.ts
- 13 screenshots validados vs mockups

## V6 — FASE 2 polish + FASE 3 publicacao (9 itens)

**Tema**: cache canonico, gerador alternativas, monitoria, push, build release, onboarding, AdMob, publicacao.

Itens:
40. Cache canonico organico (salvar respostas M3 com score>=0.85)
41. Gerador de alternativas plausiveis para Quiz (10.850 × 4 = 43.400 alternativas)
42. Notificacoes push diarias (Lembrete de estudo)
43. Monitoria de quota M3 + alerta
44. Build release APK via EAS Build + assinatura propria (v1.0.0)
45. Onboarding primeira vez + Privacy Policy LGPD (DESTRAVAVEL — usuario escolhe host)
46. Integracao AdMob balanceada (banner + interstitial + GDPR consent)
47. TestFlight + App Store (iOS) — OPCIONAL (PAUSAR — DEPENDE_VOCE)
48. Google Play Console setup + submissao + Sentry + Deep link + Criptografia SQLite

DoD V6:
- APK assinado v1.0.0 instalavel em device real
- AdMob em telas NAO-criticas; nunca em splash/Final/Feedback
- Privacy Policy acessivel (GitHub Pages ou dominio proprio)
- Monitoria registra; alerta Telegram >80% quota
- **ITEM-47 BLOQUEADO** ate conta Apple Developer criada (OPCIONAL)
- **ITEM-48 BLOQUEADO PARCIALMENTE** ate conta Google Play Developer criada ($25)

## Dependencias entre versoes

```
V1 (setup basico)
 └── V2 (infra: SQLite, testes, CI)
      └── V3 (geracao conteudo — paralelo a V4)
           └── V4 (UI 13 telas — depende V1+V2; pode comecar antes de V3 terminar)
                └── V5 (logica + 77 modulos + quiz — depende V3+V4)
                     └── V6 (publicacao — depende V5; parcialmente bloqueado por deps usuario)
```

## Dependencias de usuario (persistir em pending_user_input.md)

- **ITEM-18** (V3, P0-11): Revisar 100 amostras teologicas — BLOQUEIA V6 publicacao
- **ITEM-45** (V6, P3-4): Escolher GitHub Pages vs dominio proprio
- **ITEM-47** (V6, P3-5): Criar Apple Developer account (OPCIONAL)
- **ITEM-48** (V6, P3-6): Criar Google Play Developer account ($25)

Regra AUTONOMIA MAXIMA: persistir pedidos em `orchestration/pending_user_input.md` e seguir nas versoes autonomas.