# Validação empírica V23.11 (milestone K) — 2026-06-27

APK: `dist/ExpertNaBiblia-v23.11.0.apk` (vc17/1.22.0, 105MB). Emulador hi-res 1080x1920.
Instalado via `adb install -r` (UPGRADE sobre V23.10) — testa migration 007.

## Gates
- tsc 0 | jest 216/216 (26 suites; +13: desafios, incl. computus da Páscoa validado vs 2024-2027) | eslint 0.
- gradle assembleRelease BUILD SUCCESSFUL.

## Logcat (upgrade)
- `[layout] migrations+seed OK` → migration 007 (`desafio_progresso`) aplicada no upgrade SEM crash. 0 FATAL.

## Screenshots
- `00_modos.png` — card "🏆 DESAFIOS — missões diárias e eventos" no hub (após CONTINUAR).
- `01_desafios.png` — **K.2**: /desafios. DESAFIO DO DIA "Foco total — Ganhe 30 XP hoje" 30/30 (verde,
  Resgatar +15 XP); DESAFIO DA SEMANA "Maratona — Ganhe 150 XP" 110/150 (Em andamento). Sem card sazonal
  (27/jun não é janela litúrgica — comportamento correto).
- `02_resgatado.png` — **K.2 resgate**: Desafio do dia → "✓ Resgatado". O bônus +15 XP foi REALMENTE
  concedido: o medidor semanal subiu de 110 para 125 XP (o XP do resgate entrou em user_xp).

## K.1 sazonal
- `eventoSazonal` (Natal/Páscoa/Quaresma via computus de Gauss) é unit-tested contra datas conhecidas.
  Em 27/jun não há evento ativo (correto). O card "EVENTO ESPECIAL" aparece nas janelas litúrgicas.

## K.3 win-back
- `agendarWinBack(3)` é chamado a cada abertura (reagenda p/ frente; só dispara após 3 dias inativo).
  No-op sem permissão de notificação (não concedida neste perfil de teste). Wired + defensivo.

## K.4
- Desafiar amigo: BACKLOG (não implementado, por decisão do team-lead).
