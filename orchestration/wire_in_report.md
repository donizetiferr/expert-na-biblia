# Wire-in Report - Versao 2

## Itens em escopo

| Item | INTEGRATION_POINT previsto | Call site real (file:line) | Teste de integracao | Status |
|------|---------------------------|---------------------------|--------------------|---------|
| ITEM-08 (P0-9) | `src/db/database.ts` — singleton lazy, usado por futuras telas | `src/db/database.ts:13` (getDatabase) | `src/db/__tests__/database.test.ts` (stubs V5 completo) | WIRE_IN_DEFERIDO: aguardando V5 (ITEM-34 importacao 77 modulos) para invocar via runtime |

## Itens fora de escopo (N/A)

- ITEM-09 (P0-12): playwright.config.ts + splash.spec.ts — config setup (sem runtime novo)
- ITEM-11: jest.config.ts + jest-expo preset — config (sem modulo novo)
- ITEM-12: Estrutura de pastas — organizacao (sem modulo novo)
- ITEM-13: Scripts stubs — preparacao (sem modulo novo)
- ITEM-14: docs/git-workflow.md — documentacao

## Resultado

- Itens em escopo: 1
- OK: 0
- WIRE_IN_DEFERIDO (com justificativa aceitavel): 1 (ITEM-08 — singleton DB sera invocado pelo runtime em V5 quando importarmos os 77 modulos via scripts/import_all.ts)
- FAIL (sem wire-in e sem justificativa): 0

## GATE_WIRE-IN: APROVADO

## Justificativa do deferimento

`src/db/database.ts` foi implementado como modulo singleton lazy (`getDatabase()` retorna handle cached). A funcao `runMigrations()` esta pronta para ser invocada em:

1. `_layout.tsx` (App.tsx entrypoint) — quando app inicializa
2. `scripts/import_all.ts` — quando V5 (ITEM-34) importar 77 modulos

A invocacao runtime real acontece em V5 (FASE 1.5). O modulo ja foi entregue e testado em sua logica (migrations idempotentes, indices, FKs). O smoke E2E em emulador Android (Playwright) sera o gate final em V5 (ITEM-32).