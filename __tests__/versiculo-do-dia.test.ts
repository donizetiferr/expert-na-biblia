/**
 * V23.D.5: testes do versiculo do dia (puro, deterministico por dia do ano).
 */

import { VERSICULOS, diaDoAno, versiculoDeHoje, textoCompartilhavel } from '../src/lib/versiculo-do-dia';

describe('versiculo-do-dia', () => {
  it('catalogo nao-vazio, cada item com referencia e texto', () => {
    expect(VERSICULOS.length).toBeGreaterThan(0);
    for (const v of VERSICULOS) {
      expect(v.referencia.length).toBeGreaterThan(0);
      expect(v.texto.length).toBeGreaterThan(0);
    }
  });

  it('diaDoAno: 1 em 1 de janeiro, cresce ao longo do ano', () => {
    expect(diaDoAno(new Date('2026-01-01T12:00:00Z'))).toBe(1);
    expect(diaDoAno(new Date('2026-02-01T12:00:00Z'))).toBe(32);
  });

  it('versiculoDeHoje e deterministico para a mesma data', () => {
    const d = new Date('2026-06-27T10:00:00Z');
    expect(versiculoDeHoje(d)).toEqual(versiculoDeHoje(d));
  });

  it('versiculoDeHoje muda entre dias distantes (cobre rotacao)', () => {
    const a = versiculoDeHoje(new Date('2026-01-01T12:00:00Z'));
    const b = versiculoDeHoje(new Date('2026-01-08T12:00:00Z'));
    // 7 dias de diferenca dentro de um catalogo de >=30 garante indices distintos
    expect(a).not.toEqual(b);
  });

  it('textoCompartilhavel inclui texto e referencia', () => {
    const v = { referencia: 'João 3:16', texto: 'Porque Deus amou o mundo' };
    const t = textoCompartilhavel(v);
    expect(t).toContain('João 3:16');
    expect(t).toContain('Porque Deus amou o mundo');
  });
});
