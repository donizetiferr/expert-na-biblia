# EAS (Expo Application Services) Setup — Expert Na Biblia

**Atualizado em 2026-06-25 (V17 T3)**

## O que e EAS

EAS = Expo Application Services. Servico na nuvem da Expo que constroi seu app Android/iOS sem precisar de Android Studio/Xcode local. Suporta:
- Build de AAB/APK direto na nuvem
- Submit automatico para Play Store / App Store
- OTA Updates (hotfixes sem rebuild)

## Pre-requisitos

1. **Conta Expo** (https://expo.dev/signup) — gratuita
2. **Expo CLI** instalado: `npm install -g eas-cli`
3. **Login**: `eas login` (autentica via browser)
4. **Projeto Expo vinculado**: `eas init` (gera `projectId` em app.json)
5. **eas.json** na raiz do projeto (ja configurado)

## Build profiles (ja em `eas.json`)

| Profile | Comando | Resultado | Uso |
|---------|---------|-----------|-----|
| `development` | `eas build --profile development --platform android` | APK debug | Dev com Expo Dev Client |
| `preview` | `eas build --profile preview --platform android` | APK release | Teste interno / compartilhamento direto |
| `production` | `eas build --profile production --platform android` | AAB (App Bundle) | Upload para Google Play |

## Como rodar build EAS

### Local (recomendado para Preview)

Ja temos `expert-na-biblia-release.keystore` em `android/app/`. Para build local com EAS:

```bash
# Build local (usa o keystore local)
eas build --profile preview --platform android --local

# Gera APK em: ./build-*.apk (caminho impresso no fim)
```

### Nuvem (necessita conta Expo)

```bash
# Build na nuvem (EAS sobe keystore)
eas build --profile preview --platform android

# Resultado: URL para download do .apk + credenciais de instalacao
```

## Submit automatico (Play Store)

### 1. Criar Google Cloud Service Account

1. Acesse https://console.cloud.google.com/
2. Crie projeto ou use existente
3. Ative **Google Play Android Developer API**
4. Crie **Service Account** com role "Service Account User"
5. Baixe JSON key → salve como `./google-service-account.json` na raiz do projeto
6. **IMPORTANTE**: nunca commitar este arquivo (ja esta no .gitignore)

### 2. Vincular ao Play Console

1. Google Play Console → Setup → API access
2. Em "Service accounts" clique no service account criado
3. Conceda permissao: "Release manager" ou "Admin"
4. Salve

### 3. Submit

```bash
# Build + submit automatico (production profile)
eas submit --platform android --latest

# Ou build + submit em 1 comando
eas build --profile production --platform android --auto-submit
```

## Custo / limites (free tier)

- **Free**: 30 builds/mes por plataforma
- **Hobby plan**: $99/mes (builds ilimitados)
- Para nosso cenario (1 build por versao), free tier basta

## Backup do keystore (CRITICO)

A EAS guarda o keystore automaticamente quando voce roda `eas build --platform android` pela primeira vez (faz upload do `expert-na-biblia-release.keystore` para Expo servers). Mas se perder acesso a Expo account, voce perde o keystore.

**Recomendacao**: backup local + cofre de senhas + 1 copia no Google Drive privado.

## Troubleshooting comum

| Erro | Causa | Solucao |
|------|-------|---------|
| `Project not configured` | `eas init` nao rodou | Rodar `eas init` no projeto |
| `Build failed: gradle` | Config invalida em app.json/build.gradle | Ver `eas build:view` para logs |
| `Invalid credentials` | Service account sem permissao | Re-conectar no Play Console |
| `APK not signed` | Keystore nao encontrado | Verificar `android/app/expert-na-biblia-release.keystore` existe |
| `Version code already used` | Ja subiu essa versao | Incrementar `versionCode` em app.json/app.config.ts |

## Referencias

- Docs oficiais: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- Pricing: https://expo.dev/pricing