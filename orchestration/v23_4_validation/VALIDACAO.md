# Validação empírica V23.4 (D.5 versículo do dia) — emulador hi-res — 2026-06-27

APK: dist/ExpertNaBiblia-v23.4.0.apk (vc10/1.15.0). UPGRADE sobre V23.3. 0 FATAL EXCEPTION.

## Screenshot
- 01_versiculo.png: **D.5 COMPROVADO** — card "📖 VERSÍCULO DE HOJE" no rodape de /modos:
  "Mas os que esperam no Senhor renovam as suas forças. Voam alto como águias." — Isaías 40:31,
  com botoes "Li hoje" (marca pratica -> streak) e "Compartilhar" (Share). /modos como ScrollView
  acomoda CONTINUAR + cards + versiculo sem estourar a dobra.

## Cobertura
- D.5 versiculo do dia: COMPROVADO (card renderiza, versiculo deterministico por dia do ano, share +
  "li hoje"). Logica pura unit-tested (versiculo-do-dia.test.ts: catalogo, diaDoAno, determinismo).

## Pendente do milestone D (proximas versoes — precisam batch M2.7)
- D.1 conteudo didatico (campo explicacao por licao), D.2 revisao espacada/Leitner, D.3 novos
  formatos (completar-versiculo), D.4 refs biblicas no feedback (campo existe, NULL — seedar via batch).

## Gates
- tsc --noEmit: 0 | jest: 144/144 (18 suites, +5) | eslint: 0
