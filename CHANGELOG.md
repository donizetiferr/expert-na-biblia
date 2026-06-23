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

## [1.0.0] - 2026-06-23

### Added
- `src/lib/quiz-alternatives.ts`: gerador batch via M3 com fallback stub
- `src/lib/notifications.ts`: wrapper expo-notifications (3 mensagens variantes, lembrete diario)
- `src/lib/quota-monitor.ts`: dashboard quota M3 + alerta Telegram (>80%)
- `src/lib/deep-link.ts`: URL scheme expertnabiblia://licao/{id} + compartilhar WhatsApp
- `src/lib/sentry.ts`: stack traces sem dados do usuario (LGPD)
- `src/lib/sqlcipher.ts`: adapter SQLCipher (chave derivada de device ID)
- `src/components/AdBanner.tsx`: banner AdMob (placeholder quando nao configurado)
- `src/components/AdInterstitial.tsx`: hook interstitial (max 1 a cada 3 conclusoes, NUNCA em splash/final/feedback)
- `src/app/onboarding.tsx`: 3 telas swipe (Bem-vindo / Como funciona / Vamos comecar!)
- `docs/PRIVACY_POLICY.md`: template LGPD completo (dados coletados, servicos terceiros, direitos)
- `scripts/build-release.sh`: helper EAS build production

### Notes
- **APK release gerado**: codigo pronto. Execucao real requer `eas login` + `eas build --platform android --profile production` + conta Expo.
- **Publicacao Google Play**: BLOQUEADA_POR_USUARIO (P3-6) — requer conta Google Play Developer ($25 one-time).
- **Publicacao iOS App Store**: BLOQUEADA_POR_USUARIO (P3-5, OPCIONAL) — requer Apple Developer account ($99/ano).
- **Codigo do app completo (MVP+ v1.0.0)**: 77 modulos, 13 telas, matching TF-IDF, M3 + OpenAI fallback, gamificacao, quiz, push, AdMob balanceado.

## [0.5.0] - 2026-06-23

### Added
- `src/lib/matching.ts`: matching canonico 2-camadas (Levenshtein exato + cossino semantico com sinonimos biblicos pre-mapeados — deus/senhor/yhwh, jesus/cristo/messias, etc)
- `src/lib/m3.ts`: cliente HTTPS Minimax M2.7 (Token Plan) com filtro think tags + retry 3x + timeout 10s + SecureStore para API keys
- `src/lib/openai.ts`: cliente OpenAI GPT-4o-mini (fallback) — mesmo JSON schema, response_format json_object
- `src/lib/avaliador.ts`: orquestrador local-cache → M3 → OpenAI com cache SQLite (score >= 0.85) + TTL 90 dias + log m3_usage
- `src/lib/streak.ts`: streak diario com freeze semanal (SQLite user_streak)
- `src/lib/quiz-questions.ts`: gerador de 4 alternativas (1 correta + 3 distrators via hash deterministico, Fisher-Yates embaralhamento)
- `src/app/quiz/index.tsx`: Tela 3 - Aleatorio vs Licoes personalizadas
- `src/app/quiz/customizar.tsx`: Tela 4 - 77 modulos + checkboxes max 20
- `src/app/quiz/jogar.tsx`: Tela Quiz - pergunta + timer 10s + 4 alternativas + auto-avanco
- `src/app/quiz/final.tsx`: Placar final + persistir user_rankings (3 variantes)
- `src/lib/__tests__/matching-coverage.test.ts`: 24 testes (sinonimos + cossino + Levenshtein + matchCanonico 2-camadas)

### Notes
- API keys M3 + OpenAI armazenadas em expo-secure-store (pesquisa A4 anti-pattern AsyncStorage)
- Smoke E2E real em emulador Android fica para V6 (requer Android Studio)

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