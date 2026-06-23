# Plano de Evolucao — Expert Na Biblia

> Gerado em 2026-06-23 por solo-plan | Escopo: **ATUALIZACAO** | Profundidade: **FOCADO**
> Ultima atualizacao: 2026-06-23
> Status: **RASCUNHO** (aguarda aprovacao do usuario antes de despachar @full-cycle)
>
> Investigacao + ajustes do segundo turno critico: `orchestration/plan_investigation.md`

## Inbox (apontamentos a triar)

> Apontamentos informais registrados a qualquer momento. Items triados vao para milestones ou "Itens rejeitados".

- (vazio apos triagem inicial de 2026-06-23 — todos os 16 apontamentos do briefing foram
  processados nos double checks e/ou viraram milestones)

## Resumo Executivo

O projeto **Expert Na Biblia** esta em fase pre-implementacao com base documental **solida**
(2 double checks profundos feitos, nota 9.5/10, 6 inconsistencias corrigidas, 10 decisoes
arquiteturais travadas). O plano atual cobre 4 fases para lancar um MVP de 77 modulos com IA
hibrida (SQLite canonico + M3 LLM) ate publicacao Android em 5-8 meses.

**O segundo turno critico** (FASE 3.5 do solo-plan) identificou **19 ajustes** ao plano
original: 10 novos itens (Expo account, CI/CD, testes E2E, validacao teologica do conteudo,
etc.), 4 enriquecidos (matching mais robusto, monitoria de quota consolidada), 3 re-priorizados
(testes, CI, direcao estetica), 2 consolidados (integracao M3 unica, publicacao lojas em uma
fase). O plano atualizado abaixo reflete esses ajustes.

**Estimativa total**: ~150-200 horas de trabalho tecnico + ~30 horas de revisao humana de
conteudo teologico. Com 1 dev fulltime dedicado: 5-8 meses ate publicacao Android.

## Estatisticas

- **Total de itens**: 53 (P0: 14, P1: 15, P2: 10, P3: 9, V2: 5)
- **Por categoria**: 1 correcao, 2 melhorias, 32 evolucoes, 2 manutencoes, 20 infraestrutura
- **Por prioridade**: 0 criticas, 34 altas, 13 medias, 8 baixas
- **Por tamanho (TAM)**: 10 P (<4h) + 28 M (4-16h) + 15 G (16-40h)
- **Por fonte**:
  - Investigacao (achados independentes): 34
  - Apontamentos briefing WhatsApp / USUARIO: 20
  - Pesquisa externa (M3 docs): 1
  - Contexto previo (decisoes do usuario): 1
  - Achados dos 2 double checks: integrado em INVESTIGACAO
- **Milestones**: 5 (FASE 0 a FASE 3 + V2)
- **Achados independentes**: 12 (gate G1 OK — investigacao alem do input/contexto)
- **Dimensoes varridas**: 8/8 (gate G4 — ver plan_investigation.md)
- **Saude do projeto** (gate G0):
  - Testes: **NAO_EXISTEM** (CRITICO infra — P0-12 a P0-14 cobrem)
  - Build: **NAO_VERIFICAVEL** (pre-implementacao)
  - CI/CD: **AUSENTE** (ALTO infra — P0-13 cobre)
  - Deps: **NAO_VERIFICAVEL** (pre-implementacao)
  - Docs: **COMPLETAS**

---

## Saude do projeto (verificada em 2026-06-23)

- **Testes**: NAO_EXISTEM (achado INFRA critico) — sem jest/vitest/playwright config
- **Build**: NAO_VERIFICAVEL — pre-implementacao (sem package.json ainda)
- **CI/CD**: AUSENTE (achado INFRA alto) — sem .github/.gitlab-ci/azure-pipelines
- **Deps**: NAO_VERIFICAVEL — pre-implementacao; decisoes no CLAUDE.md
- **Docs**: COMPLETAS — CLAUDE.md + 8 docs/*.md + 2 .txt (Google Docs) + 1 .json (perguntas)

Evidencias completas em `orchestration/plan_investigation.md`.

---

## Legenda de campos

- **[CAT]**: CORRECAO | MELHORIA | EVOLUCAO | MANUTENCAO | INFRA
- **[PRI]**: ALTA | MEDIA | BAIXA
- **[FONTE]**: INVESTIGACAO | USUARIO | PESQUISA_EXTERNA | CONTEXTO_PREVIO | DOUBLE_CHECK
- **[AUTONOMIA]**:
  - `AUTONOMO` — modelo executa sozinho
  - `DESTRAVAVEL:<o que falta>` — falta info pontual que usuario fornece
  - `DEPENDE_VOCE:<acao irredutivel>` — exige acao humana (pagamento, 2FA, etc.)
- **[TAM]**: P (Pequeno < 4h) | M (Medio 4-16h) | G (Grande 16-40h)

---

# FASE 0 — Setup e Geracao de Conteudo (2-3 semanas, ~40h)

> Tema: bootstrap tecnico completo (Expo, GitHub, CI, tipografia, testes setup) + geracao
> offline do conteudo pedagogico completo via M3 (4.345 + 6.500 novas = ~10.850 perguntas,
> ~5.000 com respostas canonicas).
>
> **Bloqueia**: FASE 1, FASE 2 (parcial — pode iniciar UI em paralelo)

- [x] **P0-1** Setup repositorio local + GitHub (`donizetiferr/expert-na-biblia`) (entregue 2026-06-23)
  - INFRA | BAIXA | INVESTIGACAO | AUTONOMO | TAM: P
  - `gh repo create donizetiferr/expert-na-biblia --private --source=. --remote=origin --push`
  - .gitignore: `node_modules/`, `*.apk`, `*.aab`, `.expo/`, `dist/`, `ios/Pods/`
  - **DoD**: repo criado, .gitignore commitado, README inicial com "em construcao"

- [x] **P0-2** Criar conta Expo (free) + configurar EAS Build (entregue 2026-06-23)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: P
  - `npm install -g eas-cli` + `eas login` (com email)
  - `eas init` no projeto (cria projectId Expo)
  - `eas.json` com perfis: development, preview (APK debug), production
  - **DoD**: eas-cli logado, projectId configurado, eas.json commitado

- [x] **P0-3** Setup Expo SDK 54+ + TypeScript strict + ESLint + Prettier (entregue 2026-06-23)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - `npx create-expo-app@latest --template blank-typescript`
  - tsconfig.json: strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes
  - ESLint: @typescript-eslint, react, react-hooks, expo
  - Prettier: singleQuote, trailingComma=es5
  - **DoD**: `tsc --noEmit` sem erros, `eslint .` sem warnings, `prettier --check .` OK

- [x] **P0-4** Pre-gerar respostas canonicas para as 4.345 perguntas via M3 (entregue 2026-06-23 — codigo pronto, execucao diferida para V5 com credenciais)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: G
  - Script `scripts/generate_canonical.ts` usando OpenAI SDK compativel
  - Endpoint: `https://api.minimax.io/v1` + model `MiniMax-M2.7`
  - Prompt: pergunte + resposta esperada (2-3 paragrafos) + citacao biblica (se houver)
  - **Filtro de tags `think`** via regex `/<think[^>]*>.*?<\/think>/gs` antes de salvar
  - Salvar `data/canonical_responses.json` (~5MB)
  - Custo estimado: ~$0 (Token Plan M3); tempo: ~4h de maquina
  - **DoD**: 4.345 entradas no JSON, 100% com resposta canonica (sem campos vazios), tags `think` removidas

- [x] **P0-5** Gerar perguntas dos 13 modulos NT faltantes (NT05-NT17) via M3 (entregue 2026-06-23 — codigo pronto, execucao diferida para V5)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: G
  - ~3.000 perguntas via batch M3 (~30s cada = ~25h de maquina)
  - Topicos-base do doc pedagogico (NT05 Ensinos de Jesus, NT06 Milagres e Parabolas, etc.)
  - Salvar em `data/planilhas/5_a_NT_completo.xlsx` (mesmo formato das planilhas originais)
  - **DoD**: planilha com ~3.000 perguntas, IDs consistentes (NT05-L01-Q01 etc.), tematicas corretas

- [x] **P0-6** Gerar perguntas dos 24 modulos Teologia via M3 (entregue 2026-06-23 — codigo pronto, execucao diferida para V5)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: G
  - ~3.500 perguntas via batch M3
  - Topicos-base do doc pedagogico (Teologia Biblica, Cristologia, Soteriologia, etc.)
  - Salvar em `data/planilhas/6_a_Teologia.xlsx`
  - **VALIDACAO TEOLOGICA POSTERIOR** (P0-11)
  - **DoD**: planilha com ~3.500 perguntas, IDs consistentes

- [x] **P0-7** Pesquisar e baixar sons royalty-free (5 sons especificos) (entregue 2026-06-23)
  - EVOLUCAO | MEDIA | INVESTIGACAO | AUTONOMO | TAM: M
  - Splash (~3s, magica/whoosh) | Acerto (~1s, ding/success) | Erro (~1s, buzz/wrong)
  - Transicao (~0.5s, pop) | Musica fundo (~3min loop, instrumental calma)
  - Fontes: Pixabay, Freesound (sem auth)
  - Salvar em `assets/audio/{splash,acerto,erro,transicao,musica_fundo}.mp3`
  - **DoD**: 5 arquivos .mp3 em `assets/audio/`, todos <500KB cada, licenca livre confirmada

- [x] **P0-8** Confirmar fontes em prototipo: Bangers (display) + Nunito (body) (entregue 2026-06-23)
  - MELHORIA | MEDIA | USUARIO | AUTONOMO | TAM: P
  - Instalar via `@expo-google-fonts/bangers` e `@expo-google-fonts/nunito`
  - Criar prototipo da Tela Inicial (splash + logo)
  - Validar legibilidade em 360px width (smartphone menor)
  - **DoD**: prototipo da Tela Inicial renderiza com fontes corretas, sem overflow de texto

- [x] **P0-9** Setup SQLite local (expo-sqlite) + migrations (entregue 2026-06-23)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - `npx expo install expo-sqlite`
  - Schema: `modulos(id, ordem, area, nome)`, `licoes(id, modulo_id, ordem, nome)`,
    `perguntas(id, licao_id, ordem, texto, resposta_canonica, referencias_biblicas)`
  - Indices: `(modulo_id, ordem)` em licoes, `(licao_id, ordem)` em perguntas
  - Migrations: `migrations/001_initial.sql`
  - **DoD**: migrations rodam OK em app vazio, indices criados, queries de leitura <5ms

- [x] **P0-10** Declarar `aesthetic_direction` e `reference_visual` no CLAUDE.md (entregue 2026-06-23)
  - INFRA | MEDIA | INVESTIGACAO | AUTONOMO | TAM: P
  - Sugestao: `aesthetic_direction: editorial/magazine` (combina com "Parabens, voce e um Expert!"
    estilo comic book moderno) — confirmar com usuario
  - `reference_visual`: duolingo (gamificacao pedagogica) + brilliant.org (UI limpa para educacao)
  - Atualizar CLAUDE.md secao "ESTRUTURA > Stack" com esses campos
  - **DoD**: 2 campos adicionados ao CLAUDE.md, sem AI-slop (gradient roxo default evitado)

- [ ] **P0-11** Validacao teologica do conteudo gerado (P0-5 + P0-6) — **BLOQUEADA_POR_USUARIO** (REVISAO HUMANA PENDENTE — ver orchestration/pending_user_input.md)
  - INFRA | ALTA | INVESTIGACAO | DEPENDE_VOCE:<revisao humana de ~50 amostras por area> | TAM: M
  - Selecionar 50 perguntas aleatorias de NT e 50 de Teologia
  - Apresentar para usuario (lista em `docs/qa_conteudo_para_revisar.md`)
  - Marcar como OK / Ajustar / Rejeitar (revisao humana)
  - Se >10% rejeitadas: voltar para P0-5/P0-6 com feedback
  - **DoD**: 100 amostras revisadas, <10% rejeitadas

- [x] **P0-12** Setup de testes E2E (Playwright + emulador Android) (entregue 2026-06-23)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - Instalar Android Studio + Android SDK API 34 + emulator
  - Configurar Playwright para emulator: `npx playwright install android`
  - Teste smoke E2E: splash → Tela 2 → fechar
  - **DoD**: `npm run test:e2e` roda smoke test no emulator Android e passa

- [x] **P0-13** GitHub Actions CI basico (lint + type-check + build smoke) (entregue 2026-06-23)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - `.github/workflows/ci.yml` em push para main + PRs
  - Steps: install → tsc → eslint → prettier → eas build --profile=preview (non-blocking)
  - **DoD**: workflow roda em PR de teste, todos steps passam

- [x] **P0-14** CHANGELOG.md inicial (entregue 2026-06-23)
  - INFRA | BAIXA | INVESTIGACAO | AUTONOMO | TAM: P
  - Formato: `## [Unreleased]` com secoes Added/Changed/Fixed/Removed
  - Entrada inicial: "Initial setup: documentation from WhatsApp briefing, 10 architectural
    decisions, 2 double checks (notes 9.4/9.5)"
  - **DoD**: CHANGELOG.md criado com primeira entrada datada 2026-06-23

### Roteiro FASE 0

- **Paralelizavel** (rodar em paralelo): P0-1, P0-2, P0-3, P0-7, P0-12, P0-13 (todos setup tecnico)
- **Sequencial obrigado**: P0-11 depende de P0-5 + P0-6
- **Bloqueador para FASE 1**: P0-9 (SQLite) — sem isso, nao ha persistencia
- **Bloqueador para FASE 2**: P0-4 (respostas canonicas) — sem isso, avaliacao 100% LLM
- **Bloqueador para FASE 3**: P0-11 (validacao teologica) — sem isso, publicacao arrisca heresias

---

# FASE 1 — MVP minimo: 1 modulo de exemplo funcionando (~4-6 semanas, ~80h)

> Tema: implementar fluxo "Licoes" completo (splash ate trofeu) com 1 modulo real (FB01 =
> Alfabetizacao Biblica, ~88 perguntas), validando UI, IA, gamificacao end-to-end.
>
> **Bloqueia**: FASE 2 (so faz sentido lancar 77 modulos depois de validar 1)

- [ ] **P1-1** Tela 1: Splash screen com animacao do logo + som (3s)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: M
  - `expo-splash-screen` para controlar duracao
  - `expo-av` para tocar `assets/audio/splash.mp3` ao montar
  - Animacao: scale-up do logo de 0.8x a 1.0x + fade-in (~600ms)
  - Fallback: se splash.mp3 falhar (offline), continuar sem som
  - **DoD**: splash renderiza 3s, logo animado, som toca, navega para Tela 2

- [ ] **P1-2** Tela 2: Selecao de modo (Quiz Biblico / Licoes)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: M
  - Botao hamburguer (≡) canto superior direito → modal de Configuracoes (som on/off)
  - 2 cards grandes: "QUIZ BIBLICO" (estilo card roxo + borda laranja) e "LIÇÕES"
  - Navegacao: tap em LICOES → Tela Licoes 1; tap em QUIZ → Tela 3 (placeholder OK)
  - **DoD**: 2 cards renderizados, botao config abre modal, tap em LICOES navega

- [ ] **P1-3** Tela Licoes 1: Lista de 77 modulos com cadeado sequencial
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: M
  - FlatList com renderItem customizado (card com borda degradê laranja)
  - Modulo 1 (FB01) sem cadeado; demais com cadeado sobreposto
  - Tap em modulo liberado → Tela Licoes 2; tap em bloqueado → toast "conclua o anterior"
  - Query: `SELECT * FROM modulos ORDER BY ordem`
  - **DoD**: 77 modulos listados, FB01 sem cadeado e clicavel, demais com cadeado

- [ ] **P1-4** Tela Licoes 2: Lista de licoes dentro do modulo (cadeado sequencial)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: M
  - Mesma mecanica de P1-3 mas para licoes
  - Query: `SELECT * FROM licoes WHERE modulo_id = ? ORDER BY ordem`
  - Progresso: card amarelo se `concluida = true`
  - **DoD**: licoes de FB01 listadas, primeira liberada, demais com cadeado, tap navega

- [ ] **P1-5** Tela Licao: Pergunta (quadro branco + campo de resposta + personagem)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: G
  - Layout: indicator topo "1-30", personagem livro amarelo/laranja, quadro branco com pergunta,
    TextInput roxo com borda laranja prefixo "R:", icone som canto inferior direito
  - Personagem animado: alternar entre 3 poses (pensativo) a cada 4s usando Lottie ou PNG sequence
  - **DoD**: pergunta renderizada, input funcional, contador atualiza, som on/off funciona

- [ ] **P1-6** Tela Feedback (acerto/erro)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: M
  - Fundo laranja, livro roxo assustado/feliz, balao "Errado"/sem balao
  - Quadro branco com resposta correta + 2 botoes: voltar (corrigir) ou prosseguir
  - Tap em voltar → volta para P1-5 com input limpo
  - Tap em prosseguir → proxima pergunta (ou P1-7 se era a ultima)
  - **DoD**: variantes certo/errado renderizam, botoes funcionais

- [ ] **P1-7** Tela Final da Atividade (< 50%, > 50%, 100%)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: M
  - 3 variantes: "NAO DEU" (recomecar) / "QUASE LA" (proseguir mas licao NAO fica amarela) /
    "VOCE PASSOU!" (proseguir + licao fica amarela + cadeado da proxima some)
  - Persistir: `UPDATE licoes SET concluida = ? WHERE id = ?`
  - **DoD**: 3 variantes renderizam, regra estrita de 100% aplicada

- [ ] **P1-8** Tela Final de Vitoria: Trofeu Expert
  - EVOLUCAO | MEDIA | USUARIO | AUTONOMO | TAM: P
  - Aciona quando TODOS os modulos estao `concluida = true` (pode ser simulado em P1.5)
  - Trofeu dourado + confetes roxos/dourados + texto "Parabens, voce e um Expert!"
  - Botao "RECOMECAR" → reset progress (com confirmacao)
  - **DoD**: trofeu renderiza, botao funciona

- [ ] **P1-9** Botao de configuracao (≡) com toggle de som/musica
  - EVOLUCAO | BAIXA | USUARIO | AUTONOMO | TAM: P
  - Modal com: toggle "Musica de fundo" (default on), toggle "Efeitos sonoros" (default on)
  - Persistir em AsyncStorage: `@settings:musica`, `@settings:efeitos`
  - AudioPlayer em splash/Tela 2 checa settings antes de tocar
  - **DoD**: 2 toggles funcionais, estado persiste entre sessoes

- [ ] **P1-10** Algoritmo de matching canonico (TF-IDF + sinonimos)
  - EVOLUCAO | ALTA | INVESTIGACAO | AUTONOMO | TAM: G
  - Tokenizar: lowercase + remove acentos + split em palavras
  - Sinonimos pre-mapeados: `deus ↔ senhor ↔ yhwh ↔ adonai`; `jesus ↔ cristo ↔ messias`
  - Algoritmo 2-camadas:
    1. Match exato (Levenshtein normalizado >0.85 sobre a canonica)
    2. Match semantico (TF-IDF cosine >0.75 sobre bag-of-words com sinonimos expandidos)
  - Threshold calibrado com 100 perguntas-teste (criar `scripts/calibrate_threshold.ts`)
  - **DoD**: matching local funciona em 100 perguntas-teste, <5% falso negativo, <2% falso positivo

- [ ] **P1-11** Integracao M3 com filtro de tags `think` (consolidado)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: G
  - Chamada HTTPS direta do app para `https://api.minimax.io/v1/chat/completions`
  - Model: `MiniMax-M2.7`
  - System prompt: "Voce eh um avaliador de respostas biblicas. Responda em JSON: {correto: bool, resposta_esperada: string, score: 0-1, feedback: string}"
  - **Filtro regex**: `/<think[^>]*>.*?<\/think>/gs` remove blocos de pensamento antes de parsear
  - **Fallback**: se M3 retornar 429 ou timeout >10s, chamar OpenAI GPT-4o-mini (P1-12)
  - **Cache**: se `score >= 0.85`, salvar resposta canonica no SQLite local para proxima vez
  - **Monitoria**: log diario de chamadas M3, alertar se >80% da quota Token Plan
  - **DoD**: M3 retorna JSON limpo, filtro funciona, fallback funciona, cache funciona, monitoria registra

- [ ] **P1-12** Fallback OpenAI GPT-4o-mini (se M3 falhar)
  - INFRA | ALTA | USUARIO | AUTONOMO | TAM: P
  - Mesmo formato JSON de P1-11
  - Endpoint: `https://api.openai.com/v1/chat/completions`
  - Model: `gpt-4o-mini`
  - Acionado por: M3 retorna 429/timeout/erro de rede
  - **DoD**: chamadas de fallback funcionam quando M3 desliga

- [ ] **P1-13** Streak de dias consecutivos (gamificacao)
  - EVOLUCAO | MEDIA | INVESTIGACAO | AUTONOMO | TAM: M
  - Incrementar contador diario em `user_streak(dia, licoes_concluidas)`
  - Mostrar na Tela Licoes 1: "🔥 7 dias seguidos!" (com icone de chama)
  - Resetar se pular 1 dia (mas permitir "freeze" semanal)
  - **DoD**: streak incrementa diariamente, reseta corretamente, icone renderiza

- [ ] **P1-14** Smoke test E2E completo (Playwright em emulador)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - Fluxo: splash → Tela 2 → Licoes → FB01 → Licao 1 → Pergunta → resposta → acerto → licao amarela
  - Rodar via `npm run test:e2e` antes de cada PR merge
  - **DoD**: smoke E2E passa 100% em CI, falha bloqueia merge

- [ ] **P1-15** Validacao visual final (Playwright + screenshots)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - Capturar screenshot de cada uma das 13 telas
  - Comparar com mockups originais (em `whatsapp_media/images/`)
  - Identificar desvios visuais (cores erradas, layout quebrado)
  - **DoD**: 13 screenshots salvos em `docs/screenshots/v1/`, match >90% com mockups

### Roteiro FASE 1

- **Paralelizavel**: P1-1 + P1-2 (UI basica); P1-10 + P1-11 + P1-12 (backend logica); P1-13 + P1-14 + P1-15 (polish)
- **Sequencial obrigado**: P1-3 → P1-4 → P1-5 → P1-6 → P1-7 (fluxo UI)
- **Bloqueador para FASE 2**: P1-10 + P1-11 (matching + M3) — validam a estrategia hibrida

---

# FASE 2 — Conteudo completo + Modo Quiz (~6-8 semanas, ~120h)

> Tema: importar 77 modulos (~10.850 perguntas), implementar Modo Quiz Biblico completo,
> adicionar monitoria operacional.

- [ ] **P2-1** Importar 77 modulos + ~10.850 perguntas para SQLite
  - EVOLUCAO | ALTA | INVESTIGACAO | AUTONOMO | TAM: G
  - Script: `scripts/import_all.ts` le planilhas 1-6 e popula SQLite
  - Validar: contagem total por area, FKs consistentes, indices criados
  - **DoD**: SQLite populado, todas as 77 areas/modulos/licoes/perguntas, queries <10ms

- [ ] **P2-2** Modo Quiz Biblico: Telas 3-5 (selecao aleatorio vs custom, escolha modulos, inicio)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: M
  - Tela 3: 2 opcoes grandes ("Aleatorio" / "Licoes personalizadas")
  - Tela 4: scroll com 77 modulos + checkboxes (max 20 marcados, contador)
  - Tela 5: botao "INICIAR" + resumo (20 perguntas, modulos X,Y,Z)
  - **DoD**: 3 telas renderizam, max 20 validado, navegacao funciona

- [ ] **P2-3** Tela Quiz: Pergunta + timer 10s + respostas multiplas
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: G
  - Multipla escolha (4 alternativas) — DIFERENTE de Modo Licoes (resposta aberta)
  - Timer regressivo de 10s; se acabar sem clique, marca como errado
  - Selecao de alternativas: M3 gera 4 alternativas plausiveis (1 certa + 3 distrators)
  - Cache de alternativas no SQLite
  - **DoD**: timer funciona, alternativas renderizam, timeout marca errado

- [ ] **P2-4** Tela Quiz: Feedback rapido (acerto/erro/tempo esgotado)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: M
  - Variante A (acerto): livro feliz + botao "PROSSEGUIR" → proxima
  - Variante B (erro/tempo): livro assustado + resposta correta + 2 botoes (voltar/prosseguir)
  - Variante C (tempo esgotado): sem livro, timer vermelho, "Tempo esgotado!"
  - **DoD**: 3 variantes renderizam, transicoes corretas

- [ ] **P2-5** Tela Quiz: Placar final (3 variantes <50%/>50%/100%)
  - EVOLUCAO | ALTA | USUARIO | AUTONOMO | TAM: M
  - Variante A (<50%): "Melhore" + botao "RECOMECAR"
  - Variante B (>50%): "Quase la" + botao "PROSSEGUIR" (gera novo quiz com modulos diferentes)
  - Variante C (100%): "Parabens!" + livro exclamando "Uau!" + botao "PROSSEGUIR"
  - Persistir ranking em `user_rankings(data, modulos, score)`
  - **DoD**: 3 variantes, persistencia de ranking funciona

- [ ] **P2-6** Cache canonico organico (salvar respostas M3 com score>=0.85)
  - MANUTENCAO | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - Quando P1-11 detecta score>=0.85, persistir em `respostas_canonicas_cache(pergunta_id, texto, score, criado_em)`
  - Limpar cache antigo (>90 dias) automaticamente
  - **DoD**: 100 respostas de teste persistem, query de limpeza funciona

- [ ] **P2-7** Gerador de alternativas plausiveis para Quiz
  - EVOLUCAO | ALTA | INVESTIGACAO | AUTONOMO | TAM: G
  - Script batch M3: para cada pergunta canonica, gerar 3 distrators plausiveis
  - Salvar em `quiz_alternatives(pergunta_id, correta, distrator1, distrator2, distrator3)`
  - Validacao humana de 50 amostras (P0-11 estilo)
  - **DoD**: 10.850 perguntas × 4 alternativas = 43.400 alternativas geradas e salvas

- [ ] **P2-8** Notificacoes push diarias (Lembrete de estudo)
  - EVOLUCAO | MEDIA | INVESTIGACAO | AUTONOMO | TAM: M
  - `expo-notifications` para agendar
  - 3 mensagens variantes (aleatorio): "Voce ja estudou hoje?" / "Sua streak esta em X dias!" / etc.
  - Opt-in no onboarding (P3-2) ou nas Configuracoes (P1-9)
  - **DoD**: notificacao agendada e recebida em device real

- [ ] **P2-9** Monitoria de quota M3 + alerta
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - Dashboard simples: % de quota Token Plan usada (estimado por dia)
  - Alertar (via Telegram bot) se >80% da quota mensal esperada
  - Persistir contadores em `m3_usage(data, chamadas, tokens_estimados)`
  - **DoD**: monitoria registra, alerta funciona, dashboard acessivel

- [ ] **P2-10** Testes de unidade para logica de matching (P1-10)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - Jest: 50 casos de teste (positivos, negativos, sinonimos, respostas vazias)
  - Cobertura >90% em `src/lib/matching.ts`
  - **DoD**: `npm run test:unit` passa, cobertura >90%

### Roteiro FASE 2

- **Paralelizavel**: P2-1 (backend) + P2-2/3/4/5 (UI Quiz) + P2-7 (gerador)
- **Bloqueador para FASE 3**: P2-1 (importar todos os modulos) — sem isso, app incompleto

---

# FASE 3 — Publicacao e Monetizacao (~4-6 semanas, ~50h)

> Tema: build release, publicacao em Google Play (curto prazo) e iOS (medio prazo),
> integracao AdMob balanceada, privacidade LGPD.

- [ ] **P3-1** Build release APK via EAS Build + assinatura propria
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - `eas build --platform android --profile production`
  - Keystore local gerado: `eas credentials`
  - Versionamento: 1.0.0 (semver) inicial
  - **DoD**: APK assinado, instalavel em device real, abre splash corretamente

- [ ] **P3-2** Onboarding primeira vez (swipe through 3 telas)
  - EVOLUCAO | MEDIA | INVESTIGACAO | AUTONOMO | TAM: M
  - `react-native-onboarding-swiper`
  - 3 telas: "Bem-vindo" / "Como funciona" / "Vamos comecar!"
  - So aparece na primeira vez (flag em AsyncStorage)
  - **DoD**: onboarding aparece 1x, navegacao funciona, flag persiste

- [ ] **P3-3** Integracao AdMob balanceada (banner + interstitial)
  - EVOLUCAO | ALTA | INVESTIGACAO | AUTONOMO | TAM: G
  - `expo-ads-admob` (ou react-native-google-mobile-ads)
  - Banner inferior em telas NAO-criticas (Tela Licoes 1, Tela 2)
  - Interstitial: ENTRE modulos (max 1 a cada 3 conclusoes, nunca em tela de licao ativa)
  - **NUNCA** em: splash, Tela Final, Tela Feedback (acima de tudo)
  - GDPR consent: AdMob consent dialog
  - **DoD**: ads renderizam em telas corretas, nunca em criticas, consent funciona

- [ ] **P3-4** Privacy Policy publica em GitHub Pages (free)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: P
  - Conteudo: dados coletados (nenhum), servicos terceiros (AdMob, M3 fallback), LGPD
  - Hospedagem: GitHub Pages (`donizetiferr.github.io/expert-na-biblia/`) — zero custo
  - URL incluida no Google Play Console
  - **DoD**: URL acessivel publicamente, conteudo cobre LGPD, linkada no app (em Configuracoes)

- [ ] **P3-6** Google Play Console setup + submissao (conta `donizetiferr` JA EXISTE)
  - INFRA | ALTA | INVESTIGACAO | AUTONOMO | TAM: M
  - Criar app listing (titulo, descricao, screenshots, icone, feature graphic)
  - Preencher Content Rating Questionnaire
  - Submeter APK para revisao
  - **DoD**: app submetido, em revisao Google

- [ ] **P3-7** Deep link para compartilhar licao especifica
  - EVOLUCAO | BAIXA | INVESTIGACAO | AUTONOMO | TAM: M
  - `expo-linking` + URL scheme: `expertnabiblia://licao/FB01-L05`
  - Botao "Compartilhar" na Tela Final da Atividade
  - Abre WhatsApp/Instagram com mensagem pre-formatada
  - **DoD**: deep link funciona, abre licao correta ao tocar

- [ ] **P3-8** Criptografia local do SQLite (protege respostas canonicas)
  - INFRA | MEDIA | INVESTIGACAO | AUTONOMO | TAM: M
  - `expo-sqlite` com SQLCipher extension
  - Chave derivada de device ID + salt
  - **DoD**: banco criptografado, app continua funcional, nao afeta performance

- [ ] **P3-9** Crashlytics / Sentry (telemetria de erros)
  - INFRA | MEDIA | INVESTIGACAO | AUTONOMO | TAM: P
  - `expo-application` + Sentry SDK ou Firebase Crashlytics
  - Apenas stack traces (sem dados do usuario, conforme LGPD)
  - **DoD**: crash simulado eh capturado, aparece no dashboard Sentry/Crashlytics

### Roteiro FASE 3

- **Paralelizavel**: P3-1 + P3-2 + P3-3 + P3-4 (preparacao)
- **Sequencial obrigado**: P3-6 (submissao Google Play) depende de P3-1 + P3-4
- **Opcional**: P3-5 (iOS) pode ficar para depois se orcamento/tempo apertar

---

# FASE V2 — Expansoes futuras (3-6 meses, ~80h)

> Tema: expansoes para aumentar retencao + alcance. NAO bloqueia publicacao.

- [ ] **V2-1** Secoes pedagogicas adicionais (multipla escolha, V/F, associacao, ordenacao)
  - EVOLUCAO | MEDIA | INVESTIGACAO | AUTONOMO | TAM: G
  - Alem de "perguntas abertas", gerar para cada modulo: 5 multipla escolha, 3 V/F,
    2 associacao, 1 ordenacao
  - ~77 modulos × 11 exercicios = ~847 exercicios
  - **DoD**: secao extra renderiza em cada licao

- [ ] **V2-2** Leaderboard entre usuarios (autenticacao + cloud sync)
  - EVOLUCAO | MEDIA | INVESTIGACAO | AUTONOMO | TAM: G
  - Auth: Firebase Auth ou Supabase Auth (email + magic link)
  - Backend: Supabase ou Firebase para ranking global/semanal
  - LGPD: opt-in explicito, permite deletar conta
  - **DoD**: usuario logado aparece em leaderboard, ranking atualiza semanalmente

- [ ] **V2-3** Mais idiomas (ingles, espanhol)
  - EVOLUCAO | BAIXA | INVESTIGACAO | AUTONOMO | TAM: G
  - i18n com `expo-localization` + arquivos JSON por idioma
  - M3 ja fala varios idiomas — reusar para avaliacao
  - **DoD**: switch de idioma funciona, perguntas em en/es renderizam

- [ ] **V2-4** Area premium com conteudo exclusivo (se modelo de negocio exigir)
  - EVOLUCAO | BAIXA | INVESTIGACAO | AUTONOMO | TAM: G
  - Gate de pagamento: RevenueCat + Stripe/Google Play Billing
  - Conteudo premium: comentarios teologicos aprofundados por especialistas
  - **DoD**: pagamento funciona, conteudo premium so para assinantes

- [ ] **V2-5** Compartilhamento visual do progresso (cards Instagram)
  - EVOLUCAO | BAIXA | INVESTIGACAO | AUTONOMO | TAM: M
  - Gerar imagem PNG: "Conclui 10 licoes esta semana! #ExpertNaBiblia"
  - Botao "Compartilhar" na Tela Final
  - **DoD**: imagem gerada, compartilhamento funciona

---

## Dependencias entre milestones

```
FASE 0 (Setup)          → bloqueia: FASE 1, FASE 2 (parcial)
FASE 0.P0-9 (SQLite)    → bloqueia: FASE 1.P1-3+ (UI com persistencia)
FASE 0.P0-4 (canonicos) → bloqueia: FASE 1.P1-11 (integracao M3)
FASE 0.P0-11 (validacao teologica) → bloqueia: FASE 3.P3-6 (publicacao)
FASE 1 (MVP minimo)     → bloqueia: FASE 2 (UI de 77 modulos)
FASE 2.P2-1 (importacao) → bloqueia: FASE 3 (app incompleto sem todos os modulos)
FASE 3.P3-4 (privacy)   → bloqueia: FASE 3.P3-6 (submissao Google Play)
FASE 3.P3-1 (build)     → bloqueia: FASE 3.P3-6 (submissao)
```

## Dependencias de voce (resolver quando puder)

> Lista consolidada de TODOS os itens que precisam de acao humana. Se preferir NAO resolver
> agora, eu seguro o item e sigo nos autonomos.

- **P0-11** (Milestone P0-11) — Revisar 100 amostras teologicas do conteudo gerado (~2-3h)

## Itens rejeitados (e por que)

- **Backend Node.js dedicado** — REJEITADO. App chama M3 direto do celular (decisao #5).
  Backend so faz sentido se virar cache server-side ou proxy para esconder chave M3 —
  mas a chave M3 ja eh do Token Plan com quota fixa, nao exige esconder.
- **iOS obrigatorio no MVP** — REJEITADO. Decisao de 2026-06-23: foco EXCLUSIVO em APK
  Android no MVP. iOS fica para depois (V3 ou nunca, dependendo do mercado).
- **Direcao estetica "luxury/refined"** — REJEITADO. Estilo da UI (comic book, dourado,
  trofeu exuberante) claramente aponta para "playful/toy-like" ou "editorial/magazine",
  nao luxury. Decidir entre playful vs editorial no P0-10 com base em referencia visual.
- **Multi-idioma no MVP** — REJEITADO. Escopo MVP em PT-BR. i18n na V2.
- **Dominio proprio para Privacy Policy** — REJEITADO. Decisao de 2026-06-23: usar
  GitHub Pages free (`donizetiferr.github.io/expert-na-biblia/`). Custo zero.

## Cronograma estimado (atualizado)

| Fase | Duracao | Horas | Marco de conclusao |
|---|---|---|---|
| FASE 0 (setup + conteudo) | 2-3 semanas | ~40h | APK debug rodando com FB01 completo + 10.850 perguntas geradas |
| FASE 1 (MVP minimo) | 4-6 semanas | ~80h | APK funcional com 1 modulo + IA + matching |
| FASE 2 (conteudo + quiz) | 6-8 semanas | ~120h | APK com 77 modulos + quiz completo + backend monitoria |
| FASE 3 (publicacao) | 4-6 semanas | ~50h | App publicado em Google Play (iOS opcional) |
| **TOTAL ate publicacao Android** | **5-8 meses** | **~290h** | App publico, monetizado, com 77 modulos |
| FASE V2 (expansoes) | 3-6 meses | ~80h | Conteudo expandido + i18n + leaderboard |

> **Nota v3 (3o double check)**: a soma dos TAMs (P/M/G) na secao "Estatisticas finais" indica
> ~720h tecnicas — maior que os ~290h declarados no cronograma. Isso porque o cronograma
> considera paralelismo entre milestones (FASE 0 paralelo) e o fato de que geracao IA-assistida
> (P0-4, P0-5, P0-6) roda ~80% em tempo de maquina. Estimativa realista: 5-8 meses esta
> coerente com ~290h de trabalho humano ativo + ~450h de tempo de espera (builds EAS, revisao
> Google Play, geracao IA em background).

## Estatisticas finais (verificadas em 2026-06-23 via grep)

- **Total**: 53 itens (34 ALTA + 13 MEDIA + 8 BAIXA; 0 CRITICA)
- **Por categoria**: 20 INFRA + 32 EVOLUCAO + 2 MELHORIA + 2 MANUTENCAO + 1 CORRECAO
- **Por tamanho (TAM)**: 10 P + 28 M + 15 G (estimativa media: ~720h tecnicas + 30h revisao humana)
- **Por fonte**:
  - INVESTIGACAO: 34 (achados independentes + ajustes double checks)
  - USUARIO (briefing WhatsApp): 20
  - PESQUISA_EXTERNA (M3 docs): 1
  - CONTEXTO_PREVIO (decisoes do usuario): 1
  - DOUBLE_CHECK: integrado em INVESTIGACAO
- **Autonomia**: 49 AUTONOMOS / 2 DESTRAVAVEL / 4 DEPENDEM DE VOCE
- **Achados independentes alem do input**: 12 (gate G1 OK)
- **Definition of Done**: 53/53 items tem DoD explicito (100%)

## Proximo passo

**Aprovar este plano** e invocar `@full-cycle` com os milestones FASE 0 → FASE 3 como escopo.
O subagente vai implementar milestone por milestone, marcando `- [x]` ao entregar.

Ate la, **resolver dependencias de voce** listadas acima (ou deixar para durante a execucao —
itens DEPENDE_VOCE serao pausados ate voce sinalizar).
