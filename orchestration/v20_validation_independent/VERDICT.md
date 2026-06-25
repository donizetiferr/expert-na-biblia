# Validação Independente V20 — Expert Na Bíblia (QA cético)

Data: 2026-06-25 | APK: C:\ENB\dist\ExpertNaBiblia-v20.0.0.apk (com.donizetiferr.expertnabiblia)
Build conferido: MD5 do APK == MD5 do base.apk instalado (a84d7ce34a177ade1e5ea749c131f77d) → estou testando exatamente o v20. App reinstalado com `install -r` + `pm clear` (estado limpo). versionName=1.10.0 / versionCode=5.
Emulador: emulator-5554 (motoraauto_smoke) com override 1080x1920 @ 420dpi (físico 320x640 — resetado ao final).
REDE: ONLINE. `ping api.minimax.io` resolveu e respondeu (~500ms). Diferente das QAs anteriores (offline) → **avaliação por IA foi efetivamente testada online**.
Crashes: NENHUM. Sem FATAL EXCEPTION / Resources$NotFoundException / JS error fatal no logcat a sessão inteira; processo vivo o tempo todo.

## VEREDITO FINAL: APROVADO COM RESSALVAS — sem release-blocker, mas NÃO está 100% sem bugs.
A fabricação do ciclo V18 ("modo Lições com progressão morta") é REFUTADA pela evidência fresca: o **release-blocker BUG-1 (scoring) está corrigido** e a jornada de progressão funciona ponta a ponta (cheguei a 100%, lição ficou amarela, próxima desbloqueou, troféu alcançável). A identidade de duplo-mascote (V20) está implementada (Lições=DOURADO, Quiz=ROXO). Restam 3 itens reais não-bloqueantes: confiabilidade da IA (timeout de 10s curto para o M2.7), 1 resposta canônica "..." residual na Lição 1, e omissão de acentos no copy do onboarding.

---

## 1. Tabela por tela (score 1-5 vs mock)

| # | Tela | Score | Observações / divergências |
|---|------|-------|----------------------------|
| 1 | Splash | 4 | Splash nativa configurada (logo sobre #3c026d), transição rápida para onboarding. Não isolada em screenshot dedicado (some rápido); funcional. |
| 2 | Onboarding (3 slides) | 4 | Visual ótimo (gradiente roxo real, mascote roxo, Bangers). DIVERGÊNCIA: copy SEM acentos — "Licoes", "Biblico", "COMECAR", "licao", "proxima", "trofeu". (01/02/03) |
| 3 | Seleção de Modo | 5 | Creme, logo frameless, ≡ laranja, 2 cards roxo-degradê borda amarela, acentos corretos. (04) |
| 4 | Configurações | 5 | Completa (música/efeitos/volumes/vibração/TTS/notif./reset). Título "CONFIGURAÇÕES" 100% visível (sem banner offline sobreposto). Ícones de volume = emoji/glyph (pendência conhecida). (05) |
| 5 | Lista de Módulos | 5 | BUG-7 (V18) CORRIGIDO: "Alfabetização Bíblica" com espaço correto. Módulo 01 livre; 02-03 roxo-escurecido + cadeado (não cinza). (06) |
| 6 | Lições do Módulo | 5 | Lição 1 livre, 2-6 cadeado; header espaçado. (07) |
| 7 | Pergunta da Lição | 5 | Mascote **DOURADO** (regra V20 ✓), gradiente roxo, quadro branco borda preta, campo "R:" roxo borda laranja, ENVIAR, ícones home/som. (08) |
| 8 | Loading IA | 5 | Botão entra em estado "AVALIANDO..." com spinner enquanto a IA processa (regra #4). (11) |
| 9 | Feedback Certo | 5 | DOURADO feliz, balão "CORRETO!", quadro "RESPOSTA CORRETA", feedback da IA quando avaliado por LLM, "X de 10 · Acertos: N". (12/13/14) |
| 10 | Feedback Errado | 5 | DOURADO (pose "questionando" — reuso documentado, só há 3 poses douradas), balão "ERRADO!", resposta correta + explicação da IA, botões VOLTAR/PROSSEGUIR. (25) |
| 11 | Final da Lição — 100% | 5 | "VOCÊ PASSOU!" + DOURADO exclamando + "Lição concluída com 100%" + "PRÓXIMA LIÇÃO". (16) |
| 11b | Final da Lição — <50%/>50% | N/V | Não capturado direto p/ lições; o componente é o mesmo do placar do quiz ("NÃO DEU" capturado). |
| 12 | Quiz — Tipo | 5 | "QUIZ BÍBLICO", cards ALEATÓRIO (dado) / PERSONALIZADO (livros), borda amarela. Subtítulo "modulos aleatorios" sem acento. (18) |
| 13 | Quiz — Personalizar | 5 | "ESCOLHA OS MÓDULOS", checkboxes, "X/20 selecionados", selecionado vira LARANJA c/ check, "INICIAR(N)" habilita. (22/23) |
| 14 | Quiz — Jogar | 5 | Carrega 20q SEM spinner, timer 10s contando, alternativa selecionada = **degradê AMARELO circulado de PRETO, letra preta** (mock ✓ — V18 não conseguiu capturar). Opção D "NAO SEI" sem acento. (19/20) |
| 15 | Quiz — Placar | 5 | BUG-5 (V18) CORRIGIDO: mascote **ROXO** "Errado", "NÃO DEU", quadro "Você acertou 0 de 20", "RECOMEÇAR". (21) |
| 16 | Troféu Expert | 5 | Troféu dourado, confetes roxo/dourado, "Parabéns, você é um Expert!" (Expert! em degradê), "RECOMEÇAR". Acessado via deep link `expertnabiblia://trofeu`. (24) |

---

## 2. Mascote por modo (regra de identidade V20) — PASS
- **Lições = livro DOURADO**: confirmado em todas as telas de lição (pergunta, feedback certo, feedback errado, final 100%). Screenshots 08, 12, 13, 14, 16, 25.
- **Quiz = livro ROXO**: confirmado no placar do quiz com balão "Errado". Screenshot 21. (Onboarding também usa o roxo, ok.)
- Nota honesta: só há 3 poses douradas reais; o estado "errado" das lições reusa a pose dourada neutra/questionando (documentado no código). O ponto central — dourado ≠ roxo por modo — está cumprido.

## 3. IA obrigatória nas lições (regra #4) — TESTADA ONLINE, FUNCIONA (porém intermitente)
Evidência empírica de chamadas roteadas à IA (match local < 0.85 → M2.7):
- **L01-Q02** ("significa coleção de livros…"): veredito REAL do LLM, feedback com etimologia grega ("A palavra 'Bíblia' vem do grego βιβλία…"), score 1.00 → CORRETO. (13)
- **L01-Q07** (canônica "..."): só passou porque a IA respondeu (score 0.80) e devolveu `resposta_esperada` própria ("Não. A Bíblia foi escrita por cerca de 40 autores…"). (14)
- **L02-Q01** (resposta deliberadamente errada): IA retornou correto=false + explicação substantiva ("…39 livros … 27 livros … 66 livros…"), score 0.00. (25)
- **L01-Q01** (1ª tentativa): FALHOU → tela mostrou "Avaliacao automatica indisponivel. Confirme com a resposta exibida." e o veredito caiu no match local (score 0.70). (12)

Placar do meu teste: 3 de 4 chamadas à IA retornaram veredito real do LLM; 1 caiu no fallback.

Causa-raiz da intermitência (investigada): a chave Minimax embutida no APK é VÁLIDA (testei direto: HTTP 200, JSON correto com max_tokens=600) e o parser `extrairAvaliacaoJson` está correto. O problema é latência: medi o M2.7 em **4.4s / 9.4s / 20.4s** (modelo de raciocínio, latência muito variável), enquanto `src/lib/m3.ts` usa `TIMEOUT_MS = 10000` (10s). Quando o M2.7 passa de 10s → AbortError → erro "M3_TIMEOUT" (que NÃO casa com a regex /network|fetch|abort/) → cai para OpenAI; se também falhar → fallback "Avaliacao automatica indisponivel" + decisão pelo match local. O fallback é gracioso (não trava, não crasha), mas o recurso-âncora do produto não é 100% confiável.

## 4. Jornada de progressão (não regrediu) — PASS
- **Completar Lição 1 a 100%**: cheguei a 10/10 (Acertos: 10) digitando respostas reais. (16: "VOCÊ PASSOU! / Lição concluída com 100%")
- **Lição vira AMARELA + próxima desbloqueia**: Lição 01 ficou amarela com badge "✓ 100/100"; Lição 02 desbloqueou (sem cadeado); 03-06 seguem cadeadas. (17)
- **Acumulação de acertos robusta**: o contador acumulou 1→2→3…→10; inclusive tratou corretamente um caminho erro→retry no Q08 sem duplicar (mostrou "8 de 10 · Acertos: 8"). BUG-1 do V18 definitivamente CORRIGIDO.
- **Persistência**: após force-stop + relaunch, Lição 01 continuou amarela e Lição 02 desbloqueada (SQLite ok).
- **Troféu**: alcançável; tela renderiza corretamente (24).
- **Quiz aleatório jogável sem spinner**: PASS (carregou 20q, timer, jogou até o placar). (19/21)

## 5. Checklist de identidade (PASS/FAIL)
| Item | Resultado | Evidência |
|------|-----------|-----------|
| Gradientes roxo/laranja reais (não chapado) | PASS | Onboarding roxo-degradê; feedback/placar laranja-degradê; cards roxo-degradê; troféu. (V18 dizia onboarding chapado — agora é gradiente visível.) |
| Personagem frameless (sem moldura) | PASS | Mascotes integrados ao fundo, sem caixa. |
| Paleta (roxo/laranja/creme/preto) | PASS | #8b16c7→#3c026d, laranja, creme, preto observados. |
| Bangers (títulos) + Nunito (corpo) | PASS | Títulos comic display + corpo arredondado. |
| Módulo/lição concluído AMARELO borda/texto pretos | PASS | Lição 01 amarela com "✓ 100/100". (17) |
| Quiz: alternativa selecionada amarela circulada de preto | PASS | Screenshot 20 (letra preta, borda preta grossa, fundo amarelo-degradê). |
| "Expert!" / títulos de resultado em degradê c/ borda preta | PASS (parcial) | Troféu "Expert!" em degradê c/ borda; "NÃO DEU"/"VOCÊ PASSOU!" branco c/ borda preta (não roxo-degradê, mas legível e fiel ao gibi). |
| Copy do placar "NÃO DEU/QUASE LÁ/VOCÊ PASSOU!" | PASS | "NÃO DEU" (quiz) + "VOCÊ PASSOU!" (lição) confirmados; "QUASE LÁ" não capturado (mesmo componente). |
| Ícones som/home/config presentes | PASS | Presentes (volume/cadeado = emoji/glyph — pendência conhecida). |

---

## 6. Bugs / ressalvas encontradas (V20)

### MÉDIO / ALTO
- **IA-1 — Avaliação por IA intermitente (timeout 10s vs latência do M2.7).** O M2.7 frequentemente passa de 10s; quando isso ocorre o app aborta e (se OpenAI também falhar) exibe "Avaliacao automatica indisponivel", decidindo pelo match local. Repro: responder lição online; ~25% das chamadas no meu teste caíram no fallback. Correção sugerida: subir `TIMEOUT_MS` (ex.: 25-30s) em `src/lib/m3.ts`, e/ou reduzir o raciocínio do M2.7 (prompt "sem think"/modelo não-reasoning), e tratar "M3_TIMEOUT" como erro de conexão (mensagem amigável "sem conexão" em vez de "indisponível").

### MÉDIO
- **DB-1 — Resposta canônica "..." residual em FB01-L01-Q07** (Lição 1, Q7). O V18 tinha 8; agora só resta 1, mas é justamente na 1ª lição. Sem canônica válida, a Q07 só é vencível se a IA responder em tempo; se a IA cair no fallback, a Q07 fica inalcançável (match local 0) e a tela mostraria "Resposta correta: ..." (quebrado). Demais ≤5 chars são legítimas ("Jesus", "Grego", "Sinai", "Fé"). Correção: regenerar a canônica de FB01-L01-Q07.

### BAIXO (polish)
- **COPY-1 — Onboarding sem acentos**: "Licoes", "Biblico", "COMECAR", "licao", "proxima", "trofeu" (slides 1-3). Restante do app tem acentos corretos.
- **COPY-2 — Pequenas omissões de acento**: opção "NAO SEI" no quiz; subtítulo "modulos aleatorios" na tela de tipo do quiz.
- **UI-1 — Ícones de volume/cadeado são emoji/glyph** (pendência conhecida MD.7), não ícones desenhados.
- **WARN-1 — Warnings expo-router não-fatais**: `[Layout children]: No route named "licoes"/"quiz" exists in nested children` repetidos no logcat. Navegação funciona normalmente; ruído a limpar.

### Itens do V18 — status nesta validação
BUG-1 (scoring) CORRIGIDO ✓ · BUG-2 ("...") MAJORITARIAMENTE corrigido (8→1) ✓~ · BUG-5 (copy placar) CORRIGIDO ✓ · BUG-6 (mascote lições roxo) CORRIGIDO (agora dourado) ✓ · BUG-7 (títulos sem espaço) CORRIGIDO ✓ · BUG-9 (módulos cinza) CORRIGIDO (roxo+cadeado) ✓ · BUG-8 (banner offline sobrepõe) não reproduzido (online) · BUG-3/BUG-4 (teclado/validação) corrigidos no código (ScrollView + tecla "send" + validação de vazio); usei a ação "send" do IME com sucesso.

## 7. Capturas (orchestration/v20_validation_independent/)
01_splash · 02/03_onboarding · 04_modos · 05_config · 06_lista_modulos · 07_licoes_modulo · 08_licao_pergunta_DOURADO · 11_licao_loading · 12/13/14_licao_veredito (CORRETO + IA) · 16_final_licao_100 · 17_licoes_pos100 (lição amarela + desbloqueio) · 18_quiz_tipo · 19_quiz_jogar · 20_quiz_selecionado (amarelo circulado preto) · 21_quiz_placar (NÃO DEU + mascote ROXO) · 22/23_quiz_customizar · 24_trofeu · 25_feedback_errado. (arquivos _*.png = auxiliares de navegação.)

## 8. Prioridade de correção
1. IA-1 — ajustar timeout/modelo para a IA ser confiável online (recurso-âncora do produto).
2. DB-1 — regenerar canônica de FB01-L01-Q07.
3. COPY-1/COPY-2 — acentuar copy do onboarding e opção "NÃO SEI".
4. UI-1 / WARN-1 — ícones desenhados e limpeza dos warnings de rota.
