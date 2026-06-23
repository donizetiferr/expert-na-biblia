# Audit Report v2 — Expert Na Biblia (pos-decisoes)

**Data:** 2026-06-23
**Auditor:** double check manual (standalone, 2a rodada)
**Dominio:** MOBILE
**Tipo:** AUDITORIA_COMPLETA

---

## Contexto desta 2a rodada

Apos o 1o double check (nota 9.4/10), o usuario respondeu as 10 perguntas criticas e aplicamos
as seguintes decisoes:

1. Plataforma = React Native + TypeScript via Expo (EAS Build)
2. Escopo MVP = 77 modulos completos (FB+AT+NT+Teologia)
3. Respostas IA = Hibrido (canonico local + M3 para ambiguos)
4. Provedor IA = Minimax M2.7 (Token Plan) + fallback OpenAI
5. Arquitetura dados = SQLite embarcado (expo-sqlite) + backend opcional
6. Sons = royalty-free (Pixabay, Freesound)
7. Tipografia = inferir (Bangers/Luckiest Guy + Nunito/Quicksand)
8. Publicacao = APK curto prazo, lojas medio prazo
9. Monetizacao = Free + AdMob (apos publicacao)
10. LGPD = publico adulto

Esta 2a rodada valida **consistencia** entre essas decisoes e a documentacao, identifica
**novas lacunas** que surgiram apos as escolhas, e enriquece o plano com **custos/riscos
operacionais**.

---

## Achados por Severidade

### CRITICO

(nenhum novo)

### ALTO

| ID | Area | Descricao | Confidence | Acao Recomendada |
|---|---|---|---|---|
| A3 | Consistencia | **CLAUDE.md OBJETIVO desatualizado**: linha 10 diz "40+ modulos e ~4.345 perguntas em 3 areas" mas decisao #2 = 77 modulos em 4 areas | ALTA (100%) | CORRIGIDO - OBJETIVO agora menciona 77 modulos / 4 areas / ~7.500 perguntas MVP |
| A4 | Consistencia | **CLAUDE.md descricao da pasta desatualizada**: linha 51 "40 modulos, 4345 perguntas" mas real = 77 planejados, 40 com conteudo, ~7.500+ perguntas MVP | ALTA (100%) | CORRIGIDO - agora diz "77 modulos planejados (40 com conteudo)" |
| A5 | Arquitetura | **Diagrama no CLAUDE.md mostava backend separado**, mas decisao #5 diz backend OPCIONAL. Frontend pode chamar M3 direto via HTTPS do celular | ALTA (100%) | CORRIGIDO - diagrama agora mostra app→M3 direto, sem backend obrigatorio |
| A6 | Cronograma | **P0-5 e P0-6 (gerar NT+Teologia) subestimados**: gerar ~6.500 perguntas a ~10min cada = ~1.083 horas manual = inviável em 1-2 semanas | ALTA (95%) | CORRIGIDO - milestone agora diz "via M3 IA-assistido" (~25h batch + ~6h revisao humana) |

### MEDIO

| ID | Area | Descricao | Confidence | Acao Recomendada |
|---|---|---|---|---|
| M5 | Algoritmo | **Matching canonico fragil**: Levenshtein+Jaccard falha com sinonimos ("Deus" vs "Senhor") e respostas parciais | ALTA (90%) | CORRIGIDO - milestone P1-12 agora menciona TF-IDF + sinonimos pre-mapeados |
| M6 | M3 | **Tags `think` nao tinham plano de filtragem** | ALTA (90%) | CORRIGIDO - P0-4 e P1-13 agora citam explicitamente o filtro regex |
| M7 | Custos | **Sem estimativa de custos operacionais** (M3 quota, AdMob, Apple Dev, dominio privacy) | ALTA (100%) | CORRIGIDO - secao "Custos operacionais estimados" adicionada ao evolution_plan |
| M8 | Riscos | **Sem registro formal de riscos do stack escolhido** | ALTA (100%) | CORRIGIDO - secao "Riscos especificos do stack" adicionada (10 riscos) |
| M9 | Publicacao | **iOS indefinido no cronograma**: usuario disse "curto prazo APK Android", mas plano nao dizia quando iOS | MEDIA (80%) | Documentar: iOS fica para DEPOIS de Android publicado. Sem data fixa. |
| M10 | UX | **Splash com som + som de transicao + musica de fundo**: briefing menciona "som" generico, nao detalhado | MEDIA (70%) | P0-7 agora lista 5 sons especificos necessarios |

### BAIXO

| ID | Area | Descricao | Confidence | Acao Recomendada |
|---|---|---|---|---|
| B6 | LGPD | Google Play exige URL de privacy policy - nao definido onde hospedar | ALTA (95%) | Decidir na FASE 3: GitHub Pages (gratis) ou dominio proprio (R$15/ano) |
| B7 | UX | Tempo exato da animacao do splash nao especificado (briefing diz "leve") | MEDIA (60%) | Adotar 3s como default (padrao mobile) - ajustar se feedback |
| B8 | Algoritmo | Threshold 85% para match canonico e arbitrario - precisa calibracao | MEDIA (70%) | Calibrar com 100 perguntas de teste antes de implementar |
| B9 | Publicacao | iOS TestFlight requer conta Apple Developer ($99/ano) - nao orcado | ALTA (100%) | Listado em "Custos operacionais" |
| B10 | Teste | "Teste interno via sideload" - nao ha aparelho fisico listado no setup | MEDIA (60%) | Verificar se usuario tem aparelho Android ou se usa emulator |

### INFO

- **P1-15 adicionado**: smoke test E2E explicito (splash→Licoes→1 licao→1 pergunta→acerto)
- **FASE 0 expandida**: 2-3 semanas (era 1-2) - agora reflete tempo real de geracao IA
- **Cronograma publicado Android**: 5-8 meses (era 5-7) - 1 mes a mais para calibrar conteudo

---

## Validacao de Consistencia (Decisoes ↔ Documentacao)

### Decisao #1 (Plataforma = Expo)
- CLAUDE.md linha 22-25: "React Native + TypeScript via Expo (EAS Build)"  OK
- evolution_plan.md P0-2, P0-3, P1: referenciam Expo SDK 51+, EAS Build  OK

### Decisao #2 (Escopo = 77 modulos)
- CLAUDE.md OBJETIVO: agora menciona 77 modulos / 4 areas  CORRIGIDO
- CLAUDE.md diagrama: agora menciona 77 modulos  CORRIGIDO
- evolution_plan.md FASE 2 P2-1: "Importar 77 modulos + 4.345+ perguntas"  OK
- evolution_plan.md FASE 0 P0-6: 24 modulos Teologia  OK

### Decisao #3 (Respostas IA = Hibrido)
- CLAUDE.md secao Stack: menciona "Hibrido: SQLite canonico local + M3 LLM"  OK
- CLAUDE.md diagrama: mostra match local + M3 para ambiguos  CORRIGIDO
- evolution_plan.md P1-12 e P1-13: detalham algoritmo + integracao M3  OK

### Decisao #4 (Provedor = M3 + fallback)
- CLAUDE.md linha 26-30: M2.7 + fallback OpenAI + tags think  OK
- evolution_plan.md P0-4 e P1-13: filtro tags + fallback  OK

### Decisao #5 (SQLite embarcado + backend opcional)
- CLAUDE.md diagrama: app chama M3 direto, backend opcional  CORRIGIDO
- evolution_plan.md P1-11 e P2-9: expo-sqlite + backend opcional  OK

### Decisao #6 (Sons royalty-free)
- CLAUDE.md secao Stack: nao menciona (info vai pra FASE 0)  OK
- evolution_plan.md P0-7: 5 sons especificos listados  OK

### Decisao #7 (Tipografia inferida)
- CLAUDE.md secao Stack: nao menciona (info vai pra FASE 0)  OK
- evolution_plan.md P0-8: teste explicito Bangers+Nunito  OK

### Decisao #8 (Publicacao)
- CLAUDE.md secao "Decisoes pendentes": Google Play Console vs Apple Developer  OK
- evolution_plan.md FASE 3 P3-7 a P3-10: timeline iOS separado  OK

### Decisao #9 (Monetizacao = AdMob)
- CLAUDE.md secao Stack: nao menciona (info vai pra FASE 3)  OK
- evolution_plan.md FASE 3 P3-1: anuncio AdMob explicito  OK
- Custos operacionais: AdMob listado  OK

### Decisao #10 (LGPD publico adulto)
- CLAUDE.md OBJETIVO: "publico adulto"  OK
- evolution_plan.md: nao ha mencao especifica a LGPD - **follow-up na FASE 3**

**Total**: 10/10 decisoes refletidas na documentacao (com correcoes aplicadas).

---

## Cronograma - Validacao Realista

| Fase | Original | Ajustado v2 | Por que mudou |
|---|---|---|---|
| FASE 0 | 1-2 semanas | **2-3 semanas** | Geracao IA-assistida de ~6.500 perguntas + revisao humana |
| FASE 1 | 4-6 semanas | 4-6 semanas | OK (algoritmo robusto compensado por base menor) |
| FASE 2 | 6-8 semanas | 6-8 semanas | OK |
| FASE 3 | 4-6 semanas | 4-6 semanas | OK |
| **TOTAL** | **5-7 meses** | **5-8 meses** | +1 mes para conteudo |
| FASE 4 (V2) | 3-6 meses | 3-6 meses | OK |

**Validacao**: cronograma e viavel SE:
- Geracao IA-assistida funcionar bem (sem muitos falsos teologicos)
- 1 dev fulltime dedicado
- Sem contratempos graves (revisao Apple, AdMob reprovado, etc.)

**Risco**: se a geracao IA de Teologia for muito custosa de revisar, pode estourar para 10-12 meses.

---

## Nota Final v2

**Score: 9.5 / 10.0** (subiu de 9.4)

**Decomposicao**:
- Completude da coleta: 10.0
- Fidelidade briefing ↔ doc: 10.0
- Qualidade tecnica: 9.5
- Organizacao: 9.5 (corrigido A1, A2)
- Eficiencia: 9.0 (duplicata removida)
- Cobertura de escopo: 9.5 (decisoes aplicadas + lacunas novas identificadas)
- **NOVO: Consistencia pos-decisao: 9.5** (corrigido A3, A4, A5, A6)
- **NOVO: Riscos/custos: 9.5** (secoes adicionadas)

**Veredito: APROVADO com ressalvas** - o projeto esta pronto para `solo-plan`.

**Ressalvas**:
- Antes de despachar `@full-cycle`, validar calibragem do algoritmo de matching com 100 perguntas-teste
- Antes de publicar, validar geracao IA-assistida com 1 modulo de Teologia completo

---

## Top 5 itens que ainda merecem atencao

1. **Calibragem do matching canonico**: 85% e arbitrario. Testar com respostas reais.
2. **Geracao IA de Teologia**: validar se M3 produz perguntas teologicamente corretas (revisar 50 amostras).
3. **Filtro de tags `think`**: testar regex `/<think[^>]*>.*?<\/think>/gs` no output do M3.
4. **Backend deploy**: decidir Railway vs Render vs Cloudflare Workers na FASE 2 (se necessario).
5. **iOS no cronograma**: decidir se FASE 3 inclui iOS ou se fica para V2.
