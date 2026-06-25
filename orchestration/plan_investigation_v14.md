# Plan Investigation V14 — Expert Na Bíblia (2026-06-25)

## Modo
Escopo: ATUALIZACAO (V13 → V14) | Profundidade: FOCADO — input ja traz 9 bugs
acionaveis (auditoria profunda V14) + contexto previo rico (V13 nesta sessao).

## Comandos executados
- adb screencap (splash 2s/4s, modos, licoes, licao, quiz, feedback) — capturou ~10 telas
- python PIL pixel analysis — comparou briefing vs V13
- grep "useEffect\|useState" — investigou loop quiz
- cat src/app/quiz/jogar.tsx — verificou useEffect dependencies
- adb input keyevent — tentou pular onboarding

## Saude do projeto (re-verificada)
- Testes: EXISTEM (5 arquivos) — veredito: NAO_VALIDADO
- Build: BUILD SUCCESSFUL V13.0.0 — veredito: OK
- CI/CD: CONFIGURADO (parcial) — veredito: GREEN_FALSO (UX nao segue briefing)
- Deps: ATUALIZADAS (Expo SDK 55, RN 0.83.6) — veredito: OK
- Docs: RICO — veredito: OK

## Cobertura por dimensao (FOCADO = sem gate G4; declaracao minima)
- CORRECAO_BUGS: 6 achados (SPLASH, ONBOARDING, LOOP_QUIZ, PERSONAGEM_TAMANHO, TECLADO, AUDIO_GLITCH)
- MELHORIA: 2 (IDENTIDADE_VISUAL, FEEDBACK_ELEGANCIA)
- EVOLUCAO_FEATURES: 0
- MANUTENCAO_REFACTOR: 0
- INFRAESTRUTURA: 0
- UX_UI: 8 (mesmos de CORRECAO_BUGS + MELHORIA, todos afetam UX)
- PERFORMANCE: 0
- SEGURANCA: 0

## Achados independentes (gate G1 = 9 confirmados)
1. **SPLASH** (CRITICA): mostra adaptive icon 96x96 (não logo cropped 750x900)
2. **IDENTIDADE_VISUAL** (CRITICA): /modos + /quiz divergem do briefing
3. **ONBOARDING** (CRITICA): aparece toda vez que abre o app
4. **LOOP_QUIZ** (CRITICA): loop infinito em /quiz/jogar após responder
5. **PERSONAGEM_TAMANHO** (ALTA): PersonagemLivro size=110 (deveria ser 300+)
6. **TECLADO** (ALTA): KeyboardAvoidingView behavior=undefined no Android tampa input
7. **AUDIO_GLITCH** (MEDIA): musica_fundo_v2.mp3 tem estouro recorrente
8. **FEEDBACK_ELEGANCIA** (MEDIA): feedback acerto/erro não segue briefing
9. **EMOJIS** (BAIXA): /modos usa 🎲/💪 em vez de personagem livro

## Autonomia por item
- 15.1 (splash): AUTONOMO
- 15.2 (identidade): AUTONOMO
- 15.3 (onboarding): AUTONOMO
- 15.4 (loop quiz): AUTONOMO
- 15.5 (personagem): AUTONOMO
- 15.6 (teclado): AUTONOMO
- 15.7 (audio): AUTONOMO (ElevenLabs MCP)
- 15.8 (feedback): AUTONOMO
- 15.9 (emojis): AUTONOMO

## Segundo turno critico (FASE 3.5 — gate G5)
- Lentes aplicadas: 7/7
- Ajustes: 2 detalhados (15.4 useEffect cleanup; 15.6 KeyboardAvoidingView height+adjustResize) | 1 enriquecido (POLISH 15.2 com personificação 3 cards) | 0 recuperados | 1 re-priorizado (15.5 MEDIA → ALTA, afeta muito) | 0 consolidados | 1 premissa verificada (15.3 confirmado — onboard sempre aparece)
- Total ajustes: 5
- Re-ataque: NAO aplicavel (9 itens, ≥ 3)
- Top 3 ajustes mais relevantes:
  1. **15.4**: useEffect deve ter `return () => clearTimeout/clearInterval` para evitar loop
  2. **15.6**: `behavior="height"` + `keyboardVerticalOffset={64}` no Android
  3. **15.5**: 15.5 re-priorizado para ALTA — PersonagemLivro size=110 é inaceitável, briefing diz grande
