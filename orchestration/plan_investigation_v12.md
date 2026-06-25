# Plan Investigation V12 — Expert Na Bíblia (2026-06-24)

## Modo
Escopo: ATUALIZACAO (V11 → V12) | Profundidade: FOCADO — razao: input do usuario ja traz 4 divergencias
acionaveis (auditoria completa V11 vs briefing) + contexto previo rico (V10/V11 nesta sessao).

## Comandos executados (resultado resumido)
- adb shell screencap + exec-out screencap — capturou T1 splash, T2 modos, TL1 licoes, TL2 licoes_mod, TL licao
- python PIL pixel analysis — 12 pontos por imagem briefing
- Verificou splash.png bundled no APK (nao esta)
- Verificou BackHandlerOffline hook globalmente
- Verificou opacity em cardLicoes e cardBloqueado

## Saude do projeto (re-verificada 2026-06-24)
- Testes: EXISTEM (5 arquivos) — veredito: NAO_VALIDADO nesta sessao
- Build: BUILD SUCCESSFUL V11.0.0 (104 MB) — veredito: OK
- CI/CD: CONFIGURADO (parcial) — veredito: GREEN_FALSO
- Deps: ATUALIZADAS (Expo SDK 55, RN 0.83.6) — veredito: OK
- Docs: RICO (CLAUDE.md + 6 sub-docs + 17 imagens + 4 planilhas) — veredito: OK

## Cobertura por dimensao (FOCADO = sem gate G4; declaracao minima)
- CORRECAO_BUGS: 4 achados (DIV 1, DIV 2, DIV 3, DIV 4)
- MELHORIA: 0
- EVOLUCAO_FEATURES: 0
- MANUTENCAO_REFACTOR: 0
- INFRAESTRUTURA: 0
- UX_UI: 4 (mesmos de CORRECAO_BUGS, sao todos UX)
- PERFORMANCE: 0
- SEGURANCA: 0

## Achados independentes (gate G1 = 4 confirmados)
1. **DIV 1**: splash.png NAO esta bundled no APK final — splash mostra adaptive icon 96x96
2. **DIV 2**: BackHandlerOffline hook global — modal aparece em CADA focus de tela (deveria so no back)
3. **DIV 3**: card LIÇÕES tem cor #f98214 vs briefing #fd8414 (1% RGB diff)
4. **DIV 4**: cards bloqueados TL1 com opacity 0.6 sobre fundo escuro

## Autonomia por item
- 12.1 (splash grande): AUTONOMO (plugin + assets existem)
- 12.2 (modal offline): AUTONOMO (BackHandler component existe)
- 12.3 (cor card LIÇÕES): AUTONOMO
- 12.4 (cards bloqueados): AUTONOMO

## Segundo turno critico (FASE 3.5 — gate G5)
- Lentes aplicadas: 7/7
- Ajustes: 0 detalhados | 2 enriquecidos (POLISH) | 1 recuperado (DIV 4 era achado esquecido) | 0 re-priorizados | 0 consolidados | 1 premissa verificada (splash.png NAO bundled - premissa do input do usuario)
- Total ajustes: 4
- Re-ataque: NAO aplicavel (plano tem 4 itens, limite eh >= 3)
- Top 3 ajustes mais relevantes:
  1. **DIV 1 (splash)**: confirmada a premissa — splash.png nao esta no APK. Solucao: mover para android/app/src/main/res/drawable OU usar expo-splash-screen com path absoluto
  2. **DIV 2 (modal)**: confirmar a logica do BackHandler — deve disparar em back, nao em focus
  3. **DIV 4 (cards bloqueados)**: era achado esquecido do V10. Adicionar ao plano.
