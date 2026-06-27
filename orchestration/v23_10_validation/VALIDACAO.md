# Validação empírica V23.10 (milestone J) — 2026-06-27

APK: `dist/ExpertNaBiblia-v23.10.0.apk` (vc16/1.21.0, 105MB). Emulador hi-res 1080x1920.
Instalado via `adb install -r` (UPGRADE sobre V23.9) — testa migration 006 + seed de referência.

## Gates
- tsc 0 | jest 203/203 (25 suites; +15: enciclopedia + planos) | eslint 0 | gradle BUILD SUCCESSFUL.

## Logcat (upgrade)
- `[layout] migrations+seed OK` → migration 006 (`enciclopedia`/`plano_leitura`/`plano_dia`/`plano_progresso`)
  + seed de referência aplicados no upgrade SEM crash. 0 FATAL em toda a jornada.

## Screenshots
- `00_modos_cards.png` — /modos com os entrypoints novos: BÍBLIA (📖 enciclopédia) + PLANOS (📅 de leitura).
- `01_enciclopedia.png` — **J.1**: /enciclopedia com busca + filtros (Todos/Personagens/Termos/Eventos) +
  verbetes seedados (Abraão, Adão, Aliança, Apóstolo, Arrependimento, Daniel…) com emoji por tipo.
- `02_verbete_modal.png` — **J.1 detalhe**: modal "ABRAÃO" → resumo "O pai da fé e das nações" + detalhe
  completo + "📖 Gênesis 12-25" + Fechar.
- `03_planos_lista.png` — **J.2**: /planos com "7 dias nos Salmos" + "A vida de Jesus em 7 dias" (7 dias cada).
- `04_plano_dias.png` — plano aberto: "0/7 dias concluídos", dias com título + passagem (Salmo 23…) +
  reflexão + "Marcar como lido".
- `05_dia_lido.png` — **J.2 marcar**: Dia 1 → "✓ Lido" (verde), contador "1/7 dias concluídos". A marcação
  registra atividade (mantém streak) + concede XP (código wired).

## J.3 "Saiba mais"
- Wired no feedback das lições (`encontrarVerbeteEm(resposta_correta)` → "📚 Saiba mais: [nome]" abre o
  verbete). O match (`nomeApareceEm`, palavra inteira sem acento) é coberto por teste unitário. Não foi
  exercitado empiricamente porque exige jogar uma lição cuja resposta case um verbete do acervo.
