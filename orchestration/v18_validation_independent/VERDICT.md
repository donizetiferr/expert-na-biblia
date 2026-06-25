# Validação Independente V18 — Expert Na Bíblia (QA cético)

Data: 2026-06-25 | APK: C:\ENB\dist\ExpertNaBiblia-v18.0.0.apk (com.donizetiferr.expertnabiblia)
Emulador: emulator-5554 (motoraauto_smoke) com override de display 1080x1920 @ 420dpi (físico era 320x640, inválido p/ scoring).
Estado: app rodou em MODO OFFLINE o tempo todo (DNS do emulador caído: `ping api.minimax.io` = unknown host) → avaliação por IA Minimax NÃO testável neste ambiente; app usou fallback de match canônico local.
Sem crashes: nenhum FATAL EXCEPTION / Resources$NotFoundException / JS error no logcat; processo vivo a sessão inteira.

## VEREDITO FINAL: REPROVADO — NÃO está 100% conforme briefing e TEM bug crítico.
A afirmação do ciclo anterior ("14 telas 5/5, tudo perfeito") é REFUTADA. O modo LIÇÕES (modo primário do app, 40 módulos) está com a progressão COMPLETAMENTE QUEBRADA: nenhuma lição pode ser concluída a 100%, logo nada desbloqueia e o troféu é inalcançável. O modo QUIZ funciona bem.

---

## 1. Tabela por tela (score 1-5 vs mock)

| # | Tela | Score | Divergências concretas |
|---|------|-------|------------------------|
| 1 | Onboarding (intro logo + 3 slides) | 4 | Fundo roxo aparenta sólido/chapado, não degradê. Logo, personagem e copy OK. |
| 2 | Seleção de Modo | 5 | Bate com mock: fundo creme, logo frameless, ≡ laranja, 2 cards roxo-degradê c/ borda amarela. |
| 3 | Configurações | 4 | Funcional e completa (música/efeitos/volume/vibração/TTS/notif./reset). Título "CONFIGURAÇÕES" parcialmente coberto pelo banner MODO OFFLINE. Ícones de volume são emoji. |
| 4 | Lista de Módulos | 3 | Módulos travados em CINZA (mock mantém roxo+cadeado). Títulos SEM espaço: "AlfabetizaçãoBíblica", "Históriada Redenção". |
| 5 | Lições do Módulo | 4 | Estrutura OK (lição 1 livre, resto cadeado). Header com espaçamento correto. |
| 6 | Pergunta da Lição | 4 | Layout bate (progresso 1-10, quadro branco, campo "R:" roxo borda laranja, ENVIAR, ícones home/som). PORÉM usa o mascote ROXO; doc de identidade atribui o livro DOURADO ao modo Lições. |
| 7 | Feedback Certo | 5 | Degradê laranja, livro feliz + balão "Certo", badge "CORRETO!", quadro "RESPOSTA CORRETA". |
| 8 | Feedback Errado | 5 | Degradê laranja, badge "ERRADO!", quadro resposta, botões redondos VOLTAR/PROSSEGUIR. |
| 9 | Quiz — Tipo | 5 | Cards ALEATÓRIO (dado) / PERSONALIZADO (livros), borda amarela. |
| 10 | Quiz — Personalizar | 5 | Checkboxes, "X/20 selecionados", máx 20, INICIAR(N), selecionado vira laranja c/ check. Filtro de módulos CONFIRMADO correto (ver Jornada B). |
| 11 | Quiz — Jogar | 4 | Carrega 20q, timer 10s contando, timeout funciona. Sem estado "alternativa selecionada amarela circulada de preto" capturável (auto-avança); sem tela de feedback por-questão (doc Tela 7) — pode ser intencional. |
| 12 | Quiz — Placar | 3 | Degradê laranja OK, mas copy diverge: mostra "CONTINUE ESTUDANDO" + "0% — Reforce..." + botões VOLTAR AO MENU/JOGAR NOVAMENTE; briefing/mock pedem "NÃO DEU"/"QUASE LÁ"/"VOCÊ PASSOU!" + quadro branco "Você acertou X de 20" + personagem triste cabisbaixo + RECOMEÇAR. Personagem exibido é o "Errado" exclamando. |
| 13 | Final da Lição (final.tsx) | N/A | NÃO capturável — impossível concluir lição (bug crítico + teclado cobrindo ENVIAR). |
| 14 | Troféu Expert | N/A | INALCANÇÁVEL — exige 100% em todos os módulos, impossível dado o bug de scoring. |

---

## 2. BUGS encontrados

### CRÍTICO
**BUG-1 — Pontuação da lição NUNCA acumula → 100% impossível → progressão de Lições morta.**
- Repro: entrar em Módulo 1 → Lição 1 → responder Q1, Q2, Q3, Q4 TODAS corretas. O contador exibe "Acertos: 1" em TODAS (deveria ir 1,2,3,4). Confirmado empiricamente nas 4 telas de feedback.
- Causa-raiz (código):
  - `src/app/licoes/[moduloId]/[licaoId]/feedback.tsx` `handleProsseguir` (linhas 76-79): ao avançar de questão faz `router.replace` para a rota da lição passando só `{indice, moduloId, licaoId}` — NÃO repassa `acertos`.
  - `src/app/licoes/[moduloId]/[licaoId].tsx` (linha 36): `const [acertos, setAcertos] = useState(0)`. Cada PROSSEGUIR remonta a tela da lição com `acertos=0`. Logo `acertos_atual = 0 + (correto?1:0)` (linha 100) é sempre 1 (acerto) ou 0 (erro).
  - Score final (feedback.tsx linha 69): `Math.round(acertos / total_perguntas * 100)` = no máximo `1/10*100 = 10%`.
- Impacto: NENHUMA lição chega a 100% → nenhuma lição fica amarela (regra #3) → nenhum módulo desbloqueia (regra #2) → troféu "Expert" inalcançável. Quebra o objetivo central do app (modo Lições / 40 módulos progressivos). RELEASE-BLOCKER.

### ALTO
**BUG-2 — Respostas canônicas placeholder ("...") no banco.** 8 das 4.345 perguntas têm `resposta_canonica = '...'` (e 14 têm ≤5 chars), incluindo a **Lição 1 / Q7** ("A Bíblia foi escrita por uma única pessoa..."). Offline isso é INVENCÍVEL: `normalizar('...')` → '' → `matchCanonico` retorna FALHOU para qualquer input (matching.ts linha 237); e se o usuário digitar "..." é rejeitado como placeholder (linha 230). Bloqueia o caminho de conclusão offline já na 1ª lição. Outras: FB05-L10, FB07-L03, FB16-L05, FB17-L09, AT14-L15, AT15-L20, AT17-L14.

**BUG-3 — Teclado cobre o botão ENVIAR/PROSSEGUIR na tela de pergunta.** Com o teclado aberto, ENVIAR fica atrás do teclado (KeyboardAvoidingView não eleva o botão). O usuário precisa fechar o teclado manualmente para enviar. Atrapalha gravemente a UX do core da lição.

**BUG-4 — ENVIAR com resposta vazia navega para fora/abandona a lição** silenciosamente (sem mensagem de validação), em vez de bloquear o envio. Observado repetidamente.

### MÉDIO
**BUG-5 — Copy/visual do placar diverge do briefing** (ver tela 12): faltam "NÃO DEU/QUASE LÁ/VOCÊ PASSOU!", "Você acertou X de 20", e o personagem/poses corretos.
**BUG-6 — Mascote do modo Lições é o livro ROXO**; identidade visual define o livro DOURADO para Lições.
**BUG-7 — Títulos sem espaço na lista de módulos** ("AlfabetizaçãoBíblica", "Históriada Redenção"). Na tela Personalizar e no header da lição o espaçamento está correto → bug isolado no card da lista de módulos.
**BUG-8 — Banner MODO OFFLINE sobrepõe headers** (título de Configurações e de "Escolher os módulos" ficam cortados).
**BUG-9 — Módulos travados em cinza** vs mock (roxo com overlay de cadeado).

### BAIXO / AMBIENTE
- DNS caído no emulador → MODO OFFLINE → avaliação por IA (feature core) não testada aqui. App detecta offline e mostra banner (boa resiliência).
- Ícones de som/cadeado/volume são emoji/glyph (pendência conhecida MD.7 — registrado, não reprovado).
- Quiz: sem estado visível de "alternativa selecionada" e sem feedback por-questão (Tela 7) — possivelmente intencional.

---

## 3. Jornadas obrigatórias

- **A. Quiz Aleatório**: PASSA. Carrega 20 perguntas e joga, SEM travar em spinner (o bug principal histórico está REFUTADO). Timer de 10s conta e o timeout marca como errado e avança.
- **B. Quiz Personalizado**: PASSA. Seleção de módulos funciona (contador, máx 20, INICIAR habilita). Confirmado via DB que a 1ª pergunta servida pertence a FB02-L13 (módulo 02 selecionado) → filtro por módulos OK.
- **C. Completar Módulo 1 → lição amarela → desbloquear Módulo 2 → troféu**: FALHA (BUG-1). Impossível concluir lição a 100%. Módulo 1 permaneceu não-amarelo e Módulos 2-3 travados após tentativa. Troféu inalcançável.
- **D. Timer 10s / sem clique = erro**: PASSA (observado no quiz: Q2 expirou sem clique e avançou como erro).

---

## 4. Checklist de identidade visual (PASS/FAIL)

| Item | Resultado | Evidência |
|------|-----------|-----------|
| Gradientes reais (roxo e laranja) onde o briefing pede | PARCIAL | Laranja confirmado em feedback/placar; cards roxo-degradê OK; mas fundos de onboarding e da tela de pergunta parecem roxo CHAPADO, não degradê. |
| Personagem livro SEM moldura (frameless) | PASS | Personagem integrado ao fundo, sem caixa roxa com borda. |
| Logo/Troféu sem retângulo de fundo | PASS (logo) | Logo transparente. Troféu não visto. |
| Paleta confere (roxo/laranja/creme/preto) | PASS | Roxo ~#8b16c7→#3c026d, laranja, fundo creme ~#f7f4ed observados. |
| Tipografia Bangers (títulos) + Nunito (corpo) | PASS | Títulos comic display + corpo limpo arredondado. |
| Módulo/lição concluído fica AMARELO c/ borda/texto pretos | NÃO VERIFICÁVEL | Nenhuma lição conclui (BUG-1). |
| Quiz: alternativa selecionada vira degradê amarelo circulado de preto | NÃO OBSERVADO | Auto-avanço não permitiu capturar o estado. |
| Títulos de resultado e "Expert!" em degradê roxo c/ borda preta | PARCIAL/FAIL | "CONTINUE ESTUDANDO" é branco c/ borda preta (não roxo degradê); badges "CORRETO!/ERRADO!" são roxo sólido. "Expert!" do troféu não visto. |
| Ícones som/home/config presentes | PASS | Presentes (como emoji/glyph — MD.7). |

---

## 5. Capturas (orchestration/v18_validation_independent/)
Principais: 01_splash, 02/03/04_onboarding, 05_modos, 06_config, 08_lista_modulos, 09_licoes_modulo,
10_licao_pergunta, 11_quiz_index, 12_feedback (CORRETO), 13_quiz_aleatorio_load, 14_quiz_placar,
15_quiz_personalizado, 16_quiz_perso_jogar, 17_feedback_errado.
(probe_*.png = capturas auxiliares de navegação/diagnóstico.)

## Logcat (trecho relevante)
- Sem FATAL EXCEPTION / Resources$NotFoundException / JS error do app.
- Único erro recorrente: `io.grpc.internal ... ManagedChannel allocation site` (relacionado a rede/offline) — não-fatal.
- `ping api.minimax.io` → unknown host (DNS do emulador caído = causa do MODO OFFLINE).

## Prioridade de correção
1. BUG-1 (scoring da lição) — bloqueia 100% do modo Lições. Corrigir threading de `acertos` (passar acertos no router.replace e ler de params, OU mover o score para um store global/contexto que sobreviva à navegação).
2. BUG-2 (respostas "..." no banco) — regenerar as 8 canônicas faltantes (e revisar as ≤5 chars).
3. BUG-3/BUG-4 (teclado cobre ENVIAR / envio vazio navega fora) — UX do core.
4. BUG-5..9 (divergências de copy/identidade) — alinhar placar, mascote, espaçamento de títulos, banner overlay, estilo dos módulos travados.
