# User Input - 2026-06-23

## Texto original do usuario
[copia integral em orchestration/user_apontamentos.md]

## Apontamentos estruturados (re-confirmados a partir do wrapper; nenhum novo adicionado)

1. **[OBJETIVO]** — Implementar projeto Expert Na Biblia — app mobile Android+iOS ludico com 2 modos (Licoes progressivas + Quiz Biblico)
2. **[ESCOPO]** — Cobrir FASE 0 a FASE 3 do evolution_plan.md (P0-1 a P3-9 = 48 itens). NAO invadir FASE V2
3. **[INSTRUCAO]** — LEITURA_OBRIGATORIA: ler primeiro evolution_plan.md, CLAUDE.md, docs/05_conteudo_pedagogico/README.md, orchestration/plan_investigation.md, orchestration/audit_report_v3.md, orchestration/qa_verdict_v3.md
4. **[INFRA]** — MARCACAO: cada item entregue como `- [x]` com data `(entregue YYYY-MM-DD)` em evolution_plan.md
5. **[RESTRICAO]** — NAO modificar regras de negocio em CLAUDE.md secao "REGRAS DO PROJETO"
6. **[INSTRUCAO]** — RESPONDER em portugues
7. **[INSTRUCAO]** — MODO_CONTINUO: rodar quantos ciclos forem necessarios (sem +um-ciclo)
8. **[INFRA]** — COMMIT_POR_MILESTONE: cada milestone deve ter git commit com mensagem descritiva
9. **[INFRA]** — EVIDENCIA: cada item marcado `- [x]` deve ter evidencia concreta
10. **[INFRA]** — TESTES_UNIT: cada modulo de logica (matching, gamificacao, IA) com testes unitarios Jest
11. **[INFRA]** — TESTES_E2E: testes E2E Playwright em emulador Android para fluxos principais
12. **[INFRA]** — VALIDACAO_VISUAL: Playwright + screenshots ANTES de marcar item de UI como concluido
13. **[INFRA]** — TS_STRICT: TypeScript strict sem erros (tsc --noEmit)
14. **[INFRA]** — LINT: ESLint sem warnings
15. **[INFRA]** — QA_POR_FASE: rodar solo-qa ao terminar cada fase para validar
16. **[DEP_USUARIO]** — P0-11: Revisar 100 amostras teologicas — NAO pode ser pulado, qualidade teologica critica
17. **[DEP_USUARIO]** — P3-4: Escolher GitHub Pages vs dominio proprio
18. **[DEP_USUARIO]** — P3-5: Criar Apple Developer account (OPCIONAL)
19. **[DEP_USUARIO]** — P3-6: Criar Google Play Developer account ($25)
20. **[OBJETIVO]** — ENTREGA_FINAL: 48 itens marcados, evolution_plan.md com datas, CHANGELOG.md v1.0.0, APK release gerado, relatorio final
21. **[INSTRUCAO]** — NAO pare prematuramente; rodar ate esgotar o escopo declarado
22. **[INFRA]** — DEPENDENCIAS: seguir dependencias entre milestones documentadas em evolution_plan.md
23. **[INSTRUCAO]** — FASES canonicas: FASE 0/0.5/0.7/0.8/0.9/1/2/2.99/3
24. **[INFRA]** — STATUS_UPDATE: atualizar orchestration/status.md a cada gate

## Metadados
- Total de apontamentos estruturados: 24
- Tipos presentes: OBJETIVO, ESCOPO, INSTRUCAO, INFRA, RESTRICAO, DEP_USUARIO
- Eh heterogeneo? SIM (6 tipos distintos) — confirma modo COMPLETE
- Modo final: COMPLETE
- Reclassificacao: NAO (input ja era COMPLETE)