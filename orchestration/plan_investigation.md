# Plan Investigation — Expert Na Biblia (2026-06-23)

## Modo

Escopo: **ATUALIZACAO** | Profundidade: **FOCADO** — razao: input traz apontamentos acionaveis
+ 2 double checks profundos ja feitos (notas 9.4 e 9.5/10) + base documental completa. FOCADO
aproveita o contexto previo (input rico) e roda investigacao independente calibrada (gate G1).

## Arquivos lidos (piso minimo 1.1)

- `CLAUDE.md` — objetivo, 10 decisoes travadas, 3 pendentes, diagrama de arquitetura
- `evolution_plan.md` — plano existente com 4 fases (P0/P1/P2/P3) + V2, 5-8 meses ate publicacao
- `orchestration/audit_report.md` (v1) — nota 9.4/10, 0 criticos, 2 altos (A1+A2) ja corrigidos
- `orchestration/audit_report_v2.md` (v2) — nota 9.5/10, 6 inconsistencias corrigidas
- `orchestration/qa_verdict_v2.md` — APROVADO com ressalvas, zero bloqueios
- `docs/README.md` — indice principal da documentacao
- `docs/01_objetivo_e_escopo.md` — visao geral + regras de negocio
- `docs/02_mensagens_whatsapp/README.md` — 68 mensagens do grupo
- `docs/03_identidade_visual/README.md` — paleta + logo + personagem
- `docs/04_fluxo_de_telas/README.md` — 13 telas mapeadas
- `docs/05_conteudo_pedagogico/README.md` — 77 modulos planejados
- `docs/06_google_docs_links.md` — links externos
- `docs/raw_whatsapp_extraction.json` — extracao original da API
- `docs/questions_clean.json` — 4.345 perguntas estruturadas
- `docs/doc1_oficial_fluxo_telas.txt` — Google Doc 1
- `docs/doc2_estrutura_pedagogica_completa.txt` — Google Doc 2
- `orchestration/evidence_map.md` — mapa de evidencias do 1o double check
- `Tokens API e acessos/minimax/credentials.md` — chave M3 validada em APW

## Comandos executados

- `ls` + `find` no projeto → 41 arquivos totais (20 .md/.txt/.json + 21 midia)
- `find` testes → **0 testes** (sem jest/vitest/playwright config)
- `find` CI/CD → **0 CI/CD** (sem .github/.gitlab-ci/azure-pipelines)
- `find` build config → **0 build config** (sem package.json/tsconfig/app.json/eas.json)
- `grep TODO/FIXME/HACK` → 0 nos .md (esperado, projeto pre-implementacao)
- `cat mcp-registry.json` → fleet Chrome real 8-12 ativa, perfil preservado
- `gh auth status` → donizetiferr logado, scopes gist/read:org/repo
- `gh repo list D7Bots` → 2 repos (restore-claude-windows-terminal, leitor-de-video)
- `ls Tokens API e acessos/{minimax,openai}/` → credenciais existem

## Saude do projeto (gate G0)

| Dimensao | Veredito | Evidencia |
|---|---|---|
| **Testes** | NAO_EXISTEM (achado INFRA critico) | `find -name "*.test.*"` retornou 0. Sem jest.config/vitest.config/playwright.config. |
| **Build** | NAO_VERIFICAVEL (pre-implementacao) | Sem package.json/tsconfig/app.json. Projeto nao tem codigo ainda. |
| **CI/CD** | AUSENTE (achado INFRA alto) | Sem .github/.gitlab-ci/azure-pipelines. Setup do CI sera parte da FASE 0. |
| **Deps** | NAO_VERIFICAVEL (pre-implementacao) | Sem package.json. Decisoes de deps estao no CLAUDE.md (Expo, expo-sqlite, etc.) |
| **Docs (CLAUDE/README/changelog)** | COMPLETAS (com gaps identificados) | CLAUDE.md e 8 docs/*.md estao consistentes. Sem CHANGELOG.md (achado BAIXO). |

**Sinal CRITICO de infraestrutura**: projeto pre-implementacao nao tem NADA de codigo/testes/CI.
Isso NAO eh falta de qualidade — eh o estado natural antes de FASE 0. Plano de acao precisa
cobrir setup de tudo isso.

## Sinais de codigo

- TODO/FIXME/HACK: 0 (esperado, pre-implementacao)
- Arquivos >500 linhas: N/A (sem codigo)
- Duplicacao obvia: 0 (removida `questions_raw.json` no 1o double check)
- Tipagem forte: N/A (sem codigo TS ainda)

## Pesquisa externa (FOCADO — gate G4 parcial)

**Queries** (no 1o e 2o double checks ja executados):
- "minimax coding plan token plan commercial use restriction backend" (SearXNG)
- Docs oficiais do Token Plan M3

**Fontes usadas**:
- `https://platform.minimax.io/docs/token-plan/intro` — confirmou Token Plan = "for applications"
- `https://platform.minimax.io/subscribe/coding-plan` — confirmou Token Plan usage
- `Tokens API e acessos/minimax/credentials.md` — validou APW em producao

**Achados que viraram candidatos**:
1. M3 validado em producao (APW) → habilita uso direto no app
2. Filtro `think` tags → P0-4 e P1-13 ja cobrem
3. Custo M3 Token Plan incluso em plano existente → $0 marginal

**FOCADO**: pesquisa externa adicional minima (queries de benchmark visual de apps religiosos
e de implementacao React Native + Expo SQLite + AdMob seriam uteis, mas a FASE 0 do projeto
ja vai validar tudo isso empiricamente).

## Objetivos do produto (gate G4 parcial em FOCADO)

Extraido de CLAUDE.md secao OBJETIVO (1 objetivo principal):

### OBJ-1: Ensinar a Biblia de forma ludica e progressiva via smartphone

- **Fonte**: CLAUDE.md L8-16 (declaracao explicita)
- **Cobertura atual**: PARCIAL — documentacao completa, briefing 100% coletado, decisoes
  travadas, mas ZERO codigo
- **Componentes**:
  - Modo Licoes progressivas (77 modulos, 4 areas) → NAO_IMPLEMENTADO
  - Modo Quiz Biblico (20 perguntas, timer 10s) → NAO_IMPLEMENTADO
  - Gamificacao (cadeado, 100%, trofeu) → NAO_IMPLEMENTADO
  - Avaliacao IA das respostas abertas → NAO_IMPLEMENTADO
  - UI cartoon/playful com personagem livro → NAO_IMPLEMENTADO
  - Splash + som + configuracao → NAO_IMPLEMENTADO
- **Gap vira**: milestones FASE 0 a FASE 3 do evolution_plan.md

## Historico do plano (gate G5 pre-check)

- **Categorias recorrentes**: N/A (plano foi criado HOJE, primeiro uso)
- **Areas nunca tocadas**: N/A (pre-implementacao)
- **Rejeitados anteriores**: nenhum

## Cobertura por dimensao (gate G4 — FOCADO, formato leve)

| Dimensao | Veredito |
|---|---|
| CORRECAO_BUGS | N/A (sem codigo) |
| MELHORIA | 6 inconsistencias identificadas no 2o double check, todas corrigidas |
| EVOLUCAO_FEATURES | Briefing 100% mapeado, 10 decisoes travadas, 4 fases de milestones definidas |
| MANUTENCAO_REFACTOR | N/A (sem codigo) |
| INFRAESTRUTURA | 4 gaps criticos/altos: testes, CI/CD, build config, changelog |
| UX_UI | Identidade visual completa (paleta, logo, personagem, fontes inferidas); 13 telas mockadas; mas sem direcao estetica declarada no CLAUDE.md |
| PERFORMANCE | N/A (sem codigo); nota: SQLite embarcado com 7.500+ perguntas precisa de indices |
| SEGURANCA | LGPD publico adulto (decidido); M3 token exposto se hardcoded → atencao |

## Achados independentes (gate G1)

Investigacao INDEPENDENTE alem dos apontamentos do input (mesmo sabendo do contexto previo,
rodei FASE 1):

1. **CHANGELOG.md ausente** — projeto pre-implementacao mas ja com 1o save-state, deveria ter
   changelog (INFRA BAIXA)
2. **Sem direcao estetica declarada** — CLAUDE.md tem paleta e tipografia inferida, mas nao
   declara `aesthetic_direction`/`reference_visual` conforme regra ANTI AI-SLOP (DESIGN MEDIO)
3. **Sem testes automatizados** — mesmo projeto novo merece setup minimo (INFRA CRITICO)
4. **Sem CI/CD** — git push sem validacao automatica (INFRA ALTO)
5. **5-8 meses ate publicacao** — depende de geracao IA-assistida das ~6.500 perguntas faltantes;
   nao ha task de validar qualidade teologica das perguntas geradas (RISCO)
6. **Plano nao tem ESTIMATIVA DE ESFORCO** — sem horas/dias por milestone, fica declarativo (GAPS)
7. **Plano nao tem DEPENDENCIAS explicitas** entre milestones (GAPS)
8. **Plano nao tem DEFINITION OF DONE** testavel por milestone (GAPS)
9. **Plano nao tem ROTEIRO DE EXECUCAO** — qual fase paraleliza, qual bloqueia (GAPS)
10. **Backend opcional sem decisao** — manter backend Node.js ou app chama M3 direto? CLAUDE.md
    ja simplificou para app chama M3 direto, mas plano ainda cita "backend opcional" (CONFUSAO)

## Autonomia por item (gate G1.9)

| Servico/Integracao | Credencial disponivel? | Itens que tocam | Autonomia |
|---|---|---|---|
| Minimax M2.7 (Token Plan) | SIM — `Tokens API e acessos/minimax/credentials.md` | P0-4, P1-13, P2-10, todos que usam M3 | AUTONOMO |
| OpenAI GPT-4o-mini (fallback) | SIM — `Tokens API e acessos/openai/credentials.md` | P1-13 (fallback) | AUTONOMO |
| GitHub `donizetiferr` | SIM — logado | Todos de P0-1 | AUTONOMO |
| Expo account (free) | NAO conta ainda | P0-3 | AUTONOMO (criar com email) |
| Google Play Console | NAO — exige pagamento $25 | P3-8 | DEPENDE_VOCE:<criar conta + pagar $25> |
| Apple Developer Program | NAO — exige pagamento $99/ano | P3-7 (iOS, opcional) | DEPENDE_VOCE:<criar conta Apple ID + pagar $99> |
| Google AdMob | NAO conta ainda | P3-1 | AUTONOMO (criar com conta Google) |
| Railway/Render (backend) | NAO conta ainda | P2-9 | AUTONOMO (criar free tier) |
| Dominio privacy policy | NAO — exige compra | P3-8 (pre-requisito) | DEPENDE_VOCE:<comprar dominio R$10-15/ano OU usar GitHub Pages free> |
| ElevenLabs (fallback audio) | SIM — `Tokens API e acessos/elevenlabs/` | P0-7 (se royalty-free nao servir) | AUTONOMO |
| Pixabay / Freesound | URL publica (sem auth) | P0-7 | AUTONOMO |
| ElevenLabs MCP | MCP ja carregado nesta sessao | midia em geral | AUTONOMO |
| Playwright MCP | MCP ja carregado (Chrome real 8) | P1-14, P3-7, etc. | AUTONOMO |
| Fal.ai MCP | MCP ja carregado | midia | AUTONOMO |
| Pollinations CLI | CLI disponivel (verificar) | assets visuais secundarios | AUTONOMO |

## Segundo turno critico (FASE 3.5 — gate G5)

### Lentes aplicadas

1. **Profundidade rasa?** — varios milestones do plano atual sao declarativos ("P1-1 Splash
   screen com animacao do logo + som"). Vou DETALHAR com:
   - Duracao exata da animacao (3s default)
   - Bibliotecas Expo: expo-splash-screen + expo-av
   - Formato do asset (PNG sequencia ou Lottie?)
   - Comportamento em slow network (fallback estatico)
2. **Falta a melhor versao? (POLISH)** — milestones "anonimos" podem ter a versao mais ambiciosa
   omitida. Ex: matching canonico local pode usar TF-IDF + sinonimos pre-mapeados, mas tambem
   pode ir para embeddings leves (sentence-transformers em ONNX).
3. **Algo se perdeu?** — cross-check entre achados do 1o/2o double check e milestones do plano:
   - ✅ Conteudo Teologia (P0-6)
   - ✅ Filtro tags `think` (P0-4, P1-13)
   - ✅ Algoritmo robusto (P1-12)
   - ✅ Custos (ja no evolution_plan)
   - ✅ Riscos (ja no evolution_plan)
   - ❌ **Setup de Expo account** — nao ha milestone explicito
   - ❌ **Privacy policy URL** — nao ha milestone explicito
   - ❌ **Direcao estetica declarada** — nao ha milestone (lente UX)
   - ❌ **Testes automatizados** — nao ha milestone dedicado (FASE 0 setup nao cobre)
   - ❌ **CI/CD** — nao ha milestone
   - ❌ **CHANGELOG.md** — nao ha milestone
   - ❌ **Validacao teologica de perguntas geradas** — sem milestone de QA do conteudo
4. **Priorizacao errada?** — varios milestones MEDIO estao no FASE 0 que deveriam ser FASE 1
   (ex: testes). Vou re-priorizar.
5. **Premissa nao-verificada?** — "M3 retorna tags `think`" foi validado em docs do M3, mas
   ainda nao testei empiricamente (Read/Grep no output real).
6. **Falta o adjacente obvio?** — para um app religioso com progressao, faltam:
   - **Streak/contador de dias** (gamificacao classica — Duolingo faz)
   - **Notificacoes push diarias** ("ja estudou hoje?")
   - **Modo offline** explicito (voce esta sem internet, mas pode estudar)
   - **Deep link** para compartilhar licao especifica
7. **Item redundante/inflado?** — P1-13 (integracao M3) e P2-10 (teste de carga M3) podem ser
   consolidados em "Integracao M3 com monitoria de quota".

### Ajustes identificados (resumo)

- **NOVOS itens a adicionar** (10):
  1. Criar conta Expo + EAS (FASE 0)
  2. Setup TypeScript strict + ESLint + Prettier no projeto Expo (FASE 0)
  3. GitHub Actions CI basico (lint + type-check + build smoke test) (FASE 0)
  4. CHANGELOG.md inicial (FASE 0)
  5. Direcao estetica declarada (CLAUDE.md + reference_visual) (FASE 0)
  6. Validacao teologica do conteudo gerado por M3 (FASE 0/1)
  7. Streak/dia consecutivo (gamificacao) (FASE 1)
  8. Notificacoes push (FASE 3)
  9. Privacy policy + URL publica (FASE 3)
  10. Testes E2E Playwright em emulador Android (FASE 1)

- **ENRIQUECIDOS** (4):
  - P0-4: explicitar filtro tags `think` + cache canonico apos batch
  - P1-12: adicionar TF-IDF + sinonimos pre-mapeados + embeddings leves opcionais
  - P1-13: consolidar com P2-10 (monitoria de quota M3)
  - P3-3: incluir Reanimated 3 + gestos

- **RE-PRIORIZADOS** (3):
  - Setup de testes → MEDIO → **ALTO** (afeta Definition of Done de TUDO)
  - CI/CD → MEDIO → **ALTO** (seguranca de push)
  - Direcao estetica → BAIXA → **MEDIO** (regra ANTI AI-SLOP)

- **CONSOLIDADOS** (2):
  - P1-13 + P2-10 → "Integracao M3 com monitoria de quota"
  - P3-1 + P3-9 + P3-10 → "Publicacao em lojas (Google Play primeiro, iOS opcional)"

- **PREMISSAS VERIFICADAS** (1):
  - M3 tags `think` → confirmado em `Tokens API e acessos/minimax/credentials.md` L35-36
  - "Backend opcional" → CONFUSAO: vou REMOVER mencoes a backend no plano atualizado
    (app chama M3 direto; backend so se virar cache server-side futuro)

### Re-ataque

Plano com ~40 itens, segundo turno encontrou 10 novos + 4 enriquecidos + 3 re-priorizados +
2 consolidados = **19 ajustes**. Guard anti-superficialidade OK (ajustes >> 0).

### Top 3 ajustes mais relevantes

1. **Setup de testes E2E em emulador Android** (NOVO ALTO) — sem isso, Definition of Done
   de cada milestone eh subjetivo; quebra todo o ciclo de feedback
2. **Direcao estetica declarada** (RE-PRIORIZADO MEDIO) — sem isso, implementacao cair em
   "AI-slop" generico (gradient roxo default) — viola regra global ANTI AI-SLOP
3. **Validacao teologica do conteudo gerado** (NOVO ALTO) — M3 pode gerar heresias
   teologicas inadvertidamente (especialmente em Teologia); sem revisao humana, app
   publica conteudo problematico
