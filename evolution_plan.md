# Plano de Evolucao — Expert Na Biblia (V22, 2026-06-26)

> Atualizado em 2026-06-26 por solo-plan (V22, COMPLETO, sessao principal) | Escopo: **ATUALIZACAO** | Profundidade: **COMPLETO**
> Ultima atualizacao: 2026-06-26
> Status: **AGUARDANDO_APROVACAO**
>
> Investigacao + segundo turno critico V22: `orchestration/plan_investigation.md`
> Historico: V1-V7 (47/47), V8 (18 [x]), V9 (18/19 [x]), V10 (M5+M6), V11, V12 (M7), V13 (M14), V14 (M15), V17 (Play Store prep), V18 (fidelidade visual + fix loop + validacao), V19 (scoring + 8 bugs QA), V20 (mascote dourado + IA obrigatoria), V21 (timeout IA + canonica + acentuacao). V22 = AUDITORIA PROFUNDA (bugs, melhorias, UX/UI, infraestrutura, segurança).

---

# ===== PLANO V22 (2026-06-26) — AUDITORIA PROFUNDA (bugs, polish, infra, UX) =====

> Auditoria completa do projeto apos V21 (v1.11.0/vc6). Tests 97/97, tsc 0, build OK.
> 29 achados independentes + 12 achados de infraestrutura. 8 dimensoes varridas.

## Resumo Executivo V22

O projeto está **funcional e estável** (97 testes passando, build OK, APK V21 publicado), mas acumula **debt técnico** e **oportunidades de polish** que merecem ser endereçadas antes da publicação na Play Store.

**Principais achados (apos double-check):**
1. **Infraestrutura desatualizada**: Expo SDK 55 -> 56 disponível (breaking change), 29 packages outdated, 16 moderate vulnerabilities (@expo/config chain). Sem `eas.json` para builds EAS.
2. **Bugs menores de código**: SplashScreen import shadowing, key prop faltando, botões feedback 140px overflow em telas <=320px.
3. **UX polish**: config usa emoji para ícones, sem loading/error state em [moduloId].tsx, animações loop contínuo consomem CPU, haptic feedback ausente nos botões.
4. **Segurança**: 16 moderate vulns, API keys não hardcoded (OK) mas sem `.env` documentado = feature IA indisponível sem config manual.
5. **Falta crítica para produção**: zero error boundaries, zero analytics/crash reporting (re-priorizado para ALTA), EAS projectId placeholder, eas.json ausente.
6. **Conteúdo**: ~489 canonicas "NAO SEI" em módulos NT, matching pode falhar em respostas longas.
7. **Privacy policy**: HTML EXISTE (HTTP 200, confirmado) — não é bug.

## Estatísticas V22 (FINAL — 7 rodadas de investigação)

- Milestones: 12 (V22.A-L)
- Itens: 78 ( CRITICA: 6 | ALTA: 23 | MEDIA: 29 | BAIXA: 20 )
- Por categoria: 8 CORRECAO, 14 MELHORIA, 14 EVOLUCAO, 28 MANUTENCAO, 12 INFRAESTRUTURA, 2 BACKLOG
- Por fonte: INVESTIGACAO 48 | PESQUISA_EXTERNA 8 | OBJECTIVE_GAP 4 | DOUBLE_CHECK 4 | RODADA_2-7: 44
- Autonomia: ~70 AUTONOMO | 1 DESTRAVAVEL | 5 DEPENDE_VOCE
- Credenciais expostas: 2 (keystore + Minimax API key)
- Git repo: 119MB (meta: <10MB)
- Acessibilidade: 4/30+ elementos com label (meta: 100%)
- Catch blocks silenciados: 40 (meta: todos com log mínimo)
- Código morto: 11 arquivos (7 .ts + 2 áudio + 2 .js)
- Arquivos rastreados desnecessariamente: ~134MB (84 PNG + data + whatsapp_media + questions_clean.json)

## Saúde do projeto V22 (verificada em 2026-06-26)
- Testes: EXISTEM+PASSANDO (97/97, 11 suites) | Build: OK | CI/CD: CONFIGURADO | Deps: DESATUALIZADAS (29 outdated, 16 moderate vulns) | Docs: COMPLETAS
- Evidencias: `orchestration/plan_investigation.md`

---

## Milestone V22.A: Bugs e correções de código (CORRECAO) — PENDENTE

- [ ] V22.A.1 **FIX: SplashScreen import shadowing em index.tsx** — CORRECAO | MEDIA | INVESTIGACAO | AUTONOMO
  - `src/app/index.tsx:21` nomeia o componente `SplashScreen` que shadoweia o import `SplashScreenLib` da linha 3. Funciona em runtime mas confunde desenvolvedores e lint.
  - Acao: renomear componente para `SplashScreenApp` ou `TelaSplash`.
  - DoD: sem warnings de shadowing no lint.

- [ ] V22.A.2 **FIX: key prop ausente em Pressable bloqueado (licoes/index.tsx)** — CORRECAO | BAIXA | INVESTIGACAO | AUTONOMO
  - `src/app/licoes/index.tsx:97` — Pressable do card bloqueado não tem `key` (FlatList renderItem, mas React pode warnar).
  - Acao: adicionar `key={item.id}` ao Pressable externo do card bloqueado.
  - DoD: sem warnings de key no console.

- [ ] V22.A.3 **FIX: botões feedback circulares overflow em telas <=320px** — CORRECAO | MEDIA | INVESTIGACAO (double-check: risco menor que estimado) | AUTONOMO
  - `src/app/licoes/[moduloId]/[licaoId]/feedback.tsx:265-269` — botões `width: 140, height: 140` lado a lado. Em telas >=360px (smartphones modernos mínimos) cabe com folha. Em telas <=320px (tablets antigos, emuladores de teste) não cabe.
  - Acao (double-check: solução responsiva em vez de full-width): reduzir para 120px (120+16+120+48padding=304px, cabe em 320px). Manter layout circular que dá personalidade. OU: usar `useWindowDimensions` e adaptar (>=360px: 140px, <360px: 110px).
  - DoD: feedback funcional em telas 320px largura sem overflow, mantendo design circular.

- [ ] V22.A.4 **FIX: sem loading/error state na tela [moduloId].tsx** — CORRECAO | ALTA | INVESTIGACAO (lente 3 recuperado) | AUTONOMO
  - `src/app/licoes/[moduloId].tsx` — se `listarLicoes()` falhar ou retornar [], a tela fica vazia (FlatList vazio, sem feedback). Diferente de `jogar.tsx` que tem estado de erro dedicado.
  - Acao: adicionar estado `loading` + `erro` (mesmo padrão de jogar.tsx). Se lista vazia: "Nenhuma lição encontrada neste módulo" + botão VOLTAR.
  - DoD: tela nunca fica vazia sem feedback.

- [ ] V22.A.5 **FIX: listarModulos() chamado 2x em [moduloId].tsx** — CORRECAO | BAIXA | INVESTIGACAO | AUTONOMO
  - `src/app/licoes/[moduloId].tsx:25-30` — useEffect chama `listarModulos()` para achar o nome do módulo, mas `licoes/index.tsx` já carregou todos os módulos. Cada navegação para [moduloId] refaz a query inteira.
  - Acao: criar `listarModuloPorId(id)` em db-queries.ts (query WHERE id=?) ou passar o nome do módulo via params da rota.
  - DoD: 1 query leve em vez de query completa de 40 módulos.

## Milestone V22.B: UX Polish e melhorias visuais (MELHORIA) — PENDENTE

- [ ] V22.B.1 **Config: VolumeSlider com emoji -> ícones on-palette** — MELHORIA | MEDIA | INVESTIGACAO | AUTONOMO
  - `src/app/config.tsx:65-79` — usa emojis 🔇🔈🔉🔊 que renderizam diferente por dispositivo/OS. Inconsistente com design on-palette do app.
  - Acao: usar texto simples ("0", "33", "66", "100") OU ícones Unicode circulares (●◐◑◉) OU barras visuais (segments preenchidos). Manter acessibilidade com labels.
  - DoD: ícones de volume consistentes em todos os dispositivos.

- [ ] V22.B.2 **PersonagemLivro: pausar animações quando tela não visível** — MELHORIA | MEDIA | INVESTIGACAO (lente PERFORMANCE) | AUTONOMO
  - `src/components/PersonagemLivro.tsx:57-71` — `Animated.loop` de bounce+blink roda para SEMPRE, mesmo quando a tela não está visível (navegou para outra tela, app em background). Consome CPU desnecessariamente.
  - Acao: usar `useFocusEffect` (expo-router) ou `AppState` para pausar/retomar animações. Ou usar `Animated.timing` com `isInteraction: false` para permitir que outras animações tomem prioridade.
  - DoD: CPU usage em background reduzido.

- [ ] V22.B.3 **Adicionar haptic feedback nos botões principais** — MELHORIA | MEDIA | INVESTIGACAO (double-check: detalhado) | AUTONOMO
  - O app tem `expo-haptics` instalado e `src/lib/haptics.ts` com `lightTap()`, mas nenhum botão usa haptic feedback.
  - **8 pontos específicos** (double-check):
    1. `licoes/[moduloId]/[licaoId].tsx` — botão ENVIAR → `lightTap()`
    2. `licoes/[moduloId]/[licaoId]/feedback.tsx` — PROSSEGUIR → `lightTap()`
    3. `licoes/[moduloId]/[licaoId]/feedback.tsx` — VOLTAR → `lightTap()`
    4. `quiz/jogar.tsx` — cada alternativa (4x) → `lightTap()`
    5. `licoes/[moduloId]/[licaoId]/feedback.tsx` — acerto → `successBuzz()`
    6. `licoes/[moduloId]/[licaoId]/feedback.tsx` — erro → `errorBuzz()`
    7. `quiz/final.tsx` — RECOMECAR → `lightTap()`
    8. `trofeu.tsx` — RECOMECAR → `lightTap()`
  - DoD: feedback tátil nos 8 pontos de interação principais.

- [ ] V22.B.4 **Header "Voltar" em [moduloId].tsx inconsistente** — MELHORIA | BAIXA | INVESTIGACAO | AUTONOMO
  - `src/app/licoes/[moduloId].tsx:95-97` — usa `<Pressable onPress={() => router.back()}><Text>← Voltar</Text></Pressable>` simples, sem o padrão de header usado em outras telas.
  - Acao: padronizar header com botão voltar estilizado consistente com o design do app.
  - DoD: navegação consistente entre telas.

## Milestone V22.C: Infraestrutura e dependências (INFRA/MANUTENCAO) — PENDENTE

> V22.C.1 original (privacy policy) RECLASSIFICADO: HTML verificado em 2026-06-26, HTTP 200 OK. Não é bug.

- [ ] V22.C.1 **Substituir EAS projectId PLACEHOLDER + criar eas.json** — INFRA | ALTA | INVESTIGACAO | DESTRAVAVEL: precisa rodar `eas init`
  - `app.config.ts:64` tem `eas: { projectId: 'PLACEHOLDER_EAS_PROJECT_ID' }`. EAS Build não funciona sem ID real.
  - **Adicional (double-check):** `eas.json` NÃO existe no projeto. Sem ele, `eas build` usa defaults sem env vars (API keys), signing config, nem profiles.
  - Acao: (1) rodar `eas init` e substituir placeholder; (2) criar `eas.json` com profiles `preview` (APK) e `production` (AAB) + env block para MINIMAX_API_KEY/OPENAI_API_KEY.
  - DoD: `eas build --profile preview --platform android --dry-run` funciona.

- [ ] V22.C.2 **Error boundaries com fallback contextual** — INFRA | CRITICA | INVESTIGACAO (double-check: enriquecido) | AUTONOMO
  - O app NÃO tem nenhum ErrorBoundary. Crash em render = app inteiro fecha sem feedback.
  - Acao: criar `src/components/ErrorBoundary.tsx` com fallback CONTEXTUAL:
    - Props opcionais `fallbackTitle` / `fallbackAction` para personalização por tela
    - Fallback padrão: "Algo deu errado" + botão "Tentar novamente"
    - Fallback contextual: se crashou em `/licoes/...` → "Voltar aos módulos"; se em `/quiz/...` → "Voltar ao Quiz"
    - Log do erro via `console.error` (preparar para Sentry futuro)
  - Envolver Stack em `_layout.tsx` + pontos críticos (licaoId.tsx, jogar.tsx).
  - DoD: erro de render mostra tela amigável contextual em vez de crash branco.

- [ ] V22.C.3 **Integrar analytics/crash reporting (Sentry)** — INFRA | ALTA | OBJECTIVE_GAP (double-check: re-priorizado de BAIXA) | AUTONOMO
  - App vai para produção sem saber se crasha. Zero instrumentação. (Re-priorizado de V22.F.4 para V22.C — é infraestrutura mínima, não evolução opcional.)
  - Acao: integrar `@sentry/react-native` (compatível com Expo). Mínimo: crash reporting automático + breadcrumbs de navegação (Screen tracking). Configurar DSN em `eas.json` env.
  - DoD: crashes reportados automaticamente no Sentry dashboard.

- [ ] V22.C.4 **Criar .env.example documentado** — INFRA | MEDIA | INVESTIGACAO (double-check: achado novo) | AUTONOMO
  - Não há `.env` arquivo, não há keys em `gradle.properties`, não há `eas.json`. `app.config.ts` lê de `process.env` mas ninguém documenta QUÊ definir. Feature IA fica indisponível sem config manual.
  - Acao: criar `.env.example` com `MINIMAX_API_KEY=your_key_here` + `OPENAI_API_KEY=your_key_here` + instruções de como obter. Adicionar seção "Configuração de API keys" no README.
  - DoD: desenvolvedor clonando o repo sabe exatamente como configurar IA em 2 minutos.

- [ ] V22.C.5 **Atualizar CLAUDE.md: remover backend Node.js obsoleto** — MANUTENCAO | BAIXA | INVESTIGACAO | AUTONOMO
  - `CLAUDE.md:36-38` menciona "Backend: Node.js + Express em Railway/Render free tier" mas V9 decidiu "Backend deploy: descartado (app chama M3 direto)". Documentação inconsistente.
  - Acao: atualizar seção de arquitetura removendo backend dedicado, documentando que app chama M2.7 direto.
  - DoD: CLAUDE.md reflete arquitetura real.

- [ ] V22.C.6 **Remover arquivos .json/.bak obsoletos da raiz** — MANUTENCAO | BAIXA | INVESTIGACAO | AUTONOMO
  - `app.json.bak`, `app.json.full` na raiz são resquícios de debug V8. Não são usados.
  - Acao: deletar `app.json.bak` e `app.json.full` (verificar que não são referenciados em nenhum script).
  - DoD: raiz limpa sem arquivos de backup.

## Milestone V22.D: Segurança e proteção (SEGURANCA) — PENDENTE

- [ ] V22.D.1 **Auditar 16 moderate vulnerabilities (@expo/config chain)** — SEGURANCA | ALTA | INVESTIGACAO | AUTONOMO
  - `npm audit` reporta 16 moderate em @expo/config -> @expo/config-plugins -> @expo/prebuild-config -> expo-splash-screen. São transitivas do Expo SDK 55.
  - Acao: rodar `npm audit fix` (non-breaking). Se não resolver, avaliar se Expo SDK 56 resolve (provavelmente sim — as vulns são do SDK 55).
  - DoD: `npm audit` = 0 high/critical (moderate aceitável se são transitivas do Expo).

- [ ] V22.D.2 **Verificar se API keys vazam no bundle** — SEGURANCA | MEDIA | INVESTIGACAO (double-check: premissa verificada) | AUTONOMO
  - **Premissa verificada:** `app.config.ts:69-70` lê de `process.env.MINIMAX_API_KEY` / `process.env.OPENAI_API_KEY` com fallback para string vazia. Keys NÃO estão hardcoded. `m3.ts` lê de `expo-constants` que lê do config.
  - **Risco real:** se env vars não definidas no build, `minimaxApiKey = ''` → `obterApiKey()` retorna null → IA lança erro → `avaliador.ts` cai em fallback gracioso. App funciona sem IA, mas feature fica indisponível. (Coberto por V22.C.4 que documenta o fluxo.)
  - Acao: extrair APK de produção e rodar `strings | grep -E "sk-|eyJ|api.minimax"` para confirmar que nenhuma key escapou. Ação defensiva — provavelmente limpo.
  - DoD: confirmado que bundle não contém keys hardcoded.

## Milestone V22.E: Qualidade de conteúdo (EVOLUCAO/CORRECAO) — PENDENTE

- [ ] V22.E.1 **Regenerar ~489 canonicas "NAO SEI" via batch M2.7** — EVOLUCAO | ALTA | INVESTIGACAO | AUTONOMO
  - Módulos NT e FB (além de FB01) têm canonicas placeholder "NAO SEI". Offline, o guard SEM_GABARITO cobre; online, a IA avalia. Mas a qualidade do conteúdo fica prejudicada.
  - Acao: criar script batch que chama M2.7 para gerar canonicas reais para todas as perguntas com resposta "NAO SEI". Atualizar seed-perguntas.ts + data/db.sqlite.
  - DoD: <10 canonicas "NAO SEI" restantes (apenas as genuinamente ambíguas).

- [ ] V22.E.2 **Melhorar matching para respostas longas** — MELHORIA | MEDIA | INVESTIGACAO | AUTONOMO
  - `src/lib/matching.ts` — matchCanonico pode falhar em respostas longas mesmo quase exatas (threshold cosseno 0.50 pode ser baixo para textos com muitos tokens).
  - Acao: testar com 20+ casos reais de respostas longas e ajustar thresholds. Considerar normalização por comprimento da resposta.
  - DoD: matching com >90% acurácia em respostas longas testadas.

## Milestone V22.F: Evoluções futuras (EVOLUCAO) — BACKLOG

> Itens de evolução identificados na pesquisa externa e gaps de objetivos. Não bloqueiam release.

- [ ] V22.F.1 **Wire streak na UI + freeze semanal funcional** — EVOLUCAO | ALTA | PESQUISA_EXTERNA + INVESTIGACAO (Rodada 2: código morto) | AUTONOMO
  - `src/lib/streak.ts` existe mas NUNCA é importado por nenhuma tela (0 imports). `usarFreezeSemanal()` retorna `false` (stub). Streak é o #1 driver de retenção em apps educativos (Duolingo: streaks aumentam compromisso em 60%).
  - Acao: (1) importar `registrarAtividade()` em `final.tsx` da lição (ao concluir 100%); (2) importar `obterStreak()` + `formatarStreakTexto()` em `licoes/index.tsx` (header "🔥 N dias seguidos!"); (3) implementar `usarFreezeSemanal()` real (1 freeze por semana, persistir em DB); (4) adicionar warning de streak em perigo via notificação push (se não praticou hoje e streak > 3).
  - DoD: streak visível em /licoes, incrementa ao concluir lição, freeze funciona 1x/semana.

- [ ] V22.F.2 **Modo de revisão espaçada** — EVOLUCAO | BAIXA | PESQUISA_EXTERNA | AUTONOMO
  - Apps de educação eficazes usam spaced repetition (SM-2). O app atual não tem revisão — uma vez concluída, a lição nunca mais aparece.
  - Acao: criar modo "Revisão" que seleciona perguntas de lições concluídas há X dias, priorizando as que o usuário errou mais.
  - DoD: modo Revisão funcional com algoritmo simples de intervalo.

- [ ] V22.F.3 **Compartilhamento de conquistas via Share Sheet nativo** — EVOLUCAO | MEDIA | PESQUISA_EXTERNA + INVESTIGACAO (Rodada 2: deep-link.ts morto) | AUTONOMO
  - `src/lib/deep-link.ts` existe mas NUNCA é importado (0 imports). A função `compartilharLicao` abre WhatsApp hardcoded — falha se não instalado. Apps de referência (Duolingo, Ascend) usam share sheet nativo.
  - Acao: (1) importar `deep-link.ts` em `trofeu.tsx` e `quiz/final.tsx`; (2) substituir `Linking.openURL('whatsapp://...')` por `Share.share()` do React Native (mostra todos os apps); (3) gerar mensagem de conquista formatada ("🔥 Concluí Expert Na Bíblia! X módulos, Y dias de streak!"); (4) adicionar botão "Compartilhar" na tela de troféu e quiz/final.
  - DoD: share sheet nativo abre com mensagem formatada de conquista.

- [ ] V22.F.4 **Notificações push condicionais (streak reminder)** — EVOLUCAO | MEDIA | PESQUISA_EXTERNA | AUTONOMO
  - `src/lib/notifications.ts` existe com `agendarLembreteDiario()` mas NUNCA é chamado automaticamente. O toggle em config ativa/desativa mas não agenda. Duolingo: notificação "Sua streak está em perigo!" às 20h se não praticou = +2.5x engajamento.
  - Acao: (1) ao ativar notificações em config, chamar `agendarLembreteDiario()`; (2) ao concluir lição do dia, cancelar lembrete pendente; (3) se streak > 3 e não praticou hoje, enviar notificação "🔥 Sua streak de X dias pode acabar!" às 20h; (4) adicionar seletor de horário na tela de config (default 19h).
  - DoD: notificação push aparece se não praticou hoje, cancela ao praticar.

- [ ] V22.F.5 **Mascote que evolui com progresso** — EVOLUCAO | MEDIA | PESQUISA_EXTERNA | AUTONOMO
  - Ascend (phoenix que cresce) e Manna (study pet) são os #1 apps de Bible gamification. O mascote do Expert (PersonagemLivro) não evolui — mesmo tamanho do início ao fim. Evolução do mascote é driver de retenção (usuário quer ver crescer).
  - Acao: (1) adicionar prop `nivel` ao PersonagemLivro (1-5 baseado em módulos concluídos); (2) aumentar size progressivamente (120→140→160→180→200); (3) adicionar "aura" visual (glow dourado) nos níveis mais altos; (4) transição de nível com animação especial + SFX.
  - DoD: mascote cresce visualmente a cada 8 módulos concluídos, com feedback de nível.

- [ ] V22.F.6 **Versículo do dia / Devocional leve** — EVOLUCAO | MEDIA | PESQUISA_EXTERNA | AUTONOMO
  - FaithTime, Bible Way, YouVersion oferecem versículo do dia como "entry point" leve. O app atual exige compromisso com lição inteira (5-10 min). Versículo do dia (30s) traz usuário de volta sem pressão.
  - Acao: (1) criar tabela `versiculos_do_dia` no DB com 365 versículos pré-selecionados; (2) tela simples em /modos (card "Versículo de hoje" com versículo + referência); (3) compartilhar versículo via share sheet; (4) refresh diário automático.
  - DoD: card "Versículo de hoje" em /modos, diferente a cada dia.

- [ ] V22.F.7 **Onboarding: FlatList com 1 item -> View simples** — MELHORIA | BAIXA | INVESTIGACAO (double-check: rebaixado para backlog) | AUTONOMO
  - `src/app/onboarding.tsx:56-69` — FlatList horizontal com `data={[slide]}`. Overhead negligível, funciona perfeitamente. Nice-to-have cosmético.
  - Acao: substituir por View simples se/quando refatorar onboarding.
  - DoD: sem FlatList desnecessário (baixa prioridade).

- [ ] V22.F.8 **Exibir histórico de rankings/scores do usuário** — EVOLUCAO | BAIXA | INVESTIGACAO (double-check 2ª passada: achado novo) | AUTONOMO
  - `quiz/final.tsx:57` grava em `user_rankings` mas ninguém lê essa tabela. O usuário não tem visão do seu progresso acumulado (quantos quizzes fez, score médio, evolução temporal).
  - Acao: (1) criar `listarRankings()` em db-queries.ts; (2) adicionar seção "Seu histórico" em /config ou como modal acessível de /modos; (3) mostrar últimos 10 scores com data + tipo (lição/quiz).
  - DoD: usuário pode ver seu histórico de scores.

- [ ] V22.F.9 **Preencher referencias_biblicas no seed** — EVOLUCAO | BAIXA | INVESTIGACAO (double-check 2ª passada: achado novo) | AUTONOMO
  - Schema `perguntas` tem campo `referencias_biblicas TEXT` mas nenhum seed o preenche. Se preenchido, a tela de feedback poderia exibir "Referência: Gênesis 1:1" — enriquece valor educacional.
  - Acao: (1) gerar referências via batch M2.7 para as 4345 perguntas; (2) exibir na tela de feedback quando disponível.
  - DoD: referências bíblicas exibidas no feedback de acerto/erro.

- [ ] V22.F.10 **Upgrade Expo SDK 55 -> 56** — MANUTENCAO | ALTA | INVESTIGACAO (double-check: recuperado como backlog) | AUTONOMO
  - Expo SDK 55 está em deprecated path. SDK 56 traz New Architecture melhorias, Hermes 0.82, correções de segurança.
  - **Breaking changes conhecidas:** expo-router 56.x, react-native 0.86, possíveis mudanças em expo-sqlite API.
  - Acao: planejar upgrade dedicado com: (1) `npx expo install expo@latest`; (2) fixar breaking changes; (3) rodar testes + build completo; (4) validar no emulador.
  - DoD: app funcional no SDK 56 com todos os testes passando.

## Milestone V22.H: Otimização de assets, dados e engajamento (RODADA 3) — PENDENTE

> 10 achados da Rodada 3 — análise de assets, DB schema, seed data, git history, e padrões não-utilizados.

- [ ] V22.H.1 **Remover 2 áudio mortos do APK (114KB)** — MANUTENCAO | ALTA | INVESTIGACAO (Rodada 3) | AUTONOMO
  - `assets/audio/musica_fundo.mp3` (81KB) e `assets/audio/musica_fundo_v2.mp3` (33KB) NUNCA são referenciados em código — só `musica_fundo_v3.mp3` é usado (sound.ts:143-152). Adicionam 114KB ao APK sem benefício.
  - Acao: deletar os 2 arquivos. Verificar que Metro bundler não inclui arquivos não-referenciados (deve ser safe com `require()`).
  - DoD: APK ~114KB menor, zero impacto em funcionalidade.

- [ ] V22.H.2 **Adicionar data/ ao .gitignore + remover db.sqlite do git** — MANUTENCAO | ALTA | INVESTIGACAO (Rodada 3) | AUTONOMO
  - `data/` NÃO está em .gitignore. `data/db.sqlite` (2.7MB) é binário rastreado pelo git — cada rebuild gera diff gigante no histórico. `*.log` está ignorado mas `data/*.json` e `data/*.html` não.
  - Acao: (1) adicionar `data/` ao .gitignore; (2) `git rm --cached data/db.sqlite data/*.json data/*.html` (manter no disco, remover do tracking); (3) documentar no README que `data/db.sqlite` é gerado pelo seed na primeira execução.
  - DoD: `data/` não rastreado pelo git, repo mais leve.

- [ ] V22.H.3 **Mover seed data de TS para JSON + gerar em build time** — MANUTENCAO | ALTA | INVESTIGACAO (Rodada 3) | AUTONOMO
  - `seed-perguntas.ts` (824KB) e `seed-quiz.ts` (massivo) são arquivos TS com dados brutos. Cada commit que altera dados gera diff enorme. Dados deveriam estar em JSON (ou CSV) e o seed.ts deveria ler o JSON em runtime.
  - Acao: (1) extrair dados dos INSERTs para `data/perguntas.json` e `data/quiz_alternatives.json`; (2) refatorar seed-perguntas.ts e seed-quiz.ts para ler JSON em vez de hardcodar SQL; (3) adicionar `data/*.json` ao .gitignore (dados são regeneráveis via batch M2.7).
  - DoD: seed files < 10KB (lógica de leitura JSON), dados em JSON não-rastreado.

- [ ] V22.H.4 **Exibir referências bíblicas no feedback** — EVOLUCAO | MEDIA | INVESTIGACAO (Rodada 3: campo existe mas nunca usado) | AUTONOMO
  - Schema `perguntas` tem `referencias_biblicas TEXT` (database.ts:79) e tipo `string[]` (index.ts:32), mas: (a) seed-perguntas.ts define NULL para TODAS as 4345 perguntas; (b) nenhuma tela lê o campo. O campo é infraestrutura morta.
  - Acao: (1) gerar referências via batch M2.7 para as perguntas (ex: "Gênesis 1:1" para perguntas sobre criação); (2) exibir na tela de feedback (feedback.tsx) quando disponível: "Referência: {ref}"; (3) exibir na tela de pergunta como hint opcional.
  - DoD: referências bíblicas exibidas no feedback quando disponíveis.

- [ ] V22.H.5 **Dificuldade adaptativa (FACIL/MEDIO/DIFICIL)** — EVOLUCAO | MEDIA | INVESTIGACAO (Rodada 3: infra existe, nunca implementada) | AUTONOMO
  - Schema tem campo `dificuldade` (FACIL/MEDIO/DIFICIL) mas TODAS as 4345 perguntas são MEDIO. Nenhuma lógica filtra ou adapta por dificuldade. Infraestrutura existe mas é morta.
  - Acao: (1) classificar ~30% das perguntas como FACIL (conceitos básicos) e ~20% como DIFICIL (análise profunda) via batch M2.7; (2) no Quiz, começar com perguntas FACIL e progredir para MEDIO/DIFICIL conforme acertos; (3) nas Lições, mostrar dificuldade atual como badge visual.
  - DoD: perguntas classificadas por dificuldade, Quiz adapta conforme desempenho.

- [ ] V22.H.6 **Botão "Reportar erro" na resposta canônica** — EVOLUCAO | MEDIA | INVESTIGACAO (Rodada 3) | AUTONOMO
  - Se a resposta canônica de uma pergunta está errada (ex: "NAO SEI", factualmente incorreta), o usuário não tem como reportar. Com ~489 canonicas "NAO SEI" + possíveis erros nas 3856 restantes, isso é importante para qualidade.
  - Acao: (1) adicionar botão "Reportar erro" discreto na tela de feedback; (2) gravar em tabela `reports` no SQLite (pergunta_id, resposta_usuario, timestamp); (3) exportar reports para análise offline (script que gera CSV); (4) não enviar para servidor (offline-first).
  - DoD: usuário pode reportar erros, reports gravados localmente para análise.

- [ ] V22.H.7 **Limpar artifacts de batch do diretório data/** — MANUTENCAO | BAIXA | INVESTIGACAO (Rodada 3) | AUTONOMO
  - `data/` contém 20+ arquivos de log/checkpoint de geração M2.7 (`m2_batch_v9*.log`, `checkpoint_v9.json`, `catbox_response_v9.html`, etc.). São artifacts de processo, não dados do app.
  - Acao: manter apenas `data/db.sqlite` (ou nem isso, se V22.H.3 mover para seed JSON). Deletar logs, checkpoints, catbox responses.
  - DoD: `data/` limpo (apenas dados essenciais ou vazio).

- [ ] V22.H.8 **Limpar screenshots antigos do dist/** — MANUTENCAO | BAIXA | INVESTIGACAO (Rodada 3) | AUTONOMO
  - `dist/` contém `screenshot_*.png` de V9 (4 arquivos, ~140KB) que são artifacts de validação, não distribuição.
  - Acao: mover screenshots para `orchestration/v9_validation/` ou deletar.
  - DoD: dist/ contém apenas APKs/AABs (regra das 5).

- [ ] V22.H.9 **Cache de módulos em customizar.tsx** — MELHORIA | BAIXA | INVESTIGACAO (Rodada 3) | AUTONOMO
  - `quiz/customizar.tsx:19` chama `listarModulos()` em cada mount. Se o usuário vai e volta do quiz, refaz a query de 40 módulos.
  - Acao: usar `useFocusEffect` (expo-router) com cache em state (só refetch se lista vazia) OU passar módulos via params da rota.
  - DoD: módulos carregados 1x, navegação instantânea.

- [ ] V22.H.10 **Dificuldade visual por pergunta (badge)** — MELHORIA | BAIXA | INVESTIGACAO (Rodada 3, depende V22.H.5) | AUTONOMO
  - Com V22.H.5 implementado, mostrar badge de dificuldade na tela de pergunta (⭐ Fácil, ⭐⭐ Médio, ⭐⭐⭐ Difícil) dá feedback visual de progresso.
  - Acao: adicionar badge no quadro da pergunta (licaoId.tsx e jogar.tsx) quando `dificuldade` !== 'MEDIO'.
  - DoD: badge de dificuldade visível quando pergunta não é MEDIO.

## Milestone V22.I: Segurança, git bloat e limpeza de dados (RODADA 4) — PENDENTE

> 10 achados da Rodada 4 — análise de configs, git history, navegação, e segurança.

- [ ] V22.I.1 **[CRÍTICO] Revogar credencial exposta no git history** — SEGURANCA | CRITICA | INVESTIGACAO (Rodada 4) | DEPENDE_VOCE
  - `orchestration/release_keystore_credentials.md` contém senha do keystore (`expert2026`) em plaintext. Committado em V17 (2721dc4). Mesmo deletando o arquivo, a senha permanece no git history.
  - Acao: (1) DELETAR o arquivo AGORA; (2) gerar NOVO keystore com senha diferente (`keytool -genkeypair ...`); (3) atualizar `android/app/build.gradle` com novo keystore; (4) considerar `git filter-repo` para scrub do history (OU aceitar que o repo é privado e a senha antiga não é reutilizável); (5) NUNCA mais committar credenciais.
  - DoD: keystore antigo revogado, novo keystore com senha forte, arquivo deletado.

- [ ] V22.I.2 **Limpar 84 PNGs de validação do orchestration/ (131MB)** — MANUTENCAO | ALTA | INVESTIGACAO (Rodada 4) | AUTONOMO
  - `orchestration/` contém 84 PNG screenshots de validação (V9-V21) + XML dumps + logs. Total: 131MB rastreados pelo git. Repo tem 119MB — a maior parte são esses screenshots.
  - Acao: (1) mover PNGs para `orchestration/archive/` e adicionar `orchestration/archive/` ao .gitignore; (2) OU manter apenas os das últimas 2 versões (V20, V21) e deletar os anteriores; (3) `git rm --cached` dos arquivos removidos.
  - DoD: orchestration/ < 10MB, screenshots antigos fora do git.

- [ ] V22.I.3 **Remover docs/questions_clean.json (1.3MB) do git** — MANUTENCAO | ALTA | INVESTIGACAO (Rodada 4) | AUTONOMO
  - `docs/questions_clean.json` (1.3MB) é o JSON bruto das planilhas WhatsApp usado para gerar o seed. Dados já estão em `seed-perguntas.ts` e `data/db.sqlite`. Redundante e infla o repo.
  - Acao: (1) `git rm --cached docs/questions_clean.json`; (2) adicionar ao .gitignore; (3) manter no disco para referência (não versionado).
  - DoD: JSON não rastreado, repo mais leve.

- [ ] V22.I.4 **Remover path aliases nunca usados (babel + tsconfig)** — MANUTENCAO | MEDIA | INVESTIGACAO (Rodada 4) | AUTONOMO
  - `babel.config.js` define 7 aliases (`@/`, `@assets/`, `@components/`, `@lib/`, `@db/`, `@types/`, `@constants/`). `tsconfig.json` mapeia os mesmos. MAS: 0 arquivos fonte usam qualquer alias — todos usam paths relativos (`../../../lib/...`). Configuração morta que confunde desenvolvedores.
  - Acao: (1) remover aliases do `babel.config.js` (plugin `module-resolver` pode ser removido entirely se não há outros usos); (2) remover `paths` do `tsconfig.json`; (3) manter `module-resolver` apenas se houver outros usos além dos aliases.
  - DoD: config limpa, sem aliases não-usados.

- [ ] V22.I.5 **Corrigir onboarding: duplo redirecionamento** — CORRECAO | MEDIA | INVESTIGACAO (Rodada 4) | AUTONOMO
  - `onboarding.tsx:47` faz `router.replace('/')` que vai para `index.tsx` (splash) que depois redireciona para `/modos`. Duplo hop desnecessário — deveria ir direto para `/modos`.
  - Acao: trocar `router.replace('/')` por `router.replace('/modos')` em `onboarding.tsx:47` e `:89`.
  - DoD: onboarding → /modos direto (sem passar pelo splash).

- [ ] V22.I.6 **Adicionar botão "Voltar" em quiz/index.tsx e quiz/customizar.tsx** — MELHORIA | BAIXA | INVESTIGACAO (Rodada 4) | AUTONOMO
  - `quiz/index.tsx` e `quiz/customizar.tsx` não têm header com botão voltar. Usuário precisa usar o botão físico do Android para voltar. Inconsistente com `licoes/[moduloId].tsx` que tem "← Voltar".
  - Acao: adicionar header com botão voltar (mesmo padrão de `[moduloId].tsx`).
  - DoD: botão "← Voltar" visível em quiz/index e quiz/customizar.

- [ ] V22.I.7 **Remover whatsapp_media/ do git (1.5MB)** — MANUTENCAO | MEDIA | INVESTIGACAO (Rodada 4) | AUTONOMO
  - `whatsapp_media/` contém 17 imagens + 4 planilhas XLSX do WhatsApp. Dados já processados no seed/DB. 1.5MB rastreados.
  - Acao: (1) `git rm --cached -r whatsapp_media/`; (2) adicionar ao .gitignore; (3) manter no disco para referência.
  - DoD: whatsapp_media/ não rastreado.

- [ ] V22.I.8 **Otimizar moduloLiberado() — O(n²) para O(n)** — MELHORIA | BAIXA | INVESTIGACAO (Rodada 4) | AUTONOMO
  - `licoes/index.tsx:30` chama `moduloLiberado(index, modulos)` em cada `renderItem`. A função percorre `modulos[index-1]` — O(1) por chamada, mas com 40 módulos = 40 chamadas por render. Na prática é rápido, mas poderia ser O(1) total com pre-computação.
  - Acao: calcular Set de IDs liberados em um `useMemo` antes do FlatList e passar para renderItem.
  - DoD: lógica de liberação pré-computada (O(n) total).

- [ ] V22.I.9 **Remover raw_whatsapp_extraction.json do git** — MANUTENCAO | BAIXA | INVESTIGACAO (Rodada 4) | AUTONOMO
  - `docs/raw_whatsapp_extraction.json` (20KB) é extração bruta do WhatsApp, processada e não mais necessária.
  - Acao: `git rm --cached`, adicionar ao .gitignore.
  - DoD: arquivo não rastreado.

- [ ] V22.I.10 **Adicionar orchestration/*.png e docs/*.json ao .gitignore** — MANUTENCAO | ALTA | INVESTIGACAO (Rodada 4) | AUTONOMO
  - .gitignore atual não exclui PNGs de orchestration nem JSONs de docs. Resultado: 131MB+ de screenshots e dados rastreados.
  - Acao: adicionar ao .gitignore:
    ```
    orchestration/*.png
    orchestration/*.xml
    orchestration/archive/
    docs/questions_clean.json
    docs/raw_whatsapp_extraction.json
    whatsapp_media/
    data/
    ```
  - DoD: .gitignore previne rastreamento de artifacts.

## Milestone V22.J: Scripts, permissões e credenciais (RODADA 5) — PENDENTE

> 10 achados da Rodada 5 — análise de scripts/, Android permissions, configs de build.

- [ ] V22.J.1 **[CRÍTICO] Revogar API key Minimax hardcoded em generate_canonicos.py** — SEGURANCA | CRITICA | INVESTIGACAO (Rodada 5) | DEPENDE_VOCE
  - `scripts/generate_canonicos.py:8` contém API key Minimax em plaintext: `sk-cp-OZy9Fk5...`. É o 2º arquivo com credencial exposta (além do keystore).
  - Acao: (1) DELETAR o arquivo OU substituir key por `os.environ['MINIMAX_API_KEY']`; (2) revogar a key no painel Minimax; (3) gerar nova key; (4) `git filter-repo` OU aceitar que repo é privado.
  - DoD: key hardcoded removida, key antiga revogada.

- [ ] V22.J.2 **Remover 3 permissões Android desnecessárias** — MANUTENCAO | MEDIA | INVESTIGACAO (Rodada 5) | AUTONOMO
  - `AndroidManifest.xml` declara `SYSTEM_ALERT_WINDOW`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`. Nenhuma é usada no código fonte. São leftovers do template Expo.
  - Acao: remover as 3 permissões do AndroidManifest (via `app.config.ts` plugins ou editando direto no prebuild).
  - DoD: manifest limpo, sem permissões desnecessárias.

- [ ] V22.J.3 **Remover scripts mortos de V9 (5 arquivos)** — MANUTENCAO | BAIXA | INVESTIGACAO (Rodada 5) | AUTONOMO
  - Scripts que não são mais usados:
    1. `scripts/generate_canonicos.py` — Python script com credencial hardcoded
    2. `scripts/debug_m2_raw.js` — debug script de V9
    3. `scripts/preflight_v9_db_inspect.js` — preflight de V9
    4. `scripts/preflight_v9_m2_ping.js` — preflight de V9
    5. `scripts/restore_ids.js` — restore de V9
  - Acao: deletar os 5 scripts (verificar que não são referenciados em package.json scripts).
  - DoD: scripts/ limpo (apenas scripts atuais).

- [ ] V22.J.4 **Remover .js duplicados de scripts (manter .ts)** — MANUTENCAO | BAIXA | INVESTIGACAO (Rodada 5) | AUTONOMO
  - `generate_canonicos_v9.js` e `import_direct.js` são versões compiladas dos .ts correspondentes. Não deveriam estar no repositório (gerados por `tsc`).
  - Acao: deletar os .js, adicionar `scripts/*.js` ao .gitignore (exceto os que são intencionalmente .js como `build-release.sh`).
  - DoD: apenas .ts e .sh em scripts/.

- [ ] V22.J.5 **Avaliar expo-updates: remover ou ativar** — MANUTENCAO | BAIXA | INVESTIGACAO (Rodada 5) | AUTONOMO
  - `AndroidManifest.xml` tem `expo.modules.updates.ENABLED=false`. Plugin `expo-updates` não está no package.json mas config existe. Se não vai usar OTA updates, remover a config. Se vai usar, ativar.
  - Acao: decidir — provavelmente remover (app usa EAS Build, não OTA).
  - DoD: config consistente com estratégia de deploy.

- [ ] V22.J.6 **Remover generate_canonicos.py do git** — SEGURANCA | ALTA | INVESTIGACAO (Rodada 5) | AUTONOMO
  - Arquivo com credencial hardcoded NÃO deveria estar no repositório.
  - Acao: `git rm --cached scripts/generate_canonicos.py` + adicionar ao .gitignore.
  - DoD: arquivo com credencial não rastreado.

## Milestone V22.K: Acessibilidade, testes e polish final (RODADA 6) — PENDENTE

> 6 achados da Rodada 6 — análise de a11y, testes E2E, privacy policy, CI.

- [ ] V22.K.1 **Adicionar accessibilityLabel em todos os elementos interativos** — MELHORIA | ALTA | INVESTIGACAO (Rodada 6) | AUTONOMO
  - Apenas 4 de ~30+ elementos interativos têm accessibilityLabel (logo, troféu, IconeHome, IconeSom). Elementos críticos SEM label:
    - ENVIAR button (licaoId.tsx)
    - PROSSEGUIR/VOLTAR buttons (feedback.tsx)
    - Quiz alternatives (jogar.tsx) — cada uma das 4 opções
    - Config switches (config.tsx) — 6 toggles
    - Module/Lesson cards (licoes/index.tsx, [moduloId].tsx)
    - Onboarding buttons (onboarding.tsx)
    - Quiz index cards (quiz/index.tsx)
  - Acao: adicionar `accessibilityLabel` e `accessibilityRole="button"` em todos os Pressable/Switch interativos.
  - DoD: TalkBack/VoiceOver anuncia corretamente todos os elementos interativos.

- [ ] V22.K.2 **Adicionar testIDs para testes E2E** — INFRA | MEDIA | INVESTIGACAO (Rodada 6) | AUTONOMO
  - Zero elementos têm `testID` no código fonte. O teste E2E (`splash.spec.ts`) é stub — não testa nada real. Playwright não consegue selecionar elementos sem testIDs.
  - Acao: adicionar `testID` nos elementos-chave (botões, cards, inputs, listas) para permitir testes E2E robustos.
  - DoD: elementos-chave têm testID para seleção E2E.

- [ ] V22.K.3 **Atualizar privacy policy: remover seções AdMob e Sentry** — CORRECAO | MEDIA | INVESTIGACAO (Rodada 6) | AUTONOMO
  - `docs/PRIVACY_POLICY.md` menciona Google AdMob (Seção 3) e Sentry (Seção 4) como serviços ativos. Nenhum está implementado — AdMob é PLACEHOLDER, Sentry foi removido V13. A privacy policy HTML (`privacy.html`) provavelmente tem o mesmo conteúdo.
  - Acao: (1) remover ou marcar como "futuro" as seções 3 e 4; (2) atualizar `privacy.html` correspondente; (3) atualizar versão/data.
  - DoD: privacy policy reflete apenas serviços realmente ativos (Minimax + OpenAI).

- [ ] V22.K.4 **Paralelizar jobs no CI** — MELHORIA | BAIXA | INVESTIGACAO (Rodada 6) | AUTONOMO
  - `.github/workflows/ci.yml` — `test-unit` depende de `lint-type-check` (`needs: lint-type-check`). São independentes — poderiam rodar em paralelo.
  - Acao: remover `needs: lint-type-check` de `test-unit` (ambos rodam em paralelo).
  - DoD: CI ~30% mais rápido (jobs paralelos).

- [ ] V22.K.5 **Remover upload de coverage não-utilizado** — MANUTENCAO | BAIXA | INVESTIGACAO (Rodada 6) | AUTONOMO
  - CI faz `upload-artifact` de `coverage/` mas nenhum job consome esse artifact. Ocupa espaço no Actions sem benefício.
  - Acao: remover o step `Upload coverage` OU adicionar step que comenta coverage no PR (via `jest-coverage-report-action`).
  - DoD: CI limpo, sem artifacts inúteis.

- [ ] V22.K.6 **Criar testes E2E reais (substituir stub)** — INFRA | MEDIA | INVESTIGACAO (Rodada 6) | AUTONOMO
  - `__tests__/e2e/splash.spec.ts` é stub — `page.goto('/')` + `toHaveTitle(/Expert/)`. Não testa nada real do app.
  - Acao: criar pelo menos 1 teste E2E real: splash → modos → licoes → pergunta → feedback. Usar testIDs (V22.K.2) para seleção.
  - DoD: teste E2E que valida jornada básica do usuário.

## Milestone V22.L: Qualidade de código e edge cases (RODADA 7) — PENDENTE

> 3 achados significativos da Rodada 7 — análise de catch blocks, hooks, e edge cases.

- [ ] V22.L.1 **Adicionar logging em catch blocks silenciados** — MELHORIA | MEDIA | INVESTIGACAO (Rodada 7) | AUTONOMO
  - 40 catch blocks no código, muitos com corpo vazio ou apenas comentário. Erros de DB, haptics, ranking, e avaliação são silenciados. Em produção, bugs ficam invisíveis.
  - Acao: adicionar `console.warn('[contexto] operacao falhou:', e)` nos catch blocks críticos (db-queries, avaliador, quiz/final). Manter vazios apenas para haptics (não-crítico).
  - DoD: erros críticos logados no logcat para diagnóstico.

- [ ] V22.L.2 **Adicionar PRAGMA journal_mode=WAL para performance SQLite** — MELHORIA | BAIXA | INVESTIGACAO (Rodada 7) | AUTONOMO
  - Nenhum pragma de performance no banco. WAL (Write-Ahead Logging) melhora performance de leitura concorrente e reduz locks.
  - Acao: adicionar `db.execSync('PRAGMA journal_mode=WAL')` em `database.ts` após `openDatabaseSync()`.
  - DoD: WAL mode ativo, queries de leitura não bloqueadas por writes.

- [ ] V22.L.3 **listarModulos() desnecessário em [moduloId].tsx** — MELHORIA | BAIXA | INVESTIGACAO (Rodada 7, duplicata de V22.A.5) | AUTONOMO
  - Já coberto por V22.A.5 (criar `listarModuloPorId()`). Mantido aqui como referência cruzada.

## Dependencias entre milestones V22
- **V22.I.1 (keystore) DEVE ser PRIMEIRO** — credencial exposta é risco de segurança imediato
- V22.I.2-3-7-9-10 (git cleanup) deve vir cedo — reduz 119MB para <10MB, melhora performance do git
- V22.A (bugs) pode rodar em paralelo com V22.B (UX) e V22.G (limpeza)
- V22.C.2 (error boundaries) deve vir antes de V22.D (segurança)
- V22.G (código morto) antes de V22.F (evoluções) — wirear streak/deep-link/notifications
- V22.H.3 (seed JSON) antes de V22.H.4 (referências) e V22.H.5 (dificuldade)
- V22.H.5 (dificuldade) antes de V22.H.10 (badge visual)
- Ordem recomendada: **V22.I.1 → V22.I.2-10 → V22.A → V22.B → V22.H.1-3 → V22.C → V22.D → V22.G → V22.E → V22.H.4-6 → V22.F → V22.H.7-10**

## Dependencias de voce (V22)
- **Revogar keystore antigo** (V22.I.1) — CRÍTICO: gerar novo keystore com senha diferente (o antigo `expert2026` está no git history). Destrava: segurança do app.
- **EAS projectId + eas.json** (V22.C.1) — falta de voce: rodar `eas init` no projeto OU fornecer ID existente. Destrava: EAS Build funcional.
- **AdMob real IDs** (backlog V8) — falta de voce: criar conta AdMob + obter App ID. Destrava: monetização.
- **Poses douradas assustado/triste** (backlog V20) — falta de voce: designer subir assets. Destrava: mascote completo nas lições.

## Milestone V22.G: Código morto, bugs ocultos e limpeza (CORRECAO/MANUTENCAO) — PENDENTE

> Achados da Rodada 2 (análise linha-a-linha de todos os 55 arquivos fonte + pesquisa externa).

- [ ] V22.G.1 **FIX: cache de haptics nunca invalidado** — CORRECAO | MEDIA | INVESTIGACAO (Rodada 2) | AUTONOMO
  - `src/lib/haptics.ts:12-16` — `cache` é setado na primeira chamada de `shouldVibrate()` mas NUNCA é invalidado. `invalidateHapticsCache()` existe (linha 39) mas NUNCA é chamada. Se usuário desativar haptics em config, o cache continua `true` até reiniciar o app.
  - Acao: chamar `invalidateHapticsCache()` em `config.tsx` após `toggle('hapticos', v)`.
  - DoD: toggle de haptics em config tem efeito imediato.

- [ ] V22.G.2 **Verificar qualidade dos distratores do Quiz no seed** — CORRECAO | MEDIA | INVESTIGACAO (double-check 2ª passada: premissa corrigida) | AUTONOMO
  - **Premissa corrigida:** 4341/4345 perguntas JÁ têm quiz_alternativas no seed (3816 FB/AT + 525 NT). O fallback `gerarAlternativas()` com distratores triviais é praticamente CÓDIGO MORTO (nunca acionado em produção). O problema real é a QUALIDADE dos distratores no seed — verificar se os 3 distratores de cada pergunta são plausíveis ou óbvios.
  - Acao: (1) amostrar 50 quiz_alternativas do seed e verificar manualmente se distratores são plausíveis; (2) se ruins, regenerar via batch M2.7; (3) melhorar `gerarAlternativas()` como defesa (usar canônicas de outras perguntas da mesma lição em vez de `${resposta} (verso X)`).
  - DoD: distratores do Quiz são plausíveis (não óbvios).

- [ ] V22.G.3 **Remover 4 arquivos mortos do projeto** — MANUTENCAO | BAIXA | INVESTIGACAO (double-check 2ª passada: +1 arquivo) | AUTONOMO
  - Arquivos com 0 imports em todo o projeto:
    1. `src/components/BackHandlerOffline.tsx` — removido do _layout.tsx em V12, nunca mais importado
    2. `src/lib/quiz-alternatives.ts` — substituído por `quiz-alternatives-db.ts`, nunca mais importado
    3. `src/lib/design-tokens.ts` — TEMA/ESPACO/BORDA/TIPOGRAFIA definidos mas NUNCA usados por nenhum componente
    4. `src/lib/sqlcipher.ts` — NUNCA importado, depende de `expo-sqlite-cipher` NÃO instalado, PRAGMA key com interpolação insegura
  - Acao: deletar os 4 arquivos (verificar que não são referenciados em testes ou scripts).
  - DoD: 4 arquivos mortos removidos, zero impacto em testes/build.

- [ ] V22.G.4 **Wire deep-link.ts nos fluxos de compartilhamento** — MELHORIA | MEDIA | INVESTIGACAO (Rodada 2: código morto) | AUTONOMO
  - `src/lib/deep-link.ts` — NUNCA importado (0 imports). Função `compartilharLicao` abre WhatsApp hardcoded (falha se não instalado).
  - Acao: (1) importar em `trofeu.tsx` e `quiz/final.tsx`; (2) trocar `Linking.openURL('whatsapp://...')` por `Share.share()` nativo; (3) atualizar mensagem de compartilhamento com conquista.
  - DoD: compartilhamento via share sheet nativo funcional.

- [ ] V22.G.5 **Wire quota-monitor.ts para monitoramento de uso M3** — MANUTENCAO | BAIXA | INVESTIGACAO (Rodada 2: código morto) | AUTONOMO
  - `src/lib/quota-monitor.ts` — NUNCA importado. Monitor de quota M3 com alerta Telegram existe mas nunca é chamado.
  - Acao: chamar `checarEAlertar()` em `_layout.tsx` (1x ao abrir app) ou em `avaliador.ts` (a cada chamada M3).
  - DoD: quota M3 monitorada, alerta Telegram funciona se >80%.

## Itens rejeitados V22
- Nenhum item rejeitado. Todos os achados foram promovidos para milestones ou backlog com justificativa.
- iOS: REJEITADO (decisão mantida)
- Multi-idioma: REJEITADO (decisão mantida)
- Backend dedicado: REJEITADO (decisão V9 mantida, apenas atualizar docs)

## Proximo passo
Aprovar este plano e despachar `@full-cycle` com os milestones como escopo.

Ordem recomendada: **V22.A -> V22.B -> V22.C -> V22.D -> V22.E** (V22.F em paralelo como backlog).

---

# ===== PLANOS ANTERIORES (histórico) =====

> Tudo abaixo é histórico de V18-V21. Os milestones [x] estão concluídos. Os [ ] pendentes foram consolidados no plano V22 acima quando aplicável.

## Inbox (apontamentos a triar)

> Apontamentos informais registrados a qualquer momento. Items triados vao para milestones ou "Itens rejeitados".

- [x] [2026-06-25] [fonte: USUARIO] Bugs visuais e de layout ainda presentes no app — **TRIADO V18**: VALIDO. Promovido para milestones MA/MB/MC/MD.
- [x] [2026-06-25] [fonte: USUARIO] Looping infinito em um dos modulos — **TRIADO V18**: VALIDO. Promovido para milestone M-LOOP.
- [x] [2026-06-25] [fonte: USUARIO] Mascote dourado nas Licoes — **ENTREGUE V20**.
- [x] [2026-06-25] [fonte: USUARIO] IA obrigatoria nas licoes — **ENTREGUE V20**.
- [ ] [2026-06-25] [fonte: INVESTIGACAO] PRIVACIDADE GitHub: auto-push hook sobe orchestration/CLAUDE.md ao remoto. Usuario decidiu "NAO MEXER AGORA". Repo privado.
- [x] [2026-06-25] [fonte: USUARIO] Confiabilidade da IA (timeout M2.7 curto) — **ENTREGUE V21**.
- [x] [2026-06-25] [fonte: USUARIO] Canonica FB01-L01-Q07 placeholder — **ENTREGUE V21**.
- [x] [2026-06-25] [fonte: USUARIO] Acentuacao PT-BR nas telas — **ENTREGUE V21**.
- [x] [2026-06-25] [fonte: INVESTIGACAO] Tela de feedback nao rolavel — **ENTREGUE V21**.
- [ ] [2026-06-25] [fonte: INVESTIGACAO] ~489 canonicas "NAO SEI" em modulos NT — **PROMOVIDO V22.E.1**.
- [ ] [2026-06-25] [fonte: INVESTIGACAO] matching falha em respostas longas — **PROMOVIDO V22.E.2**.
- [ ] [2026-06-26] [fonte: INVESTIGACAO] 16 moderate vulns em @expo/config chain — **PROMOVIDO V22.D.1**.
- [ ] [2026-06-26] [fonte: INVESTIGACAO] Expo SDK 56 disponível (v55 deprecated) — **PROMOVIDO V22.C** (backlog upgrade).
- [ ] [2026-06-26] [fonte: INVESTIGACAO] Error boundaries ausentes — **PROMOVIDO V22.C.3** (CRITICA).
- [ ] [2026-06-26] [fonte: INVESTIGACAO] EAS projectId placeholder — **PROMOVIDO V22.C.2**.
- [ ] [2026-06-26] [fonte: INVESTIGACAO] Privacy policy HTML precisa verificação — **PROMOVIDO V22.C.1**.
- [ ] [2026-06-26] [fonte: INVESTIGACAO] Docs inconsistentes (backend Node.js mencionado mas descartado) — **PROMOVIDO V22.C.4**.

---

# ===== PLANO V20 (2026-06-25) — CONFORMIDADE DO BRIEFING (mascote dourado + IA obrigatoria) =====

> Ciclo @full-cycle (agent). 2 lacunas de conformidade do briefing que impediam o "100%".
> Gates: tsc 0 | jest 94/94 | eslint 0 | APK V20 vc5/1.10.0. Evidencias: orchestration/v20_validation/.

## Milestone V20.A: Mascote DOURADO no modo Licoes — ENTREGUE
- [x] V20.A.1 **Obter set DOURADO da designer** — INFRA | ALTA | USUARIO | DESTRAVAVEL(Drive)
  - Drive "Personagens" (compartilhada) -> 3 poses DOURADAS reais baixadas via Playwright (Chrome
    logado): golden_13 (exclamando/dedo p/ cima), golden_14 (pensativo/queixo), golden_15
    (questionando). Set dourado eh PARCIAL (so 3 poses positivas/neutras; SEM assustado/triste).
    Processadas p/ transparente ~760px em assets/images/personagem_licoes_*.png.
- [x] V20.A.2 **PersonagemLivro prop `variante: 'licoes'|'quiz'`** — MELHORIA | ALTA | AUTONOMO
  - Default 'quiz' (roxo, preserva legado). 2 mapas (IMAGENS_LICOES dourado / IMAGENS_QUIZ roxo).
- [x] V20.A.3 **Wire variante='licoes' nas 3 telas de Licoes** — MELHORIA | ALTA | AUTONOMO
  - [licaoId].tsx (pergunta), feedback.tsx, final.tsx. Quiz mantem roxo (default).
  - LIMITACAO HONESTA: assustado/triste nas licoes usam a pose dourada "questionando" (set dourado
    nao tem essas emocoes). Reabrir se a designer subir poses dourado-assustado/triste.

## Milestone V20.B: IA obrigatoria nas licoes (regra #4) — ENTREGUE
- [x] V20.B.1 **Wire `avaliarResposta` (hibrido) no enviar() da licao** — CORRECAO | ALTA | AUTONOMO
  - Substitui matchCanonico cru. Loading "AVALIANDO..." + bloqueio duplo-envio + feedback da IA na tela.
- [x] V20.B.2 **[BUG REAL] Parser do M2.7 (think + cercas markdown) quebrava a IA** — CORRECAO | ALTA | INVESTIGACAO(integracao real)
  - novo src/lib/parse-json.ts (extrairAvaliacaoJson) aplicado em m3.ts/openai.ts. +7 testes regressao.
  - COMPROVADO: integracao Node real vs MiniMax-M2.7 (4/4 casos).

## Itens rejeitados / backlog V20
- quiz-alternatives.ts tem o MESMO padrao de parsing fragil (filtrarThink + JSON.parse sem strip de
  cercas) na geracao de distratores — fora do escopo V20 (batch offline). FOLLOW-UP: aplicar
  extrairAvaliacaoJson la se for usado em runtime.
- Poses dourado assustado/triste dedicadas: dependem da designer (DESTRAVAVEL).

---

# ===== PLANO V18 (2026-06-25) — FIDELIDADE VISUAL + FIX LOOP + VALIDACAO MOCK-A-MOCK =====

> Este bloco e a ATUALIZACAO V18. Os milestones antigos (M0-M17) permanecem abaixo como historico.
> M16.1/M16.2/M17 do plano antigo foram CONSOLIDADOS aqui (mesma causa-raiz) e marcados superseded.

## Resumo Executivo V18

Apos 5 ciclos (V8/V10/V11/V12/V14) atacando "fidelidade visual" sem resolver, a investigacao V18 encontrou a **causa-raiz do ciclo** — e ela tem 3 camadas:

1. **Loop do Quiz = bug de DADOS, nunca corrigido.** O Quiz trava num spinner eterno ("nem entra na tela") porque `src/app/quiz/jogar.tsx:90-93` monta IDs hardcoded `M001..M004` que **nao existem** no DB (IDs reais sao `FB##/AT##/NT##`). A query retorna `[]` sem lancar erro -> o fallback mock nao dispara -> `ActivityIndicator` para sempre. As tentativas V10/V14 corrigiram loops de re-render (que estavam OK) e nunca tocaram o bug de dados. Afeta Aleatorio E Personalizado (que tambem ignora os params da rota).

2. **Design infiel por impossibilidade fisica, nao por ajuste fino.** (a) `expo-linear-gradient` **nao esta instalado** — ha ZERO degrades no app inteiro; ~12 superficies que o briefing pede em degrade estao em cor solida. (b) **Todos os assets sao JPG com fundo** (screenshots do WhatsApp), inclusive `logo.png` que e um JPEG renomeado. O `PersonagemLivro` renderiza esse JPG dentro de um `<View>` roxo com borda -> exatamente "imagem com fundo dentro de um quadrado". Nenhum CSS conserta um JPG com fundo embutido + lib de degrade ausente. Os PNGs transparentes originais (Drive da designer) nunca foram baixados.

3. **Validacao insuficiente perpetuou o ciclo.** As validacoes "E2E no emulator" usavam screenshots low-res (320x640), cobriam so splash/modos/licoes e **nunca jogaram o Quiz** (por isso o spinner-eterno passou 17 versoes), nem compararam tela-a-tela contra os mocks.

O plano V18 ataca as 3 camadas + saude do projeto (5 erros tsc, 2 deps ausentes que dao crash, 3 testes falhando) + um milestone dedicado de **validacao mock-a-mock** que e o que quebra o ciclo. **Recomendacao /design-sync: NAO usar** (serve para design-system no claude.ai, nao para app RN; os tokens ja estao corretos). Fazer design direto + `ux-polish` (Playwright score) no fim.

**Unica dependencia de voce**: os PNGs transparentes originais (pasta Drive "Personagens"/"Logo"/"Elementos"). Tentarei baixar autonomamente via Playwright no Chrome logado; se o Drive bloquear, peco os arquivos.

## Estatisticas V18

- Milestones novos: 6 (MA loop+progressao, MB assets, MC gradientes, MD fidelidade tela-a-tela, ME saude, MF validacao+entrega)
- Itens: ~31 ( CRITICA: 9 | ALTA: 12 | MEDIA: 8 | BAIXA: 2+backlog )
- Por fonte: USUARIO 4 | INVESTIGACAO 23 | PESQUISA_EXTERNA 2 (backlog) | OBJECTIVE_GAP 2
- Autonomia: ~29 AUTONOMO | 1 DESTRAVAVEL (assets do Drive) | 0 DEPENDE_VOCE irredutivel
- Achados independentes: 11 (gate G1/G4 satisfeito); dimensoes 8/8 com veredito
- Segundo turno critico (2 passadas): 6 detalhados + 2 POLISH + 2 recuperados + 1 re-priorizado + 1 consolidado + 2 correcoes de premissa
- **2a passada (double-check pedido pelo usuario)**: +MA.5 (conclusao de modulo ausente = trofeu/desbloqueio quebrados, CRITICO recuperado); ME.1 corrigido (secure-store ja existe; faltam haptics/speech/linear-gradient); MA.1 enriquecido (mock M001 mascara bug em Jest); MF enriquecido (AVD hi-res + completar modulo inteiro)

## Saude do projeto V18 (verificada em 2026-06-25)
- Testes: EXISTEM+FALHANDO PARCIAL (55/58 PASS; 3 FAIL + 2 suites mal configuradas) | Build: OK mas PRODUTO QUEBRADO em runtime (Quiz) | CI/CD: CONFIGURADO parcial | Deps: RISCO (linear-gradient/haptics/secure-store ausentes) | Docs: COMPLETAS (copy "77 vs 40" a alinhar)
- Evidencias: `orchestration/plan_investigation.md`

---

## Milestone MA: Fix do "loop infinito" do Quiz (CORRECAO) — V18 — PENDENTE
> CONSOLIDA M16.1, M16.2 e M17 do plano antigo (superseded). Causa-raiz confirmada por evidencia de DB.

- [x] MA.1 **Corrigir IDs em `carregarPerguntas` (quiz/jogar.tsx:87-106)** — CORRECAO | CRITICA | INVESTIGACAO | AUTONOMO
  - Trocar loop hardcoded `M001..M004` por IDs reais: `listarModulos()` -> `listarLicoes(id)` -> `listarPerguntas(licaoId)` (ambos JA existem em db-queries.ts:91/107). Ideal: 1 funcao `listarPerguntasAleatorias(n)` em db-queries.ts com `ORDER BY RANDOM() LIMIT 20`.
  - **Nota double-check (por que passou nos testes 17 versoes)**: `MOCK_MODULOS` em db-queries.ts:10 usa o esquema `M001..M077` — em Jest (que cai no mock) o quiz "funciona"; no device (DB real, IDs `FB##/AT##/NT##`) a query volta `[]` sem lancar -> spinner eterno. Adicionar teste de regressao que exercite `carregarPerguntas` com o esquema de ID REAL (ou alinhar o mock ao real) para capturar regressao futura.
  - DoD: Quiz Aleatorio carrega 20 perguntas reais (verificado no emulador, sem spinner) + teste de regressao verde com IDs reais.
- [x] MA.2 **Ler `useLocalSearchParams` (modo/modulos) em jogar.tsx** — CORRECAO | CRITICA | USUARIO+INVESTIGACAO | AUTONOMO
  - jogar.tsx hoje nao importa useLocalSearchParams -> ignora `modo`/`modulos`. Adicionar e ramificar: custom = so modulos do CSV; aleatorio = amostra global.
  - DoD: Personalizar 5 modulos resulta em perguntas APENAS desses 5.
- [x] MA.3 **Guard anti-spinner-eterno (empty/error state)** — CORRECAO | ALTA | INVESTIGACAO (lente 3) | AUTONOMO
  - Se apos load `perguntas.length === 0`, renderizar estado de erro/vazio com botao "Voltar" em vez de `ActivityIndicator` infinito (jogar.tsx:152-158). Mesmo padrao aplicado a avaliacao por IA (loading/erro).
  - DoD: nenhum caminho deixa o usuario preso num spinner.
- [x] MA.4 **persistir() em useEffect (quiz/final.tsx:56-58)** — CORRECAO | MEDIA | INVESTIGACAO | AUTONOMO
  - Mover `setTimeout(persistir)` do body do componente para `useEffect(()=>{...},[])` (evita ranking duplicado / side-effect em render).
  - DoD: 1 linha em user_rankings por quiz concluido.

- [x] MA.5 **[ACHADO DOUBLE-CHECK — CRITICO] Persistir conclusao de MODULO (desbloqueio + trofeu)** — CORRECAO | CRITICA | INVESTIGACAO (double-check, recuperado) | AUTONOMO
  - **Bug confirmado**: `licoes/index.tsx:26-29` desbloqueia o modulo N apenas se `modulos[N-1].concluido === true`, mas NENHUM codigo grava `modulos.concluido = 1` (grep em src/: so existe `UPDATE modulos SET concluido = 0` no reset). Logo o **modulo 2+ fica travado para sempre** e `todosModulosConcluidos()` nunca e true -> **trofeu inalcancavel**. Falha do objetivo central ("libera proximo modulo ao concluir o anterior" + "trofeu ao concluir todos").
  - **Acao**: criar `marcarModuloConcluido(moduloId)` em db-queries.ts (`UPDATE modulos SET concluido = 1`); no fluxo de licao 100% (licoes/[moduloId]/[licaoId]/final.tsx), apos `marcarLicaoConcluida`, checar se TODAS as licoes do modulo estao `concluida` -> se sim, marcar o modulo concluido; ao concluir o ultimo modulo, navegar para /trofeu (via `todosModulosConcluidos`).
  - DoD: completar todas as licoes do modulo 1 desbloqueia o modulo 2 (verificado no emulador); concluir todos os modulos abre o Trofeu.

## Milestone MB: Pipeline de assets transparentes (INFRA/MELHORIA) — V18 — PENDENTE
> Base de TODA a fidelidade. Sem PNG transparente, o personagem/logo/trofeu sempre aparecem "com fundo num quadrado".

- [x] MB.1 **Obter assets originais transparentes** — INFRA | CRITICA | INVESTIGACAO | DESTRAVAVEL: PNGs originais do Drive (pastas Personagens/Logo/Elementos)
  - Tentativa autonoma: Playwright no Chrome logado -> abrir pastas Drive (folder IDs em docs/06) -> baixar logo, 5 personagens, trofeu, icones (home/som/config), confetes como PNG transparente.
  - Fallback: usuario baixa da pasta Drive e dropa em `assets/images/`. Ultimo recurso: background-removal/regeneracao via media-generation (qualidade inferior — marcar como provisorio).
  - DoD: PNGs transparentes reais em assets/images/ (verificar canal alfa, nao JPEG renomeado).
- [x] MB.2 **Corrigir logo.png (hoje JPEG renomeado, magic bytes ffd8ffe0)** — INFRA | ALTA | INVESTIGACAO | AUTONOMO
  - DoD: assets/images/logo.png e PNG real com transparencia.
- [x] MB.3 **Refatorar PersonagemLivro.tsx (remover moldura)** — MELHORIA | CRITICA | USUARIO+INVESTIGACAO | AUTONOMO
  - Remover `<View>` com `backgroundColor: roxoPrimario` + `borderWidth:4` + `borderRadius`; renderizar `<Image>` PNG transparente direto sobre o fundo da tela (resizeMode contain). Trocar requires .jpg -> .png.
  - DoD: personagem aparece sem caixa/fundo, integrado ao fundo da tela.
- [x] MB.4 **Remover moldura dupla na tela de pergunta** — MELHORIA | ALTA | INVESTIGACAO | AUTONOMO
  - licoes/[moduloId]/[licaoId].tsx:205-217 `personagemMoldura` (fundo creme+borda+sombra) envolve o componente que ja tinha moldura. Remover.
  - DoD: personagem frameless na tela de pergunta.
- [x] MB.5 **trofeu.jpg -> PNG transparente em trofeu.tsx:143** — MELHORIA | ALTA | USUARIO | AUTONOMO
  - DoD: trofeu sem retangulo de fundo sobre o creme.

## Milestone MC: Gradientes da identidade (INFRA/MELHORIA) — V18 — PENDENTE
> SIST-1: sem a lib instalada, e impossivel qualquer degrade do briefing.

- [x] MC.1 **Instalar expo-linear-gradient** — INFRA | CRITICA | INVESTIGACAO | AUTONOMO
  - `npx expo install expo-linear-gradient`. DoD: import resolve, build OK.
- [x] MC.2 **Componentes reutilizaveis GradienteRoxo / GradienteLaranja + aplicar nas ~12 superficies** — MELHORIA | ALTA | INVESTIGACAO (lente 2 POLISH) | AUTONOMO
  - Cards (modos/quiz/licoes), fundos (feedback/final/pergunta), trofeu, "Expert!", titulos de resultado, palavras-chave. Cores ja em colors.ts (roxoClaro->roxoMedio; laranjaForte->laranjaMedio; trofeu top/bottom).
  - DoD: degrades visiveis onde o briefing pede, comparados aos mocks.

## Milestone MD: Fidelidade tela-a-tela vs mocks (MELHORIA/CORRECAO) — V18 — PENDENTE
> Divergencias concretas (subagente de fidelidade). Cada item cita arquivo:linha.

- [x] MD.1 **Regra de negocio #3: modulo/licao concluido fica AMARELO (borda/texto pretos)** — CORRECAO | ALTA | INVESTIGACAO (lente 4 re-priorizado) | AUTONOMO
  - Hoje fica roxo + ✓ verde (licoes/index.tsx:69,160; [moduloId].tsx:56-60). Implementar estado amarelo. E REGRA DE NEGOCIO, nao cosmetico.
  - DoD: licao 100% fica amarela; modulo com todas licoes amarelas fica amarelo.
- [x] MD.2 **Card secundario roxo+borda laranja (nao laranja solido)** — MELHORIA | ALTA | INVESTIGACAO | AUTONOMO
  - modos.tsx:104-108 (card "LICOES") e quiz/index.tsx:77 (card "PERSONALIZADO"). DoD: ambos os cards no padrao roxo/borda laranja/texto branco.
- [x] MD.3 **Quiz: alternativa selecionada = degrade amarelo circulado de preto, letra preta** — CORRECAO | ALTA | INVESTIGACAO | AUTONOMO
  - jogar.tsx:180-181,234 hoje fica verde/vermelho. DoD: ao clicar, alternativa fica degrade amarelo com borda preta grossa e letra preta (briefing docs/04:135).
- [x] MD.4 **Titulos de resultado + "Expert!" em degrade roxo com borda preta** — MELHORIA | ALTA | INVESTIGACAO | AUTONOMO
  - final.tsx:109-117 ("NAO DEU/QUASE LA/VOCE PASSOU!"), quiz/final.tsx:91, trofeu.tsx:170,216-224 ("Expert!"). DoD: degrade roxo + borda preta (text stroke) nos titulos.
- [x] MD.5 **quiz/final.tsx usa PersonagemLivro (nao emoji gigante)** — MELHORIA | ALTA | INVESTIGACAO | AUTONOMO
  - :88 emoji 100px -> PersonagemLivro com pose por faixa (<50 TRISTE, >50 PENSATIVO, 100 EXCLAMANDO). DoD: placar com personagem coerente com licao/feedback.
- [x] MD.6 **Quadro branco da pergunta com borda preta** — MELHORIA | MEDIA | INVESTIGACAO | AUTONOMO
  - licaoId.tsx:218 e jogar.tsx:214. DoD: quadro branco com borda preta (briefing).
- [ ] MD.7 **Icones home/som/config como assets desenhados (nao emoji)** — MELHORIA | MEDIA | INVESTIGACAO | AUTONOMO (depende de MB.1)
  - V18.3 DEFERIDO: pasta Drive "Elementos" enumerou VAZIA (sem assets de icone); icones emoji/glyph atuais mantidos (funcionais). Reabrir quando a designer subir os icones.
  - IconeHome.tsx:18 (🏠), IconeSom.tsx:33 (🔊), modos.tsx:71 (≡ glyph). DoD: icones on-palette desenhados.
- [x] MD.8 **Header do quiz com icone home** — MELHORIA | MEDIA | INVESTIGACAO | AUTONOMO
  - jogar.tsx:163-170 sem home. DoD: nº questao + home no topo (briefing).
- [x] MD.9 **Substituir emojis gigantes/confete-emoji por arte on-palette** — MELHORIA | MEDIA | INVESTIGACAO | AUTONOMO
  - onboarding.tsx:14-28 (📖🧠🚀), trofeu.tsx:15 (confete emoji), quiz/index.tsx (🎲📚 — manter so se briefing validar). DoD: visual on-palette (confetes roxos/dourados no trofeu).
- [x] MD.10 **Splash: logo transparente + contraste do subtitulo** — MELHORIA | MEDIA | INVESTIGACAO | AUTONOMO
  - index.tsx:83 (logo .jpg -> .png transparente), :133 subtitulo laranja sobre roxo (baixo contraste). DoD: splash legivel e sem retangulo no logo.
- [x] MD.11 **Alinhar copy "77 modulos" vs 40 reais** — CORRECAO | BAIXA | INVESTIGACAO | AUTONOMO
  - "77" hardcoded em onboarding.tsx/modos.tsx E no comentario/`MOCK_MODULOS` (db-queries.ts:10, gera 77 com area TE). DoD: copy + mock refletem os 40 modulos do MVP (ou texto neutro); alinhar mock ao esquema/contagem real evita mascarar bugs (ver MA.1).

## Milestone ME: Saude / regressoes (CORRECAO/INFRA) — V18 — PENDENTE
- [x] ME.1 **[CORRIGIDO no double-check] Listar/instalar deps importadas mas AUSENTES do package.json** — INFRA | ALTA | INVESTIGACAO | AUTONOMO
  - **Correcao do double-check**: `expo-secure-store` JA esta no package.json (linha 96) — NAO instalar. Faltam de fato: `expo-haptics` (importado em haptics.ts:6), `expo-speech` (TTS) e `expo-linear-gradient` (= MC.1); verificar tambem `@react-native-community/slider` (usado em config.tsx).
  - **Risco de reprodutibilidade (elevado)**: deps importadas mas nao listadas fazem `npm ci`/CI/clone novo QUEBRAR o build (hoje so funciona porque estao em node_modules local). Adicionar todas ao package.json.
  - Acao: `npx expo install expo-haptics expo-speech expo-linear-gradient @react-native-community/slider`. DoD: `npx tsc --noEmit` sem TS2307; `npm ci` limpo builda; sem crash ao chamar haptics/TTS.
- [x] ME.2 **Corrigir 5 erros tsc** — CORRECAO | ALTA | INVESTIGACAO | AUTONOMO
  - app.config.ts:23 (newArchEnabled), settings.ts:23/62 (tipo Settings sem volumeMusica/volumeEfeitos/hapticos/voz), sound-runtime.ts:20 (lastEfeitos). DoD: `npx tsc --noEmit` = 0 erros.
- [x] ME.3 **Corrigir suites jest + 1 teste de logica** — CORRECAO | MEDIA | INVESTIGACAO | AUTONOMO
  - Excluir Playwright spec do testMatch do Jest; transform/mocar expo-secure-store; corrigir matching-coverage (sinonimo) e 2 asserts de catalogo desatualizado. DoD: jest verde.
- [x] ME.4 **Lint cleanup** — MANUTENCAO | BAIXA | INVESTIGACAO | AUTONOMO
  - console.log->debug/remover (4), any em PersonagemLivro:19, eslint-disable inutil jogar.tsx:52, prefer-const network.ts:47. DoD: 0 warnings relevantes.
- [x] ME.5 **Backfill 4 perguntas sem quiz_alternatives** — CORRECAO | BAIXA | INVESTIGACAO (recuperado) | AUTONOMO
  - DoD: toda pergunta tem alternativas (ou fallback gerado validado).

## Milestone MF: Validacao empirica mock-a-mock + entrega (INFRA) — V18 — PENDENTE
> CAUSA-RAIZ do ciclo de 17 versoes. Sem isso, o plano repete o fracasso.

- [x] MF.1 **Protocolo de validacao visual tela-a-tela** — INFRA | CRITICA | INVESTIGACAO (lente 6) | AUTONOMO
  - **AVD de resolucao real (nota double-check)**: usar um AVD Pixel ~1080x1920 (NAO o `motoraauto_smoke` 320x640 usado em V10-V14 — low-res foi parte do trap de validacao). Criar AVD se preciso.
  - Build APK -> emulator hi-res -> screenshot de CADA uma das 14 telas -> comparar contra o mock correspondente (whatsapp_media/images + telas Drive) -> score 1-5 por tela -> iterar telas com score <4. Registrar evidencia em orchestration/.
  - DoD: todas as 14 telas com score >=4 vs mock, em resolucao real.
- [x] MF.2 **Jornada completa E2E no emulador (sem FATAL no logcat)** — INFRA | CRITICA | INVESTIGACAO | AUTONOMO
  - Quiz Aleatorio: 20 perguntas -> placar (NAO spinner). Quiz Personalizado: so modulos escolhidos.
  - **Completar um MODULO INTEIRO (nota double-check)**: todas as licoes do modulo 1 a 100% -> licao fica amarela -> **modulo 2 desbloqueia** (prova MA.5) -> seguir ate o **Trofeu**. Exatamente o caminho que nunca foi validado nas 17 versoes.
  - adb logcat limpo (sem FATAL EXCEPTION).
  - DoD: jornada inteira percorrida com screenshots, sem crash, sem loop, com desbloqueio de modulo e trofeu comprovados.
- [x] MF.3 **ux-polish final + entrega** — MELHORIA | MEDIA | INVESTIGACAO | AUTONOMO
  - Rodar ux-polish (score before/after) nas telas principais. Recomendacao /design-sync: NAO usar (documentado). Limpar dist/ (regra das 5). Atualizar changelog + CLAUDE.md (status real). APK final + catbox.
  - DoD: APK V18 validado publicado; docs atualizadas; dist/ com 5 APKs.

## Dependencias entre milestones V18
- MB.1 (assets) destrava MB.3/MB.4/MB.5/MD.7/MD.10 (qualquer coisa que use PNG transparente).
- MC.1 (instalar lib) antes de MC.2 e dos itens de degrade em MD.
- MA (loop) e pre-requisito de MF.2 (so da pra jogar o quiz depois do fix).
- MF (validacao) por ultimo, mas MF.1 deve rodar incrementalmente apos cada tela tocada.
- Ordem recomendada: **MA -> MC.1 -> MB -> MC.2 -> MD -> ME -> MF** (ME pode rodar em paralelo).

## Dependencias de voce (V18)
- **PNGs transparentes originais (MB.1)** — falta de voce: confirmar que posso baixar do Drive via Playwright no seu Chrome logado, OU baixar voce mesmo as pastas "Personagens"/"Logo"/"Elementos" e dropar em `assets/images/`. Destrava: toda a fidelidade de personagem/logo/trofeu/icones. (Tentarei autonomamente primeiro; so peco se o Drive bloquear.)

## Recomendacao /design-sync (resposta a pergunta do usuario)
- **NAO usar /design-sync.** A ferramenta sincroniza biblioteca de componentes com um projeto Design System no claude.ai/design — nao aplica template de marca a app React Native, nao instala lib de degrade, nao gera assets. Os tokens (cores/fontes) JA estao corretos no codigo (colors.ts/FONTES). O gargalo e assets transparentes + lib de degrade + layout por tela + bug de dados — nada disso e endereçado por design-sync.
- **Fazer design direto** (milestones MB/MC/MD) e, no fim, **ux-polish** (agente que usa Playwright para score visual before/after) para o acabamento. Isso aproveita os mocks como fonte de verdade.

## Itens rejeitados / backlog V18
- Teologia (24 modulos): BACKLOG (ja adiado V10; reavaliar pos-MVP).
- Streak/XP/badges surfacing: BACKLOG BAIXA (PESQUISA_EXTERNA; streak.ts existe subutilizado).
- iOS / backend dedicado / multi-idioma: REJEITADO (decisoes anteriores mantidas).
- M17 do plano antigo (hipoteses de race em licoes): SUPERSEDED por MA (causa real = dados do quiz).



## Resumo Executivo

O projeto **Expert Na Biblia** completou V1-V7 (47/47 itens, codigo pronto em `src/`) mas o APK gerado nao roda end-to-end por problemas estruturais do build (app.json placeholder, 46 resources faltando, `__DEV__=true` no bundle Hermes, modulo `ExpoLinking` nativo faltando). V8 tentou consertar via patch binario do APK (19 tentativas em `dist/*.apk`) e conseguiu instalar + abrir splash mas nao renderizar o root layout. A UNICA solucao viavel e **rebuild nativo via gradle** que precisa corrigir primeiro o `expo prebuild` que falha com `withAndroidDangerousBaseMod`.

Este plano (V8-RETOMADA + double check 2026-06-23) define **6 milestones** ordenados para gerar o APK 100% funcional e validado no emulador. Estimativa: ~3-5 horas de trabalho autonomo + 1 validacao empirica final. Nenhuma dependencia humana irredutivel (apenas `AdMob ID` que pode ser substituido por ID de teste).

**Causa raiz (consolidada)**: APK foi gerado em um `app.json` temporario (placeholder `com.anonymous.testapp`/`test-app`), `package.json` foi drasticamente reduzido (removendo 17+ deps), e o APK foi manualmente reembalado excluindo arquivos necessarios. Patch binario nao consegue resolver 100% — rebuild nativo e obrigatorio.

**Hipotese forte para o prebuild crash**: o plugin `expo-ads-admob` com `androidAppId: "PLACEHOLDER_ANDROID_APP_ID"` no `app.json` esta causando o erro `withAndroidDangerousBaseMod: Project file MainApplication does not exist` durante o prebuild, porque plugins Expo que modificam `MainApplication.kt` precisam de configuracoes validas para gerar o codigo.

**Resultado do double check (2026-06-23)**: 2 achados CRITICOS + 4 ALTOS identificados e enderecados neste plano. NOTA: 7.0/10.0 -> 9.0/10.0 (REPROVADO -> APROVADO).

## Estatisticas

- **Total de itens**: 18 (6 ALTA, 7 MEDIA, 5 BAIXA) + 2 dependencias de voce (AdMob ID + 5 sons) + 5 itens JA_RESOLVIDOS (nao contam)
- **Por categoria**: 7 INFRA (rebuild + import + config), 5 MELHORIA (polish), 3 MANUTENCAO (refactor + cleanup), 3 EVOLUCAO (audios + db + runtime)
- **Por fonte**: 4 USUARIO (apontamentos), 8 INVESTIGACAO (achados independentes), 2 CONTEXTO_PREVIO (V8-RETOMADA), 4 DOUBLE_CHECK (M0, M2.2, M3.4, M6)
- **Milestones**: 6 (M0, M1, M2, M3, M4, M5, M6)
- **Achados independentes**: 8 (gate G1 satisfeito)
- **Dimensoes varridas (gate G1)**: 8/8 (4 com achados: CORRECAO_BUGS, MELHORIA, MANUTENCAO_REFACTOR, INFRAESTRUTURA; 4 sem: EVOLUCAO_FEATURES, UX_UI, PERFORMANCE, SEGURANCA — declaradas como "nada encontrado" com metodo)
- **Double check (2026-06-23)**: 14 achados (2 CRITICO + 4 ALTO + 6 MEDIO + 2 BAIXO); 5 ajustes aplicados; NOTA 7.0 -> 9.0 (REPROVADO -> APROVADO)

## Saude do projeto (verificada em 2026-06-23)

- **Testes**: EXISTEM (5 test files: matching, matching-coverage, settings, smoke, database) — nao rodados nesta sessao
- **Build**: QUEBRADO — APK final instala + abre splash + crasha em `renderElement` do RootLayout
- **CI/CD**: CONFIGURADO (parcial) — `.github/workflows/ci.yml` com 3 jobs; build-preview usa EAS cloud (nao roda build nativo)
- **Deps**: ATUALIZADAS (com ressalvas) — 22 deps restauradas no V8; expo-ads-admob~13.0.0 (antiga); scripts `type-check`/`lint`/`format:check` referenciados pelo CI mas nao definidos
- **Docs**: COMPLETAS — CLAUDE.md 161 linhas, README, CHANGELOG, evolution_plan.md, 8 docs, orchestration/ rico

Evidencias completas em `orchestration/plan_investigation.md`.

---

## Milestone 0: Pre-requisitos criticos para o rebuild (INFRA) — PENDENTE

> 2 itens CRITICOS identificados no double check (2026-06-23) que devem ser resolvidos ANTES do prebuild. Sem isso, o rebuild gera um app com conteudo mock (nao conteudo real das planilhas) OU falha em M4.3 porque scripts nao existem.

- [x] 0.1 **Importar `docs/questions_clean.json` (1.3MB, 4345 perguntas) para `data/db.sqlite`** — INFRA | ALTA | DOUBLE_CHECK (AC1) | AUTONOMO | [CRITICO] (entregue 2026-06-23)
  - Acao: `npx tsx scripts/import_all.ts` (ou `node scripts/import_direct.js`)
  - Validar: `sqlite3 data/db.sqlite 'SELECT COUNT(*) FROM modulos; SELECT COUNT(*) FROM perguntas;'` deve retornar `>=40` e `>=1500` (planilhas cobrem modulos 1-40)
  - Documentar no log de importacao: quantos modulos/licoes/perguntas foram importados
  - **Por que CRITICO**: sem isso, modo Licoes usa mock data com 77 modulos de ~25 perguntas geradas aleatoriamente, em vez do conteudo real do briefing
  - DoD: `data/db.sqlite` tem conteudo real (>=1500 perguntas de `questions_clean.json` ou das planilhas XLSX)

- [x] 0.2 **Adicionar ESLint, Prettier e plugins em devDeps** — INFRA | ALTA | DOUBLE_CHECK (AC2) | AUTONOMO | [CRITICO] (entregue 2026-06-23)
  - Acao: `npm install --save-dev eslint prettier eslint-config-expo @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-native --legacy-peer-deps`
  - Validar: `npm ls eslint prettier` retorna as versoes instaladas
  - **Por que CRITICO**: `package.json` M4.3 referencia `npm run lint` e `npm run format:check` mas ESLint/Prettier NAO estao em devDeps — scripts vao falhar sem este pre-requisito
  - DoD: `npm run lint --help` nao retorna "command not found"; ESLint e Prettier funcionando localmente

---

## Milestone 1: Corrigir prebuild (REGRESSÃO) — PENDENTE

> Corrigir o erro `withAndroidDangerousBaseMod: Project file MainApplication does not exist` no `npx expo prebuild --platform android`. Sem isso, o rebuild nativo via gradle nao acontece. Hipotese forte: `expo-ads-admob` com `PLACEHOLDER_ANDROID_APP_ID` esta causando o crash.

- [x] 1.1 **Investigar causa raiz do prebuild crash** — INFRA | ALTA | CONTEXTO_PREVIO | AUTONOMO | [A4 detalhado]
  - Acao: rodar `npx expo prebuild --platform android --no-install --verbose 2>&1` e capturar stack trace
  - Hipotese 1: plugin `expo-ads-admob` com `PLACEHOLDER_ANDROID_APP_ID` invalido
  - Hipotese 2: algum plugin esta tentando modificar `MainApplication.kt` antes de existir
  - Hipotese 3: cache `.expo/` corrompido
  - Validacao: apos cada tentativa, rodar `rm -rf android .expo` e tentar novamente
  - DoD: erro reproduzido e causa raiz identificada em log

- [x] 1.2 **Resolver prebuild crash (tentar solucoes em ordem)** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [A4]
  - Solucao A: REMOVER `expo-ads-admob` do array `plugins` em `app.json` (temporariamente)
  - Solucao B: substituir `androidAppId: "PLACEHOLDER_ANDROID_APP_ID"` por um ID de teste valido (ex: `ca-app-pub-3940256099942544~3347511713` — ID de teste oficial Google)
  - Solucao C: limpar cache `rm -rf .expo node_modules/.cache` e re-tentar
  - Solucao D: usar `--no-plugins` se disponivel
  - DoD: `npx expo prebuild --platform android --no-install` completa sem erro

- [x] 1.3 **Validar saida do prebuild** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [A4]
  - Acao: apos prebuild OK, verificar que pasta `android/` foi criada
  - Verificar `android/app/build.gradle`, `android/app/src/main/AndroidManifest.xml`, `android/app/src/main/java/com/donizetiferr/expertnabiblia/MainActivity.kt`
  - Verificar que `MainApplication` referencia todos os expo modules do `app.json.plugins`
  - DoD: pasta `android/` completa com `gradlew` no root

## Milestone 2: Build nativo local (REGRESSÃO) — PENDENTE

> Buildar APK release via gradle (NAO EAS cloud) com signing debug. Resolve o `__DEV__=true` no bundle (release gera bundle com `__DEV__=false`) e gera APK com nome/label corretos.

- [x] 2.1 **Setar JAVA_HOME para JDK 17** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [A5 enriquecido] (entregue 2026-06-23)
  - Acao: `export JAVA_HOME=C:/Users/Donizeti/scoop/apps/temurin17-jdk/current`
  - Validacao: `$JAVA_HOME/bin/java.exe -version` retorna 17+
  - Nota: Java padrao do sistema (1.8) e INCOMPATIVEL com Gradle 8+; sem isso, build falha com UnsupportedClassVersionError

- [ ] 2.2 ** [BLOQUEADA — incompatibilidade Hermes 0.81 + babel class transforms, requer Expo SDK 55+ ou EAS Build]Rodar gradle assembleRelease** — INFRA | ALTA | USUARIO (A5) | AUTONOMO | [A5]
  - Acao: `cd android && ./gradlew assembleRelease --no-daemon`
  - **Pre-check: configurar `gradle.properties`** com `android.useAndroidX=true` (moderno) e `android.enableJetifier=true` (compatibilidade com deps legadas). Ambos sao defaults do Expo 54 mas validar.
  - **Pre-check: configurar `local.properties`** com `sdk.dir=C:/Android/Sdk` (caminho local do Android SDK)
  - **Pre-check: variavel `ANDROID_HOME=C:/Android/Sdk` no ambiente**
  - Aguardar ~5-15 min para build completo
  - Validar que APK gerado: `android/app/build/outputs/apk/release/app-release.apk` (ou `app-release-unsigned.apk` se nao assinado)
  - Validar 4 ABIs: arm64-v8a, armeabi-v7a, x86, x86_64
  - DoD: APK release gerado

- [ ] 2.3 ** [BLOQUEADA — depende de 2.2]Assinar APK com debug keystore** — INFRA | ALTA | USUARIO (A6) | AUTONOMO | [A6]
  - Acao: `apksigner sign --ks ~/.android/debug.keystore --ks-pass pass:android --out ExpertNaBiblia-v1.0.0.apk android/app/build/outputs/apk/release/app-release.apk`
  - Se debug.keystore nao existir: `keytool -genkeypair -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Android Debug'`
  - Validar: `apksigner verify ExpertNaBiblia-v1.0.0.apk`
  - Validar package name: `aapt2 dump badging ExpertNaBiblia-v1.0.0.apk` deve mostrar `package: name='com.donizetiferr.expertnabiblia'`
  - Validar label: deve mostrar `application-label: 'Expert Na Bíblia'`
  - DoD: APK assinado, package name correto, label correto, signature valida

## Milestone 3: Validacao completa no emulador (REGRESSÃO) — PENDENTE

> Substitui A7 (validar) + A8 (navegacao em 13 telas) consolidados. Validacao empirica via adb no emulator-5554 (Android 14, x86_64) ja disponivel em C:/Android/Sdk.

- [ ] 3.1 **Verificar emulator online** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [PREMISSA VERIFICADA]
  - Acao: `adb devices` deve mostrar `emulator-5554 device`
  - Se nao: `C:/Android/Sdk/emulator/emulator.exe -avd <avd_name>` (ou `motoraauto_smoke` ja existe)
  - DoD: `adb devices` mostra device pronto

- [ ] 3.2 **Instalar APK no emulador** — INFRA | ALTA | USUARIO (A7) | AUTONOMO | [A7/A8 consolidado]
  - Acao: `adb install -r ExpertNaBiblia-v1.0.0.apk`
  - Validar: `adb shell pm list packages | grep expertnabiblia` deve mostrar o package
  - DoD: APK instalado sem erro

- [ ] 3.3 **Iniciar app e capturar logs** — INFRA | ALTA | USUARIO (A7) | AUTONOMO | [A7/A8 consolidado]
  - Acao: `adb logcat -c && adb shell am start -n com.donizetiferr.expertnabiblia/.MainActivity`
  - Aguardar 5s
  - Capturar: `adb logcat -d -t 500 *:E AndroidRuntime:V ReactNativeJS:V`
  - Validar: app NAO crasha (sem `FATAL EXCEPTION` no logcat)
  - Validar: processo `com.donizetiferr.expertnabiblia` esta rodando (`adb shell ps -ef | grep expertnabiblia`)
  - DoD: app iniciado, sem crash, processo vivo por 30s+

- [ ] 3.4 **Validar 13 telas via screencap e adb input** — INFRA | ALTA | USUARIO (A8) | AUTONOMO | [A7/A8 consolidado + DOUBLE_CHECK AA4]
  - Acao: capturar screenshot de cada tela (Tela 1 splash, Tela 2 modos, Tela 3 licoes/index, etc)
  - **Pre-coordenadas**: usar `adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml` para extrair coordenadas exatas dos botoes/elementos (bounds no XML)
  - Comandos: `adb exec-out screencap -p > tela1.png`
  - Validar: app navega entre telas (adb shell input tap X Y onde X Y vem do uiautomator dump)
  - Validar: sem `Resources$NotFoundException` (problema V8) no logcat
  - Validar: splash exibe por 3s e navega para Tela 2 automaticamente
  - DoD: 13 screenshots salvos, app navega entre todas as telas via uiautomator coordinates, sem crashes

- [ ] 3.5 **Smoke test das funcionalidades core** — INFRA | ALTA | INVESTIGACAO | AUTONOMO | [A7/A8 consolidado]
  - Validar: db.sqlite abre (app nao crasha ao tentar query)
  - Validar: lista de modulos renderiza (77 cards com cadeado sequencial)
  - Validar: tap em modulo liberado navega para Tela Licoes
  - Validar: tap em modulo bloqueado mostra toast "conclua o anterior"
  - Validar: botao ≡ abre Config (som/musica)
  - DoD: smoke test manual via adb input + screencap passa em todas as funcionalidades

## Milestone 4: Polish do codigo para evitar crashes recorrentes (MELHORIA) — PENDENTE

> 5 achados independentes que NAO estavam nos apontamentos do orquestrador mas devem ser resolvidos para evitar problemas similares no futuro. (P0-5 PENDENTE, refactor, infra minima)

- [x] 4.1 **(entregue 2026-06-23)Substituir emojis em PersonagemLivro.tsx por imagens reais** — MELHORIA | MEDIA | INVESTIGACAO (achado 1) | AUTONOMO | [recuperado lente 3]
  - Arquivo: `src/components/PersonagemLivro.tsx`
  - Substituir `EMOCAO_EMOJI` por `<Image source={require('../../assets/images/personagem_pensativo.png')}>`
  - Imagens em `whatsapp_media/images/`: image_20260622_211747.jpg (pensativo), image_20260622_212830.jpg (assustado), image_20260622_213156.jpg (feliz)
  - Mover para `assets/images/`
  - DoD: PersonagemLivro renderiza com imagem real para cada pose

- [x] 4.2 **(entregue 2026-06-23)Mover SplashScreen.preventAutoHideAsync() para useEffect** — MANUTENCAO | MEDIA | INVESTIGACAO (achado 2) | AUTONOMO | [recuperado lente 3]
  - Arquivo: `src/app/_layout.tsx`
  - Causa: chamada no module scope (linha 11) causa efeito colateral na importacao
  - Mover para useEffect dentro de RootLayout
  - DoD: build nao crasha por ordem de inicializacao

- [x] 4.3 **(entregue 2026-06-23)Adicionar scripts type-check/lint/format:check em package.json** — INFRA | MEDIA | INVESTIGACAO (achado 3) | AUTONOMO | [recuperado lente 3]
  - Scripts faltando que o `.github/workflows/ci.yml` chama
  - Adicionar: `"type-check": "tsc --noEmit"`, `"lint": "eslint . --ext .ts,.tsx"`, `"format:check": "prettier --check ."`
  - DoD: `npm run type-check`, `npm run lint`, `npm run format:check` funcionam

- [x] 4.4 **(entregue 2026-06-23)Validar conteudo do db.sqlite (mock ou real)** — EVOLUCAO | MEDIA | INVESTIGACAO (achado 6) | AUTONOMO | [recuperado lente 3]
  - Acao: `sqlite3 data/db.sqlite 'SELECT COUNT(*) FROM modulos; SELECT COUNT(*) FROM perguntas;'`
  - Se mock: rodar `npm run import:all` (ou `npx tsx scripts/import_all.ts`) com planilhas em `whatsapp_media/spreadsheets/`
  - Se real: confirmar contagem > 4000 perguntas
  - DoD: db.sqlite validado e documentado (mock vs real)

- [ ] 4.5 **Adicionar 5 sons royalty-free em assets/audio/** — EVOLUCAO | BAIXA | INVESTIGACAO (achado 5) | DESTRAVAVEL: 5 sons royalty-free (Pixabay/Freesound) | [recuperado lente 3]
  - Sons esperados: splash (3s, magica), acerto (1s, ding), erro (1s, buzz), transicao (0.5s, pop), musica_fundo (3min loop)
  - Pesquisar em Pixabay.com ou Freesound.org (sem auth, royalty-free)
  - Salvar em `assets/audio/{splash,acerto,erro,transicao,musica_fundo}.mp3`
  - Cada arquivo <500KB
  - DoD: 5 arquivos .mp3 em `assets/audio/`, todos com licenca livre confirmada

## Milestone 5: Limpeza e documentação (MANUTENCAO) — PENDENTE

> Acoes finais apos rebuild bem-sucedido: limpar APKs antigos e documentar V8 no changelog.

- [x] 5.1 **(entregue 2026-06-23)Limpar dist/*.apk (19 APKs antigos)** — MANUTENCAO | BAIXA | INVESTIGACAO (adjacente obvio 10) | AUTONOMO
  - Acao: `rm -f dist/*.apk dist/*.bak.template dist/*.injecao`
  - Mover apenas o APK FINAL para `dist/ExpertNaBiblia-v1.0.0.apk`
  - DoD: dist/ tem 1 unico APK limpo

- [x] 5.2 **(entregue 2026-06-23)Atualizar CHANGELOG.md com entrada V8** — MANUTENCAO | BAIXA | INVESTIGACAO (adjacente obvio 10) | AUTONOMO
  - Acao: adicionar entrada `## [1.0.1] - 2026-06-23` ou `## V8-RETOMADA` na CHANGELOG.md
  - Descrever: rebuild nativo via gradle, validacao no emulador, polish de PersonagemLivro/SplashScreen/scripts
  - DoD: CHANGELOG.md tem entrada V8 datada

---

## Dependencias entre milestones

- **Milestone 0 (CRITICO - pre-requisito)** deve rodar ANTES de M1 (senao M3 gera app com conteudo mock)
- **Milestone 2 depende de Milestone 1** (prebuild OK antes de gradle)
- **Milestone 3 depende de Milestone 2** (APK release assinado antes de instalar no emulador)
- **Milestone 4 (P0-5) pode rodar em paralelo** a Milestone 1-3 (refactor nao bloqueia validacao)
- **Milestone 5 depende de Milestone 3** (limpar so apos APK final validado)
- **Milestone 6 (CRITICO - runtime config) deve rodar ANTES de M3.3** (senao APK quebra em runtime sem credenciais M3)

## Milestone 6: Configuracao de credenciais runtime (INFRA) — PENDENTE

> CRITICO: sem as credenciais M3/OpenAI configuradas, o app quebra em runtime quando usuario tenta responder uma licao (modo Licoes) — `src/lib/m3.ts` e `src/lib/openai.ts` fazem chamadas HTTPS. M1.2-M3.3 podem validar build/instalacao sem credenciais, mas M3.5 (smoke test das funcionalidades core) vai falhar.

- [x] 6.1 **(entregue 2026-06-23)Configurar credenciais M3 em `app.config.ts` via `expo-constants`** — INFRA | ALTA | DOUBLE_CHECK (AA2) | AUTONOMO | [CRITICO]
  - Acao: criar `app.config.ts` (renomear `app.json` para `app.config.ts` OU usar `app.json` com `extra` references via `expo-constants`)
  - Setar `extra.minimaxApiKey = process.env.MINIMAX_API_KEY || "sk-cp-..."` (token ja disponivel em `Tokens API e acessos/minimax/credentials.md`)
  - Setar `extra.openaiApiKey = process.env.OPENAI_API_KEY || "sk-..."` (token ja disponivel em `Tokens API e acessos/openai/credentials.md`)
  - **NAO HARDCODAR** keys em codigo versionado — usar `process.env` e passar via gradle properties OU `.env` (dotenv)
  - **Acao especifica Android**: criar `android/gradle.properties` com `MINIMAX_API_KEY=...` e `OPENAI_API_KEY=...` (lido em build time)
  - Atualizar `src/lib/m3.ts` para usar `expo-constants` ou `process.env` em vez de hardcoded
  - Validar: app nao quebra em runtime ao chamar `avaliador.ts`
  - DoD: app instalado, modo Licoes funcional (resposta avaliada por M3 ou OpenAI, nao crasha)

---

## Dependencias de voce (resolver quando puder)

> Lista consolidada de TODOS os itens DESTRAVAVEL e DEPENDE_VOCE.

- **AdMob ID real** — substituir `PLACEHOLDER_ANDROID_APP_ID` em `app.json` (M1.2 Solucao B) por ID real OU ID de teste `ca-app-pub-3940256099942544~3347511713` (Google oficial) — destrava: o plugin expo-ads-admob para de fazer prebuild crash
- **5 sons royalty-free** (M4.5) — pesquisar em Pixabay/Freesound e baixar — destrava: app tem som (P0-7)

## Milestone 16: Bugs visuais e de layout pendentes (MIX) — V18 (PENDENTE, NAO INICIADO)

> Catalogo de bugs visuais e de layout reportados pelo usuario em 2026-06-25.
> Pedido explicito: NAO corrigir agora, apenas catalogar para V18+.
> Estimativa de fix: 3-5h de trabalho autonomo (refactor + QA visual).

- [ ] 16.1 **FIX: quiz/jogar.tsx `carregarPerguntas` lento (20 awaits sequenciais)** — CORRECAO | ALTA | INVESTIGACAO (code review 2026-06-25) | AUTONOMO
  - **Causa**: `src/app/quiz/jogar.tsx:87-106` faz loop sequencial `for (let m = 1; m <= 4; m++) ... await listarPerguntas(...)` — 20 chamadas SQLite em serie. Em SQLite embarcado isso eh rapido (~50ms total), MAS o loop eh fragil: se o usuario trocar de aba antes do termino, race condition + memoria segurando perguntas da tela anterior.
  - **Acao**: substituir por `Promise.all(modulos.flatMap(m => licoes.flatMap(l => listarPerguntas(`${m}-L${l}`))))` OU criar funcao `listarPerguntasAleatorias(total: number)` em `db-queries.ts` que faz 1 unica query SQL com ORDER BY RANDOM() LIMIT 20.
  - DoD: `carregarPerguntas()` em <=200ms no emulator, sem race condition.

- [ ] 16.2 **FIX: quiz/jogar.tsx ignora param `modo` e `modulos` (sempre carrega M001-M004)** — CORRECAO | ALTA | INVESTIGACAO (code review 2026-06-25) | AUTONOMO
  - **Causa**: `quiz/index.tsx:23` faz `router.push('/quiz/jogar?modo=aleatorio')` e `quiz/customizar.tsx:36` faz `router.push('/quiz/jogar?modo=custom&modulos=M001,M002,...')`. Porem `quiz/jogar.tsx` NAO usa `useLocalSearchParams` — sempre carrega 4 modulos fixos (M001-M004, primeiros 5 licoes de cada).
  - **Acao**: adicionar `const { modo, modulos } = useLocalSearchParams<{modo?: string; modulos?: string}>()`; se `modo === 'custom'` e `modulos` presente, parsear CSV e usar como filtro na query; senao (aleatorio), usar `listarPerguntasAleatorias(20)`.
  - DoD: customizar 5 modulos especificos em `/quiz/customizar` resulta em perguntas APENAS desses 5 modulos em `/quiz/jogar`.

- [ ] 16.3 **FIX: quiz/final.tsx `persistir` em setTimeout fora de useEffect** — CORRECAO | MEDIA | INVESTIGACAO (code review 2026-06-25) | AUTONOMO
  - **Causa**: `src/app/quiz/final.tsx:56-58` tem `if (typeof window !== 'undefined') { setTimeout(persistir, 100); }` no BODY do componente (NAO em useEffect). Em React Native, `window` eh undefined — entao NUNCA executa. Mesmo se executasse (web), rodaria em cada re-render.
  - **Acao**: mover para `useEffect(() => { setTimeout(persistir, 100); return () => clearTimeout(timeout); }, []);`
  - DoD: `user_rankings` recebe 1 linha por conclusao de quiz (verificavel via `sqlite3 data/db.sqlite 'SELECT * FROM user_rankings ORDER BY id DESC LIMIT 5'`).

- [ ] 16.4 **FIX: feedback.tsx playAcerto/playErro no body (flood de audio em re-render)** — CORRECAO | MEDIA | INVESTIGACAO (code review 2026-06-25) | AUTONOMO
  - **Causa**: `src/app/licoes/[moduloId]/[licaoId]/feedback.tsx:57-65` chama `playAcerto().catch(...)` / `playErro().catch(...)` FORA de useEffect, no body do componente. Cada re-render (ex: timer de bounce animation, state changes) re-dispara o som.
  - **Acao**: envolver em `useEffect(() => { ... }, [isAcerto])`.
  - DoD: som de feedback toca exatamente 1x por visita a tela.

- [ ] 16.5 **FIX: onboarding.tsx `Dimensions.get('window')` no module scope** — CORRECAO | BAIXA | INVESTIGACAO (code review 2026-06-25) | AUTONOMO
  - **Causa**: `src/app/onboarding.tsx:31` calcula `const { width } = Dimensions.get('window')` no module scope. NAO atualiza em rotacao de tela. Em landscape, slides podem ficar cortados.
  - **Acao**: usar `useWindowDimensions()` hook (atualiza em rotacao) OU `flex: 1` no FlatList com `pagingEnabled` (sem width fixa).
  - DoD: rotacao portrait<->landscape na tela onboarding funciona sem cortar slides.

- [ ] 16.6 **FIX: licoes/[moduloId].tsx cards bloqueados quase invisiveis** — CORRECAO | MEDIA | INVESTIGACAO (code review 2026-06-25) | AUTONOMO
  - **Causa**: `src/app/licoes/[moduloId].tsx:131-134` tem `cardBloqueado: { backgroundColor: COLORS.cinzaEscuro, ..., opacity: 0.5 }`. CinzaEscuro (#4b5563) + 50% opacity = praticamente invisivel contra fundo creme.
  - **Contexto historico**: V12 7.4 corrigiu o ANALOGO em `licoes/index.tsx` (muda para cinzaMedio + opacity 0.85), mas esqueceu de tocar `[moduloId].tsx` (tela de licoes dentro do modulo).
  - **Acao**: copiar o mesmo fix: `backgroundColor: COLORS.cinzaMedio, opacity: 0.85` + `numeroBloqueado.color: COLORS.preto` para legibilidade.
  - DoD: cards bloqueados visiveis (mesmo padrao visual dos cards em `/licoes`).

- [ ] 16.7 **FIX: licoes/index.tsx `playCadeiraDesbloqueia` em batch no primeiro render** — CORRECAO | BAIXA | INVESTIGACAO (code review 2026-06-25) | AUTONOMO
  - **Causa**: `src/app/licoes/index.tsx:31-40` chama `playCadeiraDesbloqueia()` dentro do `renderItem`. A guarda `unlockSoundOnceRef` evita re-tocadas no mesmo modulo, MAS na PRIMEIRA renderizacao, todos os modulos liberados (ate 76 com progresso) sao processados em batch — o som pode tocar 1x OU NAO tocar (race entre add no Set e o proximo render), dependendo da engine.
  - **Acao**: mover a logica para um `useEffect(() => { ... }, [modulos])` que detecta transicoes bloqueado->livre comparando snapshot anterior com estado atual.
  - DoD: som de "cadeado abriu" toca apenas 1x quando o usuario AVANCA de progresso (nao no load inicial).

---

## Milestone 17: Looping infinito em modulo (MIX) — V19 (PENDENTE, NAO INICIADO)

> Usuario reportou "looping infinito em um dos modulos" em 2026-06-25. NAO consegui localizar
> a causa exata via code review estatico — requer investigacao runtime (Playwright + adb
> logcat) para reproduzir e confirmar.
>
> Hipoteses provaveis (em ordem de investigacao):
>
> - [ ] 17.1 **DEBUG: licoes/[moduloId]/[licaoId].tsx race entre 2 useEffects** — INVESTIGACAO | CRITICA | USUARIO (2026-06-25) | AUTONOMO
>   - **Hipotese**: 2 useEffects no arquivo reagem a `params.indice` / `indice` simultaneamente:
>     - Linhas 43-45: `useEffect(() => { listarPerguntas(licaoId).then(setPerguntas); }, [licaoId, moduloId])`
>     - Linhas 59-66: `useEffect(() => { const p = parseInt(params.indice ?? '0', 10); if (p === indice) return; setResposta(''); setPose('PENSATIVO'); setIndice(p); }, [params.indice, indice])`
>   - **Cenario problematico**: usuario responde Q01 -> feedback (indice 0) -> pressiona PROSSEGUIR -> navega para `/licoes/[moduloId]/[licaoId]?indice=1` -> 1o useEffect NAO re-roda (licaoId/moduloId inalterados) -> 2o useEffect roda com params.indice=1 != indice=0 -> setIndice(1) -> componente re-renderiza com pergunta[1]. Se essa re-renderizacao disparar alguma animacao ou efeito que chame `router.replace()` novamente para o mesmo path, pode entrar em loop.
>   - **Acao**: instrumentar logs `[licao] effect1` e `[licao] effect2` em cada useEffect; rodar app no emulator + adb logcat + reproduzir o fluxo ate o looping; capturar stack trace.
>   - **Fix especulado** (apos confirmar): adicionar guard `if (p === indice) return` no inicio do 2o useEffect (JA EXISTE, mas talvez nao pega todos os casos) OU unificar em 1 useEffect so.
>   - DoD: reproduzir looping em emulator, capturar causa exata, fixar e validar E2E sem loop.
>
> - [ ] 17.2 **DEBUG: feedback.tsx handleProsseguir pode causar loop se params malformados** — INVESTIGACAO | ALTA | INVESTIGACAO (hipotese 2026-06-25) | AUTONOMO
>   - **Hipotese**: `feedback.tsx:67-83` chama `router.replace({ pathname: '/licoes/[moduloId]/[licaoId]', params: { indice: String(indice + 1), ... } })`. Se `params.moduloId` ou `params.licaoId` vierem undefined da query string anterior, o path pode resolver para rota inesperada que dispara nova navegacao.
>   - **Acao**: validar `params.moduloId && params.licaoId` antes do replace; adicionar `console.log('[feedback] handleProsseguir', { isLast, indice, total, params })` para debug.
>   - DoD: instrumentar, reproduzir, fixar se confirmado.

---

## Itens rejeitados (e por que)

- **A1, A2, A3, A9, A10 (apontamentos do orquestrador)** — JA_RESOLVIDOS no V8-RETOMADA: app.json ja tem package/label corretos, package.json restaurado, assets visuais criados, rebuild nativo tera label correto. NAO precisam de acao futura.
- **P0-11 (validacao teologica humana)** — BLOQUEADA_POR_USUARIO desde V3, mantida em `orchestration/pending_user_input.md` (revisao de 100 amostras)
- **P3-5 (iOS)** — REJEITADO desde V7, foco exclusivo Android
- **P3-6 (build EAS cloud + Play Store)** — infraestrutura pronta, execucao via `eas login` + `eas build` apos rebuild local OK (escopo deste plano: build local primeiro)
- **Backend Node.js dedicado** — REJEITADO (app chama M3 direto)
- **iOS obrigatorio no MVP** — REJEITADO
- **Luxury/refined estetica** — REJEITADO (estilo cartoon/playful)
- **Multi-idioma no MVP** — REJEITADO (V2)

## Proximo passo

Aprovar este plano e despachar `@full-cycle` com os milestones como escopo. O subagente vai implementar milestone por milestone, marcando `- [x]` ao entregar.

Ordem recomendada: **M0 → M6 → M1 → M2 → M3 → M5** (com M4 em paralelo a M1-M3).

## Historico de double check (2026-06-23)

- **Resultado inicial**: 7.0/10.0 (REPROVADO) — 2 CRITICOS + 4 ALTOS
- **Ajustes aplicados**: 5 (M0 criado com 2 itens CRITICOS, M2.2 enriquecido, M3.4 enriquecido, M6 criado)
- **Resultado final**: 9.0/10.0 (APROVADO)
- **Relatorio completo**: `orchestration/audit_report_doublecheck_v8.md`
- **QA Verdict**: `orchestration/qa_verdict_doublecheck_v8.md`

## STATUS V10 — EXECUCAO 2026-06-24 (@full-cycle agent, opus[1m])

### Entregues (14 itens [x]: 7 M5 + 7 M6)

**M5 — Identidade visual conforme briefing:**
- M5.1 splash logo grande: reativado `image: './assets/splash.png'` em `app.config.ts` + `SplashScreen.hideAsync()` apos 3s no `src/app/index.tsx`.
- M5.2 Tela Modos: `modos.tsx` com `backgroundColor: COLORS.creme` (#f7f4ed), logo cropped 220x220, cards `roxoCard` (#4d0a7d) + borda `laranjaBorda` (#f9ea59) 4px, palavras-chave "BIBLICO"/"LICOES" em `laranjaEscuro`.
- M5.3 Header NOME modulo: adicionado `listarModuloPorId(id)` em `db-queries.ts`; renderiza `modulo?.nome ?? moduloId`.
- M5.4 FIX looping (CRITICA): `deps [licaoId, moduloId]`, `carregadoRef` impede re-fetch, `respondendoRef` impede duplo-clique; index.tsx deps `[]`. Validado E2E (Q01 → Q02 → Q03 sem loop).
- M5.5 TL Pergunta: `container.backgroundColor = COLORS.roxoClaro` (#3e036f).
- M5.6 Feedback/Placar: 3 variantes com cores oficiais briefing em `final.tsx` e `quiz/final.tsx` (nao_deu=laranjaForte, quase=laranjaMedio, vitoria=laranjaForte).
- M5.7 Trofeu: `trofeu.tsx` com `LinearGradient` [laranjaTrofeuTop (#fca605), laranjaTrofeuBottom (#ffc027)] + fundo creme + imagem `trofeu.jpg`.

**M6 — Evolucoes de audio:**
- M6.1 Sons premium: 7 arquivos em assets/audio/ — combo (33KB), tick (17KB), vitoria (49KB), cadeira_desbloqueia (25KB), splash (49KB), musica_fundo (81KB), 3 temas musica_fundo_{fb,at,nt} (49KB cada). Total: 12 arquivos.
- M6.2 Volume independente: `volumeMusica` (0.3) + `volumeEfeitos` (0.7) em Settings; 2 `Slider`s em config.tsx; sound.ts aplica volumes no `createAsync`.
- M6.3 Observer reativo: `subscribe/notify/getCachedSettings` em settings.ts substitui polling 500ms; sound-runtime.ts usa `subscribe()` em vez de setInterval.
- M6.4 Musica tema por area: `playMusicaFundo(area?)` seleciona musica_fundo_{fb,at,nt}; LicaoScreen chama `playMusicaFundo(m.area)` ao montar.
- M6.5 Haptics: `expo-haptics` + `src/lib/haptics.ts` com lightTap/successBuzz/errorBuzz/notificationBuzz; toggle `hapticos` (default true).
- M6.6 TTS: `expo-speech` + `Speech.speak(pergunta, 'pt-BR')` ao trocar pergunta; toggle `voz` (default false).
- M6.7 Resume positionMillis: `musicaPositionMillis` salvo em stopMusicaFundo; retomado via `setStatusAsync({ positionMillis })` em playMusicaFundo.

### Validacao E2E no emulator-5554 (smoke)

- APK V10 instalado em emulator-5554 (motoraauto_smoke, 320x640 hdpi).
- /modos: CONFIRMADO fundo creme + logo cropped + cards roxos/borda laranja/palavras-chave laranja (briefing).
- /licoes/M001: CONFIRMADO header "Alfabetizacao Biblica" (NOME, era codigo FB01).
- Licao Q01 → Q02 → Q03: CONFIRMADO fundo roxo claro + personagem PENSATIVO + pergunta REAL ("O que e a Biblia?") + input roxo/borda laranja + botao ENVIAR. **SEM LOOP** (M5.4 validado).
- Screenshots em `C:\ENB\orchestration\v10_*.png` (8 capturas).

### Pendencias (NAO cobertas em V10)

1. Validacao completa ate Tela Final/Trofeu no emulator (10 Q nao foram percorridas). Codigo aplicado, mas nao visualizado.
2. M6 audio (SFX novos + musica tema por area) nao audivel em emulador mudo.

### APK

- **Local**: `C:\ENB\dist\ExpertNaBiblia-v10.0.0.apk` (101 MB)
- **SHA256**: `29FE771144A2CDB2E79711B70844B7F953785265D40FE9DA42C4BC8AAC8E8391`
- **URL publica**: `https://files.catbox.moe/yd7zxg.apk`

### Type-check

- 0 erros introduzidos por V10 (4 pre-existentes nao relacionados: app.config.ts newArchEnabled, quiz/jogar.tsx params, AdInterstitial useState, PersonagemLivro Image).

### Dependencias adicionadas

- `expo-speech`, `expo-haptics`, `expo-linear-gradient`, `@react-native-community/slider` (4 pacotes via `npm install --legacy-peer-deps`).

---

## Milestone 7: Polish UX + matching tolerante (MELHORIA) — CONCLUIDO 2026-06-24

> 5 fixes pontuais identificados na auditoria visual V11. Cada item eh DIV (divergencia) do briefing.
> Origem: orquestrador @full-cycle (2026-06-24, opus[1m] agent, rigor=NORMAL, modo_continuo=ATIVO).

- [x] 7.1 **[DIV 1: CRITICA] Splash com logo grande "EXPERT NA BÍBLIA"** — INFRA | CRITICA | AUDITORIA_V11 | AUTONOMO | (entregue 2026-06-24)
  - Acao: copiou `assets/splash.png` (1284x2778, 776KB) para `android/app/src/main/res/drawable/splash.png` (forcar include via res/drawable). Atualizou `android/app/src/main/res/values/styles.xml` adicionando `<item name="android:windowBackground">@drawable/splash</item>` em AppTheme. SplashScreen.hideAsync continua sendo chamado em `_layout.tsx` quando fontes carregam.
  - **Por que CRITICA**: splash.png nao era bundled no APK final porque Metro/Gradle so inclui assets referenciados por `require()` — usar `windowBackground` em res/drawable garante render ANTES do JS carregar.
  - DoD: splash mostra "EXPERT NA BÍBLIA" grande (nao adaptive icon 96x96).

- [x] 7.2 **[DIV 2: MEDIA] Modal "Sair" so no back de /modos** — MELHORIA | MEDIA | AUDITORIA_V11 | AUTONOMO | (entregue 2026-06-24)
  - Acao: removeu `<BackHandlerOffline />` do JSX em `_layout.tsx` e do import. Criou hook `useBackHandlerRoot` em `src/hooks/useBackHandlerRoot.ts` que escuta `BackHandler.addEventListener('hardwareBackPress')` e mostra Alert "Deseja sair do Expert Na Biblia?" APENAS quando `pathname === '/modos' || '/modos/' || '/'`. Em outras telas, NAO intercepta (delega ao default handler para `router.back()`). Implementa debounce de 1.5s (segundo back dentro da janela = sai).
  - **Por que MEDIA**: briefing define "modal so quando usuario tenta sair via back na raiz". Antes mostrava em qualquer back se offline.
  - DoD: modal aparece somente quando back pressionado em /modos raiz.

- [x] 7.3 **[DIV 3: BAIXA] Card "LIÇÕES" cor exata #fd8414** — MELHORIA | BAIXA | AUDITORIA_V11 | AUTONOMO | (entregue 2026-06-24)
  - Acao: trocou `cardLicoes.backgroundColor` para `COLORS.laranjaEscuro` (#fd8414) sem opacity/transform. Adicionou `palavraChaveLaranja` style (cor preta) para manter "LIÇÕES" legivel em cima do fundo laranja. Borda preta para contraste.
  - **Por que BAIXA**: cor visual diferente do briefing. Agora match exato.
  - DoD: card "LIÇÕES" tem cor exata #fd8414 e "LIÇÕES" visivel em preto.

- [x] 7.4 **[DIV 4: BAIXA] Cards bloqueados em /licoes mais visiveis** — MELHORIA | BAIXA | AUDITORIA_V11 | AUTONOMO | (entregue 2026-06-24)
  - Acao: trocou `cardBloqueado.backgroundColor` de `COLORS.cinzaEscuro` (#4b5563) para `COLORS.cinzaMedio` (#9ca3af), opacity 0.6 → 0.85. Numero do modulo: `numeroBloqueado.color` mudou de `COLORS.cinzaMedio` para `COLORS.preto` para legibilidade no novo fundo.
  - **Por que BAIXA**: cards bloqueados quase invisiveis (cinza escuro + opacity 0.6). Agora claramente distintos dos liberados (roxos), mas visiveis.
  - DoD: cards bloqueados visiveis e distintos dos liberados.

- [x] 7.5 **[FIX CRITICO] Matching dissertativo tolerante** — FIX | CRITICA | AUDITORIA_V11 | AUTONOMO | (entregue 2026-06-24)
  - Acao: reescreveu `src/lib/matching.ts` com 5 camadas (vs 2 originais):
    1. **Placeholder filter** (NOVO): rejeita ANTES de qualquer matching respostas vazias, '...', 'NAO SEI', 'tbd', 'nada', etc.
    2. **Match exato normalizado**: identicas → CORRETO.
    3. **Match numerico** (NOVO): extrai digitos das duas strings e compara como conjunto (ordem nao importa). "39" vs "39 livros" → CORRETO.
    4. **Levenshtein normalizado**: threshold 0.85 → **0.50**.
    5. **Subconjunto de tokens** (NOVO): se tokens do usuario (com sinonimos expandidos) estao contidos >= 40% nos tokens canonicos expandidos → CORRETO. Tolera "AT e NT" vs "Antigo Testamento e Novo Testamento".
    6. **Cosseno semantico com sinonimos**: threshold 0.75 → **0.50**. Sinonimos expandidos: adicionou `antigo → at, ..., novo → nt, ..., livros → livro/escritura, ..., 39 ↔ trinta_nove, 66 ↔ sessenta_e_seis, 73 ↔ setenta_e_tres, ..., genesis/gn, apocalipse/apoc/revelacao`.
  - Acao secundaria: regenerou 3 placeholders em `src/db/seed-perguntas.ts`:
    - FB01-L01-Q07: '...' → "Nao. A Biblia foi escrita por cerca de 40 autores..."
    - FB01-L03-Q01: 'NAO SEI' → lista completa dos 39 livros do AT.
    - FB01-L03-Q02: 'NAO SEI' → lista completa dos 27 livros do NT.
  - **Por que CRITICA**: thresholds antigos rejeitavam respostas validas como "AT e NT", "39", "genesis", "apocalipse de joao". Validado E2E com 9 casos representativos (8/9 OK; "39 livros do AT" eh caso degenerado — muitos tokens irrelevantes diluem fracao, aceitavel).
  - **Testes**: jest matching.test.ts (8/8 PASS); tsx scripts/test_matching_v12.ts (8/9 OK; 1 caso degenerado).
  - DoD: respostas validas aceitas; placeholders rejeitados.

---

## Milestone 14: Bugs reais pendentes (MIX) — V13

> O usuario reportou "som nao funciona e outros bugs". Apos investigacao, encontrei 5 bugs
> que escaparam do V12. Estimativa: 2-4h de trabalho autonomo.

- [x] 14.1 **FIX: Som M6 (audio) — SFX novos nao tocam, MP3s vazios** — CORRECAO | CRITICA | USUARIO + INVESTIGACAO (auditoria V13) | AUTONOMO | [lente 1 detalhado] **(entregue 2026-06-25)**
  - **Causa real** (investigada):
    - 7 funcoes de SFX novos (playCombo, playTick, playVitoria, playCadeiraDesbloqueia, playShake) sao CODIGO MORTO — geradas mas nunca chamadas
    - 4 MP3 originais (splash/acerto/erro/transicao) tem 17KB cada — provavelmente quase vazios
    - SFX sao chamados com `.catch(() => {})` (silent failure) — usuario nunca sabe se falhou
  - **Sub-tarefas entregues**:
    1. **Substituir MP3s vazios**: 4 sons REAIS via `mcp__elevenlabs__text_to_sound_effects` (splash 48KB, acerto 17KB, erro 17KB, transicao 17KB — gerados 2026-06-25 06:56)
    2. **Wire-up SFX novos**:
       - `playCombo` em final.tsx score >=100 (combo de 3+ acertos seguidos)
       - `playVitoria` em trofeu.tsx (substituiu playAcerto generico)
       - `playCadeiraDesbloqueia` em licoes/index.tsx (tocado uma unica vez via useRef Set)
       - `playShake` em final.tsx score <50 (substituiu playErro generico)
    3. **Remover silent catches**: 7 pontos trocados por `console.warn('[audio] <contexto> falhou:', e)` — index.tsx, _layout.tsx, feedback.tsx, final.tsx, trofeu.tsx, sound.ts (3x)
    4. **Validar playMusicaFundo**: getStatusAsync + stopAsync + unloadAsync + setStatusAsync agora logam warn em vez de silenciar
  - DoD: SFX tocam em momentos certos (splash no app open, acerto/erro em feedback, vitoria no trofeu, transicao entre telas), musica fundo toca em background, logs de erro vao pro logcat

- [x] 14.2 **FIX: Modal de Back no root aparece em qualquer back** — CORRECAO | MEDIA | INVESTIGACAO (auditoria V13) | AUTONOMO | [lente 2 enriquecido] **(entregue 2026-06-25)**
  - **Causa**: `useBackHandlerRoot` em `src/hooks/` nao valida `pathname` — sempre mostra modal
  - **Acao em `src/hooks/useBackHandlerRoot.ts`**:
    1. Check `if (pathname === '/modos' || pathname === '/')` JÁ EXISTIA (V12 7.2); confirmado em auditoria V13
    2. **NOVO**: Fallback adicionado `if (!pathname) return false;` antes do check — protege contra deep link inicial onde pathname pode ser null
  - DoD: modal aparece SO em /modos (raiz do app)

- [x] 14.3 **FIX: renderItem com slice sem espaco** — MANUTENCAO | BAIXA | INVESTIGACAO (auditoria V13) | AUTONOMO | [lente 3 recuperado] **(entregue 2026-06-25)**
  - **Causa**: `src/app/licoes/index.tsx:32` `item.nome.slice(palavraChave.length)` nao inclui o espaco
  - **Acao**: `item.nome.slice(palavraChave.length + 1)` (inclui o espaco removido pelo split)
  - DoD: o complemento aparece com 1 espaco antes

- [x] 14.4 **FIX: console.logs esquecidos em producao** — MANUTENCAO | BAIXA | INVESTIGACAO (auditoria V13) | AUTONOMO **(entregue 2026-06-25)**
  - **Causa**: logs em `src/lib/db-queries.ts:181`, `src/lib/quiz-alternatives.ts:89,103,120,134`
  - **Acao**: trocados 5 `console.log` por `console.debug` (db-queries + 4 logs do quiz-alternatives batch)
  - DoD: console.log nao aparece em release build

- [x] 14.5 **Resolver TODOs em AdBanner/AdInterstitial/sentry** — MANUTENCAO | BAIXA | INVESTIGACAO (auditoria V13) | AUTONOMO **(entregue 2026-06-25)**
  - **Causa**: 3 TODOs nao resolvidos (AdBanner, AdInterstitial, sentry integration)
  - **Acao**: REMOVIDOS os 3 arquivos (`src/components/AdBanner.tsx`, `src/components/AdInterstitial.tsx`, `src/lib/sentry.ts`) — nenhum era usado em qualquer lugar do app (verificado via grep). Total de TODOs no projeto: 0
  - DoD: zero TODOs nos componentes de UI

## STATUS V12 — EXECUCAO 2026-06-24 (@full-cycle agent, opus[1m])

### Entregues (5 itens [x] no M7)

**M7 — Polish UX + matching tolerante:**

- 7.1 Splash com logo grande "EXPERT NA BÍBLIA": splash.png (1284x2778) copiado para `android/app/src/main/res/drawable/`, `styles.xml` agora define `windowBackground = @drawable/splash`.
- 7.2 Modal "Sair" so no back de /modos: `BackHandlerOffline` removido do _layout.tsx; novo hook `useBackHandlerRoot` em `src/hooks/useBackHandlerRoot.ts` mostra Alert APENAS quando pathname é /modos.
- 7.3 Card "LIÇÕES" #fd8414: `cardLicoes.backgroundColor = COLORS.laranjaEscuro`; palavraChaveLaranja com cor preta para legibilidade.
- 7.4 Cards bloqueados visiveis: cinza medio (#9ca3af) + opacity 0.85 + numero preto; distinto dos liberados roxos.
- 7.5 Matching tolerante: 5 camadas (placeholder, exato, numerico, subconjunto tokens, cosseno); sinonimos biblicos expandidos (AT/NT, livros, genesis/apocalipse, 39/66/73); 3 placeholders regenerados em FB01-L01-Q07, FB01-L03-Q01, FB01-L03-Q02.

### Testes executados

- `npx jest __tests__/matching.test.ts`: 8/8 PASS.
- `npx tsx scripts/test_matching_v12.ts`: 8/9 OK (casos do briefing 100%; 1 caso degenerado aceito).
- `npx tsc --noEmit`: 0 erros novos (4 pre-existentes nao relacionados).
- `npx eslint`: 0 erros nos arquivos modificados.

### APK

- **Local**: `C:\ENB\dist\ExpertNaBiblia-v12.0.0.apk` (102 MB)
- **SHA256**: `91364b9355a9e99ea7e047b4d428f47f55263d752628dbff7d3475ed9559fc38`
- **URL publica**: `https://files.catbox.moe/un567v.apk`
- **Build**: `gradlew assembleRelease --no-daemon` — BUILD SUCCESSFUL em 2m 49s.

### Pendencias (NAO cobertas em V12)

- Validacao E2E completa no emulator-5554 (splash grande, modal back, cor #fd8414, matching). Build OK; smoke E2E depende do emulador estar disponivel.
- Placeholders podem existir em OUTRAS perguntas (FB01-L02 em diante, AT, NT) — seed atualiza so FB01. Proxima iteracao: regenerar batch completo via M3 ou heuristica "..." e "NAO SEI".

### Dependencias adicionadas em V12

- Nenhuma (somente edicoes de codigo e recursos).


## Milestone 15: Bugs UX profundos (MIX) — V14

> O usuario testou V13 e listou varios bugs reais. Apos investigacao (captura de 10 telas),
> encontrei 9 bugs que afetam UX direto. Foco: 15.1 (splash), 15.3 (onboarding), 15.4 (loop quiz).
> Estimativa: 4-6h de trabalho autonomo.

- [x] 15.1 **Splash com logo grande "EXPERT NA BÍBLIA" (sem adaptive icon minúsculo)** — CORRECAO | CRITICA | USUARIO + INVESTIGACAO (auditoria V14) | AUTONOMO | [lente 1 detalhado]
  - **Causa**: index.tsx (JSX) tem `<Image source={require('../../assets/images/logo.jpg')}>` de 340x340 que renderiza ADICIONAL ao splash nativo
  - **Acao em `src/app/index.tsx`**:
    1. **Remover o `<Image>` JSX duplicado** — deixar só o splash nativo do Android (que ja tem o logo cropped 750x900 em `assets/splash.png`)
    2. **OU**: aumentar o `<Image>` JSX para 340x340 e remover o `splash.png` nativo
    3. Garantir que `SplashScreen.hideAsync()` é chamado em ~500ms (nao esperar 3s)
  - DoD: splash mostra "EXPERT NA BÍBLIA" grande (não adaptive icon 96x96 minúsculo)

- [x] 15.2 **Identidade visual em /modos e /quiz conforme briefing** — MELHORIA | CRITICA | USUARIO + INVESTIGACAO (auditoria V14) | AUTONOMO | [lente 2 enriquecido]
  - **Causa**: /modos e /quiz não seguem briefing — cards sem personagem livro, fundo roxo em vez de creme, palavras-chave não em laranja
  - **Acao**:
    1. `modos.tsx`: aplicar fundo creme (`COLORS.creme`), adicionar logo grande no topo (já existe em `licoes/index.tsx`), manter cards roxos com borda laranja (já está)
    2. `quiz/index.tsx`: substituir emojis 🎲/💪 por PersonagemLivro com poses diferentes (aleatório=PENSATIVO, personalizado=FELIZ)
    3. Validar pixel-perfect #f7f4ed em todas as telas
  - DoD: /modos e /quiz seguem briefing (fundo creme, logo grande, personagem livro)

- [x] 15.3 **Onboarding aparece só 1x (não toda vez que abre o app)** — CORRECAO | CRITICA | USUARIO + INVESTIGACAO (auditoria V14) | AUTONOMO | [lente 5 premissa verificada]
  - **Causa**: o `useEffect` em `index.tsx` sempre redireciona para `/onboarding` independente do valor de `@onboarding:completed`
  - **Acao em `src/app/index.tsx`**:
    1. Verificar se `AsyncStorage.getItem(ONBOARDING_KEY)` retorna '1' (caso sim, ir direto para /modos)
    2. Log para debug: `console.log('[onboarding] key:', done)`
  - DoD: onboarding aparece SÓ na primeira vez (depois disso vai direto para /modos)

- [x] 15.4 **Fix loop infinito no quiz (aleatório/personalizado)** — CORRECAO | CRITICA | USUARIO + INVESTIGACAO (auditoria V14) | AUTONOMO | [lente 1 detalhado]
  - **Causa provável**: o `useEffect` que faz `carregarPerguntas()` em `src/app/quiz/jogar.tsx` tem dep array `[indice, loading, selecionada]`. Quando o usuario responde, `setIndice()` é chamado, que trigga `useEffect` novamente, que pode chamar `proxima()` em loop.
  - **Acao em `src/app/quiz/jogar.tsx`**:
    1. **Adicionar cleanup** com `return () => clearTimeout/clearInterval` no `useEffect` do timer
    2. **Usar ref** para o timer: `const timerRef = useRef<any>(null);` e `timerRef.current = setInterval(...)`
    3. **Verificar se `proxima()` está sendo chamado em loop** — adicionar guard `if (carregando) return;`
  - DoD: quiz nao fica em loop infinito apos responder

- [x] 15.5 **Personagem livro grande (300-400px) com moldura elegante** — MELHORIA | ALTA | USUARIO + INVESTIGACAO (auditoria V14) | AUTONOMO | [lente 4 re-priorizado]
  - **Causa**: `<PersonagemLivro pose="PENSATIVO" size={110} />` em `licao[moduloId][licaoId].tsx` — size 110 é muito pequeno
  - **Acao em `src/app/licoes/[moduloId]/[licaoId].tsx`**:
    1. Mudar `size={110}` para `size={300}` (ou maior)
    2. Adicionar moldura elegante ao redor (borderRadius, shadow, padding) — briefing tem moldura colorida
    3. Adicionar `Animated` com fade-in/zoom para dar sensação de "vivo"
  - DoD: personagem livro aparece grande com moldura elegante (não quadradinho minúsculo)

- [x] 15.6 **Teclado nao tampa input dissertativo (KeyboardAvoidingView height + adjustResize)** — CORRECAO | ALTA | USUARIO + INVESTIGACAO (auditoria V14) | AUTONOMO | [lente 1 detalhado]
  - **Causa**: `KeyboardAvoidingView` em `licao[moduloId][licaoId].tsx` tem `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`. No Android, `behavior` é `undefined`, o que NAO funciona.
  - **Acao em `src/app/licoes/[moduloId]/[licaoId].tsx`**:
    1. Mudar `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` (height funciona no Android)
    2. Adicionar `keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 64}` (compensar status bar)
    3. Em `AndroidManifest.xml`, garantir que `android:windowSoftInputMode="adjustResize"` está setado
  - DoD: teclado nao tampa o campo de input; usuario ve o que esta digitando

- [x] 15.7 **Som de fundo sem glitch (regenerar ou trim)** — MELHORIA | **ALTA** | USUARIO + INVESTIGACAO (auditoria V14) | AUTONOMO | [lente 4 re-priorizado]
  - **Causa provável**: o `musica_fundo_v2.mp3` (60-90s) tem glitches
  - **Acao**:
    1. Gerar novo `musica_fundo_v3.mp3` via `mcp__elevenlabs__text_to_sound_effects` com texto: "A seamless 60-90 second calm mystical ambient music loop for Bible study app, no glitches, seamless loop point"
    2. Verificar `ensureAudioMode()` em `src/lib/sound.ts` — não chamar `setAudioModeAsync` múltiplas vezes (causa glitch)
    3. Adicionar fade in/out ao iniciar/parar música (volume 0 → settings.volumeMusica em 1s)
    4. Substituir `musica_fundo_v2.mp3` por `musica_fundo_v3.mp3` no `src/lib/sound.ts` linha 145
  - DoD: musica de fundo toca sem estouro recorrente

- [x] 15.8 **Feedback de acerto/erro conforme briefing (personagem livro grande, fundo laranja, balao de fala)** — MELHORIA | MEDIA | USUARIO + INVESTIGACAO (auditoria V14) | AUTONOMO
  - **Causa**: feedback acerto/erro nao segue briefing
  - **Acao em `src/app/licoes/[moduloId]/[licaoId]/feedback.tsx`**:
    1. Aumentar `PersonagemLivro size={110}` para `size={200}` (briefing diz grande)
    2. Adicionar fundo laranja (`COLORS.laranjaForte`) ao container de feedback (ja esta)
    3. Adicionar balao de fala (View com borderRadius + position absolute) com texto "Correto!" / "Errado" em destaque
    4. Adicionar animacao: bounce no personagem ao acertar
  - DoD: feedback acerto/erro segue briefing (fundo laranja, personagem livro grande, balao de fala)

- [ ] 15.9 **Substituir emojis por personagem livro em /modos** — REJEITADO (briefing valida emojis) | BAIXA | USUARIO + INVESTIGACAO (auditoria V14) | AUTONOMO | [lente 4 re-priorizado]
  - **Causa**: card "ALEATORIO" tem emoji 🎲, "PERSONALIZADO" tem 📚
  - **POR QUE REJEITADO**: o briefing oficial (`whatsapp_media/images/image_20260622_223032.jpg`) USA emojis (🎲/💪/📚) como parte do design — NÃO há personagem livro nos cards de /modos no briefing
  - **NÃO IMPLEMENTAR** — emojis do briefing são intencionais
  - Se quiser refinar, melhorar o tamanho dos emojis (size 48-64) e cor (laranjaEscuro)

## STATUS V13 — EXECUCAO 2026-06-25 (@full-cycle agent, opus[1m])

### Entregues (5/5 itens [x] no M14)

**M14 — Bugs reais pendentes:**

- **14.1 [CRITICA]**: Som M6 (audio)
  - 4 MP3s REAIS gerados via `mcp__elevenlabs__text_to_sound_effects` (splash/acerto/erro/transicao) em 2026-06-25 06:56
  - 4 SFX novos wirados: playCombo (final 100%), playVitoria (trofeu), playCadeiraDesbloqueia (licoes/index desbloqueio), playShake (final <50%)
  - 7 silent catches removidos (substituidos por console.warn com contexto)
  - playMusicaFundo validado com logs em vez de silenciar
- **14.2 [MEDIA]**: useBackHandlerRoot com fallback `if (!pathname) return false;` (deep link inicial)
- **14.3 [BAIXA]**: `item.nome.slice(palavraChave.length + 1)` em licoes/index.tsx (slice com +1)
- **14.4 [BAIXA]**: 5 console.log → console.debug em db-queries.ts + quiz-alternatives.ts
- **14.5 [BAIXA]**: 3 arquivos (AdBanner.tsx, AdInterstitial.tsx, sentry.ts) REMOVIDOS — zero TODOs no projeto

### Validacao E2E no emulator-5554
- App iniciou sem FATAL EXCEPTION (PID 20376, processo vivo)
- Splash -> /modos -> /licoes funcionais
- Zero erros de audio no logcat

### Type-check
- 4 erros pre-existentes (V12, nao relacionados): app.config.ts newArchEnabled, settings.ts (2x), sound-runtime.ts lastEfeitos
- 0 erros introduzidos por V13 (apos remover imports nao usados em final.tsx)

### APK
- **Local**: `C:\ENB\dist\ExpertNaBiblia-v13.0.0.apk` (102 MB)
- **SHA256**: `4b8b4a647c12305f0dd2c44df8be68e1f0aae6b91bbf24b1df0676d48567fb05`
- **URL publica**: `https://files.catbox.moe/i1bpj8.apk`
- **Build**: `gradlew assembleRelease --no-daemon` — BUILD SUCCESSFUL em 3m 40s

---

# ===== PLANO V19 (2026-06-25) — CORRECAO DOS BUGS REAIS DA QA INDEPENDENTE =====

> Origem: validacao INDEPENDENTE cetica do V18 (orchestration/v18_validation_independent/VERDICT.md)
> REFUTOU a alegacao V18 ("14 telas 5/5 + modulo desbloqueia"). Modo Licoes estava com progressao
> QUEBRADA (scoring nunca acumulava). @full-cycle agent (opus[1m]).

## Milestone V19 — bugs do VERDICT

- [x] **MV19.1 [CRITICA / release-blocker]** Scoring da licao nao acumulava (acertos resetava a cada
  remontagem). FIX: threading de `acertos` via params em licao<->feedback (licao inicializa state do
  param + sync effect; feedback repassa acertos no router.replace). (entregue 2026-06-25)
- [x] **MV19.2 [CRITICA]** Desbloqueio de modulo + trofeu: com o scoring corrigido, marcarLicaoConcluida
  /moduloEstaCompleto/marcarModuloConcluido/todosModulosConcluidos passam a ser alcancaveis. Validado
  empiricamente (cenarios A/B/C). (entregue 2026-06-25)
- [x] **MV19.3 [ALTO]** Canonicas placeholder. FIX em 2 camadas: (a) guard em matchCanonico — canonica
  placeholder ('...', 'NAO SEI', vazia) + resposta substantiva => aceita (metodo SEM_GABARITO), nunca
  invencivel; (b) 11 canonicas reais preenchidas (7 '...' + 4 "NAO SEI" do FB01) no seed TS + db.sqlite.
  ACHADO ALEM DO VERDICT: nao eram 8 e sim ~508 placeholders (maioria "NAO SEI"); 497 restantes ficam
  cobertos pelo guard offline. (entregue 2026-06-25)
- [x] **MV19.4 [ALTO]** Teclado cobria ENVIAR + envio vazio abandonava a licao. FIX: ScrollView dentro
  do KeyboardAvoidingView (botao sempre alcancavel) + guard de resposta vazia com mensagem de validacao
  (nao navega para fora). (entregue 2026-06-25)
- [x] **MV19.5 [MEDIO]** Placar do Quiz: copy "NAO DEU/QUASE LA/VOCE PASSOU!" + quadro branco "Voce
  acertou X de N" + RECOMECAR + pose por faixa. (entregue 2026-06-25)
- [x] **MV19.7 [MEDIO]** Titulos sem espaco na lista de modulos ("AlfabetizacaoBiblica"). FIX: slice
  sem +1 (mantem o espaco). (entregue 2026-06-25)
- [x] **MV19.8 [MEDIO]** Banner MODO OFFLINE sobrepunha headers. FIX: banner em fluxo normal (acima do
  Stack) com safe-area inset, em vez de position:absolute. (entregue 2026-06-25)
- [x] **MV19.9 [MEDIO]** Modulos/licoes travados em cinza. FIX: roxo (degrade) escurecido + cadeado
  sobreposto (mock). (entregue 2026-06-25)
- [x] **MV19.10 [MEDIO]** Gradientes "chapados" (onboarding/pergunta). FIX: GradienteRoxo passou de
  #5c0d8d->#3c026d (quase identicos) para #8b16c7->#3c026d (degrade oficial visivel). (entregue 2026-06-25)

## Pendencias V19 (honestidade — nao bloqueiam release)

- [ ] **MV19.6 [MEDIO]** Mascote do modo Licoes deveria ser o livro DOURADO (briefing); o app usa 1 set
  de PNG (livro roxo) para Licoes e Quiz. Requer asset dourado do designer/Drive. DEFERIDO p/ V20.
- [ ] **MV19.11 [ALTO->V20]** Wirar avaliador.ts (LLM M2.7/OpenAI) no fluxo da licao (enviar() usa
  matchCanonico cru — rule #4 "IA obrigatoria" nao cumprida online) + batch M2.7 para as ~497 canonicas
  "NAO SEI" (perguntas abertas de compreensao). Hoje cobertas pelo guard SEM_GABARITO offline.
