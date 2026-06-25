# Expert Na Bíblia

> Projeto Pessoal criado pelo term-deck em 2026-06-23.
> Inspirado em briefings coletados do grupo WhatsApp "App Expert na Biblia" em 2026-06-22/23.

## OBJETIVO

### 1. Ensinar a Bíblia de forma lúdica e progressiva via smartphone
Criar um aplicativo mobile gratuito que leva o usuário a se tornar "expert" na Bíblia por meio de
dois modos complementares: **Modo Lições** (trilha pedagógica progressiva com 77 módulos em
4 áreas - Fundamentos Bíblicos, Antigo Testamento, Novo Testamento, Teologia) e **Modo Quiz
Bíblico** (desafio rápido com 20 perguntas, timer de 10s e feedback imediato). O banco inicial
tem ~4.345 perguntas (FB+AT+NT parcial), expandido para ~7.500+ no MVP completo. O público é
cristão ou em busca de conhecimento bíblico (LGPD: adulto); o tom é acessível, a UX é
cartoon/playful com personagem livro animado, e a avaliação das respostas abertas é feita
por IA generativa (LLM Minimax M2.7). O progresso é gamificado: o usuário só libera o próximo
módulo/lição ao acertar 100% do anterior, e a tela final concede um troféu "Expert" quando
todos os módulos são concluídos.

## ESTRUTURA

### Stack (decidido em 2026-06-23)

- **Tipo**: app mobile smartphone (foco vertical, Android + iOS)
- **Framework**: **React Native + TypeScript via Expo (EAS Build)**
  - Justificativa: TypeScript (decisao do usuario), sem Android Studio local (EAS Build na nuvem),
    free tier Expo generoso (30 builds/mes), Expo Updates para hotfixes sem rebuild
- **IA para avaliacao**: **Minimax M2.7 (Token Plan)** — endpoint `https://api.minimax.io/v1`
  - Validacao: APW (Automatizador de Propostas Workana) ja usa em backend de producao
    (confirmado em `Tokens API e acessos/minimax/credentials.md`)
  - Fallback: OpenAI GPT-4o-mini se M2.7 estourar quota mensal
  - Peculiaridade: M2.7 retorna tags `think...` que devem ser filtradas antes de exibir
- **Banco de perguntas**: **SQLite embarcado no device** (expo-sqlite)
  - 4.345 perguntas + respostas canonicas pre-geradas via M3 (batch offline antes do APK)
- **Backend**: Node.js + Express em Railway/Render free tier ($0-5/mes)
  - Endpoint: POST /avaliar { pergunta, respostaUsuario }
  - Chama M3 quando resposta nao da match canonico local
  - Caching: respostas M3 com score>=0.85 sao salvas como canonicas para proxima vez
- **Assets visuais**: ja fornecidos via Google Drive (logo, paleta, personagens, telas mockadas)
- **aesthetic_direction**: `editorial/magazine` (comic book moderno, exuberante, "Parabéns, você é um Expert!" estilo gibi)
- **reference_visual**:
  - Duolingo (gamificação pedagógica que mantém engajamento)
  - Brilliant.org (UI limpa para educação, sem ruído visual)
- **Anti-AI-slop**: evitar Inter/Roboto como body (usamos Bangers + Nunito); evitar gradient roxo default (usamos degradê específico #8b16c7→#3c026d + acento laranja); evitar cards default rounded+sombra (usamos bordas grossas laranja); layout asymmetric com hierarquia editorial

### Tipografia (confirmado em 2026-06-23 via P0-8)

- **Display (titulos)**: Bangers (Google Fonts)
- **Body**: Nunito Regular/Bold/ExtraBold (Google Fonts)
- Pacotes: `@expo-google-fonts/bangers` + `@expo-google-fonts/nunito`

### Pastas do projeto

```
Expert Na Biblia/
├── CLAUDE.md                      # este arquivo
├── evolution_plan.md              # plano de evolucao (TO-DO vivo)
├── docs/                          # documentacao completa coletada do WhatsApp
│   ├── README.md                  # indice principal da documentacao
│   ├── 01_objetivo_e_escopo.md    # visao geral + regras de negocio
│   ├── 02_mensagens_whatsapp/     # extracao completa do grupo
│   ├── 03_identidade_visual/      # logo, paleta, personagem, assets
│   ├── 04_fluxo_de_telas/         # mapeamento de cada tela + referencias
│   ├── 05_conteudo_pedagogico/    # 77 modulos planejados (40 com conteudo), ~7500 perguntas MVP
│   └── 06_google_docs_links.md    # links externos do Drive/Docs
└── whatsapp_media/                # midia espelhada do WhatsApp
└── whatsapp_media/                # midia espelhada do WhatsApp
    ├── images/                    # 17 imagens (logos, telas, personagem)
    └── spreadsheets/              # 4 planilhas (banco de perguntas)
```

## REGRAS DO PROJETO

### Regras de negocio extraidas do briefing

1. **Progressao por 100%**: licao so e concluida com 100% de acerto. Resultado <50% = "NAO DEU";
   50-99% = "QUASE LA"; 100% = "VOCE PASSOU!". A licao fica amarela e libera a proxima apenas
   em 100%.
2. **Cadeado sequencial**: apenas o primeiro modulo e a primeira licao estao livres; os demais
   ficam com cadeado ate a conclusao 100% do anterior.
3. **Modulo amarelo = concluido**: visual de "amarelo com borda e texto pretos" indica dominada.
4. **IA obrigatoria**: respostas das licoes sao abertas (digitadas); a IA deve analisar e devolver
   a resposta correta em caso de erro.
5. **Personagem animado**: o livro-personagem varia poses (pensativo, assustado, feliz, triste,
   exclamando "Uau!") para manter engajamento.
6. **Timer do Quiz**: 10 segundos por pergunta; sem clique = considerado errado.
7. **Quiz customizado**: maximo 20 modulos marcados para personalizacao.
8. **Tela final de vitoria**: trofeu dourado "Parabens, voce e um Expert!" ao concluir todos os
   modulos ou acertar 100% do quiz.
9. **Botao de configuracao**: ≡ no canto superior direito das telas principais para ajustar
   som/musica.

### Identidade visual (paleta oficial)

| Nome | Cor 1 | Cor 2 | Uso |
|---|---|---|---|
| Degradê Roxo | `#8b16c7` | `#3c026d` | Fundos, botoes, campo de resposta |
| Degradê Laranja | `#fded48` | `#fd8414` | Bordas, destaques, texto-chave |
| Branco | `#ffffff` | — | Fundo geral, quadros de perguntas |
| Preto | `#0b0012` | — | Bordas, sombras, texto secundario |

### Decisoes tomadas em 2026-06-23

| # | Tema | Decisao |
|---|---|---|
| 1 | **Plataforma** | React Native + TypeScript via Expo (EAS Build) |
| 2 | **Escopo MVP** | 77 modulos completos (FB+AT+NT+Teologia) |
| 3 | **Respostas IA** | Hibrido: SQLite canonico local + M3 LLM para casos ambiguos |
| 4 | **Provedor IA** | Minimax M2.7 (Token Plan), fallback OpenAI GPT-4o-mini |
| 5 | **Arquitetura dados** | SQLite embarcado (expo-sqlite) + backend Node.js opcional |
| 6 | **Sons** | Biblioteca royalty-free (Pixabay, Freesound) — eu pesquiso |
| 7 | **Tipografia** | Inferir das imagens (Bangers/Luckiest Guy + Nunito/Quicksand) |
| 8 | **Publicacao** | Curto prazo: APK Android (Expo EAS Build). Publicacao lojas: medio/longo prazo |
| 9 | **Monetizacao** | Free + AdMob (so apos publicacao em loja) |
| 10 | **LGPD** | Publico geral adulto |

### Decisoes ainda pendentes (follow-up durante implementacao)

- **Modulos Teologia**: gerar perguntas para os 24 modulos ou lancar so FB+AT+NT+NT-completo
  (53 modulos)? Decidir apos MVP beta validar engajamento.
- **Backend deploy**: Railway.app, Render.com ou Cloudflare Workers? Decidir quando implementar
  backend (provavelmente desnecessario - app chama M3 direto).

### Decisoes de escopo tomadas em 2026-06-23 (pos-double-check)

- **Foco**: APK Android EXCLUSIVO no MVP. iOS/Apple Store FORA do escopo (cancelado).
- **Publicacao lojas**: conta Google Play Developer `donizetiferr` JA EXISTE — sem custo
  adicional, sem bloqueio. P3-5 (iOS) REMOVIDO do escopo.
- **Privacy Policy URL**: usar GitHub Pages free (`donizetiferr.github.io/expert-na-biblia/`)
  — zero custo. Nao precisa dominio proprio.

## Fontes dos assets (V9 M4.3)

Todos os assets visuais/audios estao em Google Drive publico + espelhados localmente em
`whatsapp_media/`. Lista de fontes (todos publicos):

- **Logos**: https://drive.google.com/drive/folders/1wpzcW9gs8T8BWZjlTIP07VlVmsyN919f
- **Paleta**: https://drive.google.com/drive/folders/1i6Ahy5A1bQ1Ra4SpGVoobve4_3R8npgv
- **Personagens**: https://drive.google.com/drive/folders/1rGy3F3q45aJCY6ipDTYyf3Ir88ykjzDm
- **Telas mockadas**: https://drive.google.com/drive/folders/1Y-OaSvZgKRAuc7e8inXsLCBUZOhh9RxR
- **Documento oficial (47 paginas)**: https://docs.google.com/document/d/1MqgnqjT3ALXY67atmYbdoEa7pxARIiTmjrs8uDix8nM

### Assets ja embarcados (V9)

| Arquivo embarcado | Fonte local (whatsapp_media/images/) | Uso |
|---|---|---|
| `assets/images/logo.png` | `image_20260622_205222.jpg` | Splash screen (300x300) |
| `assets/images/trofeu.png` | `image_20260622_215940.jpg` | Tela Trofeu (280x280) |
| `assets/images/personagem_pensativo.png` | V8 | PersonagemLivro pose PENSATIVO |
| `assets/images/personagem_feliz.png` | V8 | PersonagemLivro pose FELIZ |
| `assets/images/personagem_assustado.png` | V8 | PersonagemLivro pose ASSUSTADO |
| `assets/images/personagem_triste.png` | `image_20260622_213156.jpg` | PersonagemLivro pose TRISTE (V9 M2.2) |
| `assets/images/personagem_exclamando.png` | `image_20260622_213535.jpg` | PersonagemLivro pose EXCLAMANDO (V9 M2.2) |

### Decisao de escopo V9 (2026-06-24)

- **Modulos Teologia (24 modulos)**: adiar para V10. MVP foca FB+AT+NT com 40 modulos /
  ~750 perguntas por modulo / ~4345 perguntas totais. Justificativa: batch M2.7 ja consome
  ~3h para gerar respostas canonicas + distrators; gerar tambem os 24 modulos TE dobraria
  tempo e risco. Validar qualidade no MVP beta antes.
- **Backend deploy**: descartado (app chama M2.7 direto, sem backend dedicado).
- **Politica de retry**: settings.efeitos desativa SFX em runtime via polling 500ms
  (sound-runtime.ts); settings.musica idem (V9 M3.1).

## PROXIMO PASSO

**V20 entregue (2026-06-25, v1.10.0/vc5)** — 2 lacunas de conformidade do briefing fechadas e
COMPROVADAS no emulador hi-res (rede restaurada): (A) **mascote DOURADO no modo Licoes** (Personagem 1,
regra de identidade) — `PersonagemLivro` ganhou prop `variante: 'licoes'|'quiz'`; as 3 telas de Licoes
usam o livro DOURADO (3 poses reais baixadas do Drive "Personagens"; set parcial — sem assustado/triste
dedicado, usa "questionando"), o Quiz mantem o ROXO. (B) **IA obrigatoria nas licoes** (regra #4) —
`enviar()` agora usa o orquestrador hibrido `avaliarResposta` (match local >=85% -> M2.7 -> OpenAI) com
loading "AVALIANDO..." + fallback; bug REAL corrigido (M2.7 envolve JSON em `<think>`+cercas markdown ->
novo `src/lib/parse-json.ts`). Comprovado: golden nas Licoes + roxo no Quiz; IA online (m3_usage + cache
score 1.0) + integracao Node real M2.7 4/4; jornada licao->100%->amarela->desbloqueio integra.
Evidencias `orchestration/v20_validation/`. APK `dist/ExpertNaBiblia-v20.0.0.apk`
(https://files.catbox.moe/kjvgi4.apk). Detalhes: `evolution_plan.md` (PLANO V20) + changelog 1.10.0.

Pendencias (pos-V20, nao bloqueiam):
- Poses DOURADAS assustado/triste dedicadas: Drive so tem 3 poses douradas (positivas/neutras);
  feedback de erro nas Licoes usa a pose dourada "questionando". Reabrir se a designer subir as poses.
- `quiz-alternatives.ts` tem o MESMO padrao de parsing fragil do M2.7 (sem strip de cercas) na geracao
  de distratores — batch offline, fora do escopo V20; aplicar `extrairAvaliacaoJson` se for usado em runtime.
- Batch M2.7 para pre-gerar canonicas das ~497 perguntas abertas (hoje a IA avalia em runtime quando
  online; offline cai no guard SEM_GABARITO).
- MD.7 (icones home/som/config desenhados): pasta Drive "Elementos" vazia — emoji/glyph funcionais.
- Publicacao na Play Store: `orchestration/play_store_checklist.md` (2FA Google = execucao humana).
- Backlog: modulos de Teologia (24); surfacing de streak/XP. Avaliar pos-engajamento.

---

**V19 entregue (2026-06-25, v1.9.0/vc4)** — correcao do RELEASE-BLOCKER do modo Licoes (a
pontuacao da licao nao acumulava: o V18 ALEGOU progressao OK, mas a QA independente REFUTOU).
Corrigidos BUG-1 (scoring), BUG-2 (canonicas placeholder invenciveis + guard SEM_GABARITO),
BUG-3/4 (teclado/ENVIAR + envio vazio), BUG-5 (placar Quiz), BUG-7 (titulos), BUG-8 (banner),
BUG-9 (travados roxo+cadeado), BUG-10 (gradientes). TUDO COMPROVADO em emulador hi-res
(1080x1920) com screenshots frescos da jornada real: licao 100% -> amarela -> proxima licao ->
modulo amarelo -> proximo modulo -> TROFEU; Quiz aleatorio jogavel sem spinner. Evidencias:
`orchestration/v19_validation/`. APK: `dist/ExpertNaBiblia-v19.0.0.apk`
(https://files.catbox.moe/i9ktqe.apk). Detalhes: `evolution_plan.md` (PLANO V19) + changelog 1.9.0.

Pendencias (V20, nao bloqueiam):
- BUG-6: mascote do modo Licoes deveria ser o livro DOURADO (briefing); app usa 1 set de PNG
  (livro roxo) para Licoes e Quiz. Requer asset dourado do designer/Drive.
- IA nas licoes: `enviar()` usa `matchCanonico` cru — `avaliador.ts` (LLM M2.7/OpenAI) NAO esta
  wired no fluxo da licao (regra "IA obrigatoria" pendente). + batch M2.7 para ~497 canonicas
  abertas "NAO SEI" (hoje cobertas pelo guard SEM_GABARITO offline).
- MD.7 (icones home/som/config desenhados): pasta Drive "Elementos" vazia — emoji/glyph funcionais.
- Publicacao na Play Store: seguir `orchestration/play_store_checklist.md` (2FA Google =
  execucao humana irredutivel).
- Backlog: modulos de Teologia (24); surfacing de streak/XP. Avaliar pos-engajamento.

### Arquitetura final (decidida)

```
+--------------------+        +---------------------+
|  App Android/iOS   |        |  Minimax M2.7        |
|  (React Native +   | <----> |  (Token Plan)        |
|   Expo + SQLite)   | HTTPS  |                     |
+--------------------+        +---------------------+
       |                              |
       |  Match canonico              |  Avaliacao LLM
       |  local (>=85%)               |  para casos ambiguos
       |                              |  (resposta vazia,
       |                              |   off-topic, sinonimos)
       v                              v
+---------------------+
| SQLite embarcado   |
| - 40 modulos       |
| - ~4345 perguntas  |
| - respostas        |
|   canonicas        |
+---------------------+
```
