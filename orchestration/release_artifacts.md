# Release Artifacts — Expert Na Biblia

> Ultima atualizacao: 2026-06-23
> Status: **AGUARDANDO BUILD MANUAL** (subagente sem EXPO_TOKEN + google-service-account.json)
> Versao: 1.0.0 (versionCode 1)

## Resumo

A build real do AAB/APK nao foi executada pelo subagente porque:

1. **`eas-cli` nao esta instalado globalmente** (`which eas` retornou vazio)
2. **`google-service-account.json` nao existe** (referenciado em `eas.json` linha 42-43 e 55-56)
3. **Nao ha credencial `EXPO_TOKEN`** em `Tokens API e acessos/` (subdiretorio `expo/` ausente)
4. **`npm install` nao foi rodado** no projeto (node_modules ausente)

A execucao real deve ser feita localmente pelo usuario apos instalar o eas-cli e configurar credenciais.

## Comando para gerar build localmente

### Pre-requisitos

```bash
# 1. Instalar dependencias do projeto
cd "C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Biblia"
npm install

# 2. Instalar eas-cli global
npm install -g eas-cli

# 3. Login no Expo (requer conta Expo + projeto)
eas login
# OU: criar projeto Expo via `eas init` (se ainda nao existir)

# 4. (Opcional) Salvar EXPO_TOKEN em Tokens API e acessos/expo/credentials.md
#    para execucoes futuras 100% autonomas
```

### Build de producao (AAB para Play Store)

```bash
eas build --platform android --profile production --non-interactive
```

- **Resultado esperado**: arquivo `.aab` (Android App Bundle) na pasta raiz do projeto apos o build (~5-15 min)
- **Tamanho esperado**: 30-50 MB (com dependencias Expo + AdMob + Sentry + SQLite)
- **Caminho**: `C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Biblia\expert-na-biblia.aab`
- **Upload**: o proprio EAS ja deixa pronto para download em `https://expo.dev/accounts/[user]/projects/expert-na-biblia/builds`

### Build alternativa (APK direto)

Para gerar APK em vez de AAB (submissao manual fora do EAS submit):

```bash
# Editar eas.json: profile.production.android.buildType = "apk"
eas build --platform android --profile production --non-interactive
```

## Configuracao de signing

- **Keystore**: gerenciado pelo proprio EAS (nao eh exposto). Para usar keystore proprio:
  ```bash
  eas credentials
  # Escolher Android > Production > Set up a new keystore
  ```
- **Package name**: `com.donizetiferr.expertnabiblia` (ja definido em `app.json` android.package)
- **Version code**: 1 (campo `android.versionCode` em app.json)
- **Version name**: 1.0.0 (campo `expo.version` em app.json)

## Metadata para Play Console (preencher manualmente)

Ja estao definidos no `app.json`:

- Nome: "Expert Na Biblia"
- Slug: `expert-na-biblia`
- Package: `com.donizetiferr.expertnabiblia`
- Permissions: NOTIFICATIONS, INTERNET
- Adaptive icon: roxo #3c026d (configurado)

## Pendencias para execucao completa

- [ ] Instalar eas-cli (`npm install -g eas-cli`)
- [ ] Login no Expo (`eas login`)
- [ ] Criar projeto Expo (`eas init`) ou linkar ao ja existente
- [ ] Rodar `eas build --platform android --profile production --non-interactive`
- [ ] Aguardar build (~5-15 min)
- [ ] Baixar `.aab` resultante
- [ ] Configurar Play Console (ver `orchestration/play_store_checklist.md`)
- [ ] Submeter `.aab` para revisao Google

## LOOP DE AUTONOMIA

Apos o usuario gerar o build local e salvar o caminho do `.aab` em
`Tokens API e acessos/expo/build_path.txt`, o subagente podera retomar este
passo de forma autonoma em sessoes futuras.
