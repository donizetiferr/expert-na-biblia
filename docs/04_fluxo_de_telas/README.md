# 04 — Fluxo de Telas

> Mapeamento completo de todas as telas do app, com imagem de referencia, descricao da funcao,
> elementos de UI e regras de transicao.
>
> Numero das telas segue a numeracao do **Documento Oficial** (`doc1_oficial_fluxo_telas.txt`)
> fornecido pelo usuario. Algumas telas existem nos dois modos (Licoes e Quiz) com variacoes.

## Visao Geral do Fluxo

```
                     [Tela 1: Splash]
                           |
                           v
            [Tela 2: Selecao de Modo]
              /                   \
             v                     v
    [Modo LICOES]           [Modo QUIZ BIBLICO]
             |                     |
             v                     v
    [Tela Licoes 1:        [Tela 3: Tipo do Quiz]
     Lista de Modulos]       /          \
        |                  v            v
        v            [Aleatorio]   [Personalizado]
   [Tela Licoes 2:                     |
    Licoes do Modulo]                  v
        |                       [Tela 4: Escolher
        v                         Modulos]
   [Tela Licao:                            |
    Pergunta]                              v
        |                          [Tela 5: Inicio]
        v
   [Tela Feedback]
   (Certo / Errado)
        |
        v
   [Tela Final da Atividade]
   (<50% / >50% / 100%)
        |
        +-- < 100%: Recomecar (loop)
        |
        +-- 100% (somente Licoes):
             Proxima licao liberada
             OU se era a ultima:
             [Tela Final: Trofeu Expert]
```

## Tela 1 — Splash / Inicializacao

**Funcao**: tela de entrada do app. Apresenta o logo com animacao de entrada + som.

**Elementos**:
- Fundo: cor unica (parece branco off-white ou creme)
- Logo centralizado no topo (~30% da tela)
- Sem botoes

**Animacao/Comportamento**:
- "leve animacao no logo entrando e um som" (citacao literal do usuario)
- Transicao automatica para Tela 2 apos animacao

**Referencia local**:
- Modo Quiz: `../../whatsapp_media/images/image_20260622_223032.jpg` (logo grande + 2 botoes, mas
  essa ja inclui a Tela 2)
- Modo Licoes: `../../whatsapp_media/images/image_20260622_205222.jpg` (logo centralizado isolado)

---

## Tela 2 — Selecao de Modo

**Funcao**: o usuario escolhe entre Quiz Biblico e Licoes.

**Elementos**:
- Fundo: branco off-white
- Logo centralizado no topo
- Botao hamburguer (≡) laranja no canto superior direito -> abre Configuracoes
- 2 botoes grandes no centro inferior:
  - **"QUIZ BIBLICO"** (texto branco, fundo roxo, borda laranja)
  - **"LIÇÕES"** (mesmo estilo)

**Transicao**:
- QUIZ BIBLICO -> Tela 3
- LIÇÕES -> Tela Licoes 1 (lista de modulos)

**Referencia local**:
- `../../whatsapp_media/images/image_20260622_223032.jpg`

---

## Tela 3 (Modo Quiz) — Tipo do Quiz

**Funcao**: o usuario escolhe se quer perguntas aleatorias ou de licoes personalizadas.

**Elementos**: a descrever com base em iteracao futura (imagem nao foi enviada).

**Transicao**:
- Aleatorio -> Tela 5 (inicio do quiz)
- Licoes personalizadas -> Tela 4

---

## Tela 4 (Modo Quiz) — Escolher Modulos

**Funcao**: tela de scroll com todos os ~70 modulos para o usuario marcar os que quer estudar
no quiz customizado.

**Elementos**:
- Lista vertical scrollavel com ~70 modulos
- Cada item: checkbox + nome do modulo
- **Regra**: maximo de **20 modulos** marcados (serao 20 questoes no quiz)

**Transicao**: confirmacao -> Tela 5.

---

## Tela 5 (Modo Quiz) — Inicio

**Funcao**: confirmacao antes de iniciar o quiz. Botao de inicio grande.

**Elementos**: imagem nao enviada; descrito no doc oficial como "Tela com botao de inicio".

---

## Tela 6 (Modo Quiz) — Pergunta

**Funcao**: tela principal do quiz. Exibe pergunta, respostas e timer.

**Elementos**:
- Topo: numero da questao + icone de home (canto superior direito)
- Centro: quadro branco com a pergunta numerada
- Abaixo: **respostas possiveis** (botoes)
- **Timer de 10 segundos** visivel em algum lugar
- Icone de som on/off (canto inferior direito)

**Comportamento**:
- Ao clicar na resposta: botao fica **degradê amarelo circulado de preto** com a letra preta
- Se o timer expirar sem clique: app considera "fim do tempo" e da como **errado** -> Tela 7
  (erro)

**Referencia local**:
- `../../whatsapp_media/images/image_20260622_211747.jpg` (similar a esta, mas no modo licao)

---

## Tela 7 (Modo Quiz) — Feedback (Certo ou Errado)

**Funcao**: feedback imediato da resposta.

### Variante A — Errado / Tempo Esgotado

**Elementos**:
- Fundo: degradê laranja
- Personagem livro roxo com expressao assustada + sinais de exclamacao (!)
- Balao de fala roxo com "Errado" em destaque
- Quadro branco central com a **resposta correta**
- Abaixo: 2 botoes redondos roxos:
  - **Voltar** (corrigir) — seta para esquerda
  - **Prosseguir** (pular) — seta para direita
- Icone de som on/off (canto inferior direito)

**Referencia local**: `../../whatsapp_media/images/image_20260622_212830.jpg`

### Variante B — Certo

**Elementos** (inferidos):
- Fundo laranja
- Personagem livro feliz
- Quadro branco com a resposta certa em destaque
- Botao "PROSSEGUIR" roxo

---

## Tela 8 (Modo Quiz) — Placar Final

**Funcao**: apos as 20 questoes do quiz, mostra o desempenho.

### Variante A — < 50% ("Melhore")

**Elementos**:
- Fundo laranja
- Personagem livro roxo **triste** (cabeça baixa, expressão cabisbaixa)
- Quadro branco central:
  - "Voce acertou X de 20." (preto)
  - "NAO DEU" (em degradê roxo, fonte display bold)
- Botao **"RECOMECAR"** roxo

**Referencia local**: `../../whatsapp_media/images/image_20260622_213156.jpg`

### Variante B — > 50% ("Quase la")

**Elementos** (inferidos): mesmo padrao da variante A, mas com texto "QUASE LA" e personagem
talvez neutro.

**Referencia local**: `../../whatsapp_media/images/image_20260622_213506.jpg`

### Variante C — 100% ("Parabens")

**Elementos**:
- Fundo laranja
- Personagem livro roxo animado, bracos erguidos, exclamando **"Uau!"** (balao de fala roxo)
- Quadro branco central:
  - "Voce acertou 20 de 20." (preto)
  - "VOCE PASSOU!" (degradê roxo, display bold)
- Botao **"PROCEGUIR"** roxo -> **inicia outro quiz com perguntas diferentes**

**Referencia local**: `../../whatsapp_media/images/image_20260622_213535.jpg`

---

## Tela Licoes 1 — Lista de Modulos

**Funcao**: lista de todos os ~70 modulos para estudo progressivo.

**Elementos**:
- Logo no topo
- Botao de configuracao (≡) laranja no canto superior direito
- Lista vertical de modulos em **cards** (fundo degradê roxo, borda laranja/dourada)
- Cada card: titulo do modulo com palavras-chave em **degradê laranja** e complemento em branco
- **Modulo 1** (Fundamentos Biblicos): liberado (sem cadeado)
- **Demais modulos**: com **cadeado** (icone de cadeado sobreposto)

**Comportamento**:
- Modulo liberado (1) -> proxima tela ao clicar
- Modulo bloqueado -> toque nao tem efeito (ou mostra tooltip "conclua o anterior")

**Referencia local**: `../../whatsapp_media/images/image_20260622_205916.jpg`

---

## Tela Licoes 2 — Licoes do Modulo

**Funcao**: lista das licoes dentro do modulo selecionado. Mesma mecanica de cadeado sequencial.

**Elementos**:
- Header com nome do modulo (ex.: "Alfabetizacao Biblica")
- Lista vertical de cards de licoes (mesmo estilo dos modulos)
- Primeira licao liberada; demais com cadeado

**Referencia local**: `../../whatsapp_media/images/image_20260622_210318.jpg`

---

## Tela Licao — Pergunta

**Funcao**: tela principal de estudo. Exibe a pergunta, campo de resposta e personagem animado.

**Elementos**:
- Topo: indicador de progresso (ex.: "1-30") + icone de home
- Centro-superior: **personagem livro amarelo/laranja** com expressao pensativa
- Centro: **quadro branco** com a pergunta
- Abaixo: **campo de resposta roxo** com borda laranja, prefixo "R:" + texto digitado pelo
  usuario
- Inferior: icone de som on/off (canto inferior direito)

**Comportamento**:
- "As perguntas aparecem dentro do quadro branco, a pessoa escreve a resposta no espaco de
  resposta roxo e o bunequinho fica variando" (citacao literal)
- Ao enviar: **IA avalia** se a resposta esta correta ou errada
- Icone de som + icone home presentes em todas as variantes

**Referencia local**: `../../whatsapp_media/images/image_20260622_211747.jpg`

---

## Tela Feedback Licao — Certo ou Errado

**Funcao**: feedback imediato apos envio da resposta.

### Variante A — Errado

**Elementos**:
- Fundo laranja
- Personagem livro roxo assustado
- Balao "Errado"
- Quadro branco com a **resposta correta**
- Botoes de voltar/prosseguir (mesmo do quiz)

**Referencia local**: `../../whatsapp_media/images/image_20260622_212941.jpg`

### Variante B — Certo

**Elementos** (inferidos):
- Personagem livro feliz
- Quadro branco com a resposta
- Botao "PROSSEGUIR"

---

## Tela Final da Atividade (apos todas as perguntas da licao)

Mesma logica do Tela 8 do quiz, porem a regra e mais estrita:

- **< 50%**: "NAO DEU" + personagem triste + botao "RECOMECAR" (volta ao inicio da licao)
- **> 50%**: "QUASE LA" + botao "PROSSEGUIR" (mas **a licao NAO fica amarela** — usuario nao
  avança ate 100%)
- **100%**: "VOCE PASSOU!" + personagem exclamando "Uau!" + botao "PROCEGUIR" -> **licao fica
  amarela**, **cadeado da proxima some**, e o **modulo fica amarelo** quando todas as licoes
  amarelas.

> **REGRA CRITICA**: "Lembrando que a pessoa so consegue concluir a licao para ela ficar com o
> botao amarelo e liberar o proximo quando ela acerta 100%" (citacao literal do usuario)

---

## Tela Final — Trofeu Expert

**Funcao**: exibida quando o usuario **conclui todos os modulos** (100% em todos) OU **acerta
100% do quiz**.

**Elementos**:
- Fundo: branco
- **Trofeu dourado** centralizado, com bracos erguidos, sorriso largo, olhos brilhantes
- **Confetes roxos e dourados** ao redor
- Faiscas/diamantes brilhantes dispersos
- Texto grande:
  - "Parabens," (branco com borda preta)
  - "voce e um" (branco com borda preta)
  - "Expert!" (degradê roxo, fonte display gigante com borda preta)

**Referencia local**: `../../whatsapp_media/images/image_20260622_215940.jpg`

---

## Tela de Configuracoes

**Funcao**: ajustes de som, musica, etc.

**Elementos**:
- Botao ≡ laranja (canto superior direito de Tela 2 e Tela Licoes 1)
- Ao tocar: abre menu lateral / modal com opcoes (musica on/off, efeitos, etc.)

**Referencia local**: `../../whatsapp_media/images/image_20260622_210036.jpg` (botao ≡ em destaque)
