# User Apontamentos (canonico — dono: @full-cycle FASE 0.0.5) — 2026-06-23

## Texto original do usuario

@full-cycle com escopo definido:

OBJETIVO: Implementar o projeto "Expert Na Biblia" - app mobile Android+iOS que ensina a Biblia
de forma ludica com 2 modos (Licoes progressivas + Quiz Biblico rapido). Implementar FASE 0
(setup tecnico + geracao de conteudo) ate FASE 3 (publicacao), consumindo os milestones do
evolution_plan.md. NAO implementar FASE V2 (expansoes futuras).

ESTADO ATUAL: Projeto pessoal pre-implementacao com base documental solida ja construida:
- 53 itens no evolution_plan.md (FASE 0 setup, FASE 1 MVP, FASE 2 conteudo+quiz, FASE 3 publicacao, V2 expansoes)
- Briefing 100% coletado do WhatsApp (68 mensagens, 17 imagens, 4 planilhas com 4345 perguntas, 2 Google Docs)
- 10 decisoes arquiteturais JA TRAVADAS (Expo+TS, M3 Minimax, SQLite embarcado, 77 modulos, etc)
- 3 double checks profundos ja feitos (notas 9.4, 9.5, 9.7/10)
- Documentacao completa em docs/ (9 arquivos)
- Midia espelhada em whatsapp_media/ (17 jpgs + 4 xlsx)

INSTRUCOES CRITICAS:
1. LEIA PRIMEIRO (em ordem): evolution_plan.md, CLAUDE.md, docs/05_conteudo_pedagogico/README.md,
   orchestration/plan_investigation.md, orchestration/audit_report_v3.md, orchestration/qa_verdict_v3.md
2. EXECUTE todos os 48 itens de FASE 0 a FASE 3 (P0-1 a P3-9). NAO pule nenhum.
3. SIGA as dependencias entre milestones documentadas em evolution_plan.md
4. MARQUE cada item como `- [x]` ao entregar (com data `(entregue YYYY-MM-DD)`) em evolution_plan.md
5. NAO invadir FASE V2 (apenas FASE 0-3)
6. NAO modificar regras de negocio - elas estao em CLAUDE.md secao "REGRAS DO PROJETO"
7. RESPONDA em portugues
8. Use o cwd: C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia
9. Modo CONTINUO (default, sem +um-ciclo): rode quantos ciclos forem necessarios ate esgotar
   o escopo de FASE 0-3

CRITERIOS DE QUALIDADE:
- Cada milestone deve ter git commit com mensagem descritiva
- Cada item marcado como `- [x]` deve ter evidencia concreta (arquivo criado, comando executado, teste passando)
- Cobertura de testes: cada modulo de logica (matching, gamificacao, IA) com testes unitarios (Jest)
  + testes E2E (Playwright em emulador Android) para fluxos principais
- Validacao visual via Playwright + screenshots ANTES de marcar item de UI como concluido
- TypeScript strict sem erros (tsc --noEmit)
- ESLint sem warnings
- Para cada fase, ao terminar, rodar `solo-qa` para validar

DEPENDENCIAS DO USUARIO (pausar e avisar quando chegar):
- P0-11: Revisar 100 amostras teologicas do conteudo gerado (nao pode ser pulado, qualidade teologica eh critica)
- P3-4: Escolher GitHub Pages vs dominio proprio
- P3-5 (iOS): Criar Apple Developer account (OPCIONAL)
- P3-6: Criar Google Play Developer account ($25)

QUANDO TERMINAR:
- Todos os 48 itens de FASE 0-3 marcados como `- [x]`
- evolution_plan.md atualizado com datas de entrega
- CHANGELOG.md com entrada da v1.0.0
- APK release gerado e caminho conhecido
- Relatorio final com: versao, build status, links, pendencias

FAZER QUANTOS CICLOS FOREM NECESSARIOS ate esgotar o escopo declarado. NAO pare prematuramente.
Atualize orchestration/status.md a cada gate.

Siga as FASES canonicas [...]

## Apontamentos estruturados

#1 | OBJETIVO | Implementar projeto Expert Na Biblia — app mobile Android+iOS ludico com 2 modos (Licoes progressivas + Quiz Biblico)
#2 | ESCOPO | Cobrir FASE 0 a FASE 3 do evolution_plan.md (P0-1 a P3-9 = 48 itens). NAO invadir FASE V2
#3 | LEITURA_OBRIGATORIA | Ler primeiro: evolution_plan.md, CLAUDE.md, docs/05_conteudo_pedagogico/README.md, orchestration/plan_investigation.md, orchestration/audit_report_v3.md, orchestration/qa_verdict_v3.md
#4 | MARCACAO | Marcar cada item entregue como `- [x]` com data `(entregue YYYY-MM-DD)` em evolution_plan.md
#5 | RESTRICAO_REGRAS | NAO modificar regras de negocio em CLAUDE.md secao "REGRAS DO PROJETO"
#6 | IDIOMA | Responder em portugues
#7 | MODO_CONTINUO | Rodar quantos ciclos forem necessarios ate esgotar escopo (sem +um-ciclo)
#8 | COMMIT_POR_MILESTONE | Cada milestone deve ter git commit com mensagem descritiva
#9 | EVIDENCIA | Cada item marcado `- [x]` deve ter evidencia concreta
#10 | TESTES_UNIT | Cada modulo de logica (matching, gamificacao, IA) com testes unitarios Jest
#11 | TESTES_E2E | Testes E2E Playwright em emulador Android para fluxos principais
#12 | VALIDACAO_VISUAL | Playwright + screenshots ANTES de marcar item de UI como concluido
#13 | TS_STRICT | TypeScript strict sem erros (tsc --noEmit)
#14 | LINT | ESLint sem warnings
#15 | QA_POR_FASE | Rodar solo-qa ao terminar cada fase para validar
#16 | DEP_USUARIO_P0_11 | P0-11: Revisar 100 amostras teologicas — NAO pode ser pulado, qualidade teologica critica
#17 | DEP_USUARIO_P3_4 | P3-4: Escolher GitHub Pages vs dominio proprio
#18 | DEP_USUARIO_P3_5 | P3-5: Criar Apple Developer account (OPCIONAL)
#19 | DEP_USUARIO_P3_6 | P3-6: Criar Google Play Developer account ($25)
#20 | ENTREGA_FINAL | Todos 48 itens FASE 0-3 marcados como `- [x]`, evolution_plan.md com datas, CHANGELOG.md v1.0.0, APK release gerado, relatorio final com versao/build/links/pendencias
#21 | GATILHO_PARADA | NAO pare prematuramente; rodar ate esgotar o escopo declarado
#22 | DEPENDENCIAS | Seguir dependencias entre milestones documentadas em evolution_plan.md
#23 | FASES_INSTRUCOES | Executar FASES canonicas: FASE 0/0.5/0.7/0.8/0.9/1/2/2.99/3
#24 | STATUS_UPDATE | Atualizar orchestration/status.md a cada gate

## Metadados

- Total: 24 | Tipos: [OBJETIVO, ESCOPO, RESTRICAO, INSTRUCAO, DEP_USUARIO, CRITERIO, ENTREGA]
- Heterogeneo: SIM (multiplas naturezas)
- Classificacao solo-roadmap: COMPLETE (cobre 100% do escopo declarado)