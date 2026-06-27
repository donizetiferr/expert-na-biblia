# Version Plan — Expert Na Biblia — V23 FASE 1 (@full-cycle agent, 2026-06-26)

> Roadmap dado pelo team-lead (FASE 1 do PLANO V23 do evolution_plan.md). solo-roadmap DISPENSADO.
> modo_continuo=ATIVO — rodar quantos ciclos forem necessarios ate esgotar a FASE 1.
> Cada "versao" = conjunto coeso com gates (tsc 0, jest verde, eslint 0) + validacao empirica no emulador.

## Sequenciamento (FASE 1)

### V23.1 — Fundacao de engajamento + XP + Streak (MLE parte 1) — EM ANDAMENTO
- V23.A.0 fundacao: migration 002 (user_xp, user_badges, meta_diaria_log, streak_freeze) + Settings estendido (metaDiaria, horarioLembrete, reduceMotion, textoGrande) + helper de XP (curva nivel = floor(sqrt(xp/100))+1, anti-farm)
- V23.A.1 XP: conceder em licao (acerto*5 + 50 se 100%) e quiz (acerto*5); "+X XP" no final; total no header de /licoes
- V23.A.2 Streak: wire de registrarAtividade (licao + quiz) + freeze semanal funcional (tabela streak_freeze) + "N dias" no header
- DoD: migration roda em app instalado sem crash; loop visivel (concluir licao -> +XP + streak++ no header); jest cobre xp/streak/settings

### V23.2 — Meta diaria + progresso visivel (MLE parte 2)
- V23.A.3 meta diaria (anel no header) + V23.B.3 barra global (X/40) + V23.B.2 perfil/"meu progresso" + V23.B.1 badges

### V23.3 — Onboarding de ativacao (MLE parte 3, fecha MLE + valida loop completo)
- V23.C.1 fluxo de 1a vitoria + meta + streak | V23.C.2 continuar de onde parou

### V23.4 — Resto do nucleo de retencao
- V23.A.4 notificacoes | A.5 recompensa variavel (bau) | A.6 refazer-so-erradas | A.7 persistencia/Auto Backup

### V23.5 — Recompensa/conquista avancada
- V23.B.4 leaderboard (ler user_rankings) | B.5 combo no quiz | B.6 mascote por nivel

### V23.6 — Aprendizado intuitivo (V23.D)
- D.1 conteudo didatico | D.2 revisao espacada (Leitner) | D.3 novos formatos | D.4 refs biblicas | D.5 versiculo do dia

### V23.7 — UX/multi-idade (V23.E)
- E.1 Dynamic Type | E.2 contraste | E.3 touch targets | E.4 TTS | E.5 a11y labels | E.6 haptics | E.7 reduceMotion

### V23.8 — Infra/seguranca critica (V23.G — itens autonomos cedo onde possivel)
- G.2 error boundaries | G.3 analytics/Sentry | G.4 eas.json | G.5 vulns | (G.1 parte autonoma; acao humana DEPENDE_VOCE) | G.6 git cleanup por ultimo

## FORA da FASE 1 (NAO implementar)
- V23.F (AdMob) inteiro — FASE 3
- V23.L.2 (IAP) / V23.L.4 (widget) — FASE 3/backlog
- V23.H/I/J/K — avaliar como ciclos finais da FASE 1 se houver folga (trilha visual, multi-perfil, enciclopedia, sazonais)

## Itens DEPENDE_VOCE (nao bloqueiam; deixar pronto + sinalizar)
- V23.G.1 keystore expert2026 + API key Minimax: parte autonoma (remover do tracking, mover para env, preparar geracao) + acao humana pendente
- V23.G.4 eas init/projectId: preparar eas.json; sinalizar se faltar projectId

## Ambiente de build (CRITICO — path acentuado quebra toolchain)
- Canonical (EDITAR aqui): C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia
- Build clone: C:\ENB (path curto) — sync via orchestration/sync_to_enb.sh antes de cada build
- adb: C:/Android/Sdk/platform-tools/adb.exe | emulador hi-res 1080x1920
