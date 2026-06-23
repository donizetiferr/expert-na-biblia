# 01 — Objetivo e Escopo

## Visao Geral

> "O App se trata de um aplicativo que ensina a ficar expert na Biblia de forma ludica"
> "O nome e Expert na Biblia"
> — Mensagem original do grupo WhatsApp (2026-06-22)

**Expert na Biblia** e um aplicativo mobile (smartphone) gratuito, criado para **testar e ampliar
os conhecimentos do usuario sobre a Biblia** por meio de dois modos de aprendizado complementares
que combinam gamificacao, personagens animados e IA para avaliacao de respostas.

## Objetivo Principal

Ajudar o usuario a se tornar "expert" na Biblia de forma ludica, atraves de:

1. **Trilhas de licoes estruturadas** (modo Estudo): conteudo pedagogico organizado em modulos
   progressivos, com licoes liberadas sequencialmente (cadeado ate conclusao da anterior).
2. **Quiz biblico desafiador** (modo Quiz): perguntas rapidas com timer, em modulos aleatorios
   ou modulos personalizados, com feedback imediato e placar final.

## Publico-alvo

Cristaos (ou pessoas em busca de conhecimento biblico) que desejam aprofundar o estudo da Biblia
de forma ludica, com progressao gamificada. O tom e acessivel, a UX e infantil/juvenil com
personagem livro animado, mas o conteudo e teologico de nivel crescente (de alfabetizacao biblica
a teologia sistematica).

## Escopo Funcional (do documento oficial de fluxo)

### Modo Licoes (estudo progressivo)

1. **Tela Inicial**: splash com animacao do logo + som.
2. **Tela de Selecao de Modo**: dois botoes grandes — "QUIZ BIBLICO" e "LICOES".
3. **Tela de Modulos** (modo Licoes): lista de ~70 modulos em scroll.
   - Apenas o **primeiro modulo** esta liberado; os demais vem com **cadeado**.
   - Quando todas as licoes do modulo N sao concluidas (100%), o modulo fica **amarelo com borda
     e texto pretos**, e o **cadeado do proximo modulo some**.
4. **Tela de Licoes do Modulo**: lista de licoes dentro do modulo selecionado. Mesma regra de
   cadeado sequencial ate conclusao 100% da licao anterior.
5. **Tela de Pergunta da Licao**:
   - Quadro branco com a pergunta.
   - Campo de resposta roxo com bordas laranja/douradas.
   - **Personagem livro animado** variando entre poses para nao enjoar.
   - **IA integra** avalia se a resposta esta correta ou errada.
   - **Controles**: botao de som on/off + botao home (volta para tela inicial) + indicador de
     progresso (ex.: "1-30").
6. **Tela de Feedback (Licao)**:
   - **Errado**: fundo laranja, livro com expressao assustada + balao "Errado", mostra resposta
     correta em quadro branco, dois botoes: voltar (corrigir) ou prosseguir (pular).
   - **Certo**: livro feliz, mostra resposta, botao "PROSSEGUIR".
7. **Tela Final da Atividade** (apos todas as perguntas da licao):
   - **< 50% acertos**: livro triste, mensagem "NAO DEU", botao "RECOMECAR".
   - **> 50% acertos**: livro feliz, mensagem "QUASE LA", botao "PROSSEGUIR".
   - **100% acertos**: livro animado exclamando "Uau!", mensagem "VOCE PASSOU!", botao
     "PROCEGUIR". So apos 100% a licao fica **amarela** e o cadeado da proxima some.
8. **Tela de Conclusao Total** (apos todos os modulos): trofeu dourado com confetes,
   "Parabens, voce e um Expert!".

### Modo Quiz Biblico (desafio rapido)

1. **Tela Inicial**: mesma splash.
2. **Tela de Selecao de Modo**: dois botoes — "QUIZ BIBLICO" e "LICOES".
3. **Tela 3 (apos clicar Quiz)**: opcao entre **perguntas aleatorias** (vai direto para tela
   de inicio do quiz) ou **licoes personalizadas** (vai para tela 4).
4. **Tela 4 (Licoes Personalizadas)**: scroll com ~70 opcoes de modulos. Usuario pode marcar
   no maximo **20 modulos** (sao 20 questoes no quiz).
5. **Tela 5**: botao de inicio do quiz.
6. **Tela 6 (Pergunta do Quiz)**:
   - Numero da questao no topo.
   - **Pergunta** + **respostas possiveis**.
   - **Timer de 10 segundos** — se nao clicar em nenhuma resposta antes do tempo acabar, o app
     considera "fim do tempo" e da como **errado**.
   - Ao clicar na resposta: botao fica **degradê amarelo circulado de preto** com a letra preta.
   - Icone de som on/off + icone home.
7. **Tela 7 (Feedback do Quiz)**:
   - Se **tempo acabou** ou **errou**: tela de erro com resposta correta.
   - Se **acertou**: tela de acerto.
8. **Tela 8 (Placar Final do Quiz)**:
   - "Melhore" (< 50%) / "Quase la" (> 50%) / "Parabens" (100%).
   - Em 100%: botao "PROSSEGUIR" comeca outro quiz com perguntas diferentes.

## Regras de Negocio Chave

1. **Progressao por 100%**: uma licao so e concluida quando o usuario acerta **100%** das
   perguntas. Resultado < 50% -> "NAO DEU"; 50-99% -> "QUASE LA"; 100% -> "VOCE PASSOU!".
2. **Cadeado sequencial**: modulos e licoes sao liberados sequencialmente. Apenas o primeiro
   esta aberto inicialmente. Para abrir o proximo, e preciso **concluir 100% do anterior**.
3. **Modulo amarelo = concluido**: visual de "amarelo com borda e texto pretos" indica modulo/
   licao ja dominada.
4. **IA para avaliacao**: as respostas das licoes sao **respostas abertas** (digitadas pelo
   usuario) e a IA e responsavel por analisar se estao certas/erradas e devolver a resposta
   correta em caso de erro.
5. **Personagem animado**: o livro-personagem **varia de pose** durante o uso para nao enjoar.
6. **Sons configuraveis**: existe **botao de som** em quase todas as telas; a tela 1 (splash)
   tem som, e a **tela 2 (configuracoes)** permite ajustar musica/efeitos.
7. **Quiz com timer**: 10 segundos por pergunta; sem clique = considerado errado.
8. **Quiz customizado**: maximo 20 modulos marcados para personalizacao.
9. **Mobile-first**: o app e claramente destinado a smartphones (proporcao vertical das telas,
   foco em toques, scroll vertical).

## Conteudo Pedagogico (resumo)

- **40 modulos** distribuidos em **3 areas principais** + **1 area adicional sugerida**:
  - **Fundamentos Biblicos** (FB01-FB18): 18 modulos, 1.593 perguntas
  - **Antigo Testamento** (AT01-AT18): 18 modulos, 2.230 perguntas
  - **Novo Testamento** (NT01-NT04+): 4+ modulos no WhatsApp, ~525 perguntas (mas o documento
    pedagogico lista muitos mais sob "Novo Testamento" — verificar quais foram aprovados)
  - **Teologia** (sugerido): area adicional mencionada no doc pedagogico com modulos de
    Teologia Biblica, Sistematica, Cristologia, etc.
- **Total ate agora: 4.345 perguntas** (FB + AT + NT, sem respostas/explicacoes)
- **Estrutura de cada materia** (do doc pedagogico):
  1. Introducao breve
  2. Objetivo da materia
  3. Conteudo principal
  4. Textos biblicos obrigatorios
  5. Contexto historico ou literario
  6. Personagens e lugares envolvidos
  7. Conceitos fundamentais
  8. Versiculo para memorizacao
  9. Perguntas de multipla escolha
  10. Questoes de verdadeiro ou falso
  11. Exercicio de associacao
  12. Exercicio de ordenacao
  13. Pergunta de interpretacao
  14. Aplicacao pratica
  15. Revisao da materia
  16. Prova de dominio

## Stack e Midia

- **Tipo**: App mobile (smartphone, foco vertical)
- **Plataforma**: a definir (nativo iOS+Android ou multiplataforma como React Native / Flutter)
- **Backend IA**: a definir (provedor de LLM para avaliacao de respostas abertas)
- **Assets**: ja foram fornecidos pelo usuario:
  - Logo (Drive)
  - Paleta de cores
  - Personagens
  - Telas mockadas (screenshots)
  - Banco de perguntas (planilhas Excel)
