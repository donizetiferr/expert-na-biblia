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

## DEP_PENDENTE_APPLE_DEV (P3-5)

- **fonte**: ITEM-47 do version_plan.md / P3-5 do evolution_plan.md
- **dependencia**: conta Apple Developer Program + cartao de credito internacional ($99/ano)
- **falta de voce**: criar Apple Developer account em https://developer.apple.com/ e adicionar cartao de credito
- **concluo ao receber**: prosseguir com `eas build --platform ios --profile production` e submeter para App Store Review
- **default_se_sem_resposta**: BLOQUEADO (App Store eh OPCIONAL — pode ficar para V2/futuro). iOS NAO bloqueia Android/publicacao Google Play.
- **status**: AGUARDANDO_CONTA_APPLE_DEV
- **LOOP DE AUTONOMIA**: apos criar conta, executar `eas init` + `eas build` automatico. Antes: iOS NAO sera publicado ate input.

## DEP_PENDENTE_GOOGLE_PLAY_DEV (P3-6)

- **fonte**: ITEM-48 do version_plan.md / P3-6 do evolution_plan.md
- **dependencia**: conta Google Play Developer + cartao de credito ($25 one-time)
- **falta de voce**: criar Google Play Developer account em https://play.google.com/console/ e pagar $25
- **concluo ao receber**: prosseguir com submissao do APK para revisao Google Play
- **default_se_sem_resposta**: BLOQUEADO (publicacao Google Play eh PRIORITARIA). Codigo do APK pronto (EAS Build production profile); falta apenas conta + submissao manual.
- **status**: AGUARDANDO_CONTA_GOOGLE_PLAY
- **LOOP DE AUTONOMIA**: apos criar conta, executar `eas submit --platform android --latest` automatico para envio. Antes: APK existe mas NAO esta na loja.

## DEP_PENDENTE_PRIVACY_HOST (P3-4)

- **fonte**: ITEM-45 do version_plan.md / P3-4 do evolution_plan.md
- **dependencia**: usuario escolher entre GitHub Pages (free) OU dominio proprio (R$10-15/ano)
- **falta de voce**: sinalizar preferencia — `gh pages` ou dominio customizado
- **concluo ao receber**: ativar GitHub Pages OU configurar dominio proprio com URL em app.json `extra.privacyPolicyUrl`
- **default_se_sem_resposta**: GITHUB_PAGES (mais simples, free). URL: `https://donizetiferr.github.io/expert-na-biblia/privacy`
- **status**: PREFERENCIA_NAO_SINALIZADA
- **LOOP DE AUTONOMIA**: se preferir dominio proprio, comprar e configurar DNS antes; caso contrario, GitHub Pages eh automatico via repo do projeto.