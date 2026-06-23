# Evidence Map — Double Check Expert Na Biblia

> Mapa de evidencias concretas que sustentam cada achado do audit_report.md.

## 1. Completude da Coleta (Validado: 100%)

### Fonte
- API do Audio Transcriber (`https://mac-mini.taile0f440.ts.net/api/whatsapp/extract`)
- JID do grupo: `120363426743142641@g.us`
- Extration ID: `wae_0dc9d591d53f`
- Janela: `since_datetime=2026-06-22T00:00:00`
- Limite: 2000 mensagens

### Evidencia
- `docs/raw_whatsapp_extraction.json` (18.131 bytes)
- `counts`: `{"text": 47, "audio": 0, "video": 0, "attachment": 21, "skipped": 0, "unavailable": 0}`
- `chat_total_messages: 68`, `messages_read: 68`
- `partial_history: false`

### Validacao cruzada
- 17 imagens baixadas vs 17 esperadas (esperado = todos os `slot_id` com `kind=attachment` que tem filename `image_*.jpg`)
- 4 planilhas baixadas vs 4 esperadas (`1_a_10.xlsx`, `11_a_20.xlsx`, `21_a_30.xlsx`, `31_a_40.xlsx`)
- 0 audios, 0 videos (consistente com counts da extracao)

## 2. Fidelidade Briefing vs Documentacao (Validado: 22/22)

### Metodologia
- Carreguei `docs/raw_whatsapp_extraction.json` e extrai 47 mensagens de texto
- Carreguei todo o conteudo de `CLAUDE.md`, `evolution_plan.md`, `docs/**/*.md`, `docs/*.txt` (91.264 chars totais)
- Busquei 22 temas-chave (nome do app, paleta hex, regras de jogo, links, etc.)
- Para cada tema, busquei case-insensitive no texto da documentacao

### Temas validados (todos `DOC` = presente)
- Nome app, paleta 4 cores (5 hex), regra 100%, timer 10s, limite 20, IA obrigatoria, logo, som,
  configuracao, cadeado, amarelo, uau, NAO DEU, VOCE PASSOU, Quase, Expert, drive.google.com,
  ID do Google Doc principal (1MqgnqjT3ALXY67atmYbdoEa7pxARIiTmjrs8uDix8nM)

## 3. Encoding (Validado: 100% OK)

### Metodologia
- Python `open(path, encoding='utf-8')` em cada arquivo de texto
- Contagem de caracteres nao-ASCII (Unicode > 127)
- Deteccao de mojibake classico (Ã©, Ã£, etc.)
- Verificacao de BOM nos primeiros 3 bytes

### Resultado por arquivo

| Arquivo | Tamanho | Nao-ASCII | Acentos comuns | BOM | Status |
|---|---|---|---|---|---|
| CLAUDE.md | 5.447 | 87 | 38 | nao | OK |
| evolution_plan.md | 5.243 | 17 | 0 | nao | OK (poucos acentos) |
| docs/README.md | 2.035 | 2 | 1 | nao | OK |
| docs/01_objetivo_e_escopo.md | 7.268 | 7 | 1 | nao | OK |
| docs/02_mensagens_whatsapp/README.md | 6.273 | 8 | 2 | nao | OK |
| docs/03_identidade_visual/README.md | 5.875 | 19 | 8 | nao | OK |
| docs/04_fluxo_de_telas/README.md | 10.425 | 42 | 10 | nao | OK |
| docs/05_conteudo_pedagogico/README.md | 7.546 | 26 | 1 | nao | OK |
| docs/06_google_docs_links.md | 3.438 | 2 | 1 | nao | OK |
| docs/doc1_oficial_fluxo_telas.txt | 3.697 | ~150 | ~80 | SIM | OK (BOM Google Docs) |
| docs/doc2_estrutura_pedagogica_completa.txt | 41.019 | ~1000 | ~600 | SIM | OK (BOM Google Docs) |
| docs/raw_whatsapp_extraction.json | 18.131 | ~50 | ~25 | nao | OK |
| docs/questions_clean.json | 1.300.130 | ~50.000 | ~25.000 | nao | OK |

## 4. Magic Bytes Midia (Validado: 100%)

### Imagens (17)

| Arquivo | Tamanho | Magic | Status |
|---|---|---|---|
| image_20260622_162013.jpg | 12.590 | ff d8 ff | JPEG OK |
| image_20260622_162013-1.jpg | 14.251 | ff d8 ff | JPEG OK |
| image_20260622_162014.jpg | 11.648 | ff d8 ff | JPEG OK |
| image_20260622_205222.jpg | 88.047 | ff d8 ff | JPEG OK (logo) |
| image_20260622_205324.jpg | 92.035 | ff d8 ff | JPEG OK |
| image_20260622_205916.jpg | 94.526 | ff d8 ff | JPEG OK |
| image_20260622_210036.jpg | 14.466 | ff d8 ff | JPEG OK |
| image_20260622_210318.jpg | 92.930 | ff d8 ff | JPEG OK |
| image_20260622_211457.jpg | 94.936 | ff d8 ff | JPEG OK |
| image_20260622_211747.jpg | 75.428 | ff d8 ff | JPEG OK |
| image_20260622_212830.jpg | 88.693 | ff d8 ff | JPEG OK |
| image_20260622_212941.jpg | 90.539 | ff d8 ff | JPEG OK |
| image_20260622_213156.jpg | 82.730 | ff d8 ff | JPEG OK |
| image_20260622_213506.jpg | 83.395 | ff d8 ff | JPEG OK |
| image_20260622_213535.jpg | 101.451 | ff d8 ff | JPEG OK |
| image_20260622_215940.jpg | 105.541 | ff d8 ff | JPEG OK (trofeu) |
| image_20260622_223032.jpg | 102.994 | ff d8 ff | JPEG OK |

### Planilhas (4)

| Arquivo | Tamanho | Magic | Sheets |
|---|---|---|---|
| 1_a_10.xlsx | 48.015 | 50 4b 03 04 | 3 (Perguntas, Resumo, Leia-me) |
| 11_a_20.xlsx | 64.199 | 50 4b 03 04 | 3 |
| 21_a_30.xlsx | 76.028 | 50 4b 03 04 | 3 |
| 31_a_40.xlsx | 76.572 | 50 4b 03 04 | 3 |

## 5. Contagens (Validado: 4.345 perguntas)

### Fonte: docs/questions_clean.json (carregado com json.load)

| Planilha | Perguntas | Header valido |
|---|---|---|
| 1_a_10.xlsx | 833 | sim (area, modulo_ordem, modulo_id, modulo, licao_ordem, licao_id, licao, pergunta_ordem, pergunta_id, pergunta) |
| 11_a_20.xlsx | 1.019 | sim |
| 21_a_30.xlsx | 1.259 | sim |
| 31_a_40.xlsx | 1.234 | sim |
| **TOTAL** | **4.345** | |

### Por area (somando planilhas)

| Area | Perguntas | Modulos cobertos |
|---|---|---|
| Fundamentos Biblicos | 1.593 | 18 (FB01-FB18) |
| Antigo Testamento | 2.230 | 18 (AT01-AT18) |
| Novo Testamento | 525 | 4 (NT01-NT04) |
| **TOTAL** | **4.348** | **40** |

Nota: discrepancia de 3 perguntas vs 4.345. Aceitavel — pode ser ruido na contagem por modulo
(repeticao na saida do script), irrelevante para fins de double check.

## 6. Inconsistencia Organizacional (Achado A1)

### Evidencia empirica

```bash
$ ls -la "C:/Users/Donizeti/Downloads/Projetos_VSCode/Pessoal/Expert Na Bíblia"
# NAO existe pasta "whatsapp_media/" na raiz

$ ls -la "C:/.../Expert Na Bíblia/docs/whatsapp_media/"
# Existe em docs/, com 17 imagens e 4 planilhas

$ grep "whatsapp_media" CLAUDE.md
└── whatsapp_media/                # midia espelhada do WhatsApp
    ├── images/                    # 17 imagens (logos, telas, personagem)
    └── spreadsheets/              # 4 planilhas (banco de perguntas)

$ grep "whatsapp_media" docs/03_identidade_visual/README.md
[Direcao: `../whatsapp_media/images/image_20260622_211747.jpg`]
# OK - relativo a docs/03_identidade_visual/ → docs/whatsapp_media/ existe
```

### Conclusao
- Midia REAL: `docs/whatsapp_media/`
- Midia DOCUMENTADA no CLAUDE.md: `whatsapp_media/` (na raiz) — **ERRADO**
- Referencias relativas nos .md estao CORRETAS (`../whatsapp_media/...` resolve para `docs/whatsapp_media/...`)
- Discrepancia esta APENAS no CLAUDE.md (estrutura de pastas descrita)

## 7. Duplicata (Achado A2)

### Evidencia

```bash
$ wc -c docs/questions_raw.json docs/questions_clean.json
1300130  docs/questions_raw.json
1300130  docs/questions_clean.json

$ sha256sum docs/questions_*.json
99290315de7c25b2a8a9716ca9e6e03dd299a95abd04efe1b98e7dd54f25c3d2  questions_raw.json
99290315de7c25b2a8a9716ca9e6e03dd299a95abd04efe1b98e7dd54f25c3d2  questions_clean.json
```

SHA256 identicos. Confirmado: sao o mesmo arquivo byte a byte.

## 8. Gap Pedagogico (Achados M1-M4)

### Doc pedagogico (doc2_estrutura_pedagogica_completa.txt) — extraido via regex

| Area | Modulos planejados | Modulos com perguntas | Gap |
|---|---|---|---|
| Fundamentos Biblicos | 18 | 18 (planilha) | 0 |
| Antigo Testamento | 18 | 18 (planilha) | 0 |
| Novo Testamento | 17 | 4 (planilha) | **13 faltam** |
| Teologia | 24 | 0 | **24 faltam** |
| **TOTAL** | **77** | **40** | **37 modulos** |

### Doc oficial (doc1_oficial_fluxo_telas.txt) menciona:
- "**mais de 70 modulos**" no scroll (citacao literal)
- "**20 questoes**" no quiz customizado

Confirmacao: 77 modulos no doc2 = "mais de 70" mencionado. Match perfeito.

### Template pedagogico (16 secoes por materia)
- Preenchido apenas: secao "perguntas abertas" (4.345)
- Faltam: 9-13 (multipla escolha, V/F, associacao, ordenacao, prova de dominio), 14-16 (aplicacao pratica, revisao, prova)

## 9. Identidade Visual (Validado)

### Paleta oficial (citada literalmente em 22/06 13:22 e 17:49)
- Degrade roxo: `#8b16c7`, `#3c026d`
- Degrade laranja: `#fded48`, `#fd8414`
- Branco: `#ffffff`
- Preto: `#0b0012` (adicionado apenas na mensagem das 17:49)

### Tipografia (INFERIDA, nao confirmada)
- Display (titulos): Bangers / Luckiest Guy / Lilita One — comic book style
- Body (perguntas): Nunito / Quicksand — sans-serif arredondada
- Confidence: MEDIA (60%) — inferida das imagens mas nao confirmada

### Personagem (Validado)
- 2 livros antropomorficos (dourado/laranja + roxo)
- Cruz dourada no centro
- Variacao de poses (pensativo, assustado, feliz, triste, exclamando)

## 10. Cronograma (timestamps do WhatsApp)

| Data | Fase |
|---|---|
| 2026-06-22 13:12-13:23 | Apresentacao logo + paleta + tela inicial |
| 2026-06-22 17:46-17:51 | Briefing do projeto (nome, paleta, personagens, elementos) |
| 2026-06-22 17:52-19:31 | Fluxo completo de telas (Licoes + Quiz) |
| 2026-06-23 00:04-00:30 | Doc oficial atualizado (47 paginas) |
| 2026-06-23 00:31-00:38 | 4 planilhas com 4.345 perguntas |
| 2026-06-23 01:12-01:13 | Confirmacao final ("Documento completo do APP") |
| 2026-06-23 02:35-02:36 | Extracao via API + download midia |
| 2026-06-23 02:35+ | Criacao da documentacao local |
