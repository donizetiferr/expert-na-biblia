# Blocked Versions — Expert Na Biblia

> Versoes BLOQUEADAS por dependencia externa (POR_USUARIO, POR_NOS, etc).
> Regra AUTONOMIA MAXIMA: BLOQUEADA_POR_NOS conta para circuit breaker; BLOQUEADA_POR_USUARIO NAO conta (pulada, loop segue).

## V3 — ITEM-18 (P0-11) — BLOQUEADA_POR_USUARIO

- **timestamp**: 2026-06-23
- **fase**: 2.5 (gate pos-qa, ciclo 0 — pre-execucao)
- **motivo**: Validacao teologica do conteudo gerado (P0-5 + P0-6) — REVISAO HUMANA de 100 amostras
- **detalhes**: usuario precisa revisar `docs/qa_conteudo_para_revisar.md` (a ser gerado apos V5 `npm run generate:questions`) e marcar OK/AJUSTAR/REJEITAR cada uma
- **dependencia_concreta**: REVISAO_HUMANA das 100 amostras teologicas (50 NT + 50 Teologia); qualidade teologica eh critica para publicacao
- **codigo_completo_passando**: SIM — implementacao automatica de geracao + selecao completa; falta apenas REVISAO HUMANA
- **acao_necessaria**: revisar `docs/qa_conteudo_para_revisar.md`; sinalizar conclusao (mensagem explicita)
- **re_tentavel**: SIM (revisao pode ser feita a qualquer momento)
- **default_se_sem_resposta**: BLOQUEIO ATIVO — qualidade teologica nao pode ser pulada; outras versoes autonomas continuam normalmente
- **persistente em**: `orchestration/pending_user_input.md` bloco `DEP_PENDENTE_VALIDACAO_TEOLOGICA`
- **efeito no loop**: PULA V3 + segue para V4-V6 (regra AUTONOMIA MAXIMA); V3 sera retomada em sessao futura quando usuario revisar

## (vazio — sem outras versoes bloqueadas ate V6)
