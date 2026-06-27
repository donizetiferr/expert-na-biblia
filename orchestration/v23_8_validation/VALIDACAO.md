# Validação empírica V23.8 (milestone H) — 2026-06-27

APK: `dist/ExpertNaBiblia-v23.8.0.apk` (vc14/1.19.0, 105MB). Emulador hi-res 1080x1920.
Instalado via `adb install -r` (UPGRADE sobre V23.7) — testa migration 004 + preservação de progresso.

## Gates
- tsc 0 | jest 175/175 (22 suites; +16 cosmeticos) | eslint 0 | gradle assembleRelease BUILD SUCCESSFUL.

## Logcat (upgrade)
- `[analytics] app_open` + `[layout] migrations+seed OK` ao iniciar → migration 004 (`user_cosmeticos`)
  aplicada no upgrade SEM crash. Progresso preservado (CTA "CONTINUAR" presente em /modos).
- 0 FATAL EXCEPTION / 0 ReactNativeJS Error (apenas warnings de sistema trichromelibrary, alheios ao app).

## Screenshots (telas reais)
- `00_landing.png` — /modos pós-upgrade (CONTINUAR + progresso preservado).
- `01_trilha.png` — **H.1**: /licoes virou TRILHA serpenteante. "VOCÊ ESTÁ AQUI" no nó 01 (Alfabetização
  Bíblica, glow laranja), caminho de pontos, nó 02 "Panorama Bíblico" bloqueado/dimmed + cadeado à direita.
  Header (🔥1, Nível 2, 100 XP, Meta ✓, Módulos 0/40) preservado.
- `02_modos_cards.png` — entry points novos em /modos: COLEÇÕES (📁) + VISUAL (🎨 cosméticos).
- `03_colecoes.png` — **H.2**: /colecoes com FB 0/18, AT 0/18, NT 0/4 (+ TE), barra/% por área,
  "Total: 0/40 módulos colecionados". Reflete o schema real (18+18+4 = 40).
- `04_cosmeticos.png` — **H.3**: /cosmeticos. Preview (mascote dourado + chip Nível 2). TEMA DE COR:
  Clássico Equipado ✓, Realeza Disponível (nível 2), Ouro/Oliveira/Celeste bloqueados por nível.
- `05_equipar_realeza.png` — **H.3 equip**: tocar Realeza → vira "Equipado" ✓, Clássico vira "Disponível",
  e o preview muda AO VIVO (borda + chip "NÍVEL 2" ficam ROXOS). Acento aplicado.
- `06_auras.png` — **H.3 aura**: AURA DO MASCOTE — Mística Equipado ✓, Áurea Disponível, Celeste/Esmeralda
  bloqueados por nível. Equip persistiu nas duas categorias.

## Nota honesta
- O acento do tema também é aplicado à barra de XP do HeaderProgresso (código wired, carrega `obterCorTema`
  ao focar). Não é visualmente demonstrável neste estado porque o usuário está com exatamente 100 XP = início
  do nível 2 (barra do nível em 0% de preenchimento). O preview da tela de cosméticos (borda + chip) é a prova
  visual clara da troca de acento. A persistência é via SQLite (`user_cosmeticos`).
