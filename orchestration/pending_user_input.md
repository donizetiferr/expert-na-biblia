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

## V23.7 / G.1 — SEGURANCA (parte autonoma feita; sobra acao humana)

> Parte AUTONOMA do G.1 ja feita por @full-cycle (2026-06-27): token Minimax removido de
> `scripts/generate_canonicos.py` (agora le do cofre/env); `orchestration/release_keystore_credentials.md`
> removido do tracking + adicionado ao `.gitignore` (permanece no disco). Sobra acao humana irredutivel:

### G1_REVOGAR_TOKEN_MINIMAX
- **falta de voce**: o token Minimax `sk-cp-OZy9Fk...` esteve HARDCODED em `scripts/generate_canonicos.py`
  (no historico do git — repo privado, mas exposto). Recomendado ROTACIONAR: gerar token novo na conta
  Minimax (revogar o antigo) -> atualizar `Tokens API e acessos/minimax/credentials.env` -> rebuildar.
- **por que nao fiz**: rotacionar quebraria a IA do app ate o rebuild + exige sua conta Minimax.
- **default_se_sem_resposta**: token antigo continua valido (risco aceito enquanto o repo for privado).

### G1_NOVO_KEYSTORE
- **falta de voce**: a senha do keystore de release (`expert2026`) esteve em arquivo versionado (historico).
  Antes da 1a publicacao na Play Store, gerar KEYSTORE NOVO com senha forte:
  `keytool -genkeypair -keystore C:\ENB\android\app\expert-na-biblia-release-v2.keystore -alias expert-na-biblia -keyalg RSA -keysize 2048 -validity 10000 -storepass <SENHA_FORTE> -keypass <SENHA_FORTE> -dname "CN=Expert Na Biblia, OU=Mobile Apps, O=Donizeti, L=Brasilia, ST=DF, C=BR"`
  depois apontar `android/app/build.gradle` (signingConfig) p/ o novo keystore + guardar a senha no cofre.
- **por que nao fiz**: trocar keystore muda a IDENTIDADE de assinatura — decisao deliberada sua. App ainda
  NAO publicado, entao trocar agora eh seguro e recomendado.
- **default_se_sem_resposta**: keystore atual funcional p/ builds locais (troca so eh critica antes da loja).

### G1_FILTER_REPO (opcional)
- **falta de voce**: decidir se vale `git filter-repo` p/ apagar do HISTORICO o token + senha (arquivos
  atuais ja limpos/destrackeados; historico ainda contem os segredos antigos).
- **por que nao fiz**: reescrever historico eh destrutivo (forca push, reescreve SHAs) — exige sua aprovacao.
- **default_se_sem_resposta**: repo privado + segredos rotacionados (acima) -> aceitar historico como esta.
