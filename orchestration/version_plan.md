# Version Plan — Expert Na Biblia — V21 (ciclo de FECHAMENTO) — 2026-06-25

> FASE 1 satisfeita pelo escopo explicito do usuario (3 itens nao-bloqueantes do VERDICT V20).
> Outer loop: INATIVO (+um-ciclo). BREAK_SUCESSO = 3 itens corrigidos + validacao empirica
> (emulador hi-res ONLINE) sem regressao da jornada licao->100%->amarelo->desbloqueio.
> Regra de ouro: NAO regredir scoring/progressao, mascotes (Licoes=dourado/Quiz=roxo), quiz.
> NAO fazer push GitHub alem do auto-push do ambiente; nao mexer em git history.

## V21 — UNICA versao (ciclo de fechamento) — ALTA
Itens:
- I1 [ALTO] Confiabilidade IA (timeout M2.7):
  - src/lib/m3.ts: TIMEOUT_MS 10000 -> 27000 (M2.7 mede 4-20s; modelo de raciocinio).
  - Tratar abort/timeout como erro de conexao: avaliador.ts regex semConexao incluir "timeout"
    (M3.avaliarResposta lanca 'M3_TIMEOUT' no abort; OpenAI idem). Fallback gracioso -> match local;
    mensagem clara, sem UI travada.
  - Garantir LOADING ("AVALIANDO...") cobre ate ~27s na tela de licao (sem parecer travado).
  - DoD: resposta aberta ~15-20s recebe veredito REAL da IA no emulador online; caminho rapido
    (match canonico local) continua instantaneo; sem regressao de UX.
- I2 [MEDIO] Canonica FB01-L01-Q07:
  - seed-perguntas.ts: Q07 ja tem resposta real; corrigir acentos PT-BR ("Nao"->"Não",
    "Biblia"->"Bíblia", "inspiracao"->"inspiração", "Espirito"->"Espírito", "Asia"->"Ásia",
    "Africa"->"África") — eh exibida ao usuario como "resposta correta".
  - data/db.sqlite (master dev): corrigir Q07 "..." -> resposta real (evita regressao em regeneracao do seed TS).
  - Verificar FB01 (caminho inicial) sem outras canonicas "..."/"NAO SEI" (confirmado: 0).
  - DoD: FB01-L01-Q07 vencivel offline com canonica real acentuada; nenhuma "..." nas licoes iniciais FB01.
- I3 [BAIXO/obrigatorio PT-BR] Acentuacao e copy:
  - Varrer src/app + src/components por strings de UI sem acento e corrigir (UTF-8):
    "Licoes"->"Lições", "Biblico"->"Bíblico", "COMECAR"->"COMEÇAR", "PROXIMO"->"PRÓXIMO",
    "licao"->"lição", "proxima"->"próxima", "trofeu"->"troféu", "modulos aleatorios"->"módulos aleatórios",
    "NAO SEI"->"NÃO SEI", "Voce"->"Você", "Parabens"->"Parabéns", "Configuracoes"->"Configurações", etc.
  - NAO alterar identificadores de codigo, chaves de DB, IDs, nomes de tabela/coluna.
  - DoD: textos visiveis ao usuario com acentuacao PT-BR correta.

## Gate de entrada (reconfirmar ANTES de tocar codigo, no emulador)
- jornada licao FB01-L01 -> 100% "VOCE PASSOU" -> L01 amarela "100/100" -> L02 desbloqueada: OK.

## Validacao OBRIGATORIA (evidencia em orchestration/v21_validation/)
- AVD hi-res 1080x1920, rede ONLINE (-dns-server 8.8.8.8 se preciso).
- (a) gate de entrada jornada OK; (b) resposta aberta avaliada pela IA com latencia alta (~15-20s)
  retornando veredito REAL (screenshot loading + veredito + trecho logcat com m3_usage);
  (c) FB01-L01-Q07 com canonica real acentuada; (d) telas com acentos corretos (onboarding/quiz).
- npx tsc --noEmit 0 | npx jest verde | lint 0.
- Build APK V21 -> dist canonico E C:\ENB\dist (regra das 5 em ambos); catbox + verificar URL (HTTP 206 + PK).
- Atualizar changelog/CLAUDE.md/evolution_plan.

## Follow-up documentado (fora de escopo V21)
- 489 canonicas "NAO SEI" em modulos NT/locked (alem de FB01) — milestone de qualidade de conteudo futura.
- quiz-alternatives.ts parsing fragil (batch offline) — herdado de V20.
- set dourado parcial (sem pose assustado/triste dedicada) — depende da designer.
