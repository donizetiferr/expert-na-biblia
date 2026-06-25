# Plan Investigation — Expert Na Bíblia (V18, 2026-06-25)

## Modo
Escopo: ATUALIZACAO (evolution_plan.md já existe, V1-V17) | Profundidade: COMPLETO — razão: usuário pediu "plano completo/exaustivo para chegar à versão final conforme briefing" + flag modo COMPLETO explícita.

## Arquivos lidos (piso mínimo + relevantes)
- CLAUDE.md (projeto) — objetivos, paleta oficial, regras de negócio, decisões V9, stack Expo+RN+TS, IA M2.7.
- evolution_plan.md (620 linhas, V1-V17) — histórico completo; já cataloga M16 (7 bugs visuais) e M17 (loop) para V18/V19.
- docs/04_fluxo_de_telas/README.md — descrição mock-a-mock das 14 telas (fonte de verdade do layout esperado).
- docs/03_identidade_visual/README.md — paleta, personagens (livro dourado/roxo), tipografia, trofeu.
- docs/06_google_docs_links.md — links Drive/Docs (logo, personagens, telas mockup, elementos UI).
- src/constants/colors.ts — COLORS + FONTES (Bangers/Nunito) corretos.
- src/components/PersonagemLivro.tsx — usa .jpg em View roxa emoldurada (causa-raiz "imagem com fundo").
- src/app/* (14 telas) — auditadas via subagente de fidelidade visual.
- src/app/quiz/jogar.tsx — auditado via subagente de diagnóstico (causa-raiz do loop).

## Comandos executados (resultado resumido)
- `git log --oneline -25` -> V1-V17, último commit "V17 doc snapshot: catalogar 7 bugs visuais + looping".
- `glob assets/**/*` -> personagens/logo/trofeu são .jpg; logo.png existe mas é JPEG renomeado.
- `npx tsc --noEmit` (subagente) -> 5 erros (newArchEnabled, expo-haptics ausente, Settings type 2x, lastEfeitos unused).
- `npx jest` (subagente) -> 58 testes: 55 PASS / 3 FAIL + 2 suites mal configuradas.
- `npm run lint` (subagente) -> 0 erros, 11 warnings.
- sqlite data/db.sqlite (subagente) -> 40 módulos, 754 lições, 4.345 perguntas (CONTEÚDO REAL), 4 perguntas sem alternativas.
- Google Drive MCP -> pasta "Personagens" existe (owner thaynaborgesdeoliveira21@gmail.com, compartilhada), mas download de bytes BLOQUEADO ("ineligible for generative AI contexts") e enumeração de filhos retorna vazio.

## Saúde do projeto (veredito + evidência)
- Testes: EXISTEM+FALHANDO PARCIAL — 55/58 PASS; 3 FAIL (matching-coverage sinônimo; 2 de catálogo desatualizado) + 2 suites mal configuradas (Playwright spec coletada pelo Jest; expo-secure-store sem transform). Evidência: `npx jest`.
- Build: OK (APK builda) mas PRODUTO QUEBRADO em runtime — Quiz trava em spinner eterno (bug de dados). Evidência: dist/ExpertNaBiblia-v17.0.0-universal.apk (45MB, 2026-06-25) + análise jogar.tsx.
- CI/CD: CONFIGURADO (parcial) — .github/workflows/ci.yml; lint/type-check referenciados.
- Deps: RISCO — expo ~55 / RN 0.83 / react 19 (bleeding edge); expo-haptics e expo-secure-store IMPORTADOS mas NÃO INSTALADOS (crash risk + tsc error); expo-linear-gradient NÃO INSTALADO (impossível renderizar degradês). Evidência: tsc + grep package.json.
- Docs: COMPLETAS mas com inconsistência — CLAUDE.md/onboarding citam "77 módulos", DB tem 40 (Teologia adiada). Evidência: CLAUDE.md + sqlite.

## Sinais de código
- TODO/FIXME/HACK: 3 em src/. Arquivos >400 linhas: 1 (seed-modulos-licoes.ts, auto-gerado). console.log: 4 em src/. eslint-disable inútil em quiz/jogar.tsx:52.

## Pesquisa externa (COMPLETO)
- Queries:
  1. "Bible study quiz app gamification UX best practices Duolingo-style progression 2025"
  2. "React Native open-ended answer evaluation LLM feedback UX patterns learning app"
- Fontes: orizon.co/blog/duolingos-gamification-secrets; strivecloud.io (Duolingo gamification); themanna.app; apps.apple.com (Bible Way); blog.logrocket.com/react-llm-ui; medium.com (real-time LLM RN).
- Achados que viraram candidatos (BAIXA backlog — escopo atual é FIDELIDADE ao briefing, não novas features):
  - Streak/XP/badges surfacing (já existe src/lib/streak.ts subutilizado) — fonte: PESQUISA_EXTERNA.
  - UX de avaliação por LLM: estado de loading + erro + streaming ao avaliar resposta aberta (M2.7) — o spinner-eterno é da MESMA classe de falha (falta tratar empty/error state) — fonte: PESQUISA_EXTERNA. Cruza com loop fix.
- Benchmark visual: a FONTE DE VERDADE são os mocks do cliente (47-pg Doc + telas mockup no Drive), mais autoritativos que benchmark de mercado. Mercado confirma o modelo (Duolingo-like) já adotado.

## Objetivos do produto -> cobertura -> gaps
- OBJ-1: Ensinar Bíblia lúdica e progressiva (Modo Lições + Modo Quiz) | fonte: CLAUDE.md OBJETIVO | cobertura: PARCIAL.
  - Modo Lições: funcional (dados reais, navegação sem loop, guards OK) — cobertura BOA.
  - Modo Quiz: QUEBRADO (trava em spinner por bug de IDs M001-M004 inexistentes) — gap CRÍTICO.
  - Identidade visual "por completo": AUSENTE de fato (sem degradês, assets com fundo, regra "módulo amarelo" não implementada) — gap CRÍTICO vira milestones de design.
  - Gamificação "libera próximo só com 100%": implementada em Lições; estado visual "amarelo concluído" AUSENTE (regra de negócio #3) — gap.

## Histórico do plano (ATUALIZACAO)
- Categorias recorrentes: DESIGN/fidelidade visual aparece em V8, V10(M5), V11, V12(M7), V14(M15) — 5 ciclos atacando o MESMO tema sem resolver. Sinal forte de CAUSA-RAIZ não tratada.
- Causa-raiz do ciclo (achado meta): (a) tentaram corrigir design por CSS sobre assets ERRADOS (JPG com fundo) e sem a lib de degradê instalada — fisicamente impossível atingir fidelidade; (b) VALIDAÇÃO insuficiente — screenshots low-res (320x640), só splash/modos/licoes, NUNCA jogaram o Quiz de fato (por isso o spinner-eterno passou 17 versões); nunca compararam tela-a-tela contra os mocks.
- Loop: M17 (V19) levantou hipóteses ERRADAS (race de useEffect em licoes). Causa real é bug de DADOS no quiz. M16.1/16.2 chegaram perto (carregarPerguntas/params) mas não conectaram ao spinner-eterno.
- Áreas nunca tocadas: pipeline de assets (obter originais transparentes do Drive); validação visual mock-a-mock sistemática.

## Cobertura por dimensão (gate G4 — 8/8 com veredito)
- CORRECAO_BUGS: 6+ achados — loop/spinner do quiz (CRÍTICO, causa-raiz confirmada por DB), quiz ignora params, persistir no render body (final.tsx:56), 5 erros tsc, deps ausentes (crash), 4 perguntas sem alternativas.
- MELHORIA: 4 achados — estados loading/empty/error na avaliação IA e no quiz; contraste subtítulo splash; design-tokens layer subutilizada.
- EVOLUCAO_FEATURES: varrida; nada novo no escopo (briefing é a fonte). Backlog BAIXA: streak/XP surfacing, Teologia (24 módulos, já adiado V10).
- MANUTENCAO_REFACTOR: 3 achados — retenção dist/ (≈30 APKs viola regra das 5), console.log→debug, eslint-disable inútil, design-tokens dead-ish.
- INFRAESTRUTURA: achados — expo-linear-gradient/haptics/secure-store ausentes; suites jest mal configuradas; copy "77 módulos" vs 40.
- UX_UI: MUITOS achados (subagente de fidelidade) — ver "Achados independentes". Causa sistêmica: SIST-1 (zero degradês) + SIST-2 (assets JPG com fundo + moldura).
- PERFORMANCE: varrida — carregarPerguntas faz 20 awaits seriais (aceitável em SQLite, mas frágil); recomendado 1 query ORDER BY RANDOM(). Sem N+1 crítico.
- SEGURANCA: varrida — keys de IA via app.config.ts/expo-constants (não hardcoded em source versionado); expo-secure-store usado p/ progresso. Nada crítico.

## Achados independentes (fora dos apontamentos do usuário)
1. [CRÍTICO] Loop = Quiz travado em ActivityIndicator eterno por IDs hardcoded M001-M004 inexistentes no DB (jogar.tsx:90-93); query vazia não lança, fallback mock não dispara. (≠ hipóteses de M17).
2. [CRÍTICO] expo-linear-gradient NÃO instalado — zero degradês no app inteiro (SIST-1).
3. [CRÍTICO] logo.png é JPEG renomeado (magic bytes ffd8ffe0); todos os assets sem transparência.
4. [ALTO] Regra de negócio #3 (módulo/lição concluído fica AMARELO) NÃO implementada (fica roxo + ✓).
5. [ALTO] quiz/jogar.tsx ignora useLocalSearchParams (modo/modulos) — Personalizado não funciona.
6. [ALTO] expo-haptics / expo-secure-store importados mas não instalados (crash/erro de build).
7. [MÉDIO] quiz/final.tsx usa emoji gigante em vez de PersonagemLivro.
8. [MÉDIO] Quadro branco da pergunta sem borda preta; header do quiz sem ícone home.
9. [MÉDIO] 5 erros tsc + 3 testes falhando + 2 suites jest mal configuradas.
10. [BAIXO] dist/ com ~30 APKs (regra das 5 violada); copy "77 módulos" vs 40 reais.

## Autonomia por item (pre-check leve de acessos)
- Loop fix / params / guard / tsc / jest / lint / deps (expo install) / gradientes / refactor componentes / copy / retenção: AUTONOMO.
- Aquisição de assets transparentes originais (logo, 5 personagens, troféu, ícones, confetes): DESTRAVAVEL:<PNGs originais do Drive> — fonte: Drive pertence à designer (Thayná), compartilhado com d7bots, mas MCP bloqueia download de bytes. Tentativa autônoma via Playwright no Chrome logado (conta tem acesso compartilhado); fallback: usuário baixa da pasta Drive e dropa em assets/images/; último recurso: background-removal/regeneração via media-generation (qualidade inferior).
- Validação empírica no emulador (bundletool/adb/screenshot): AUTONOMO (emulator-5554 já usado em V10-V14).

## Segundo turno crítico (FASE 3.5 — gate G5)
- Lentes aplicadas: 7/7 (detalhe abaixo).
- Ajustes: 5 detalhados | 2 enriquecidos (POLISH) | 1 recuperado | 1 re-priorizado | 1 consolidado | 2 premissas verificadas.
- Re-ataque: não aplicável (>0 ajustes encontrados).
- Top 3 ajustes:
  1. [LENTE 3 recuperado] Adicionar guard anti-spinner-eterno como item próprio (não só corrigir IDs) — se perguntas vazio, estado de erro/empty, não ActivityIndicator. Senão um futuro empty silencioso re-trava.
  2. [LENTE 2 POLISH] Elevar regra "módulo amarelo concluído" de cosmético para REGRA DE NEGÓCIO (#3) — é gate de progressão visual; re-priorizado para ALTA.
  3. [LENTE 6 adjacente] Milestone de VALIDAÇÃO mock-a-mock como CAUSA-RAIZ do ciclo de 17 versões — sem isso o plano repete o fracasso. Tornado milestone próprio CRÍTICO.

### 2a passada — double-check profundo pedido pelo usuario (verificacao de premissas no codigo)
Postura: reprovar o proprio plano. Verificacoes diretas (Read/Grep), nao re-investigacao.
- PREMISSA OK: expo-linear-gradient ausente do package.json (grep) -> MC.1 valido.
- PREMISSA OK: loop = jogar.tsx:87-106 hardcoded M001-M004 + listarPerguntas retorna [] sem throw (db-queries.ts:128-147) -> MA valido. NOVO: MOCK_MODULOS (db-queries.ts:10) usa M001..M077, por isso o quiz "passa" em Jest mas quebra no device -> MA.1 enriquecido com teste de regressao.
- CORRECAO DE PREMISSA: expo-secure-store JA esta no package.json (linha 96). Faltam haptics/speech/linear-gradient + verificar slider. Imports nao listados = risco de `npm ci`/CI/clone quebrar -> ME.1 reescrito (era "instalar secure-store", errado).
- ACHADO NOVO CRITICO (recuperado): conclusao de MODULO nunca e gravada (grep src/: so `UPDATE modulos SET concluido = 0`). licoes/index.tsx:26-29 desbloqueia modulo N so se modulos[N-1].concluido===true -> modulo 2+ travado para sempre + trofeu inalcancavel (todosModulosConcluidos nunca true). -> novo item MA.5 CRITICA. Falha de objetivo central que sobreviveu 17 versoes (validacao nunca completou um modulo).
- PREMISSA OK: dados de conclusao de licao existem (licoes.concluida/score_max + marcarLicaoConcluida db-queries.ts:149) -> MD.1 e so UI; mas o gap de MODULO acima precede.
- MF enriquecido: validar em AVD hi-res (nao 320x640) + completar um modulo inteiro (prova desbloqueio+trofeu) — o caminho nunca validado.

### Detalhe das 7 lentes
1. Profundidade rasa? — "corrigir design" estava genérico; quebrado em ~11 itens com arquivo:linha (subagente). OK.
2. Melhor versão (POLISH)? — gradientes: criar componentes reutilizáveis GradienteRoxo/GradienteLaranja em vez de aplicar inline 12x. Regra amarelo elevada a ALTA.
3. Algo se perdeu? — recuperado guard anti-spinner; recuperado "4 perguntas sem alternativas"; recuperado copy "77 vs 40".
4. Priorização errada? — regra amarelo (era visual MÉDIO) -> ALTA (regra de negócio). Deps ausentes -> ALTA (crash, não MÉDIO).
5. Premissa não verificada? — VERIFICADO: Drive bloqueia download (testado via MCP) -> assets = DESTRAVAVEL, não AUTONOMO. VERIFICADO: DB é real (não precisa reimportar).
6. Adjacente óbvio? — milestone de validação visual mock-a-mock (causa-raiz do ciclo). Recomendação design-sync (NÃO usar) + ux-polish no fim.
7. Redundante/inflado? — consolidado: M16.1/16.2 + M17 (do plano antigo) viram o milestone único "Fix loop do Quiz" (mesma causa-raiz); marcados superseded no plano.
