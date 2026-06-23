# Expert Na Bíblia

> App mobile (Android + iOS) que ensina a Bíblia de forma lúdica e progressiva com dois modos:
> **Modo Lições** (trilha pedagógica com 77 módulos) e **Modo Quiz Bíblico** (desafio rápido).

## Status

Em construção — versão 0.1.0 (pré-implementação / setup técnico concluído).

Próximo marco: v0.2.0 — FASE 1 MVP (1 módulo de exemplo funcionando).

## Stack

- **React Native + TypeScript via Expo SDK 54+** (New Architecture habilitada)
- **IA para avaliação**: Minimax M2.7 (Token Plan) + fallback OpenAI GPT-4o-mini
- **Banco**: SQLite embarcado (expo-sqlite) com ~10.850 perguntas offline
- **Build**: EAS Build (cloud, free tier 30 builds/mês)
- **Tipografia**: Bangers (display) + Nunito (body)
- **Paleta**: degradê roxo (#8b16c7 → #3c026d) + laranja (#fded48 → #fd8414)

## Como rodar (desenvolvimento)

```bash
npm install
npm run start          # Expo Dev Client
npm run android        # Emulador Android
npm run ios            # Simulator iOS
npm run type-check     # tsc --noEmit
npm run lint           # ESLint
npm run format:check   # Prettier
npm run test           # Jest unit
npm run test:e2e       # Playwright em emulador Android
```

## Build de produção

```bash
npm run build:preview  # APK preview (interno)
npm run build:prod     # AAB/IPA produção
```

## Estrutura

```
Expert Na Bíblia/
├── assets/             # imagens, audio, fontes
├── src/
│   ├── app/            # Expo Router screens
│   ├── components/     # componentes reutilizáveis
│   ├── lib/            # lógica de negócio (matching, M3, gamificação)
│   ├── db/             # schema SQLite + migrations
│   ├── types/          # tipos TS compartilhados
│   └── constants/      # constantes (paleta, textos)
├── scripts/            # scripts de geração/importação (TS)
├── __tests__/          # testes Jest + Playwright
├── docs/               # documentação do projeto (briefing WhatsApp)
├── orchestration/      # estado de execução full-cycle
├── CLAUDE.md           # contexto para assistentes IA
├── evolution_plan.md   # TO-DO vivo do projeto
└── CHANGELOG.md        # histórico de versões
```

## Licença

Privado — projeto pessoal de Donizeti Ferreira. Todos os direitos reservados.