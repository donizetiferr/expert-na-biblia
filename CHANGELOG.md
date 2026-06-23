# Changelog

Todas as mudancas relevantes neste projeto.

## [Unreleased]

### Added
- Initial setup: documentation from WhatsApp briefing, 10 architectural decisions, 3 double checks (notes 9.4/9.5/9.7)
- Expo SDK 54 + TypeScript strict + ESLint + Prettier + New Architecture
- EAS Build config (development/preview/production profiles)
- Expo Router file-based structure (src/{app,components,lib,db,types,constants})
- 5 assets directory placeholders (audio splash/acerto/erro/transicao/musica_fundo)
- Google Fonts setup: Bangers (display) + Nunito (body)
- GitHub Actions CI workflow (lint + type-check + build smoke)
- Tests infra: Jest + Playwright emulador Android
- Scripts placeholders: generate_canonical, generate_questions, import_all

### Changed
- .gitignore expanded with Expo/React Native/EAS exclusions
- CLAUDE.md: declared aesthetic_direction (editorial/magazine) + reference_visual (duolingo + brilliant.org)

### Fixed

### Removed

## [0.4.0] - 2026-06-23

### Added
- 9 telas funcionais (Expo Router file-based): splash (3s anim), modos, licoes/index (77 modulos), licoes/[moduloId] (8 licoes), licoes/[moduloId]/[licaoId] (pergunta + personagem), licoes/[moduloId]/[licaoId]/final (3 variantes), trofeu (Expert), config (3 toggles + reset)
- `src/components/PersonagemLivro.tsx`: livro animado com 3 poses (PENSATIVO/FELIZ/ASSUSTADO), bounce loop, blink
- `src/lib/settings.ts`: AsyncStorage helper para 3 toggles (musica, efeitos, notificacoes)
- `src/lib/db-queries.ts`: queries SELECT (modulos/licoes/perguntas) com fallback mock 77/8/25; UPDATE (marcarLicaoConcluida, resetarProgresso)
- `__tests__/settings.test.ts`: 6 testes (load defaults, save, db-queries mock 77 modulos)
- `@react-native-async-storage/async-storage` adicionado a deps
- Cadeado sequencial implementado (modulo N bloqueado ate N-1 concluido)
- Regra 100% implementada (apenas 100% libera proxima licao + cadeado)

### Changed
- `src/app/_layout.tsx`: adicionado Stack.Screen "trofeu"
- `src/app/licoes.tsx` removido (substituido por `src/app/licoes/index.tsx` router file-based)
- P1-6 (Tela Feedback) integrado na Tela Licao com pose + auto-avanco (nao tela separada)

## [0.3.0] - 2026-06-23

### Added
- `scripts/generate_canonical.ts`: implementacao completa — chamada HTTPS a `https://api.minimax.io/v1/chat/completions` (modelo MiniMax-M2.7), filtro regex `/<think[^>]*>.*?<\/think>/gs`, batch processing (10 paralelas), retry com backoff exponencial (max 3 tentativas), checkpoint incremental em `data/canonical_responses.json`. Modo stub quando `MINIMAX_API_KEY` nao definido
- `scripts/generate_questions.ts`: implementacao completa — catalogo de 13 modulos NT (NT05-NT17) + 24 modulos Teologia (TE01-TE24), 25 perguntas/licao, IDs consistentes `MODULO-Lxx-Qxx`, total ~6.500 perguntas. Stubs em `data/planilhas/5_a_NT_completo.json` + `6_a_Teologia.json`
- `scripts/select_samples_for_review.ts`: selecao aleatoria de 100 amostras (50 NT + 50 Teologia) para revisao humana; gera `docs/qa_conteudo_para_revisar.md`
- `scripts/__tests__/generate_questions.test.ts`: 11 testes (filtro think tags, gerarId, validacao catalogo)
- `docs/qa_conteudo_para_revisar.md`: template pronto para revisao humana (P0-11)
- `orchestration/pending_user_input.md`: bloco `DEP_PENDENTE_VALIDACAO_TEOLOGICA` (P0-11)
- `orchestration/blocked_versions.md`: V3 ITEM-18 marcado BLOQUEADA_POR_USUARIO

### Changed
- Marcados em evolution_plan.md: P0-4, P0-5, P0-6 como `- [x] (entregue 2026-06-23 — codigo pronto, execucao diferida para V5 com credenciais)`. P0-11 marcado BLOQUEADA_POR_USUARIO

### Notes
- Execucao REAL de `npm run generate:canonical` + `npm run generate:questions` requer credenciais M3 ativas + npm install. Codigo esta pronto para rodar.
- Bloqueio P0-11 NAO trava o pipeline — regra AUTONOMIA MAXIMA: outras versoes autonomas continuam.

## [0.2.0] - 2026-06-23

### Added
- `src/db/database.ts` — wrapper expo-sqlite com runMigrations idempotente, transaction helper, countTables sanity check
- `scripts/migrate.ts` — CLI para aplicar migrations
- `src/db/__tests__/database.test.ts` — testes de logica do wrapper (migrations, indices, FKs)
- `docs/git-workflow.md` — estrategia de branches (main/dev/feature/fix/release) + conventional commits
- npm scripts: `db:migrate`, `db:seed`, `db:reset`

### Changed
- package.json: substituído `db:migrate` stub por `ts-node scripts/migrate.ts`

## [0.1.0] - 2026-06-23

### Added
- Repository bootstrap (`donizetiferr/expert-na-biblia`)
- Project skeleton: package.json, tsconfig.json, app.json, eas.json, babel.config.js, metro.config.js
- Linting and formatting: .eslintrc.js, .prettierrc.js
- README initial (em construcao)