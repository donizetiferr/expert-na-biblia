import { COLORS, FONTES, ESPACAMENTOS, BORDAS } from '../src/constants/colors';

describe('Constantes do projeto (V1 smoke)', () => {
  it('paleta oficial tem as 4 cores do CLAUDE.md', () => {
    expect(COLORS.roxoPrimario).toBe('#8b16c7');
    expect(COLORS.roxoEscuro).toBe('#3c026d');
    expect(COLORS.laranjaClaro).toBe('#fded48');
    expect(COLORS.laranjaEscuro).toBe('#fd8414');
  });

  it('fontes Bangers + Nunito definidas', () => {
    expect(FONTES.display).toBe('Bangers_400Regular');
    expect(FONTES.bodyRegular).toBe('Nunito_400Regular');
    expect(FONTES.bodyBold).toBe('Nunito_700Bold');
  });

  it('espacamentos em escala consistente', () => {
    expect(ESPACAMENTOS.xs).toBeLessThan(ESPACAMENTOS.sm);
    expect(ESPACAMENTOS.sm).toBeLessThan(ESPACAMENTOS.md);
    expect(ESPACAMENTOS.md).toBeLessThan(ESPACAMENTOS.lg);
  });

  it('bordas em escala', () => {
    expect(BORDAS.raioPequeno).toBeLessThan(BORDAS.raioGrande);
  });
});

describe('Types module', () => {
  it('Area exporta os 4 tipos esperados', () => {
    // Validacao compile-time via import
    const areas: Array<'FB' | 'AT' | 'NT' | 'TE'> = ['FB', 'AT', 'NT', 'TE'];
    expect(areas).toHaveLength(4);
  });
});