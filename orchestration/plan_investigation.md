# Plan Investigation — Expert Na Bíblia (2026-06-26)

## Modo
Escopo: ATUALIZACAO | Profundidade: COMPLETO — razão: input "auditoria profunda" (keyword de completude) + sem apontamentos acionáveis específicos, direcionamento temático (bugs, layout, UX/UI).

## Arquivos lidos (piso mínimo)
- `CLAUDE.md` — projeto pessoal, 247 linhas, stack React Native + Expo SDK 55, objetivo: ensinar Bíblia via app mobile
- `README.md` — status 0.1.0, stack, estrutura, como rodar
- `package.json` — Expo 55, React 19.2, RN 0.83.6, 30 deps, 14 devDeps
- `evolution_plan.md` — plano existente V18-V21, ~860 linhas, muitos milestones concluídos
- `src/app/_layout.tsx` — root layout, font loading, migrations, sound init
- `src/app/index.tsx` — splash screen com animação, redirecionamento onboarding/modos
- `src/app/modos.tsx` — tela de seleção de modo (Quiz/Lições), fundo creme, cards roxo+degradê
- `src/app/onboarding.tsx` — 3 slides com PersonagemLivro, useWindowDimensions
- `src/app/config.tsx` — configurações (som, haptics, TTS, reset)
- `src/app/licoes/index.tsx` — lista de 40 módulos, cadeado sequencial, amarelo concluído
- `src/app/licoes/[moduloId].tsx` — lista de lições dentro do módulo
- `src/app/licoes/[moduloId]/[licaoId].tsx` — tela de pergunta dissertativa, IA avaliadora
- `src/app/licoes/[moduloId]/[licaoId]/feedback.tsx` — feedback acerto/erro com personagem
- `src/app/licoes/[moduloId]/[licaoId]/final.tsx` — tela final da atividade (3 variantes)
- `src/app/quiz/jogar.tsx` — quiz múltipla escolha, timer 10s, 20 perguntas
- `src/app/trofeu.tsx` — tela de troféu com confetes animados
- `src/components/PersonagemLivro.tsx` — mascote animado (bounce+blink), 2 variantes (licoes/quiz)
- `src/components/Gradiente.tsx` — 4 componentes de degradê (roxo, laranja, laranja forte, troféu)
- `src/constants/colors.ts` — paleta oficial, fontes, espaçamentos, bordas
- `src/lib/db-queries.ts` — queries SQLite com fallback mock, 288 linhas
- `src/db/seed-modulos-licoes.ts` — seed data (800 linhas, esperado para dados)

## Comandos executados (com resultado resumido)
- `npx jest --no-coverage` -> 11 suites, 97/97 PASS (8.1s)
- `npx tsc --noEmit` -> 0 erros (saída limpa)
- `grep -rn TODO/FIXME/HACK src/` -> 0 ocorrências reais (apenas referências em comentários/documentação)
- `npm outdated` -> 29 packages desatualizados (expo 55->56, react-native 0.83->0.86, etc.)
- `npm audit` -> 16 moderate severity vulnerabilities (@expo/config chain)
- `find src -name "*.ts" -o -name "*.tsx" | wc -l` -> 55 arquivos fonte
- `.github/workflows/ci.yml` -> CI configurado (lint+type+test+EAS preview)

## Saúde do projeto (verificada em 2026-06-26)
- Testes: EXISTEM+PASSANDO (97/97, 11 suites) — evidência: `npx jest`
- Build: OK (gradlew assembleRelease funciona, APK V21 vc6/1.11.0 publicado) — evidência: changelog + git log
- CI/CD: CONFIGURADO (GitHub Actions: lint+type+test, EAS preview em PR) — evidência: `.github/workflows/ci.yml`
- Deps: DESATUALIZADAS (expo 55->56 disponível, RN 0.83->0.86, 29 packages outdated; 16 moderate vulns em @expo/config chain) — evidência: `npm outdated` + `npm audit`
- Docs: COMPLETAS (CLAUDE.md 247 linhas, README, changelog 45KB, evolution_plan 80KB, 8 docs em docs/, orchestration rico) — evidência: glob + reads

## Sinais de código
- TODO/FIXME/HACK: 0 ocorrências reais no código fonte
- Arquivos >300 linhas: 3 (seed-modulos-licoes.ts 800, licoes/[moduloId]/[licaoId].tsx 365, quiz/jogar.tsx 325)
- Duplicação óbvia: não detectada

## Pesquisa externa (COMPLETO)
- Queries: "bible quiz app features 2025", "gamification bible study app", "react native expo education app best practices", "mobile app UX bible learning"
- Fontes usadas: Play Store (top bible apps), Dribbble (education app designs)
- Achados que viraram candidatos: 3 (sistema de streak/XP mais visível, modo revisão espaçada, compartilhamento social)

## Objetivos do produto -> cobertura -> gaps (COMPLETO)
- OBJ-1: Ensinar Bíblia de forma lúdica e progressiva — cobertura: PARCIAL (~489 canonicas "NAO SEI", módulos Teologia ausentes)
- OBJ-2: Dois modos complementares (Lições + Quiz) — cobertura: TOTAL
- OBJ-3: Avaliação por IA generativa (M2.7) — cobertura: TOTAL
- OBJ-4: Progressão gamificada (100% para avançar, troféu final) — cobertura: TOTAL
- OBJ-5: Personagem livro animado — cobertura: PARCIAL (set parcial de poses douradas)
- OBJ-6: Timer 10s no Quiz — cobertura: TOTAL
- OBJ-7: Quiz customizado (max 20 módulos) — cobertura: TOTAL
- OBJ-8: Monetização AdMob — cobertura: AUSENTE (PLACEHOLDER_ANDROID_APP_ID, ads removidos V13)
- OBJ-9: Publicação Play Store — cobertura: PARCIAL (checklist existe, execução pendente)

## Histórico do plano (ATUALIZACAO)
- Categorias recorrentes: CORRECAO de bugs visuais/layout (V18-V21 = 4 ciclos focados em fidelidade visual)
- Areas nunca tocadas: performance profiling, acessibilidade (a11y), analytics/crash reporting, testes E2E Playwright
- Rejeitados que continuam rejeitados: iOS, multi-idioma, backend dedicado

## Cobertura por dimensao (COMPLETO — gate G4)
- CORRECAO_BUGS: 3 achados — varredura via code review + npm audit
- MELHORIA: 5 achados — varredura via code review de todas as telas
- EVOLUCAO_FEATURES: 4 achados — varredura via pesquisa externa + gaps de objetivos
- MANUTENCAO_REFACTOR: 3 achados — varredura via code review + docs
- INFRAESTRUTURA: 4 achados — varredura via npm outdated/audit + package.json
- UX_UI: 6 achados — varredura via heurísticas Nielsen + code review
- PERFORMANCE: 2 achados — varredura via code review
- SEGURANCA: 2 achados — varredura via npm audit + code review

## Achados independentes (fora dos apontamentos do input/contexto)
1. SplashScreen import shadowing (index.tsx:21)
2. key prop ausente no Pressable bloqueado (licoes/index.tsx:97)
3. FlatList com 1 item no onboarding
4. Botões feedback 140x140 overflow em telas <=320px
5. Config VolumeSlider usa emoji inconsistente
6. Animações loop contínuo consomem CPU
7. Error boundaries ausentes
8. 16 moderate vulnerabilities (@expo/config chain)
9. Expo SDK 56 disponível (v55 deprecated)
10. Privacy policy HTML EXISTE (HTTP 200, confirmado)
11. EAS projectId PLACEHOLDER + eas.json ausente
12. Backend Node.js no CLAUDE.md mas descartado
13. [Rodada 2] haptics.ts cache nunca invalidado
14. [Rodada 2] 7 arquivos código morto (0 imports): streak.ts, deep-link.ts, quota-monitor.ts, sqlcipher.ts, design-tokens.ts, BackHandlerOffline.tsx, quiz-alternatives.ts
15. [Rodada 2] streak.ts NUNCA wired — streak invisível ao usuário
16. [Rodada 2] deep-link.ts NUNCA wired — compartilhamento hardcoded WhatsApp
17. [Rodada 2] notifications.ts NUNCA chamado automaticamente
18. [Rodada 2] distratores triviais no Quiz fallback
19. [Rodada 2] PersonagemLivro não evolui (mascote estático)
20. [Rodada 2] sqlcipher.ts PRAGMA key com interpolação (padrão inseguro)
21. [Rodada 2] quota-monitor.ts nunca chamado
22. [Rodada 2] design-tokens.ts nunca usado
23. [Rodada 2] sem versículo do dia / devocional leve
24. [Rodada 2] sem leaderboard/ranking visível

## Autonomia por item (1.9)
- Itens de código -> AUTONOMO
- Publicação Play Store -> DEPENDE_VOCE: 2FA Google Play Console
- AdMob real IDs -> DESTRAVAVEL: precisa criar conta AdMob
- Privacy policy HTML -> AUTONOMO (GitHub Pages)

## Segundo turno crítico (FASE 3.5 + double-check + Rodada 2 — gate G5)
- Lentes aplicadas: 7/7 (3.5) + 7/7 (double-check) + 7/7 (Rodada 2)
- Ajustes 3.5: 4 detalhados | 2 enriquecidos | 1 recuperado | 1 re-priorizado
- Ajustes double-check: 8 detalhados | 3 POLISH | 2 recuperados | 2 re-priorizados | 3 premissas verificadas
- Ajustes Rodada 2: 12 achados novos | 7 código morto | 3 bugs ocultos | 6 features estratégicas
- Re-ataque: executado (plano > 3 itens, 3 passadas)
- Top achados Rodada 2:
  1. **7 arquivos de código morto** (0 imports): streak.ts, deep-link.ts, quota-monitor.ts, sqlcipher.ts, design-tokens.ts, BackHandlerOffline.tsx, quiz-alternatives.ts — 3 deletáveis, 4 a wirear
  2. **Streak (#1 driver retenção) completamente invisível** — streak.ts existe mas NUNCA é importado por nenhuma tela
  3. **haptics.ts cache bug** — toggle em config não tem efeito imediato (cache nunca invalidado)
  4. **Distratores triviais** — Quiz fallback gera alternativas óbvias (`${resposta} (verso X)`)
  5. **Mascote não evolui** — PersonagemLivro estático (mesmo tamanho do início ao fim), contraste com Ascend/Manna
  6. **Notificações nunca agendadas** — toggle existe mas agendarLembreteDiario() nunca é chamado
