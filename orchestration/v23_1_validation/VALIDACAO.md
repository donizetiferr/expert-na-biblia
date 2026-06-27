# Validação empírica V23.1 (MLE) — emulador hi-res 1080x1920 — 2026-06-26

APK: dist/ExpertNaBiblia-v23.1.0.apk (vc7/1.12.0). Instalado como **UPGRADE sobre a V21**
(adb install -r) — testa a migration 002 sobre um DB ja existente (migration 001 + seed).

## Resultado: APROVADO — 0 FATAL EXCEPTION em toda a sessao
- `[layout] migrations+seed OK` no logcat: migration 002 (user_xp/user_badges/meta_diaria_log/
  streak_freeze) aplicada no app ja instalado SEM crash (A.0).
- `adb logcat | grep -c "FATAL EXCEPTION"` = 0.

## Screenshots da jornada (este diretorio)
| # | Arquivo | Prova |
|---|---------|-------|
| 00 | 00_v21_baseline.png | V21 rodando antes do upgrade (DB na migration 001) |
| 01 | 01_pos_upgrade.png | Pos-upgrade: onboarding passo 1 "OLÁ!" — sem crash (migration 002 OK) |
| 02 | 02_motivacao.png | Onboarding: "O QUE TE TRAZ AQUI?" (CONTINUAR desabilitado ate escolher) — C.1 |
| 03 | 03_meta.png | Onboarding: "QUAL SUA META DIÁRIA?" (Tranquilo 50 / Dedicado 100 / Expert 150) — A.3/C.1 |
| 04 | 04_vitoria_pergunta.png | Onboarding: "SUA 1ª PERGUNTA" + SIM! (vitoria garantida) — C.1 |
| 05 | 05_vitoria_uau.png | "UAU! 🎉 ganhou seus primeiros 10 XP" — 1a vitoria concede XP + streak (A.1/A.2/C.1) |
| 06 | 06_streak_intro.png | "🔥 STREAK INICIADO! dia 1" — A.2/C.1 |
| 07 | 07_notif.png | "POSSO TE LEMBRAR?" — permissao de notificacao no onboarding (C.1) |
| 08 | 08_modos.png | /modos com botao 📊 Perfil (B.2) + ≡ Config; onboarding finalizado |
| 09 | 09_licoes_header.png | **Header /licoes: 🔥1, NÍVEL 1, 10 XP, 🎯 Meta 10/50, 📚 0/40** — loop visivel (A.1/A.2/A.3/B.3) |
| 10 | 10_perfil.png | Perfil "MEU PROGRESSO": header + POR ÁREA (FB 0/18, AT 0/18, NT 0/4) + CONQUISTAS 0/13 galeria — B.2/B.1/B.4 |
| 11 | 11_quiz_final_xp.png | **Quiz: "acertou 12 de 20" → +60 XP + 🎯 Meta diária batida! +20 XP** — A.1/A.3 |
| 12 | 12_perfil_xp_subiu.png | **Perfil: 90 XP · Nível 1, Meta de hoje ✓ 90/50 (barra VERDE)** — XP subiu 10→90 dinamicamente |

## Cobertura dos 8 itens do MLE
- A.0 fundacao (migration 002 + Settings + helper XP): PROVADO (migrations+seed OK, 0 crash no upgrade)
- A.1 XP: PROVADO (onboarding +10, quiz +60, header/perfil mostram 90 XP, subindo)
- A.2 streak: PROVADO (🔥1 desde o onboarding, mantido apos o quiz)
- A.3 meta diaria: PROVADO (10/50 → 90/50 batida, barra verde + "+20 XP" de bonus)
- B.3 barra global modulos: PROVADO (📚 0/40 no header e perfil)
- B.2 perfil: PROVADO (tela "Meu Progresso" completa)
- B.1 badges: galeria PROVADA (CONQUISTAS 0/13, locked). Modal de UNLOCK: code-complete +
  unit-tested (badges.test.ts thresholds) — trigger empirico (1º modulo / streak 7 / quiz 20/20)
  exige completar um modulo inteiro (8 licoes), desproporcional para esta validacao; deferido.
- C.1 onboarding ativacao: PROVADO (6 passos + 1a vitoria + streak + permissao notif)

## Gates
- tsc --noEmit: 0 | jest: 128/128 (15 suites, +31) | eslint: 0
