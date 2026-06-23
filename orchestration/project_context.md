# Project Context — Expert Na Biblia

## Dominio
MOBILE — app smartphone Android+iOS (React Native + Expo), conteudo pedagogico biblico + IA generativa + gamificacao.

## Stack (CLAUDE.md, 10 decisoes travadas)
- Linguagem: TypeScript (strict)
- Framework: React Native + Expo SDK 51+ (EAS Build)
- IA: Minimax M2.7 (Token Plan, validado em APW); fallback OpenAI GPT-4o-mini
- Persistencia: SQLite embarcado (expo-sqlite)
- Backend: Node.js + Express (Railway/Render free tier) — futuro
- Monetizacao: AdMob (so apos publicacao)
- Assets: ja fornecidos (logo, paleta, personagem via Google Drive / whatsapp_media/)
- Tipografia inferida: Bangers/Luckiest Guy (display) + Nunito/Quicksand (body)

## Publico-alvo
Cristao ou em busca de conhecimento biblico; LGPD publico adulto; tom acessivel; UX cartoon/playful.

## Fase atual
PRE-IMPLEMENTACAO com base documental completa (CLAUDE.md, evolution_plan.md 53 itens, docs/ 9 arquivos, whatsapp_media/ midia espelhada, orchestration/ 3 double checks profundos notas 9.4/9.5/9.7).

## Dependencias relevantes (orchestration/dependencies_check.md)
- VALIDADO_AUTO: Minimax M2.7, OpenAI GPT-4o-mini, GitHub donizetiferr
- AUTONOMO_CRIAR: Expo EAS, AdMob, Sentry
- DEPENDE_VOCE (P0-11): revisao teologica 100 amostras
- DEPENDE_VOCE (P3-4): GitHub Pages vs dominio proprio
- DEPENDE_VOCE (P3-5 OPCIONAL): Apple Developer $99/ano
- DEPENDE_VOCE (P3-6): Google Play Developer $25

## Insumos detectados
- orchestration/audit_report_v3.md — nota 9.7/10, projeto pre-implementacao, 0 criticos
- orchestration/plan_investigation.md — achados de infra (testes/CI/build ausentes) ja viraram milestones FASE 0
- evolution_plan.md — 53 itens priorizados em 4 fases (P0/P1/P2/P3 + V2)

## Resumo de 1 linha
Projeto pessoal NOVO com documentacao exemplar e 48 milestones AUTONOMOS priorizados; foco em setup tecnico (FASE 0) → MVP 1 modulo (FASE 1) → 77 modulos + quiz (FASE 2) → publicacao Google Play (FASE 3).