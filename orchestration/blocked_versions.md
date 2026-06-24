# Blocked Versions — Expert Na Biblia

> Versoes BLOQUEADAS por dependencia externa (POR_USUARIO, POR_NOS, etc).
> Regra AUTONOMIA MAXIMA: BLOQUEADA_POR_NOS conta para circuit breaker; BLOQUEADA_POR_USUARIO NAO conta (pulada, loop segue).

## V[M1.1] — Geracao de respostas canonicas via M2.7 — BLOQUEADA_POR_USUARIO

- **timestamp**: 2026-06-24
- **fase**: M1.1 (batch retomado, parado apos 93 sucessos)
- **motivo**: Quota mensal do Token Plan Minimax M2.7 estourada (HTTP 429, code 2062, "Token Plan rate limit reached")
- **detalhes**: M1.1 batch retomou em background com concurrency 6 e processou 93 sucessos em ~3min. Apos isso, todas as 700+ chamadas subsequentes retornaram HTTP 429. Teste direto confirmou que o limiter do Token Plan M2.7 esta ativo ate reset mensal. Nao ha credencial OpenAI instalada em `Tokens API e acessos/openai/` para ativar fallback (CLAUDE.md previa fallback OpenAI GPT-4o-mini).
- **dependencia_concreta**: (a) upgrade do Token Plan M2.7 (https://platform.minimax.io/account/billing) OU (b) switch para pay-as-you-go M2.7 (sem rate limit) OU (c) instalacao de OPENAI_API_KEY em `Tokens API e acessos/openai/credentials.env` para ativar fallback.
- **codigo_completo_passando**: SIM — script `scripts/generate_canonicos_v9.js` esta funcional; checkpoint em `data/checkpoint_v9.json` (1592 IDs ja processados). Falta apenas API disponivel.
- **acao_necessaria**: executar uma das 3 opcoes acima e depois `node scripts/generate_canonicos_v9.js --resume --concurrency 4` (concurrency menor = menos chance de bater rate limit). ~2h45min para zerar 2753 restantes.
- **re_tentavel**: SIM (assim que quota reabrir ou credencial OpenAI for instalada)
- **default_se_sem_resposta**: BLOQUEIO ATIVO; loop segue em outras tarefas autonomas (M3.2 OK, M4 polish OK, M3.3 em build)
- **persistente em**: `orchestration/pending_user_input.md` bloco `DEP_PENDENTE_QUOTA_M2_7`

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

## V6 — Decisoes 2026-06-23 — RESOLVIDAS nesta sessao

### P3-4 (Privacy Policy) — RESOLVIDO 2026-06-23
- Antes: BLOQUEADA_POR_USUARIO (usuario precisava escolher GitHub Pages vs dominio proprio)
- Depois: **AUTONOMO** — usuario escolheu GitHub Pages free
- Acao tomada: repo tornado publico, Pages ativado, privacy.html publicado em https://donizetiferr.github.io/expert-na-biblia/privacy.html (HTTP 200 confirmado)
- Status: **CONCLUIDO** — URL pronta para Google Play Console

### P3-5 (iOS / App Store) — REJEITADO 2026-06-23
- Antes: BLOQUEADA_POR_USUARIO (Apple Developer account + $99/ano)
- Depois: **REJEITADO** — fora do escopo MVP, foco exclusivo Android
- Acao tomada: removido de pending_user_input.md; movido para "Itens rejeitados" do evolution_plan.md
- Status: **REJEITADO** — sem acao futura obrigatoria

### P3-6 (Google Play) — PARCIALMENTE RESOLVIDO 2026-06-23
- Antes: BLOQUEADA_POR_USUARIO (conta + $25 + submissao)
- Depois: **PARCIAL** — usuario JA TEM conta `donizetiferr` (sem custo adicional)
- Pendente: build AAB real requer `eas login` + `EXPO_TOKEN` (credenciais locais do usuario)
- Acao tomada: infraestrutura completa (eas.json, scripts/build-release.sh, release_artifacts.md, play_store_checklist.md, package.json fix); execucao do build + submissao documentada para o usuario
- Status: **INFRA PRONTA + AGUARDANDO EXECUCAO MANUAL** (subagente sem EXPO_TOKEN)
