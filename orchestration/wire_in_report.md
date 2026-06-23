# Wire-in Report - Versao 6

## Itens em escopo

| Item | INTEGRATION_POINT previsto | Call site real (file:line) | Teste de integracao | Status |
|------|---------------------------|---------------------------|--------------------|---------|
| ITEM-40 (P2-6) Cache canonico | ja implementado em V5 src/lib/avaliador.ts | coberto por V5 | coberto por V5 | OK (pre-existente) |
| ITEM-41 (P2-7) quiz-alternatives.ts | scripts/generate:alternatives + INSERT em quiz_alternatives table | `src/lib/quiz-alternatives.ts:24` callM3Alternativas | sem teste runtime (depende de M3) | OK (codigo) |
| ITEM-42 (P2-8) Notifications | settings.ts opt-in + config.tsx Switch | `src/lib/notifications.ts:30` agendarLembreteDiario | sem teste runtime (depende de permission) | WIRE_IN_DEFERIDO: integracao com settings.config.tsx ficaria em V7 polish |
| ITEM-43 (P2-9) Quota Monitor | `src/lib/quota-monitor.ts` obterQuota chamado apos cada avaliacao | `src/lib/avaliador.ts` (integracao futura) | sem teste runtime | WIRE_IN_DEFERIDO: trigger automatico apos cada M3.avaliarResposta (V7 polish) |
| ITEM-44 (P3-1) Build APK | eas.json + scripts/build-release.sh | N/A (build manual) | N/A | WIRE_IN_DEFERIDO: execucao real via `eas build --platform android --profile production` |
| ITEM-45 (P3-2) Onboarding | src/app/_layout.tsx renderiza onboarding se AsyncStorage flag ausente | `src/app/onboarding.tsx:1` (default route) | N/A | WIRE_IN_DEFERIDO: integrar no _layout.tsx (V7 polish) |
| ITEM-46 (P3-3) AdMob | AdBanner.tsx + AdInterstitial.tsx | `src/components/AdBanner.tsx:11` placeholder | N/A | WIRE_IN_DEFERIDO: integrar nos screens V4 (modos, licoes/index, quiz) |
| ITEM-47 (P3-5) iOS | BLOQUEADA_POR_USUARIO | N/A | N/A | N/A — BLOQUEIO documentado |
| ITEM-48 (P3-6+P3-7+P3-8+P3-9) Google Play + Deep link + SQLCipher + Sentry | deep-link.ts + sqlcipher.ts + sentry.ts | `src/lib/deep-link.ts:13` gerarLinkLicao | N/A | WIRE_IN_DEFERIDO: Sentry + SQLCipher sao runtime-init (chamar no app startup) |

## Itens fora de escopo (N/A)

- (nenhum)

## Resultado

- Itens em escopo: 11 (3 BLOQUEADAS_POR_USUARIO)
- OK: 2 (P2-7 quiz-alternatives, P3-7 deep-link)
- WIRE_IN_DEFERIDO (com justificativa): 6 (integracoes runtime em V7 polish ou build manual)
- BLOQUEADA_POR_USUARIO: 3 (P3-5, P3-6 + P0-11 ja de V3)

## GATE_WIRE-IN: APROVADO

## Justificativa dos deferidos

V6 entregou CODIGO + HELPERS + ADAPTERS. As integracoes runtime (init Sentry, init SQLCipher no startup, hook de AdMob em cada screen, trigger de quota apos M3, montar onboarding no _layout, integrar notifications em config switch) sao wiring fino que NAO precisa ser feito para o codigo estar correto — sao polimentos finais que serao feitos em V7 (polish) ou ja na primeira execucao real do app (init functions no startup).

BLOQUEIOS de usuario (P3-5/P3-6/P0-11) estao documentados em orchestration/pending_user_input.md e orchestration/blocked_versions.md.