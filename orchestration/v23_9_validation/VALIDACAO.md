# Validação empírica V23.9 (milestone I) — 2026-06-27

APK: `dist/ExpertNaBiblia-v23.9.0.apk` (vc15/1.20.0, 105MB). Emulador hi-res 1080x1920.
Instalado via `adb install -r` (UPGRADE sobre V23.8) — testa migration 005 + perfil default + preservação.

## Gates
- tsc 0 | jest 188/188 (23 suites; +13: perfis + quiz kids) | eslint 0 | gradle assembleRelease BUILD SUCCESSFUL.

## Logcat (upgrade)
- `[analytics] app_open` + `[layout] migrations+seed OK` → migration 005 (`perfis`/`perfil_ativo`/`perfil_estado`)
  aplicada no upgrade SEM crash; perfil "default" (Eu) criado herdando o progresso global existente.
- 0 FATAL EXCEPTION em toda a jornada (criar perfil + 2 trocas).

## Teste crítico — isolamento + preservação de progresso (snapshot-swap)
- `00_modos_perfil.png` — pill "👤 Eu ⇄" no topo de /modos (perfil default). Progresso preservado (CONTINUAR).
- `01_perfis.png` — /perfis: "Eu / Adulto" ATIVO + "+ Adicionar perfil".
- `02_form.png` / `03b_form_preenchido.png` — formulário Novo perfil (nome + Adulto/Kids), "Bia" + Kids.
- `04_lista_2perfis.png` — "Bia / Modo Kids" (🧒) criado, listado com "Trocar ›".
- `05_modos_kids.png` — após trocar p/ Bia: pill "🧒 Bia MODO KIDS ⇄" (I.2 badge + I.3 troca). 0 FATAL.
- `06_licoes_kids_zerado.png` — **ISOLAMENTO**: Bia (kids) zerado → 🔥0, NÍVEL 1, 0 XP, Meta 0/50, Módulos 0/40.
  (vs "Eu" que tinha 100 XP / Nível 2 / 🔥1.)
- `07_perfis_para_voltar.png` — Bia agora ATIVO; "Eu" com "Trocar ›".
- `08_eu_restaurado.png` — **PRESERVAÇÃO**: ao voltar p/ "Eu", progresso RESTAURADO idêntico →
  🔥1, NÍVEL 2, 100 XP, Meta ✓ 100/50 XP. Nenhum dado perdido na ida-e-volta.

## Conclusão
- I.1 multi-perfil: progresso isolado por perfil E preservado na troca (save-slot transacional). COMPROVADO.
- I.2 Modo Kids: badge no hub + texto maior (useFontScale) + quiz prioriza FACIL (unit-tested). Banco Kids
  dedicado via M2.7 é follow-up.
- I.3 seletor: pill + criar/trocar perfil em 1-2 toques. COMPROVADO.
