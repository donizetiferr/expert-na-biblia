// Mocka a camada de DB (expo-sqlite nao e transformado pelo Jest). As funcoes puras
// testadas aqui nao tocam o banco; o mock so evita o import transitivo de expo-sqlite.
jest.mock('../../db/database', () => ({
  getDatabase: jest.fn(() => {
    throw new Error('mock: sem db nos testes de funcao pura');
  }),
}));

import { embaralhar, montarItem } from '../completar';

/**
 * V23.5 (D.3): testes das funcoes puras do "completar versiculo".
 */
describe('completar (D.3) — funcoes puras', () => {
  describe('embaralhar', () => {
    it('preserva todos os elementos (sem perder/duplicar)', () => {
      const input = ['a', 'b', 'c', 'd'];
      const out = embaralhar(input);
      expect(out.slice().sort()).toEqual(['a', 'b', 'c', 'd']);
    });
    it('nao muta o array original', () => {
      const input = ['a', 'b', 'c'];
      const copia = [...input];
      embaralhar(input);
      expect(input).toEqual(copia);
    });
  });

  describe('montarItem', () => {
    const linhaValida = {
      id: 'CV001',
      referencia: 'Salmos 23:1',
      texto_com_lacuna: 'O Senhor é o meu _____, nada me faltará.',
      resposta: 'pastor',
      distratores: JSON.stringify(['amigo', 'guia', 'protetor']),
    };

    it('monta item jogavel com 4 opcoes incluindo a resposta', () => {
      const item = montarItem(linhaValida);
      expect(item).not.toBeNull();
      expect(item!.opcoes).toHaveLength(4);
      expect(item!.opcoes).toContain('pastor');
      expect(item!.resposta).toBe('pastor');
      expect(item!.referencia).toBe('Salmos 23:1');
    });

    it('retorna null se ha menos de 3 distratores', () => {
      expect(montarItem({ ...linhaValida, distratores: JSON.stringify(['amigo', 'guia']) })).toBeNull();
    });

    it('retorna null se distratores nao e JSON valido', () => {
      expect(montarItem({ ...linhaValida, distratores: 'nao-e-json' })).toBeNull();
    });

    it('retorna null se a resposta esta vazia', () => {
      expect(montarItem({ ...linhaValida, resposta: '' })).toBeNull();
    });
  });
});
