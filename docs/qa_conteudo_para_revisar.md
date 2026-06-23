# QA Conteudo Para Revisao — Expert Na Biblia

> Data: 2026-06-23 (template — preenchido apos `npm run generate:questions` + `npm run select_samples`)
> Total: 100 amostras (50 NT + 50 Teologia)
> Revisao humana necessaria antes da publicacao (P0-11 — BLOQUEADA_POR_USUARIO)

## Status

**Template** — arquivo sera preenchido quando `data/planilhas/5_a_NT_completo.json` e `data/planilhas/6_a_Teologia.json` estiverem populados.

## Pre-requisitos para geracao deste arquivo

1. Credencial `MINIMAX_API_KEY` configurada (em Tokens API e acessos/minimax/credentials.md)
2. `npm install` executado
3. `npm run generate:questions` rodado (~25h de maquina para 6.500 perguntas)
4. `npm run select_samples` para gerar este markdown

## Instrucoes para o revisor (quando preenchido)

Para cada pergunta abaixo, marque uma das opcoes:
- [ ] OK — Conteudo teologicamente correto
- [ ] AJUSTAR (nota: ___) — Conteudo correto mas precisa de refinamento
- [ ] REJEITAR (motivo: ___) — Conteudo teologicamente incorreto ou heresia

Se >10% rejeitadas, voltar para P0-5/P0-6 com feedback.

## Amostras

_(lista sera preenchida apos execucao dos scripts)_

---

## Comando para executar apos geracao do conteudo

```bash
export MINIMAX_API_KEY=<sua-chave-M3>
npm run generate:questions    # ~25h
npm run select_samples        # gera este markdown
# Apresentar este arquivo ao usuario para revisao manual
```

## Bloqueio ate revisao

Apos revisao:
- Se <10% rejeitadas: marcar P0-11 como entregue, prosseguir para V4-V6
- Se >10% rejeitadas: voltar para P0-5/P0-6 com feedback do revisor

Ver `orchestration/pending_user_input.md` bloco `DEP_PENDENTE_VALIDACAO_TEOLOGICA`.