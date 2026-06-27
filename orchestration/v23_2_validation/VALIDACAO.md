# Validação empírica V23.2 (núcleo de retenção A.4-A.7) — emulador hi-res 1080x1920 — 2026-06-26/27

APK: dist/ExpertNaBiblia-v23.2.0.apk (vc8/1.13.0). Instalado como UPGRADE sobre a V23.1.

## Resultado: APROVADO — 0 FATAL EXCEPTION
- `[layout] migrations+seed OK` no upgrade (sem crash).
- Progresso preservado em TODOS os upgrades (V21 -> V23.1 -> V23.2): licao FB01-L01 segue
  "✓ 100/100" (dado de validacoes anteriores sobreviveu) — comprova a persistencia (A.7).

## Screenshots (este diretorio)
| # | Arquivo | Prova |
|---|---------|-------|
| 01 | 01_modos.png | /modos pos-upgrade (sem crash); botao 📊 perfil |
| 02 | 02_licao_final_refazer.png | **A.6: "VOCÊ CONSEGUE! Você acertou 2 de 10. Bora reforçar!" + "+10 XP" (esforco) + "REFAZER AS QUE FALTARAM (8)" + "REFAZER TUDO"** |
| 03 | 03_refazer_subset.png | **A.6: "Refazer as que faltaram" recarrega a licao com "1-8" — somente as 8 erradas (filtro `somente`)** |
| 04 | 04_config.png | **A.4: Notificacoes push ON (do onboarding) + A.3: "Meta diária" 50/100/150 XP/dia (50 selecionado)** |
| 05 | 05_config_backup.png | config (overflow detectado: reduceMotion + Backup abaixo da dobra -> FIX View->ScrollView) |

## A.6 — refazer-so-erradas: COMPROVADO end-to-end
Jornada da licao FB01-L02 (10 perguntas): Q1 "Antigo e Novo Testamento" CORRETO (match local
offline), Q2 ERRADO (fallback gracioso "Avaliação automática indisponível"), Q3 "27" CORRETO,
Q4-Q10 erradas. **Acertos threading INTACTO** (1->1->2->2->2..., "X de 10 · Acertos: N" correto =
BUG-1 da V19 NAO regrediu). Final: copy encorajadora + "+10 XP" por esforco (2 acertos x 5) +
"REFAZER AS QUE FALTARAM (8)" (8 = 10 - 2 acertos, rastreio de erradas correto). Tap -> recarrega
"1-8" (subset exato das erradas).

## A.4/A.3 — config: COMPROVADO
Notificacoes push ON (permissao concedida no onboarding V23.1) + Meta diária selector (50/100/150,
50 ativo = escolha do onboarding).

## A.5 (bau) / A.7 (export/import)
- A.5 bau: logica pura unit-tested (bau.test.ts, RNG injetavel); trigger empirico exige licao 100%
  (offline, ~30% de chance) — coberto por teste + render simples.
- A.7: Auto Backup (allowBackup) comprovado pela persistencia entre upgrades; export/import: backup.ts
  unit-tested (round-trip); UI (Exportar via Share / Importar colando) abaixo da dobra no config.

## Bug encontrado + corrigido na validacao
- Config cresceu (meta + reduzir animacoes + backup) e estourou a dobra num `View` fixo (nao rolavel).
  FIX: `View` -> `ScrollView` (commit pos-validacao). tsc 0, eslint 0. Confirmacao empirica do scroll
  no build da V23.3 (que inclui o fix).

## Gates
- tsc --noEmit: 0 | jest: 137/137 (17 suites, +9) | eslint: 0
