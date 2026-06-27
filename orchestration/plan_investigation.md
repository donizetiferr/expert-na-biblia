# Plan Investigation — Expert Na Biblia (V23, 2026-06-26)

> Investigacao V23 focada na dimensao ENGAJAMENTO/DOPAMINA/UX/MULTI-IDADE/APRENDIZADO/MONETIZACAO,
> subdimensionada no plano V22 (auditoria tecnica de bugs/infra/seguranca). Atualiza o log para os gates G0-G5.
> Evidencia V22 anterior preservada no git e no historico do evolution_plan.md.

## Modo
Escopo: ATUALIZACAO | Profundidade: COMPLETO — razao: input sem apontamentos pontuais, pede "esgotar possibilidades de evolucao / auditoria / validar+enriquecer+aprofundar".

## Arquivos lidos (piso minimo + investigacao dirigida)
- CLAUDE.md do projeto — objetivo central (engajar/dopamina/expert), stack RN+Expo, 40 modulos, 2 modos, aesthetic editorial.
- evolution_plan.md (1371 linhas) — plano V22 (78 itens, 12 milestones tecnicos) + historico V8-V21.
- src/app/ (rotas expo-router) — modos, licoes/[moduloId]/[licaoId]/feedback/final, quiz/index/jogar/final, trofeu, onboarding, config.
- src/lib/streak.ts — 99 linhas, logica completa (incremento, freeze semanal) — 0 imports (MORTO).
- src/lib/notifications.ts — agendarLembreteDiario completo — 0 imports (MORTO).
- src/lib/progressao.ts — moduloLiberado() (desbloqueio sequencial OK).
- src/lib/sound.ts / haptics.ts — SFX+haptics WIRED (playAcerto/playErro/successBuzz; playCombo existe com 0 chamadas).
- src/lib/db-queries.ts — user_rankings gravado (quiz/final.tsx:57) e NUNCA lido; sem tabela user_xp/user_badges.
- app.config.ts — plugin expo-ads-admob com PLACEHOLDER (DEPRECATED, 0 implementacao); EAS projectId PLACEHOLDER.

## Comandos executados (subagente Explore, read-only)
- grep imports streak.ts/notifications.ts/deep-link -> 0 imports (codigo morto confirmado).
- grep AdMob|admob|google.*ads|GAMobileAds -> 0 resultados (placeholder vestigial).
- grep Speech.speak -> 0 (TTS nao wired apesar de expo-speech + settings.voz).
- contagem testes -> 97/97 passando, 11 suites; CI .github/workflows/ci.yml robusto.

## Saude do projeto (verificada 2026-06-26)
- Testes: EXISTEM+PASSANDO (97/97, 11 suites) — evidencia: jest no CI + V21 checkpoint.
- Build: OK (APK V21 vc6/1.11.0 publicado) — evidencia: dist/ + catbox.
- CI/CD: CONFIGURADO (lint+type-check -> test -> EAS build preview, Node 22) — evidencia: .github/workflows/ci.yml.
- Deps: DESATUALIZADAS — Expo SDK 55 (56 disponivel), 16 moderate vulns, **expo-ads-admob DEPRECATED** (lib correta: react-native-google-mobile-ads); EAS projectId placeholder — evidencia: app.config.ts + npm audit (V22).
- Docs: COMPLETAS (CLAUDE.md/README/CHANGELOG/evolution_plan) com 1 inconsistencia (backend Node.js descartado ainda citado) — evidencia: CLAUDE.md:36.

## Sinais de codigo
- Codigo morto de engajamento: streak.ts, notifications.ts, deep-link, quota-monitor, playCombo, TTS, user_rankings(read), refs_biblicas(render), campo dificuldade(uso). Padrao: INFRAESTRUTURA DE ENGAJAMENTO EXISTE MAS NAO ESTA LIGADA NA UI.
- Arquivos >500 linhas: seeds (dados). Duplicacao: refs biblicas no feedback aparece 2x no V22 (F.9 + H.4).

## Pesquisa externa (COMPLETO — executada)
- Queries: mecanicas de engajamento Duolingo/Brilliant; apps biblia gamificados (YouVersion/Manna/Bible Trivia); modalidades de aprendizado (spaced repetition/Leitner/SM-2, Brilliant learn-by-doing); design multi-idade/WCAG mobile; AdMob nao-invasivo + rewarded + Families policy + UMP/Expo; onboarding de ativacao.
- Fontes: trophy.so/duolingo, strivecloud, plotline, youversion.com, themanna.app, brilliant.org/about, wiki Spaced_repetition + Leitner_system, median.co a11y, support.google.com/admob (6244508 frequency, 6223431 families), docs.page invertase react-native-google-mobile-ads, junoschool/appcues onboarding.
- Achados que viraram candidatos: ~12 (XP+streak+meta como nucleo; ligas/chests; versiculo do dia; spaced repetition; novos formatos; touch 44-48 + Dynamic Type + contraste + TTS; rewarded para vidas/dicas/freeze; interstitial pos-modulo c/ cap; UMP/consent LGPD; publico adulto no Play Console; onboarding de ativacao).

## Objetivos do produto -> cobertura -> gaps (COMPLETO)
- OBJ-1 "Ensinar a Biblia de forma ludica e progressiva, ENGAJANDO e liberando dopamina ate virar expert" | fonte: CLAUDE.md OBJETIVO | cobertura atual: PARCIAL (progressao 100%-gate + SFX/anim/trofeu OK; mas SEM camada de retencao persistente: XP/streak/metas/badges/perfil/progresso-visivel; engajamento morto no codigo) | gap vira: milestones V23.A/B/C (CRITICA-ALTA, fonte OBJECTIVE_GAP).
- OBJ-deriv "aprendizado (nao so avaliacao)" | INFERIDO do pedido + regra IA | cobertura: AUSENTE (so pergunta aberta + quiz; sem ensinar antes/flashcard/fill-in/ordenar/match/audio) | gap vira: V23.D.
- OBJ-deriv "varias faixas de idade" | fonte: input usuario | cobertura: AUSENTE (fontes fixas, sem Dynamic Type/TTS/contraste auditado) | gap vira: V23.E.
- OBJ-deriv "monetizacao AdMob nao-invasiva pos-loja" | fonte: CLAUDE.md decisao #9 + input | cobertura: AUSENTE (placeholder deprecated) | gap vira: V23.F (FASE 3).

## Historico do plano (ATUALIZACAO)
- Categorias recorrentes: muitos ciclos (V8-V21) gastos em fidelidade visual/bugs de runtime; engajamento sempre empurrado para "backlog V22.F". Sinal: a dimensao de PRODUTO/RETENCAO nunca foi tratada como milestone de primeira classe -> causa-raiz do objetivo OBJ-1 ficar PARCIAL.
- Areas nunca tocadas por milestone de entrega: XP, badges, perfil, metas diarias, modalidades de aprendizado, onboarding de ativacao.
- Rejeitados que continuam rejeitados (sem fato novo): iOS, multi-idioma, backend dedicado.

## Cobertura por dimensao (COMPLETO — gate G4)
- CORRECAO_BUGS: V22.A/G ja cobrem (SplashScreen shadowing, key prop, overflow 320px, loading state, haptics cache nunca invalidado). Varrida via V22 + grep. Nada novo critico no escopo V23.
- MELHORIA: muitos (haptics nos botoes, config icones, header voltar, matching respostas longas) — herdados V22.B + novos UX em V23.E.
- EVOLUCAO_FEATURES: 6+ achados V23 (XP/streak/metas/badges/perfil/modalidades/versiculo/leaderboard/combos/hearts) + V22.F (mascote evolui, revisao espacada, share, push, dificuldade adaptativa). Maior bloco V23.
- MANUTENCAO_REFACTOR: V22.H/I/J (git bloat 119MB, seed JSON, aliases mortos, scripts mortos) — validos, rebaixados a BAIXA contra objetivo de engajamento (exceto seguranca).
- INFRAESTRUTURA: error boundaries (V22.C.2 CRITICA), EAS init+eas.json (V22.C.1), Sentry/analytics (V22.C.3 — essencial p/ medir retencao real), migrar admob lib (V23.F.1). Veredito: avaliada, gaps reais.
- UX_UI: base estetica boa (editorial, degrades, personagem); gaps: progresso invisivel, sem perfil, contraste sobre degrade nao auditado, sem Dynamic Type, TTS off, touch targets nao verificados 44-48. Milestone V23.E dedicado.
- PERFORMANCE: animacoes em loop continuo (V22.B.2), 2x listarModulos (V22.A.5), O(n2) moduloLiberado (V22.I.8) — herdados, BAIXA.
- SEGURANCA: 2 credenciais expostas no git (keystore expert2026 V22.I.1 + API key Minimax V22.J.1) = CRITICA; 16 moderate vulns (V22.D.1). Cruzado com 1.5b.

## Autonomia por item (pre-check leve)
- Engajamento (V23.A-E): AUTONOMO — todo codigo/dados/credenciais ja existem (streak/notifications/sound prontos; M2.7 no cofre p/ gerar conteudo didatico/refs/distratores).
- Conteudo didatico/refs/distratores via batch M2.7: AUTONOMO (Minimax no cofre `Tokens API e acessos/minimax/credentials.md`).
- V23.F (AdMob): DEPENDE_VOCE — criar conta AdMob + App ID + ad unit IDs (decisao + cadastro). Implementacao de codigo e AUTONOMO depois do ID.
- V22.I.1 keystore: DEPENDE_VOCE (gerar novo keystore/decidir filter-repo). V22.C.1 EAS: DESTRAVAVEL (rodar eas init OU fornecer projectId).
- Poses douradas assustado/triste: DESTRAVAVEL (designer subir no Drive).

## Segundo turno critico (FASE 3.5 — gate G5)
- Lentes aplicadas: 7/7.
- Ajustes: 14 — detalhados 2 (schema user_xp + onde XP e concedido/exibido; meta diaria ancorada no onboarding) | enriquecidos/POLISH 3 (unificar XP+streak+meta num LOOP coeso, nao 3 features soltas; mascote evolui atrelado ao NIVEL de XP nao so a modulos; onboarding define a meta) | recuperados 3 (sistema de vidas/hearts como tensao + gancho de rewarded; combos no quiz playCombo morto; leaderboard = ler user_rankings) | re-priorizados ~5 (V22.F streak/push/versiculo/mascote/dificuldade SOBEM de BACKLOG para ALTA/CRITICA contra OBJ-1; git cleanup V22.H/I/J nao-seguranca DESCE para BAIXA) | consolidados 1 (refs biblicas V22.F.9 == V22.H.4) | premissas verificadas 2 (expo-ads-admob DEPRECATED -> migrar lib; TTS/expo-speech instalado mas 0 chamadas = unwired, nao ausente).
- Re-ataque (0 ajustes em plano >=3): nao aplicavel (14 ajustes).
- Top 3 ajustes mais relevantes:
  1. Reframe: engajamento nao e "backlog" (V22.F) e sim o OBJ-1 central PARCIAL — vira bloco V23.A-C de prioridade CRITICA/ALTA, organizado como LOOP unico (XP+streak+meta+recompensa) e nao features isoladas.
  2. Faseamento explicito APK-final -> loja -> AdMob; monetizacao planejada agora (V23.F) mas marcada NAO-IMPLEMENTAR-ate-versao-final.
  3. Migracao expo-ads-admob(deprecated) -> react-native-google-mobile-ads + UMP/consent LGPD + declarar publico adulto no Play Console (evita regime Families restritivo de ads).

## 2a passada — double-check profundo V23.1 (2026-06-26, solicitado pelo usuario)
> Verificacao das premissas NO CODIGO REAL (Grep/Read), nao so no levantamento do subagente. Decisoes de produto tomadas autonomamente.
- Premissas corrigidas no codigo (5): (1) `playCombo()` NAO esta morto — wired em final.tsx:32 (lição 100%); o gap real e combo no QUIZ. (2) `user_streak` JA e tabela (database.ts:105). (3) `marcarModuloConcluido` wired (final.tsx:86) — progressao funciona. (4) Existe mecanismo `_migrations` (database.ts:40) — tabelas novas DEVEM passar por ele (senao crash no upgrade). (5) `Settings` = 7 campos no SecureStore, sem metaDiaria/reduceMotion — preferencias vao p/ Settings, estado de jogo p/ SQLite. Tambem confirmado: freeze do streak e STUB (streak.ts:85-93) e streak tem 0 chamadas.
- Decisoes de produto (10, baked-in no plano): manter regra 100% mas sem punir (refazer so erradas = A.6); streak nao exige 100%; XP recompensa esforco; monetizacao SO bonus positivo, SEM vidas bloqueantes (F.5 DESCARTADO); persistencia entre reinstalacoes via Android Auto Backup + export/import (A.7); tom encorajador nao manipulador; anti-farm de XP; reduceMotion + celebracoes one-shot (E.7); assets de som via media-generation; validacao empirica obrigatoria do loop.
- Itens novos (4): A.0 (fundacao migracao+Settings+helper XP, CRITICA, pre-req de A-D), A.6 (refazer so erradas), A.7 (persistencia/backup), E.7 (reduceMotion). Reframe: F.3 (rewarded so positivo), B.5 (combo no quiz, premissa corrigida), F.5 (vidas descartado).
- Guias de execucao adicionados: Minimum Lovable Engagement (pacote minimo do "wow") + Quick Wins (codigo que so falta ligar).

## 3a passada — rodada de exaustao V23.2 (2026-06-26, "ja esgotou?")
> Ataque por angulos que A-G nao cobriam. Resultado: NAO estava esgotado — 17 oportunidades novas, todas viaveis offline-first/Android/PT-BR.
- Novos milestones (5): V23.H jornada visual/colecoes/cosmeticos; V23.I multi-perfil + modo Kids (serve "varias idades" REAL); V23.J enciclopedia/glossario + planos de leitura/devocional; V23.K eventos sazonais liturgicos + desafios rotativos + win-back + desafiar amigo async; V23.L review-na-loja (expo-store-review) + remover-ads/doacao IAP + consentimento de analytics LGPD + widget/shortcuts.
- Destaques de alto valor: H.1 (trilha sinuosa estilo Duolingo vs grid plano atual), I.1 (perfis locais p/ familia), L.1 (in-app review em momento de pico = crescimento organico).
- Fronteira de exaustao DOCUMENTADA (rejeitado por escopo, nao esquecimento): ligas/leaderboard online, multiplayer ao vivo, cloud sync, iOS, multi-idioma, multiplas traducoes embarcadas, Teologia(24). Sao as unicas fronteiras restantes — reabrir so se o escopo mudar (backend/iOS/idioma).
- Veredito: plano ESGOTADO dentro do escopo MVP Android/offline/PT-BR. Total V23 = 12 milestones / 59 itens novos + backlog tecnico V22 preservado.
