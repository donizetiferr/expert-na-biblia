# Release Artifacts — Expert Na Biblia

> Ultima atualizacao: 2026-06-25 (V17 — Play Store prep + EAS build)
> Status: **V17 ENTREGUE** (AAB + APK + keystore release + gradle signing + EAS config + docs)
> Versao: **1.7.0** (versionCode 2)

## Artefatos V17

| Arquivo | Tamanho | SHA256 | Path |
|---------|---------|--------|------|
| **AAB v17** | 73.432.746 bytes (~70 MB) | `1bbcef4fe3a8787d5fc6d26813aefcdae28796913dca6dabbb9d46b10d715e34` | `C:\ENB\dist\ExpertNaBiblia-v17.0.0.aab` |
| **APK universal v17** | 45.026.598 bytes (~43 MB) | `35d83415acbb25d1bd08d74a8c3d74a4b62c3e1961bdee20bb78b617c261ddef` | `C:\ENB\dist\ExpertNaBiblia-v17.0.0-universal.apk` |
| **APKs set v17** | 158.907.477 bytes (~152 MB) | (split APKs por ABI/density/locale) | `C:\ENB\dist\ExpertNaBiblia-v17.0.0.apks` |
| **Keystore release** | 2.796 bytes | SHA256 `BD:DC:CB:57:26:5C:61:AD:3E:DC:6D:BA:87:D5:E3:B2:0A:46:7F:6C:27:A6:98:E2:63:B9:2F:A4:53:37:5D:E2` | `C:\ENB\android\app\expert-na-biblia-release.keystore` |

Copia sincronizada em:
- `C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia\dist\ExpertNaBiblia-v17.0.0.aab`
- `C:\Users\Donizeti\Downloads\Projetos_VSCode\Pessoal\Expert Na Bíblia\dist\ExpertNaBiblia-v17.0.0-universal.apk`

## Stack V17

- **React Native**: 0.83.6 (Expo SDK 55)
- **Java**: OpenJDK 17.0.18 (Temurin)
- **Android SDK**: build-tools 35.0.0
- **Gradle**: 9.0.0
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Compile SDK**: 35
- **versionCode**: 2 (incrementado de 1 em V17)
- **versionName**: 1.7.0

## Como foi feito (V17 T1-T6)

1. **T1**: Gerado `expert-na-biblia-release.keystore` (RSA 2048, validade 10000 dias)
2. **T2**: Editado `android/app/build.gradle` — `signingConfigs.release` + `signingConfig signingConfigs.release` em `buildTypes.release`
3. **T3**: eas.json ja estava correto; criado `orchestration/eas_setup.md`
4. **T4**: Atualizado `orchestration/play_store_checklist.md` com asset checklist oficial
5. **T5**: `./gradlew clean bundleRelease` — BUILD SUCCESSFUL em 8m 54s (570 tasks, 64 executed)
6. **T6**: `bundletool validate` (exit 0) + `build-apks` (universal APK extraido)

## Pendencias do usuario (Play Store submission)

- [ ] Configurar Google Cloud Service Account (ver `orchestration/eas_setup.md`)
- [ ] Configurar `google-service-account.json` na raiz (NUNCA versionar)
- [ ] Tirar 6 screenshots de store listing (instalar APK em emulador + `adb exec-out screencap`)
- [ ] Criar feature graphic 1024x500 PNG
- [ ] Submeter via Play Console (2FA irredutivel) OU `eas submit --platform android --latest`
- [ ] Aguardar revisao Google (1-7 dias)

## Backup critico

**O keystore `expert-na-biblia-release.keystore` EH A IDENTIDADE do app na Play Store.**
- Se perder, NAO podera mais publicar atualizacoes (assinatura muda)
- Backup local + cofre + Google Drive privado
- Detalhes: `orchestration/release_keystore_credentials.md`