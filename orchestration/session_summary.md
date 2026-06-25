# Session Summary — Expert Na Biblia

## Ultima sessao (V20 — 2026-06-25)
Ciclo @full-cycle (agent). Fechadas 2 lacunas de conformidade do briefing, COMPROVADAS no emulador:
- (A) Mascote DOURADO no modo Licoes (Personagem 1): `PersonagemLivro` prop `variante:'licoes'|'quiz'`;
  3 telas de Licoes usam o livro dourado (3 poses reais baixadas do Drive "Personagens" via Playwright);
  Quiz mantem o ROXO. Set dourado PARCIAL (sem assustado/triste dedicado -> usa "questionando").
- (B) IA obrigatoria nas licoes (regra #4): `enviar()` usa o orquestrador hibrido `avaliarResposta`
  (match local >=85% -> M2.7 -> OpenAI) com loading "AVALIANDO..." + fallback gracioso.
- BUG REAL (achado em teste de integracao com o M2.7): a saida do M2.7 vem em `<think>` + cercas
  markdown ```json; o parser antigo lancava sempre -> IA caia para offline mesmo ONLINE. Fix:
  `src/lib/parse-json.ts` (extrairAvaliacaoJson) em m3.ts/openai.ts + 7 testes de regressao.

## Estado atual
- Versao: 1.10.0 / versionCode 5 (app.config.ts + ENB build.gradle)
- Branch: main | Ultimo commit local: 92e6b1c (docs V20)
- Gates: tsc 0 | jest 94/94 | eslint 0
- APK: dist/ + C:\ENB\dist\ ExpertNaBiblia-v20.0.0.apk (regra das 5). Catbox: https://files.catbox.moe/kjvgi4.apk (206 + PK)
- Validacao empirica: orchestration/v20_validation/ (local-only, fora do git por privacidade)
  - DOURADO nas Licoes: 05 (pergunta), 07b (feedback acerto), 11 (feedback erro), journey_final_100 (final 100%)
  - ROXO no Quiz: 13_quiz_final_ROXO
  - IA online: 10_burst_2 (loading "AVALIANDO..."), m3_usage=2 + cache score 1.0 (DB on-device); integracao Node M2.7 4/4
  - Jornada integra (gate de entrada): licao FB01-L01 -> 100% -> L01 amarela "100/100" -> L02 desbloqueada (journey_amarelo_unlock)

## Proxima acao
- Validar engajamento no MVP beta; considerar batch M2.7 para pre-gerar canonicas das ~497 perguntas abertas.

## Pendencias (nao bloqueiam)
- Poses DOURADAS assustado/triste dedicadas (Drive so tem 3 poses positivas/neutras) — depende da designer.
- quiz-alternatives.ts tem o mesmo padrao de parsing fragil do M2.7 (batch offline, fora do escopo V20).
- Publicacao Play Store: 2FA Google = execucao humana.

## Bloqueios / ATENCAO
- PUSH: a instrucao do ciclo foi "commit local apenas, sem push". Porem o HOOK AUTOMATICO de auto-push
  do ambiente (commit a7d313e "auto-push ... 21 reais") COMMITOU E FEZ PUSH do V20 (codigo+assets+config)
  para origin/main durante a sessao, de forma autonoma. Conteudo verificado: SEM string "claude" e SEM
  chaves de API no fonte (app.config.ts usa process.env; chaves so no APK gitignored). Repo privado.
  Decisao: NAO forcei revert (force-push exige autorizacao + conteudo eh seguro). Usuario decide se quer reverter.
