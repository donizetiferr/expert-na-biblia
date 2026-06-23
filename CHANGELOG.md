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