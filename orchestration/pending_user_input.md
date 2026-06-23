# Pending User Input — Expert Na Biblia

> Persistente. Cada bloco abaixo representa uma dependencia do usuario.
> Quando usuario fornecer resposta, mover para `pending_user_input_processed_<timestamp>.md` e aplicar default declarado.

## DEP_PENDENTE_VALIDACAO_TEOLOGICA (P0-11)

- **fonte**: ITEM-18 do version_plan.md / P0-11 do evolution_plan.md
- **dependencia**: REVISAO HUMANA de 100 amostras teologicas (50 NT + 50 Teologia)
- **falta de voce**: revisar `docs/qa_conteudo_para_revisar.md` (a ser gerado apos `npm run generate:questions`) e marcar cada pergunta como OK / AJUSTAR / REJEITAR
- **concluo ao receber**: marcar P0-11 como `- [x] (entregue YYYY-MM-DD)` em evolution_plan.md e prosseguir para V4-V6; se >10% rejeitadas, voltar para P0-5/P0-6 com feedback
- **default_se_sem_resposta**: BLOQUEIO ATIVO ate sinalizacao (esta eh dependencia irredutivel — qualidade teologica eh critica, NAO pode ser pulada)
- **status**: AGUARDANDO_GERACAO_CONTEUDO (ainda precisamos rodar `npm run generate:questions` com MINIMAX_API_KEY para gerar data/planilhas/*.json; este passo sera feito quando ambiente tiver credenciais)
- **LOOP DE AUTONOMIA**: apos geracao, NAO commitar nada automaticamente — apenas gerar `docs/qa_conteudo_para_revisar.md` e aguardar input humano.

## DEP_PENDENTE_GOOGLE_PLAY_BUILD (P3-6 parcial)

- **fonte**: ITEM-48 do version_plan.md / P3-6 do evolution_plan.md
- **dependencia**: credencial EXPO_TOKEN para executar `eas build` (subagente sem credenciais locais)
- **falta de voce**: rodar localmente (no seu terminal) o seguinte:
  ```bash
  # 1. Instalar eas-cli (ja feito pelo subagente)
  # 2. Login: eas login  (usa sua conta Expo existente ou cria nova)
  # 3. Salvar EXPO_TOKEN em Tokens API e acessos/expo/credentials.md (loop de autonomia)
  # 4. Build: eas build --platform android --profile production --non-interactive
  # 5. Baixar .aab (~5-15 min) e seguir orchestration/play_store_checklist.md
  ```
- **concluo ao receber**: executar `eas submit --platform android --latest` automaticamente (submissao EAS Play Console)
- **default_se_sem_resposta**: BUILD AGUARDANDO EXECUCAO MANUAL — infraestrutura completa, falta apenas credencial + execucao local
- **status**: AGUARDANDO_EXPO_TOKEN_E_BUILD_MANUAL
- **LOOP DE AUTONOMIA**: apos salvar EXPO_TOKEN em `Tokens API e acessos/expo/credentials.md`, execucao futura fica 100% autonoma

## DEPENDENCIAS RESOLVIDAS 2026-06-23

### ~~DEP_PENDENTE_PRIVACY_HOST (P3-4)~~ — RESOLVIDO
- Antes: usuario escolher entre GitHub Pages (free) vs dominio proprio
- Resolvido: usuario escolheu GitHub Pages (2026-06-23)
- Resultado: https://donizetiferr.github.io/expert-na-biblia/privacy.html (HTTP 200 confirmado)

### ~~DEP_PENDENTE_APPLE_DEV (P3-5)~~ — REJEITADO
- Antes: conta Apple Developer Program + cartao de credito internacional ($99/ano)
- Resolvido: usuario REJEITOU iOS do escopo MVP (2026-06-23)
- Resultado: foco exclusivo em APK Android; iOS removido do escopo (ver evolution_plan.md "Itens rejeitados")
