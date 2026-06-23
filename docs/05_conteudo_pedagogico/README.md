# 05 — Conteudo Pedagogico

> Visao geral do conteudo pedagogico do app: areas, modulos, licoes, perguntas e estrutura
> recomendada de cada materia.

## Resumo Executivo

| Item | Valor |
|---|---|
| **Total de modulos mapeados** | 40+ (com area Teologia adicional) |
| **Total de perguntas no banco** | **4.345** (FB + AT + NT, sem respostas/explicacoes) |
| **Areas principais** | 3 confirmadas + 1 sugerida |
| **Estrutura por materia** | 16 secoes padrao |
| **Formato das perguntas** | Abertas (resposta digitada, avaliada por IA) |

## Areas e Modulos

### Area 1 — Fundamentos Biblicos (FB)

18 modulos, 1.593 perguntas, ~178 licoes.

| ID | Modulo | Perguntas | Origem (planilha) |
|---|---|---|---|
| FB01 | Alfabetizacao Biblica | 88 | 1_a_10.xlsx |
| FB02 | Panorama Biblico | 68 | 1_a_10.xlsx |
| FB03 | Estrutura Biblica | 77 | 1_a_10.xlsx |
| FB04 | Historia da Redencao | 85 | 1_a_10.xlsx |
| FB05 | Cronologia Biblica | 90 | 1_a_10.xlsx |
| FB06 | Geografia Biblica | 95 | 1_a_10.xlsx |
| FB07 | Cultura Biblica | 95 | 1_a_10.xlsx |
| FB08 | Arqueologia Biblica | 80 | 1_a_10.xlsx |
| FB09 | Formacao do Canon | 80 | 1_a_10.xlsx |
| FB10 | Inspiracao Biblica | 75 | 1_a_10.xlsx |
| FB11 | Manuscritos Biblicos | 89 | 11_a_20.xlsx |
| FB12 | Traducoes Biblicas | 102 | 11_a_20.xlsx |
| FB13 | Hermeneutica | 93 | 11_a_20.xlsx |
| FB14 | Exegese | 96 | 11_a_20.xlsx |
| FB15 | Critica Textual | 97 | 11_a_20.xlsx |
| FB16 | Hebraico Biblico | 100 | 11_a_20.xlsx |
| FB17 | Grego Biblico | 105 | 11_a_20.xlsx |
| FB18 | Aramaico Biblico | 75 | 11_a_20.xlsx |

### Area 2 — Antigo Testamento (AT)

18 modulos, 2.230 perguntas, ~245 licoes.

| ID | Modulo | Perguntas | Origem (planilha) |
|---|---|---|---|
| AT01 | Genesis | 133 | 11_a_20.xlsx |
| AT02 | Exodo | 129 | 11_a_20.xlsx |
| AT03 | Levitico | 135 | 21_a_30.xlsx |
| AT04 | Numeros | 128 | 21_a_30.xlsx |
| AT05 | Deuteronomio | 114 | 21_a_30.xlsx |
| AT06 | Josue e Juizes | 144 | 21_a_30.xlsx |
| AT07 | Rute e Samuel | 136 | 21_a_30.xlsx |
| AT08 | Reis e Cronicas | 155 | 21_a_30.xlsx |
| AT09 | Esdras e Neemias | 123 | 21_a_30.xlsx |
| AT10 | Ester | 91 | 21_a_30.xlsx |
| AT11 | Jo | 112 | 21_a_30.xlsx |
| AT12 | Salmos | 121 | 21_a_30.xlsx |
| AT13 | Proverbios | 128 | 31_a_40.xlsx |
| AT14 | Eclesiastes e Cantares | 114 | 31_a_40.xlsx |
| AT15 | Profetas Maiores | 146 | 31_a_40.xlsx |
| AT16 | Profetas Menores | 116 | 31_a_40.xlsx |
| AT17 | Monarquia de Israel | 97 | 31_a_40.xlsx |
| AT18 | Exilio e Restauracao | 108 | 31_a_40.xlsx |

### Area 3 — Novo Testamento (NT)

4 modulos na planilha, ~525 perguntas. O documento pedagogico lista mais modulos
potenciais (Evangelhos Sinoticos, Vida de Jesus, Atos, Romanos, Corintios, Galatas, Cartas da
Prisao, Tessalonicenses, Cartas Pastorais, Filemom, Hebreus, Cartas Gerais, Apocalipse) —
verificar com o usuario quais foram efetivamente aprovados para o MVP.

| ID | Modulo | Perguntas | Origem (planilha) |
|---|---|---|---|
| NT01 | Periodo Interbiblico | 122 | 31_a_40.xlsx |
| NT02 | Evangelhos Sinoticos | 105 | 31_a_40.xlsx |
| NT03 | Evangelho de Joao | 135 | 31_a_40.xlsx |
| NT04 | Vida de Jesus | 163 | 31_a_40.xlsx |

### Area 4 (sugerida) — Teologia

> Nao ha planilha oficial para esta area ainda. O documento pedagogico lista uma estrutura
> completa de modulos teologicos. Verificar com o usuario se esta area entra no MVP.

Modulos sugeridos no documento:
- Teologia Biblica
- Teologia Sistematica
- Doutrina de Deus
- Trindade
- Cristologia
- Espirito Santo
- Doutrina do Homem
- Doutrina do Pecado
- Doutrina da Salvacao
- Doutrina da Igreja
- Escatologia
- Anjos e Demonios
- Aliancas Biblicas
- Reino de Deus
- Lei e Evangelho
- Historia da Igreja
- Concilios e Credos
- Reforma Protestante
- Historia das Doutrinas
- Denominacoes Cristas
- Seitas e Heresias
- Apologetica Crista
- Etica Crista
- Pregacao e Ensino

## Formato das Perguntas

- **Tipo**: abertas (resposta digitada pelo usuario em texto livre)
- **Avaliacao**: por IA (LLM) — backend precisa de um provedor de IA generativa
- **Banco**: as planilhas contem apenas o **enunciado** (sem respostas, explicacoes ou
  alternativas multiplas)
- **Estrutura do enunciado**: direto, começando por "O que...", "Por que...", "Quais...", "Como..."
- **Granularidade**: 1-2 frases por pergunta; entre 5 e 30+ perguntas por licao

## Estrutura Recomendada por Materia (do Documento Pedagogico)

> Citado literalmente do `doc2_estrutura_pedagogica_completa.txt`:
>
> "Cada materia do aplicativo deve seguir o mesmo padrao:"

1. **Introducao breve** — contexto da materia
2. **Objetivo da materia** — o que o aluno deve dominar
3. **Conteudo principal** — texto base
4. **Textos biblicos obrigatorios** — referencias a ler
5. **Contexto historico ou literario** — quando aplicavel
6. **Personagens e lugares envolvidos** — glossario contextual
7. **Conceitos fundamentais** — termos-chave definidos
8. **Versiculo para memorizacao** — 1 verso principal
9. **Perguntas de multipla escolha** — quiz objetivo
10. **Questoes de verdadeiro ou falso** — quiz rapido
11. **Exercicio de associacao** — parear colunas
12. **Exercicio de ordenacao** — colocar em sequencia correta
13. **Pergunta de interpretacao** — exige leitura mais profunda
14. **Aplicacao pratica** — como aplicar na vida
15. **Revisao da materia** — recapitulacao
16. **Prova de dominio** — avaliacao final

## Observacoes Importantes para o Desenvolvimento

1. **Banco de perguntas incompleto para algumas secoes**: as planilhas oficiais so cobrem o
   "pergunta de interpretacao" / "pergunta aberta". As secoes 9-13 (multipla escolha,
   verdadeiro/falso, associacao, ordenacao, prova de dominio) **ainda nao foram geradas** —
   sera necessario produzi-las na fase de conteudo.

2. **Respostas/explicacoes faltam**: as 4.345 perguntas so tem o enunciado. A IA precisara de
   uma base de respostas esperada por pergunta — ou usar um prompt engenheirado que avalie
   semanticamente. Esta decisao e tecnica e exige discussao com o usuario.

3. **Conflito de contagem**: o doc oficial diz "sao mais de 70 opcoes" de modulos. Hoje ha
   apenas 40 na planilha. Os 30+ restantes podem vir da area Teologia (sugerida) ou de NT
   estendido.

4. **Mapeamento licao -> perguntas**: cada licao tem entre ~5 e ~30 perguntas. A estrutura
   "pergunta_id" segue o padrao `{MODULO_ID}-L{licao_ordem}-Q{pergunta_ordem}`, exemplo:
   `FB01-L01-Q01`. Esta e a chave para o sistema de IA conseguir carregar o contexto correto.

5. **Areas de Teologia**: o usuario citou no documento pedagogico uma serie de modulos
   teologicos, mas nao foram enviadas planilhas para eles. Confirmar com o usuario se:
   - (a) Esta area entra no MVP (com conteudo a ser gerado)
   - (b) Esta area e roadmap para versoes futuras
   - (c) Esta area foi cancelada

## Arquivos do Conteudo

| Arquivo | Conteudo |
|---|---|
| `questions_clean.json` | Banco de 4.345 perguntas em JSON (UTF-8 com acentos preservados) |
| `doc1_oficial_fluxo_telas.txt` | Documento oficial resumido do fluxo de telas |
| `doc2_estrutura_pedagogica_completa.txt` | Documento pedagogico completo (~4900 linhas, 47 paginas) |
| `../../whatsapp_media/spreadsheets/1_a_10.xlsx` | Planilha modulos 1-10 (Fundamentos Biblicos) |
| `../../whatsapp_media/spreadsheets/11_a_20.xlsx` | Planilha modulos 11-20 (FB + AT inicio) |
| `../../whatsapp_media/spreadsheets/21_a_30.xlsx` | Planilha modulos 21-30 (AT) |
| `../../whatsapp_media/spreadsheets/31_a_40.xlsx` | Planilha modulos 31-40 (AT + NT) |
