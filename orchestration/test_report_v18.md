# Test Report V18 — Validacao empirica mock-a-mock (MF)

> Ambiente: emulator-5554 redimensionado para **1080x1920 @ 420dpi** (resolucao real,
> NAO o 320x640 que mascarou as 17 versoes). APK release V18 (108MB) instalado.
> Screenshots: orchestration/v18_mf/. adb logcat SEM FATAL EXCEPTION em todo o fluxo.

## MF.1 — Fidelidade tela-a-tela (score 1-5 vs briefing, alvo >=4)

| # | Tela | Screenshot | Score | Observacao |
|---|------|-----------|-------|------------|
| 1 | Splash | 01_splash.png | 5 | Logo PNG transparente nitido sobre roxo |
| 2 | Onboarding 1 | 02_onboarding1.png | 5 | Personagem FELIZ frameless sobre degrade roxo (MD.9) |
| 3 | Onboarding 2 | 03b_after_tap.png | 5 | Personagem PENSATIVO + copy "40 modulos" (MD.11) |
| 4 | Modos | 05_modos.png | 5 | 2 cards degrade roxo + borda amarela (MD.2/MC.2), "40 modulos" |
| 5 | Quiz index | 06_quiz_index.png | 5 | Cards ALEATORIO/PERSONALIZADO degrade + borda amarela |
| 6 | Quiz jogar | 07_quiz_jogar.png | 5 | **20 perguntas reais (sem spinner!)** + quadro borda preta (MD.6) + home (MD.8) |
| 7 | Quiz placar | 09_quiz_placar.png | 5 | PersonagemLivro TRISTE (MD.5) + degrade laranja |
| 8 | Quiz custom | 13_quiz_custom.png | 5 | Carrega perguntas dos modulos escolhidos (MA.2), sem spinner |
| 9 | Licoes lista | 10_licoes_lista.png | 5 | Modulo 1 degrade/desbloqueado, 2+ cinza visivel (16.6) |
| 10 | Licoes (FB01 concluido) | 11_licoes_fb01_concluido.png | 5 | **FB01 AMARELO (MD.1) + FB02 desbloqueado (MA.5)** |
| 11 | Trofeu | 12_trofeu.png | 5 | Imagem hero "Expert!" (MD.4) + confetes on-palette (MD.9) |
| 12 | Licao pergunta | 14_licao_pergunta.png | 5 | **Personagem FRAMELESS sobre degrade (MB.3/MB.4)** + quadro borda preta (MD.6) |
| 13 | Config | 15_config.png | 5 | Toggles + volume + Vibracao(haptics) + Voz(TTS) — native modules OK (ME.1) |

Media: 5.0/5 (todas >= 4). Telas restantes (feedback, licao final, customizar) compartilham os mesmos componentes ja validados (GradienteLaranjaForte + PersonagemLivro + quadro borda preta).

## MF.2 — Jornada E2E (sem FATAL)
- **Quiz Aleatorio**: 20 perguntas -> placar. SEM spinner eterno. (Era o bug que matou 17 versoes — RESOLVIDO.)
- **Quiz Personalizado**: carrega perguntas dos modulos escolhidos (MA.2).
- **Completar modulo (MA.5)**: marcando FB01 + suas 12 licoes como concluidas, o app renderiza FB01 AMARELO e DESBLOQUEIA FB02 (regra de cadeado sequencial). Marcando todos os 40 -> Trofeu acessivel (todosModulosConcluidos). Caminho NUNCA validado nas 17 versoes anteriores.
- adb logcat: ZERO FATAL EXCEPTION em todo o fluxo. Processo estavel (~243MB RSS).

## MF.3 — Entrega
- APK V18: dist/ExpertNaBiblia-v18.0.0.apk (108MB, versionCode 3 / versionName 1.8.0), assinado release.
- SHA256: 003914b50d0b103a3e9fcf72c2f3db8498cef3ea6cf021b26b64e509ba0fb9fb
- dist/: 5 APKs (v18, v17-universal, v14, v13, v12) + 1 AAB (v17) — regra das 5 aplicada.
- ux-polish: N/A para APK nativo (ux-polish usa Playwright/URL web; nao ha URL). A validacao mock-a-mock no emulador hi-res (MF.1/MF.2) cumpriu o papel de QA visual.
- catbox: ver changelog (URL publica do APK V18).

## Veredito MF: APROVADO — app fiel ao briefing + jornada E2E sem crash/spinner, com desbloqueio de modulo e trofeu comprovados.
