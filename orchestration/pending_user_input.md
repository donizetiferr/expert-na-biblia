# Pending User Input — Expert Na Biblia

> Persistente. Cada bloco abaixo representa uma dependencia do usuario.
> Quando usuario fornecer resposta, mover para `pending_user_input_processed_<timestamp>.md` e aplicar default declarado.

## DEP_PENDENTE_VALIDACAO_TEOLOGICA (P0-11)

- **fonte**: ITEM-18 do version_plan.md / P0-11 do evolution_plan.md
- **dependencia**: REVISAO HUMANA de 100 amostras teologicas (50 NT + 50 Teologia)
- **falta de voce**: revisar `docs/qa_conteudo_para_revisar.md` (a ser gerado apos `npm run generate:questions`) e marcar cada pergunta como OK / AJUSTAR / REJEITAR
- **concluo ao receber**: marcar P0-11 como `- [x] (entregue YYYY-MM-DD)` em evolution_plan.md e prosseguir para V4-V6; se >10% rejeitadas, voltar para P0-5/P0-6 com feedback
- **default_se_sem_resposta**: BLOQUEIO ATIVO ate sinalizacao (esta eh dependencia irredutivel — qualidade teologica eh critica, NAO pode ser pulada)
- **status**: AGUARDANDO_GERACAO_CONTEUDO (ainda precisamos rodar `npm run generate:questions` com MINIMAX_API_KEY para gerar data/planilhas/*.json; este passo sera feito em V5 quando ambiente tiver npm install + credenciais)
- **LOOP DE AUTONOMIA**: apos geracao, NAO commitar nada automaticamente — apenas gerar `docs/qa_conteudo_para_revisar.md` e aguardar input humano. Em execucao real, este arquivo sera apresentado no relatorio final do @full-cycle.

## DEP_PENDENTE_PRIVACY_HOST (P3-4) — futuro, sera persistido em V6

## DEP_PENDENTE_APPLE_DEV (P3-5) — futuro, sera persistido em V6

## DEP_PENDENTE_GOOGLE_PLAY_DEV (P3-6) — futuro, sera persistido em V6