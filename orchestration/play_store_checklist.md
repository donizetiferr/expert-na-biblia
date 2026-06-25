V17 revertido — Play Store fica para depois do APK 100% aprovado

> Ultima atualizacao: 2026-06-25 (V17 — Play Store prep + EAS build)
> Conta Play Console: **donizetiferr** (JA EXISTE — decisao usuario 2026-06-23)
> Status: **V17 ENTREGUE** (AAB assinado v17.0.0 + APK universal + keystore release + EAS config)

## Pre-requisitos

- [x] **Conta Google Play Developer ativa**: `donizetiferr` (confirmado pelo usuario em 2026-06-23)
- [x] **Keystore release gerado** (V17 T1): `android/app/expert-na-biblia-release.keystore`
  - SHA1: `B6:7B:40:DD:0D:08:96:47:CB:5E:29:7B:60:C9:BD:48:D9:BF:31:4C`
  - Alias: `expert-na-biblia` | Validade: 10000 dias (~ate 2053)
  - Detalhes: `orchestration/release_keystore_credentials.md`
- [x] **Gradle signing configurado** (V17 T2): `android/app/build.gradle` usa `signingConfigs.release` (NAO debug)
- [x] **eas.json configurado** (V17 T3): profiles development/preview/production + submit config
  - Docs: `orchestration/eas_setup.md`
- [x] **AAB v17 gerado** (V17 T5): `dist/ExpertNaBiblia-v17.0.0.aab` (73MB, SHA256 `1bbcef4f...`)
- [x] **APK universal v17 gerado** (V17 T6 via bundletool): `dist/ExpertNaBiblia-v17.0.0-universal.apk` (43MB)
- [x] **AAB validado com bundletool** (V17 T6): `bundletool validate` exit 0
- [x] **Privacy Policy publicada**: https://donizetiferr.github.io/expert-na-biblia/privacy.html
- [ ] **Conteudo teologico revisado** (P0-11 — BLOQUEADA_POR_USUARIO; ver `docs/qa_conteudo_para_revisar.md`)

## Passo 1: Criar App no Play Console

1. Acessar https://play.google.com/console/
2. **Criar app** > Preencher:
   - **Nome do app**: Expert Na Biblia
   - **Idioma padrao**: Portugues (Brasil)
   - **App ou jogo**: App
   - **Gratuito ou pago**: Gratuito
3. Aceitar termos de servico

## Passo 1.5: Build AAB (JA FEITO em V17)

AAB v17.0.0 ja foi gerado e esta em `dist/ExpertNaBiblia-v17.0.0.aab` (73MB).
SHA256: `1bbcef4fe3a8787d5fc6d26813aefcdae28796913dca6dabbb9d46b10d715e34`.
Detalhes completos em `orchestration/release_artifacts.md`.

Para rebuild (caso necessario):
```bash
cd C:\ENB
export JAVA_HOME="C:/Users/Donizeti/scoop/apps/temurin17-jdk/current"
export ANDROID_HOME="C:/Android/Sdk"
cd android
./gradlew clean bundleRelease
# Resultado: app/build/outputs/bundle/release/app-release.aab
```

## Passo 2: Preencher Store Listing (Ficha da loja)

Na pagina "Crescimento > Presenca na loja > Ficha da loja principal":

### Asset checklist (formato oficial Google Play 2026)

| Asset | Dimensao | Formato | Max | Obrigatorio? | Status |
|-------|----------|---------|-----|--------------|--------|
| Icone do app | 512x512 px | PNG 32-bit, sem transparencia | 1024 KB | SIM | Ja existe `assets/icon.png` |
| Feature graphic | 1024x500 px | PNG ou JPG | 1024 KB | SIM | PENDENTE |
| Screenshots telefone | 320-3840 px (recomendado 1080x1920) | PNG ou JPG 24-bit | 8 MB cada | min 2, ideal 4-8 | PENDENTE |
| Privacy Policy URL | URL publica https | - | - | SIM | `https://donizetiferr.github.io/expert-na-biblia/privacy.html` (OK) |

### Screenshots especificos para o app (recomendado 6)

1. **Splash** — logo grande + nome do app
2. **Modos** — 3 cards: Licao / Quiz / Biblia
3. **Licoes** — lista de modulos com PersonagemLivro
4. **Licao em andamento** — pergunta com personagem reagindo
5. **Feedback acerto** — feedback positivo + personagem feliz
6. **Trofeu** — tela de vitoria com confete

**Como gerar**: instalar o APK V17 emulador, tirar screenshots via `adb exec-out screencap -p > tela.png` em cada tela, salvar em `assets/store/phone/tela-1-splash.png` etc.

### Icone
- 512x512 PNG, 32-bit, sem transparencia
- Ja existe em `assets/icon.png` — usar como esta

### Imagem destaque (feature graphic)
- 1024x500 PNG ou JPG
- Criar com template roxo/dourado do app + texto "Expert Na Biblia - Estudo biblico gamificado"

### Descricao curta (80 caracteres)
"Estudo biblico gamificado com 77 modulos e avaliacao por IA."

### Descricao completa (4000 caracteres)
Sugestao:

```
Expert Na Biblia transforma o estudo biblico em uma jornada ludica e progressiva.

Funcionalidades:
- 77 modulos pedagogicos cobrindo Novo Testamento, Teologia Sistematica, Historia da Igreja e Hermeneutica
- 10.850+ perguntas geradas com avaliacao por IA (Minimax M2.7 + OpenAI fallback)
- Modo Licao (perguntas abertas com feedback inteligente)
- Modo Quiz (multipla escolha, verdadeiro/falso, associacao, ordenacao)
- Gamificacao com streak diario, ranking por modulo, trofeu de conclusao
- Personagem animado (PersonagemLivro) que reage ao progresso
- Criptografia local do SQLite (SQLCipher)
- Sentry para captura anonima de crashes
- 100% LGPD compliant (sem coleta de dados pessoais)
- Modo offline apos download

Publico-alvo: adultos estudiosos da Biblia, lideres de grupos pequenos, seminaristas.
Idioma: Portugues (Brasil).

Contato: via pagina do app na Play Store.
```

## Passo 3: Classificacao de conteudo (Content Rating)

Em "Politica > Classificacao de conteudo":

1. Iniciar questionario
2. Categoria: **Educacao** ou **Livros e referencias** (escolher "Livros e referencias" se disponivel)
3. Responder:
   - Violencia: Nenhuma
   - Conteudo sexual: Nenhuma
   - Linguagem: Nenhuma
   - Substancias: Nenhuma
   - Compras in-app: Nao
4. Obter classificacao PEGI/ESRB resultante (provavelmente L (Livre) ou 3+)

## Passo 4: Publico-alvo e conteudo

Em "Politica > Publico-alvo":

- **Faixa etaria alvo**: 13+ (ou 18+? confirmar — recomendado 13+)
- **Conteudo feito para criancas**: NAO
- **Anuncios**: SIM (banner + interstitial)
- **Compras in-app**: NAO

## Passo 5: Privacidade

Em "Politica > Privacidade do app":

1. **URL da Politica de Privacidade**:
   ```
   https://donizetiferr.github.io/expert-na-biblia/privacy.html
   ```

2. **Seguranca de dados**:
   - Coleta dados pessoais? **NAO**
   - Compartilha dados? **NAO**
   - Criptografia em transito? SIM (HTTPS para M3/OpenAI/AdMob)
   - Criptografia em repouso? SIM (SQLCipher local)
   - Usuario pode solicitar exclusao? SIM (via Configuracoes > Resetar progresso)
   - Aplicam-se policas de familia? NAO

## Passo 6: Upload do AAB

Em "Versoes > Producao > Criar nova versao":

1. **Upload do Android App Bundle**: arrastar o arquivo `.aab` gerado pelo EAS
2. **Nome da versao**: "1.0.0"
3. **Notas da versao** (Portugues):
   ```
   Lancamento inicial do Expert Na Biblia.
   - 77 modulos pedagogicos
   - Avaliacao por IA
   - 10.850+ perguntas
   - Modo offline
   - LGPD compliant
   ```

## Passo 7: Revisar e enviar

1. Revisar todas as secoes acima (checklist do Play Console)
2. Clicar em **"Enviar para revisao"**
3. Tempo medio de revisao: 1-7 dias (Google Play Review)
4. Acompanhar status em "Versoes > Producao"

## Comando EAS Submit (alternativa automatica)

Apos o usuario configurar o `google-service-account.json` em
`Tokens API e acessos/expo/`:

```bash
eas submit --platform android --latest
```

Isso submete o ultimo AAB gerado para o Play Console automaticamente.

## Pendencias do usuario (resumo)

| Item | Dono | Status |
|------|------|--------|
| Build AAB | usuario | AGUARDANDO (ver release_artifacts.md) |
| Screenshots para store listing | usuario | AGUARDANDO (assets/store/phone/) |
| Feature graphic 1024x500 | usuario | AGUARDANDO |
| Conteudo teologico revisado | usuario | AGUARDANDO P0-11 |

## LOOP DE AUTONOMIA

Apos o usuario completar a build + screenshots + feature graphic + revisao P0-11,
o subagente podera automatizar a submissao via `eas submit --platform android --latest`.
Para isso, salvar as credenciais em:

- `Tokens API e acessos/expo/credentials.md` (EXPO_TOKEN)
- `Tokens API e acessos/google-play-developer/credentials.md` (google-service-account.json)

## Referencias

- Play Console Help: https://support.google.com/googleplay/android-developer
- App Bundle requirements: https://developer.android.com/guide/app-bundle
- LGPD Privacy Policy: https://www.gov.br/cndi/pt-br/composicao/sepdin/lei-no-13-709
