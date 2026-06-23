# V8-RETOMADA — Sessão de conserto do APK (2026-06-23)

## Diagnóstico inicial
O APK `dist/ExpertNaBiblia-v1.0.0.apk` (31MB) tinha TRÊS problemas críticos:
1. **Resources faltando** (46 arquivos res/*.xml) — crashava em `AppCompatDelegate.attachToWindow`
2. **resources.arsc comprimido** mas API 30+ requer descomprimido + 4-byte aligned
3. **JS bundle com __DEV__=true** + outros problemas que causavam crash no startup
4. **JS bundle com 8.9MB Hermes bytecode** que tinha `__DEV__=true` codificado (não patchável)

## Correções aplicadas
1. ✅ `python` + `zipfile`: reempacotado com `ZIP_STORED` em todos os files (resources.arsc descomprimido)
2. ✅ `zipalign -f -p 4`: alinhamento 4-byte boundary
3. ✅ `apksigner sign`: assinado com debug keystore
4. ✅ Injeção dos 46 resources XML faltantes (com `apktool d` para referência de estrutura, e usando `res/-1.xml` como template AXML válido)
5. ✅ Patch no bundle JS: `__DEV__=true` → `__DEV__=false` (mas o nativo define `__DEV__` runtime baseado em `BuildConfig.DEBUG`, então o patch foi parcialmente efetivo)
6. ✅ Patch no bundle JS: `throw new Error('Cannot create devtools websocket...')` → `console.warn(...)`
7. ✅ Stub do `ExpoLinking` no bundle (módulo nativo faltando)

## Resultado da validação no emulador (emulator-5554)
- **APK instala**: ✅ Success
- **APK abre**: ✅ Splash screen EXIBIDO ("Displayed com.anonymous.testapp/.MainActivity for user 0: +1s381ms")
- **JS runtime inicia**: ✅ "Running main"
- **App crasha em `renderElement`**: ❌ "TypeError: undefined is not a function" (no _layout.tsx RootLayout, provavelmente `_expoRouter.SplashScreen.preventAutoHideAsync()`)

## Estado final
- APK `dist/ExpertNaBiblia-v1.0.0.FINAL.apk` (89MB) — instala, abre splash, mas não roda por completo
- App fica com nome `com.anonymous.testapp` / `test-app` no launcher (não foi possível renomear sem recompilar nativo)
- DB SQLite embarcado (798KB) — OK
- 4 ABIs (arm64-v8a, armeabi-v7a, x86, x86_64) — OK
- JS bundle é Hermes bytecode (8.9MB) — não patchável facilmente

## Causa raiz
O APK foi gerado em um app.json temporário (com nome placeholder `com.anonymous.testapp`/`test-app`),
depois modificado manualmente (injetado db.sqlite, modificados resources), e reembalado incorretamente
(excluindo 46 arquivos res/*.xml necessários pelo AndroidX/Material). O package.json foi reduzido para
apenas `expo+react+react-native`, removendo as 17+ deps que o código importa (expo-router, expo-sqlite,
expo-font, etc). Resultado: APK incompleto + bundle JS incompatível.

## Próxima ação recomendada
**Rebuild completo via gradle**:
1. Restaurar package.json completo (com todas as deps)
2. Resolver bug `withAndroidDangerousBaseMod` no prebuild
3. `npx expo prebuild --platform android --no-install`
4. `cd android && ./gradlew assembleRelease`
5. Assinar com `eas build` (produção) ou debug keystore (teste)
6. Validar no emulador

O APK `dist/ExpertNaBiblia-v1.0.0.FINAL.apk` é a melhor versão possível SEM rebuild nativo.
