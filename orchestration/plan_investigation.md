# Plan Investigation — Expert Na Bíblia (V9, 2026-06-24)

## Modo
Escopo: ATUALIZACAO | Profundidade: COMPLETO — razao: input do usuario exige auditoria profunda ampla; sem esgotar dimensoes, nao ha como gerar plano robusto.

## Arquivos lidos (amostra investigada)
- `CLAUDE.md` (CLAUDE global do projeto) — objetivo + stack + decisoes V8
- `docs/01_objetivo_e_escopo.md` — briefing oficial (7 secoes de regras de negocio)
- `docs/02_mensagens_whatsapp/README.md` — extracao completa das 68 mensagens
- `docs/03_identidade_visual/README.md` — paleta + logo + personagem + trofeu
- `docs/04_fluxo_de_telas/README.md` — 13 telas mapeadas com referencias locais
- `docs/06_google_docs_links.md` — 47 paginas no Google Docs + 6 pastas Drive
- `src/app/index.tsx` (Tela 1 splash) — verifica: usa PersonagemLivro; sem imagem de logo
- `src/app/modos.tsx` (Tela 2) — botao ≡ abre /config, 2 cards Quiz/Licoes
- `src/app/licoes/index.tsx` (Tela Licoes 1) — lista 40 modulos (NAO 77 como esperado)
- `src/app/licoes/[moduloId].tsx` (Tela Licoes 2) — header mostra so moduloId (sem nome)
- `src/app/licoes/[moduloId]/[licaoId].tsx` (Tela Licao) — chama matchCanonico contra resposta_canonica
- `src/app/quiz/index.tsx` (Tela 3) — emojis em vez de personagem
- `src/app/quiz/jogar.tsx` (Tela 6) — usa gerarAlternativas com placeholder [GERAR]
- `src/app/quiz/final.tsx` (Tela 8) — emojis + texto "CONTINUE ESTUDANDO" (NAO "NAO DEU")
- `src/app/config.tsx` (Tela Config) — switches: musica, efeitos, notificacoes
- `src/app/trofeu.tsx` (Tela Trofeu) — emoji trofeu + emoji confete (NAO imagem real)
- `src/app/onboarding.tsx` — existe mas NAO é roteado do _layout.tsx
- `src/components/PersonagemLivro.tsx` — usa 3 imagens reais (M4.1 OK)
- `src/lib/sound.ts` — 5 funcoes expo-av (splash/acerto/erro/transicao/musica)
- `src/lib/settings.ts` — AsyncStorage com 3 toggles
- `src/lib/db-queries.ts` — MOCK_MODULOS (77), MOCK_LICOES, MOCK_PERGUNTAS como fallback
- `src/lib/quiz-questions.ts` — `gerarAlternativas()` mock via hash (BUG: usa placeholder)
- `src/lib/matching.ts` — algoritmo 2-camadas (Levenshtein + cosseno sinonimos)
- `src/lib/quiz-alternatives.ts` — gerador batch M3 (NUNCA RODADO; stub gerado)
- `src/constants/colors.ts` — paleta completa; mapeada ao briefing
- `src/db/database.ts` — migrations + tabelas (modulos/licoes/perguntas/...)
- `src/app/_layout.tsx` — Stack com 6 rotas (index/modos/licoes/quiz/config/trofeu) — onboarding nao registrado
- `data/db.sqlite` — 40 modulos / 754 licoes / **4345 perguntas com resposta_canonica = "[GERAR] FB01-L01-Q01"**
- `assets/images/personagem_*.jpg` — 3 imagens reais (assustado/feliz/pensativo)
- `assets/audio/*.mp3` — 5 arquivos (splash/acerto/erro/transicao/musica_fundo)
- `evolution_plan.md` (V8-RETOMADA) — 6 milestones marcados [x] mas contem GAPS nao resolvidos

## Comandos executados (resultado resumido)
- `node -e "db=require('better-sqlite3')('data/db.sqlite'); db.prepare('SELECT COUNT(*) FROM perguntas').get()"` → 4345 total, 100% com resposta_canonica = "[GERAR] ..."
- `node -e "...SELECT area,COUNT(*)..."` → 18 FB + 18 AT + 4 NT + 0 TE (esperado 77, so 40 no DB)
- `ls src/` → confirma 13 telas implementadas; 1 a menos que o briefing (Tela 5 Quiz Inicio)
- `ls assets/images/` → 3 imagens reais; 0 logo/trofeu/cadeado
- `ls assets/audio/` → 5 MP3 OK

## Saude do projeto (verificada em 2026-06-24)
- **Testes**: EXISTEM (5 arquivos em `src/lib/__tests__/` + `src/db/__tests__/`) — nunca rodados nesta sessao — veredito: NAO_VALIDADO
- **Build**: APK v1.0.0 gerado, instala, splash renderiza; porem com bugs em runtime (resposta_canonica placeholder, audio SFX nao dispara na UI real, splash com personagem pequeno em vez de logo) — veredito: QUEBRADO_FUNCIONAL
- **CI/CD**: CONFIGURADO (`.github/workflows/ci.yml` mencionado); 22 itens V8 marcados [x] mas bugs estruturais ainda presentes — veredito: GREEN_FALSO (pipeline passa, app quebra)
- **Deps**: ATUALIZADAS (Expo SDK 55, RN 0.83.6, deps alinhadas) — veredito: OK
- **Docs**: COMPLETAS (CLAUDE.md + 6 sub-docs + 47-paginas Google Docs + 17 imagens de referencia + 4 planilhas) — veredito: RICO

## Sinais de codigo
- TODO/FIXME/HACK: 0 nos arquivos principais (mas MOCK em `db-queries.ts` linhas 10-50 eh tech debt intencional)
- Duplicacao: `db-queries.ts` repete try/catch em 5 funcoes (padrao ineficiente); aceitavel
- Arquivos >500 linhas: 0 (bom)
- Inconsistencias graves:
  - `data/db.sqlite` vs `MOCK_*` (mock e db real tem formatos diferentes; mock gera 77 modulos, db tem 40)
  - `PersonagemLivro` chama `FELIZ`/`ASSUSTADO`/`PENSATIVO` mas briefing define 5+ poses (feliz/triste/exclamando/uau/erro)
  - `_layout.tsx` registra 6 rotas mas nao registra `onboarding` (criada orfa)

## Pesquisa externa (NAO executada em V9 — desnecessaria)
- Briefing (docs/01+02+03+04+05+06) ja cobre 100% da spec de produto
- 17 imagens mockadas em `whatsapp_media/images/` cobrem todas as telas
- 4 planilhas cobrem conteudo pedagogico de 40 modulos (4345 perguntas)
- 47 paginas no Google Docs complementam com narrativa
- **Conclusao**: NENHUMA pesquisa externa adiciona insumo alem do que ja temos — fonte primaria local

## Objetivos do produto -> cobertura -> gaps

### OBJ-1 (CLAUDE.md): "Ensinar Biblia ludica/progressiva via smartphone" — fonte: CLAUDE.md
- **Cobertura**: PARCIAL — telas existem, mas conteudo pedagogico (4345 perguntas) tem placeholder [GERAR] nas respostas
- **Gap CRITICO**: respostas_canonica = "[GERAR]" em 100% das 4345 perguntas — usuario nao consegue acertar nenhuma
- **Candidato**: V9-M1.1

### OBJ-2 (docs/01): "Modo Licoes com 77 modulos em 4 areas (FB+AT+NT+TE)"
- **Cobertura**: AUSENTE — DB tem 40 modulos (FB18+AT18+NT4+TE0); NT e TE estao vazios
- **Gap**: faltam 37 modulos (37 NT restantes + 24 TE = 61 modulos, mas briefing lista 77)
- **Candidato**: V9-M1.2

### OBJ-3 (docs/01): "Modo Quiz com 20 perguntas, timer 10s, 4 alternativas, ate 20 modulos"
- **Cobertura**: PARCIAL — UI OK; alternativas geradas via hash mostram "[GERAR] ... (verso X)" como distrator (placeholder)
- **Gap CRITICO**: 4 alternativas do Quiz = "[GERAR] FB01-L01-Q01 (verso X)" / "(outro contexto)" / "Nenhuma das anteriores"
- **Candidato**: V9-M1.1 (mesmo do OBJ-1)

### OBJ-4 (docs/01): "Personagem livro animado variando poses (pensativo, assustado, feliz, triste, uau)"
- **Cobertura**: PARCIAL — 3 poses reais (pensativo/feliz/assustado); faltam TRISTE e UAU
- **Gap**: 2 imagens de personagem faltando (triste e exclamando Uau)
- **Candidato**: V9-M2.1

### OBJ-5 (docs/01): "Tela Final Vitoria com trofeu dourado + confetes + faiscas + texto 'Parabens, voce e um Expert!'"
- **Cobertura**: AUSENTE — `trofeu.tsx` usa emojis (🏆 + 🎊 ✨ 🎉) + circulo laranja; briefing pede **imagem real de trofeu** com bracos erguidos, sorriso largo, olhos brilhantes, confetes roxos/dourados
- **Gap CRITICO**: trofeu implementacao nao segue o briefing
- **Candidato**: V9-M2.2

### OBJ-6 (docs/01): "Splash com animacao do logo + som" (Tela 1)
- **Cobertura**: PARCIAL — splash renderiza PersonagemLivro (140px) com pose FELIZ + texto "Expert Na Biblia"; mas briefing pede **logo centralizado** (livro roxo com cruz dourada) com animacao
- **Gap MEDIO**: splash exibe PersonagemLivro em vez do LOGO oficial
- **Candidato**: V9-M2.3

### OBJ-7 (docs/01): "Tela 2 (modos) com botao ≡ laranja canto superior direito + 2 botoes QUIZ/LICOES grandes"
- **Cobertura**: TOTAL — botao ≡ existe, 2 cards Quiz/Licoes com bordas estilizadas
- **Gap**: nenhum
- **Candidato**: nenhum

### OBJ-8 (docs/01): "Campo de resposta roxo com borda laranja + prefixo R:"
- **Cobertura**: TOTAL — `licao[moduloId][licaoId].tsx` linhas 79-92 implementam inputContainer com borda laranja + prefixo "R:"
- **Gap**: nenhum
- **Candidato**: nenhum

### OBJ-9 (docs/01): "Icone de som on/off em quase todas as telas + botao home"
- **Cobertura**: AUSENTE — busca por icone de som/home em Tela Licao, Tela Final, etc = 0 resultados; apenas botao ENVIAR + Input
- **Gap CRITICO**: briefing explicito "Icone de som on/off + icone home presentes em todas as variantes" — nao implementado
- **Candidato**: V9-M2.4

### OBJ-10 (docs/01): "Tela Feedback Licao (Certo/Errado) com livro + balao 'Errado' + quadro branco + 2 botoes redondos"
- **Cobertura**: AUSENTE — `licao[moduloId][licaoId].tsx` linhas 41-58: apos matchCanonico, so muda a pose do PersonagemLivro e segue para proxima pergunta. NUNCA exibe tela de feedback dedicada.
- **Gap CRITICO**: feedback inline (apenas pose) em vez de tela dedicada
- **Candidato**: V9-M2.5

### OBJ-11 (docs/01): "Tela Final Atividade com 3 variantes (<50% / 50-99% / 100%) + textos 'NAO DEU' / 'QUASE LA' / 'VOCE PASSOU!'"
- **Cobertura**: TOTAL — `final.tsx` implementa 3 variantes com scores corretos; porem variante 'quase' usa COLORS.roxoPrimario (cor errada — briefing pede variacao visual de cor)
- **Gap**: nenhum critico; cosmético
- **Candidato**: nenhum (ou polish futuro)

### OBJ-12 (docs/01): "Conclusao Total = trofeu Expert" (apos todos os modulos 100%)
- **Cobertura**: PARCIAL — `trofeu.tsx` existe mas a logica de "todos os modulos concluidos" NAO esta implementada em lugar nenhum (busca por `todos os modulos` / `markAllDone` / `checkCompletion` = 0)
- **Gap**: tela inacessivel na pratica
- **Candidato**: V9-M2.6

### OBJ-13 (docs/01): "A IA deve analisar respostas abertas"
- **Cobertura**: AUSENTE — `avaliador.ts` (nao lido) provavelmente chama M3, mas a `resposta_canonica` e "[GERAR]" em 100% — entao M3 nunca e chamado para validar canonico (caminho de fallback cobre)
- **Gap CRITICO**: IA eh a Unica saida viavel para resolver [GERAR] em escala
- **Candidato**: V9-M1.1 (respostas geradas via M3 batch offline) + V9-M3.1 (chamada M3 runtime para casos ambiguos)

## Historico do plano (V8-RETOMADA)
- 18 itens planejados, 18 marcados [x], mas 5 dos "concluidos" continham gaps estruturais nao detectados
- Categorias recorrentes nao-concluidas: MELHORIA (PersonagemLivro incompleto) + EVOLUCAO (audio OK mas SFX nao dispara na UI)
- Areas nunca tocadas em V8: identidade visual real (trofeu/logo com imagem oficial), 5+ poses de personagem, conteudo pedagogico real (apenas placeholder)
- Rejeitados em V8 que continuam rejeitados: P3-5 (iOS), P3-6 (EAS Play Store), backend dedicado

## Cobertura por dimensao (gate G4)

| Dimensao | Veredito | Detalhe |
|---|---|---|
| **CORRECAO_BUGS** | 8 achados | (1) resposta_canonica placeholder em 100% das 4345; (2) Mock fallback gera 77 modulos, DB tem 40; (3) alternativas do Quiz mostram "[GERAR] ..."; (4) splash com PersonagemLivro em vez do logo; (5) PersonagemLivro so tem 3 poses (faltam TRISTE e UAU); (6) Tela Feedback Licao nao existe (apenas mudanca de pose); (7) icone som/home nao renderizado em Tela Licao; (8) tela Trofeu inacessivel (logica "todos concluidos" nao implementada) |
| **MELHORIA** | 4 achados | (a) audio SFX integrado no codigo mas Splash/Final disparam via callback async com race; (b) DB tem 40 modulos mas MOCK gera 77 (UI mostra contagem diferente em fallback); (c) variantes 'quase' no final.tsx nao destaca visualmente; (d) onboarding.tsx criado orfao (nao registrado no _layout) |
| **EVOLUCAO_FEATURES** | 3 achados | (i) tela feedback dedicada (modo Licoes e Quiz) com variantes Certo/Errado; (ii) icones de som/home globais; (iii) modulo de Teologia (24 modulos) ainda nao tem conteudo |
| **MANUTENCAO_REFACTOR** | 3 achados | (I) `db-queries.ts` com 5 funcoes try/catch identicas (refator para helper); (II) constants de cores estao OK mas nao exportam tokens semanticos (sucesso/erro/info); (III) onboarding.tsx + lib/sound.ts.bak orfaos |
| **INFRAESTRUTURA** | 4 achados | (A) testes existem mas nao rodam no CI; (B) data/ nao versionada (esperado, mas doc esta em scripts/); (C) docs/ contem 17 imagens de referencia + 47-paginas Google Docs mas nenhum README indexando; (D) ABS (Android Backup Service) nao configurado — risco de perda de progresso |
| **UX_UI** | 6 achados | (1) splash com PersonagemLivro em vez de logo (identidade quebrada); (2) PersonagemLivro so 3 poses; (3) Trofeu com emoji em vez de imagem real; (4) Tela Feedback inline em vez de dedicada; (5) botao ≡ so em Tela 2 (briefing pede em Tela 1 splash, Tela Licoes 1, etc); (6) variante 'quase' do final nao destaca |
| **PERFORMANCE** | 2 achados | (P1) `listarPerguntas` carrega TODAS as 25 perguntas de uma vez (ok para licao mas ruim se for expandido); (P2) `gerarAlternativas` por hash eh O(1) mas gera lixo quando resposta_canonica = "[GERAR]" |
| **SEGURANCA** | 1 achado | (S1) AsyncStorage guarda settings em texto plano (risco minimo, mas expo-secure-store ja esta nas deps) |

## Achados independentes (gate G1 — 14+ achados)
1. Respostas canonicas = "[GERAR]" em 100% das 4345 perguntas
2. DB tem 40 modulos (NAO 77 do briefing)
3. Modo Quiz gera alternativas com placeholder visivel ao usuario
4. Splash mostra PersonagemLivro (140px) em vez de logo oficial
5. PersonagemLivro so tem 3 poses (briefing exige 5+)
6. Tela Final (trofeu) usa emojis em vez de imagem real
7. Tela Feedback Licao nao existe — apenas mudanca de pose inline
8. Icones de som/home nao renderizados em Tela Licao
9. Onboarding.tsx orfao (criado mas nao roteado)
10. lib/sound.ts.bak (backup orfao) presente
11. Tela Trofeu inacessivel (sem logica de "todos concluidos")
12. modulo de Teologia (24 esperados) ausente
13. Tipografia: Bangers + Nunito OK; mas briefing original menciona Luckiest Guy/Lilita One como alternativas (decisao 7 ja fixou Bangers)
14. ABS / backup de progresso nao configurado
15. Variante 'quase' do final nao destaca visualmente

## Autonomia por item (1.9 — pre-check leve)
- V9-M1.1 (Gerar 4345 respostas via M3 batch) → AUTONOMO (token Minimax no cofre; plano: gerar offline + atualizar DB)
- V9-M1.2 (Importar 24 modulos Teologia + 33 NT faltantes) → AUTONOMO (conteudo pedagogico em `docs/05_conteudo_pedagogico/README.md` ou gerar via M3)
- V9-M2.1 (Baixar 2 imagens TRISTE e UAU) → AUTONOMO (links Drive em `docs/03_identidade_visual/README.md`)
- V9-M2.2 (Implementar Trofeu com imagem real) → AUTONOMO (link Drive `image_20260622_215940.jpg`)
- V9-M2.3 (Splash com logo oficial) → AUTONOMO (links Drive logo)
- V9-M2.4 (Icones som/home em Tela Licao) → AUTONOMO (componentes)
- V9-M2.5 (Tela Feedback dedicada) → AUTONOMO
- V9-M2.6 (Logica de conclusao total → Trofeu) → AUTONOMO
- V9-M3.1 (Validacao APK no emulador) → AUTONOMO (emulator-5554 online)
- V9-M4.1 (Refator db-queries) → AUTONOMO
- V9-M4.2 (Cleanup onbaording orfao) → AUTONOMO

## Segundo turno critico (FASE 3.5 — gate G5)

### Lentes aplicadas (7/7)
1. **Profundidade rasa?** Itens estao detalhados (M1.1 = 4345 perguntas, M2.1 = 2 imagens, M2.2 = 1 imagem) — OK
2. **Falta a melhor versao? (POLISH)** Milestone 0 garante pre-req; M3 rebuild + validar; faltou: M4 polish visual com **design tokens semanticos** (acerto/erro/info) para o tema escuro
3. **Algo se perdeu?** Todo achado virou item? SIM (8 + 4 + 3 + 3 + 4 + 6 + 2 + 1 = 31 achados -> 11 milestones-itens + 4 polish)
4. **Priorizacao errada?** CRITICO=bug de [GERAR]; ALTO=mock fallback vs real DB; MEDIO=polish visual; BAIXA=refator. OK.
5. **Premissa nao-verificada?** Gerar 4345 respostas via M3: ~1.5-2h de batch (12s/req); ou usar 1 chamada M3 com prompt consolidado para 50 perguntas? **Verificar empiricamente** durante execucao
6. **Falta o adjacente obvio?** ADJACENTE 1: testes E2E do fluxo de licao (ja existem unit tests mas nao E2E); ADJACENTE 2: documentar a fonte (Drive) dos assets no CLAUDE.md; ADJACENTE 3: configurar ABS (backup automatico) do progresso
7. **Item redundante/inflado?** M2.1+M2.2+M2.3 sao 3 milestones de assets visuais (poderia ser 1) — vou **consolidar em M2 "Identidade visual real"**

### Ajustes (aplicados)
- [POLISH] Adicionado V9-M4.2 (design tokens semanticos para tema escuro)
- [RECUPERADO] ADJACENTE 1 virou V9-M3.2 (smoke test E2E com adb screencap)
- [RECUPERADO] ADJACENTE 2 virou V9-M4.3 (CLAUDE.md atualizado com fontes dos assets)
- [RECUPERADO] ADJACENTE 3 virou V9-M4.4 (configurar ABS ou AsyncStorage com migration)
- [CONSOLIDADO] M2.1+M2.2+M2.3+M2.4+M2.5+M2.6 → **M2 unico: "Identidade visual real + Telas de feedback"**
- [PREMISSA] M1.1: batch M3 com 50 perguntas/req ou 1/req? — empírico durante execução

### Re-ataque: NAO aplicavel (plano tem 11+4=15 itens; segundo turno encontrou 5 ajustes)

### Top 3 ajustes mais relevantes
1. **M1.1 (gerar 4345 respostas reais via M3)**: este é O bug. Sem isso, o app inteiro é placeholder.
2. **M2 (consolidado)**: trocar PersonagemLivro de 3 poses para 5+, splash com logo, trofeu com imagem, telas de feedback dedicadas. Identidade visual que o usuário EXIGE do briefing.
3. **M3.2 (E2E smoke test)**: após correção, validar no emulador que o usuario realmente vê/responde perguntas e a tela final funciona — sem isso, novo round de "abri o APK e nada funciona".
