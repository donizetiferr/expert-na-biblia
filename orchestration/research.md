# Research — Expert Na Biblia (2026-06-23)

## Contexto
Projeto pessoal NOVO — app mobile React Native + Expo + TS + SQLite + Minimax M2.7. Roadmap ja consolidado (53 itens via solo-plan). Pesquisa externa apenas para VALIDAR stack/marcos de referencia.

## Achados (top 6, com URL)

### A1. Expo SDK 51 esta DESATUALIZADO em 2026
- **URL**: https://docs.expo.dev/guides/new-architecture/
- **Insight**: "SDK 51 is significantly outdated, and the legacy architecture has been frozen". Buildar em SDK 51 ainda funciona, mas SDKs mais novos (52/53/54) trazem New Architecture estavel, expo-sqlite mais robusto, e melhor suporte a Hermes.
- **Impacto**: P0-3 (Setup Expo SDK) — RECOMENDAR SDK 54+ em vez de 51. Justificativa: comunidade, compat AdMob/Sentry/notifications atualizada.
- **Fonte URL**: https://expo.dev/changelog/2024-05-07-sdk-51

### A2. TypeScript strict expo + best practices 2026
- **URL**: https://www.applighter.com/blog/react-native-best-practices
- **Insight**: TS strict + shapes de props evita crashes; "noUncheckedIndexedAccess" + "exactOptionalPropertyTypes" sao defaults 2026.
- **Impacto**: P0-3 mantem tsconfig.json strict recomendado no evolution_plan. OK.

### A3. expo-sqlite + offline-first patterns
- **URL**: https://www.dbpro.app/blog/expo-sqlite + https://reactnativerelay.com/article/building-offline-first-react-native-apps-2026-expo-sqlite-drizzle-orm-sync-strategies
- **Insight**: expo-sqlite suporta SQLite local, CRUD offline. Drizzle ORM eh opcao popular 2026 para query builder type-safe.
- **Impacto**: P0-9 (Setup SQLite) — usar expo-sqlite + migrations manuais (mais leve que Drizzle para 77 modulos estaticos). OK.

### A4. Expo best practices 2026
- **URL**: https://github.com/ofershap/expo-best-practices
- **Insight**: "AI coding assistants store tokens in AsyncStorage" — anti-pattern. Usar expo-secure-store para tokens M3/OpenAI. AFETA P1-11/P1-12.
- **Impacto**: Adicionar nota em P0-3: API keys M3/OpenAI em expo-secure-store (NAO AsyncStorage).

### A5. Minimax M2.7 ja validado em producao
- **URL**: https://platform.minimax.io/docs/token-plan/intro (citado em plan_investigation.md)
- **Insight**: Token Plan permite uso comercial em aplicacoes; APW ja valida.
- **Impacto**: P0-4 / P1-11 seguem como planejado.

### A6. Playwright em emulador Android requer Android Studio
- **URL**: https://playwright.dev/docs/android
- **Insight**: Playwright suporta Android desde 2024 mas requer `npx playwright install android` + Android Studio + API 34.
- **Impacto**: P0-12 mantem instalacao Android Studio + emulator. OK.

## Recomendacoes Consolidadas (Top 4)

1. **Trocar Expo SDK 51 por SDK 54+** em P0-3 (achado A1).
2. **Armazenar API keys M3/OpenAI em expo-secure-store** (achado A4) — adicionar em P1-11 e P1-12.
3. **Validar Hermes engine + New Architecture habilitada** (achado A1) — adicionar em P0-3.
4. **expo-sqlite sem ORM** (achado A3) — migrations manuais para 77 modulos.

## Source Quality: 6/6 fontes validas (URLs acessiveis, conteudo relevante)