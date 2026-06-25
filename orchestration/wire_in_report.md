# Wire-in Report - Versao V18.1 (Foundation)

## Itens em escopo (criam modulo/funcao exportada nova)
| Item | INTEGRATION_POINT | Call site real (file:line) | Teste | Status |
|------|-------------------|---------------------------|-------|--------|
| MA.1 listarPerguntasAleatorias / carregarPerguntasQuiz | quiz/jogar.tsx carregarPerguntas() | src/app/quiz/jogar.tsx:97 | quiz-loader.test.ts + db-queries-v18.test.ts | OK |
| MA.5 marcarModuloConcluido / moduloEstaCompleto | licao 100% final.tsx handleAvancar | src/app/licoes/[moduloId]/[licaoId]/final.tsx:83,85 | db-queries-v18.test.ts | OK |
| MA.5 progressao.moduloLiberado | licoes/index.tsx renderItem | src/app/licoes/index.tsx:29 | progressao.test.ts | OK |

## Itens fora de escopo (N/A)
- ME.1 (instalar deps), ME.2 (tsc em codigo existente), MA.2/MA.3/MA.4 (modificam telas existentes)

## Resultado: 3 em escopo, 3 OK, 0 deferido, 0 FAIL
## GATE_WIRE-IN: APROVADO
