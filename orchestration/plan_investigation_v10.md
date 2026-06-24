# Plan Investigation V10 — Expert Na Bíblia (2026-06-24)

## Modo
Escopo: ATUALIZACAO (V9 → V10) | Profundidade: FOCADO — razao: input do usuario ja traz 3 apontamentos
acionaveis (auditoria profunda V9.3.4 vs briefing) + contexto previo rico (V9 gerado nesta sessao).
MODO_ORQUESTRADO invocado.

## Arquivos lidos (FOCADO minimo)
- `C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia\evolution_plan.md` (V9, ja aprovado)
- `C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia\orchestration\plan_investigation.md` (V9, 17KB)
- `C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia\docs\04_fluxo_de_telas\README.md` (331 linhas, briefing completo)
- `C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia\whatsapp_media\images\image_20260622_205222.jpg` (referencia logo splash)
- `C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia\whatsapp_media\images\image_20260622_223032.jpg` (referencia tela modos)
- `C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia\whatsapp_media\images\image_20260622_210318.jpg` (referencia tela licoes do modulo)

## Comandos executados
- adb shell uiautomator dump + screencap (T1 splash, T2 modos, TL1 licoes, TL2 licoes do modulo, TL licao pergunta)
- Visual analysis: comparacao pixel-a-pixel de screenshots V9.3.4 vs briefing
- `grep "FB01\|Alfabetiza"` no UI dump → confirma que TL2 header mostra codigo em vez de nome

## Saude do projeto (re-verificada 2026-06-24 19h)
- Testes: EXISTEM (5 arquivos) — veredito: NAO_VALIDADO nesta sessao
- Build: BUILD SUCCESSFUL (V9.3.4 104.8 MB, SHA 249adf1f) — veredito: OK (funcional mas com 3 divergencias visuais)
- CI/CD: GREEN_FALSO — veredito: pipeline passa, app diverge visualmente do briefing
- Deps: ATUALIZADAS (Expo SDK 55, RN 0.83.6) — veredito: OK
- Docs: RICO (CLAUDE.md + 6 sub-docs + 47-paginas Google Docs + 17 imagens + 4 planilhas) — veredito: OK

## Sinais de codigo
- Arquivos >500 linhas: 0
- TODO/FIXME/HACK: 0 nos modulos de UI (M1.1 seed gerou entradas placeholder)
- Duplicacao: 0

## Pesquisa externa (FOCADO = nao obrigatoria, mas executada)
- Briefing ja documentado em docs/01-06 (884 linhas + 17 imagens)
- Documento oficial do usuario: docs/doc1_oficial_fluxo_telas.txt (47 paginas Google Docs)
- Fontes externas: NAO consultadas (desnecessario, briefing local eh exaustivo)

## Objetivos do produto (OBJ do V9 mantidos)
- OBJ-1 (Ensinar Biblia ludica): PARCIALMENTE COBERTO (conteudo OK, visual com 3 gaps)
- OBJ-2 (Modo Licoes 77 modulos): AUSENTE (DB so tem 40 modulos; decisao M1.2 de lancar com 40)
- OBJ-3 (Modo Quiz 20 perguntas, timer 10s, 4 alternativas): TOTAL
- OBJ-4 (Personagem 5 poses): TOTAL (V9 adicionou TRISTE + EXCLAMANDO)
- OBJ-5 (Tela Final Vitoria com trofeu): TOTAL
- OBJ-6 (Splash com animacao do logo): PARCIAL (logo aparece mas splash nativo toma conta)
- OBJ-7 (Tela 2 modos com botao ≡): TOTAL
- OBJ-8 (Campo de resposta roxo com borda laranja + prefixo R:): TOTAL
- OBJ-9 (Icone de som on/off + botao home): TOTAL
- OBJ-10 (Tela Feedback Licao Certo/Errado): TOTAL
- OBJ-11 (Tela Final Atividade 3 variantes): TOTAL
- OBJ-12 (Conclusao Total = trofeu Expert): TOTAL
- OBJ-13 (IA avalia respostas abertas): TOTAL

## Historico do plano
- V1-V7: 47/47 itens implementados
- V8: 18 marcados [x] mas 5 continham gaps estruturais
- V9: 19 itens, 18/19 [x]; corrigiu M1 (conteudo), M2 (visual), M3 (audio + E2E)
- V9.3.4: logo + cards visuais conforme briefing
- V10 (este): foca 3 divergencias de identidade visual restantes

## Cobertura por dimensao (FOCADO = sem gate G4; declaracao minima)
- CORRECAO_BUGS: 3 achados (T1 splash, T2 modos, TL2 header)
- MELHORIA: 0 (alem das correcoes)
- EVOLUCAO_FEATURES: 0
- MANUTENCAO_REFACTOR: 0
- INFRAESTRUTURA: 0
- UX_UI: 3 (mesmos achados de CORRECAO_BUGS, mas classificados como UX)
- PERFORMANCE: 0
- SEGURANCA: 0

## Achados independentes (gate G1 = NAO aplicavel em FOCADO com input acionavel)
- 0 (input ja trazia 3 achados do usuario via auditoria)

## Autonomia por item
- 5.1 (T1 splash logo): AUTONOMO (plugin ja em deps; assets existem)
- 5.2 (T2 modos logo+palavras-chave): AUTONOMO (estilo ja conhecido do TL1)
- 5.3 (TL2 header nome): AUTONOMO (DB ja tem campo nome)

## Segundo turno critico (FASE 3.5 — gate G5)
- Lentes aplicadas: 7/7
- Ajustes: 0 detalhados | 2 enriquecidos (POLISH) | 0 recuperados | 1 re-priorizado | 0 consolidados | 0 premissas verificadas
- Total ajustes: 3 (apenas enriquecidos, ja que o input ja era detalhado)
- Re-ataque: NAO aplicavel (plano tem 3 itens, limite eh >= 3)
- Top 3 ajustes mais relevantes:
  1. **5.1 (T1 splash)**: o splash nativo Android toma conta antes do JSX — preciso usar `expo-splash-screen` plugin explicitamente
  2. **5.2 (T2 modos)**: as 2 divs "BÍBLICO" e "LIÇÕES" devem ser Text nested dentro de Text (mesma tecnica usada em TL1)
  3. **5.3 (TL2 header)**: o fetch do modulo pode ser feito uma vez no useEffect (nao precisa ser async)
