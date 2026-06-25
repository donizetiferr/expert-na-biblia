# Plan Investigation V13 — Expert Na Bíblia (2026-06-25)

## Modo
Escopo: ATUALIZACAO (V12 → V13) | Profundidade: FOCADO — input ja traz 5 bugs
acionaveis (som + outros) + contexto previo rico (V12 nesta sessao).

## Comandos executados
- `ls -la assets/audio/` — 10 MP3 files (5 originais + 5 SFX novos gerados em M6)
- `grep "playSplash|playAcerto|..."` — todas as funções de SFX são chamadas, mas as 7 NOVAS (M6) são código morto
- `grep "console.log|TODO|FIXME"` — encontrou 3 TODOs e 3 console.logs esquecidos
- `wc -l src/lib/sound.ts` — tem 9 funções de SFX mas só 4 são usadas

## Saude do projeto (re-verificada)
- Testes: EXISTEM (5 arquivos) — veredito: NAO_VALIDADO
- Build: BUILD SUCCESSFUL V12.0.0 — veredito: OK
- CI/CD: CONFIGURADO (parcial) — veredito: GREEN_FALSO (app tem bugs UX que passam)
- Deps: ATUALIZADAS (Expo SDK 55, RN 0.83.6) — veredito: OK
- Docs: RICO — veredito: OK

## Cobertura por dimensao (FOCADO = sem gate G4; declaracao minima)
- CORRECAO_BUGS: 3 achados (SOM, MODAL_BACK, RENDER_SLICE)
- MELHORIA: 1 (CONSOLE_LOGS)
- EVOLUCAO_FEATURES: 0
- MANUTENCAO_REFACTOR: 1 (TODOs)
- INFRAESTRUTURA: 0
- UX_UI: 3 (mesmos de CORRECAO)
- PERFORMANCE: 0
- SEGURANCA: 0

## Achados independentes (gate G1 = 5 confirmados)
1. **SOM M6 (CRITICA)**: 7 funções de SFX novos são código morto + 4 MP3 originais são minúsculos
2. **MODAL BACK (MEDIA)**: hook não valida pathname
3. **RENDER SLICE (BAIXA)**: slice sem espaço em FB01
4. **CONSOLE LOGS (BAIXA)**: 3 console.logs em produção
5. **TODOs (BAIXA)**: 3 TODOs não resolvidos em AdBanner/AdInterstitial/sentry

## Autonomia por item
- 14.1 (som): AUTONOMO (ElevenLabs MCP disponível)
- 14.2 (modal back): AUTONOMO
- 14.3 (slice): AUTONOMO
- 14.4 (console.logs): AUTONOMO
- 14.5 (TODOs): AUTONOMO

## Segundo turno critico (FASE 3.5 — gate G5)
- Lentes aplicadas: 7/7
- Ajustes: 1 detalhado (14.1 detalhado em 4 sub-tarefas) | 1 enriquecido (POLISH — 14.2 com fallback se pathname for null) | 1 recuperado (14.3 era achado esquecido) | 0 re-priorizados | 0 consolidados | 0 premissas verificadas
- Total ajustes: 3
- Re-ataque: NAO aplicavel (5 itens, ≥ 3)
- Top 3 ajustes mais relevantes:
  1. **14.1**: detalhado em 4 sub-tarefas (substituir MP3s vazios, gerar SFX reais via ElevenLabs, chamar 7 SFX novos nos contextos certos, remover silent catches)
  2. **14.2**: enriquecido com fallback se pathname for null (não chamar modal)
  3. **14.3**: achado que estava esquecido do V12
