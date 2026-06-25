/**
 * V18.1 (MA.5) — regra de cadeado sequencial (lib/progressao.moduloLiberado).
 */
import { moduloLiberado } from '../src/lib/progressao';
import type { Modulo } from '../src/types';

function mod(id: string, ordem: number, concluido: boolean): Modulo {
  return { id, ordem, area: 'FB', nome: id, concluido };
}

describe('moduloLiberado', () => {
  const lista: Modulo[] = [
    mod('FB01', 1, false),
    mod('FB02', 2, false),
    mod('FB03', 3, false),
  ];

  it('o primeiro modulo esta SEMPRE liberado', () => {
    expect(moduloLiberado(0, lista)).toBe(true);
    expect(moduloLiberado(0, [mod('FB01', 1, false)])).toBe(true);
  });

  it('modulo 2 fica BLOQUEADO enquanto o 1 nao esta concluido', () => {
    expect(moduloLiberado(1, [mod('FB01', 1, false), mod('FB02', 2, false)])).toBe(false);
  });

  it('modulo 2 LIBERA quando o 1 esta concluido (prova do desbloqueio MA.5)', () => {
    expect(moduloLiberado(1, [mod('FB01', 1, true), mod('FB02', 2, false)])).toBe(true);
  });

  it('depende exclusivamente do modulo imediatamente anterior', () => {
    const l = [mod('FB01', 1, true), mod('FB02', 2, false), mod('FB03', 3, false)];
    expect(moduloLiberado(2, l)).toBe(false); // FB02 nao concluido -> FB03 bloqueado
    l[1]!.concluido = true;
    expect(moduloLiberado(2, l)).toBe(true);
  });
});
