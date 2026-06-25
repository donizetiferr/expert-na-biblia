# Delivered Items — V19 (2026-06-25)

## V19 (1.9.0 / vc4) — bugs do VERDICT independente, comprovados em emulador
- BUG-1 (release-blocker): scoring da licao threadado via params (licao<->feedback). Fonte: VERDICT.
- BUG-2: guard SEM_GABARITO em matchCanonico + 11 canonicas reais (seed TS + db.sqlite). Fonte: VERDICT.
- BUG-3: ScrollView no KeyboardAvoidingView (ENVIAR alcancavel). Fonte: VERDICT.
- BUG-4: guard de envio vazio (nao sai da licao). Fonte: VERDICT.
- BUG-5: placar Quiz "NAO DEU/QUASE LA/VOCE PASSOU" + "Voce acertou X de N" + RECOMECAR. Fonte: VERDICT.
- BUG-7: split do nome do modulo (espaco preservado). Fonte: VERDICT.
- BUG-8: banner offline em fluxo normal (nao sobrepoe headers). Fonte: VERDICT.
- BUG-9: modulos/licoes travados em roxo+cadeado (nao cinza). Fonte: VERDICT.
- BUG-10: GradienteRoxo oficial #8b16c7->#3c026d (degrade visivel). Fonte: VERDICT.

## Evidencias empiricas (orchestration/v19_validation/)
- 61_after.png: licao 01 AMARELA "100/100" + licao 02 desbloqueada (jornada real 10 perguntas)
- 44/47/48/52/55/57: feedback com Acertos indo 1->2->3->4->8->9->10 (prova BUG-1)
- 58_final.png: "VOCE PASSOU! Licao concluida com 100%"
- 63_modulo_unlock.png: modulo FB01 amarelo + FB02 desbloqueado
- 64_trofeu.png: "Parabens, voce e um Expert!"
- 66_quiz_jogar.png: Quiz aleatorio 20q jogavel (sem spinner)
- 67_quiz_placar.png: "NAO DEU" + "Voce acertou 0 de 20"
- logcat: 0 FATAL EXCEPTION do app

## Pendencias (V20)
- BUG-6 mascote dourado (asset). IA nas licoes (avaliador.ts) + batch M2.7 ~497 canonicas abertas.
