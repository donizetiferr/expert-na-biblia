# Dependencies Check — Expert Na Biblia

last_validated: 2026-06-23
ttl: 24h
modo: AUTOMATICO_INFERIDO

## Dependencias do projeto (runtime)

| Servico/API | Origem | Status | Fonte da credencial | Notas |
|-------------|--------|--------|---------------------|-------|
| Minimax M2.7 (Token Plan) | evolution_plan.md P0-4 + CLAUDE.md #4 | VALIDADO_AUTO | Tokens API e acessos/minimax/credentials.md | Validado em producao (APW projeto). Endpoint: https://api.minimax.io/v1 |
| OpenAI GPT-4o-mini (fallback) | evolution_plan.md P1-12 + CLAUDE.md #4 | VALIDADO_AUTO | Tokens API e acessos/openai/credentials.md | Fallback se M2.7 estourar quota |
| GitHub `donizetiferr` | evolution_plan.md P0-1 | VALIDADO_AUTO | Tokens API e acessos/github/credentials.md | Token scopes: gist/read:org/repo. OK para criar repo privado. |
| Google Play Console | evolution_plan.md P3-6 | DEPENDE_VOCE | NAO_ENCONTRADA | Aguardando usuario criar conta Google Play Developer ($25 one-time) |
| Apple Developer Program | evolution_plan.md P3-5 (OPCIONAL) | DEPENDE_VOCE | NAO_ENCONTRADA | Aguardando usuario criar conta ($99/ano) — iOS eh OPCIONAL |
| Expo EAS Build | evolution_plan.md P0-2 | AUTONOMO_CRIAR | — | Criar conta Expo free com email + `eas login` |
| AdMob (Google Ads) | evolution_plan.md P3-3 | AUTONOMO_CRIAR | — | Criar conta AdMob via Google Play Console (depende de P3-6) |
| Sentry / Crashlytics | evolution_plan.md P3-9 | AUTONOMO_CRIAR | — | Criar projeto Sentry free ou usar Firebase Crashlytics |
| OpenAI Whisper / ElevenLabs TTS | NAO_APLICA | SEM_DEP | — | Nao usado no MVP |

## Acoes pendentes do usuario

- [ ] P0-11 (FASE 0): Revisar 100 amostras teologicas do conteudo gerado via M3
- [ ] P3-4 (FASE 3): Escolher GitHub Pages (free) vs dominio proprio (R$10-15/ano)
- [ ] P3-5 (FASE 3, OPCIONAL): Criar Apple Developer account + pagar $99/ano
- [ ] P3-6 (FASE 3): Criar Google Play Developer account + pagar $25 one-time

## Status global

**PRONTO_PARA_PROSSEGUIR** (com pendencias de usuario para etapas finais — serao pausadas quando atingidas)

## Notas

- Credenciais M2.7 ja validadas em producao (APW) — Token Plan uso comercial permitido
- Sem Playwright sessions necessarias: app nao eh web, eh mobile (Expo/React Native)
- Sem dev server web necessario: smoke E2E sera via emulador Android (P0-12)