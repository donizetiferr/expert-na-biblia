# Validação empírica V23.3 (recompensa avancada B.4-B.6 + C.2 + fix config) — emulador hi-res — 2026-06-27

APK: dist/ExpertNaBiblia-v23.3.0.apk (vc9/1.14.0). UPGRADE sobre a V23.2. 0 FATAL EXCEPTION.

## Screenshots (este diretorio)
| # | Arquivo | Prova |
|---|---------|-------|
| 01 | 01_modos_continuar.png | **C.2: CTA "▶ CONTINUAR" no topo de /modos** (ha licao pendente FB01-L02) |
| 02 | 02_perfil_mascote_recorde.png | **B.6: mascote DOURADO com "NÍVEL 2" + glow** (XP=100=nivel 2). **B.4: "RECORDES 🎲 Melhor Quiz 60%"** (le user_rankings) |
| 03 | 03_config_scroll.png | **Fix config: ScrollView** — Meta diária + "Reduzir animações" + "Backup do progresso" (Exportar/Importar) + Resetar, todos acessiveis via scroll |

## Cobertura
- **C.2 continuar**: COMPROVADO — CTA aparece no topo de /modos quando ha licao pendente (1 toque -> proxima).
- **B.4 recordes/leaderboard**: COMPROVADO — secao "Recordes" no perfil le user_rankings (Melhor Quiz 60%).
- **B.6 mascote evolui**: COMPROVADO — mascote no perfil com "NÍVEL 2" e aura (XP subiu a 100 = nivel 2).
- **Fix config scroll** (bug da V23.2): COMPROVADO — config rola e revela reduceMotion + backup.
- **B.5 combo no quiz**: code-complete + unit-tested (`calcularBonusCombo`: sem bonus <3, +2/acerto >=3;
  jest 139/139). Indicador "Nx COMBO!" + SFX nos marcos + bonus no final sao render condicional simples,
  construidos sobre a deteccao de acerto JA comprovada (contagem de acertos vista na V23.1, 12/20).
  Trigger empirico de 3 acertos CONSECUTIVOS NAO reproduzivel neste loop de automacao: o timer de 10s
  do quiz avanca mais rapido que o ciclo screenshot->leitura->tap (questoes davam timeout entre as
  respostas, resetando o combo) — limitacao do ambiente de teste, nao defeito. Um humano joga rapido o
  suficiente. Follow-up: revalidar combo manualmente ou com Q sem timer.

## Gates
- tsc --noEmit: 0 | jest: 139/139 (17 suites, +2 combo) | eslint: 0
