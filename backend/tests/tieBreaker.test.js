const { resolveTie } = require('../src/utils/tieBreaker');

describe('Tie-Breaker Utility', () => {
  test('should return null for empty array', () => {
    expect(resolveTie([], 'random')).toBeNull();
  });

  test('should return the only card if length is 1', () => {
    expect(resolveTie(['AH'], 'random')).toBe('AH');
  });

  test('should pick one randomly for "random" rule', () => {
    const tied = ['AH', 'KS', '2D'];
    const result = resolveTie(tied, 'random');
    expect(tied).toContain(result);
  });

  test('should pick lowest rank for "rank_order"', () => {
    const tied = ['3H', '2S', 'KH'];
    expect(resolveTie(tied, 'rank_order')).toBe('2S');
  });

  test('should use suit order if ranks are same in "rank_order"', () => {
    // Suit order: S > H > C > D
    const tied = ['AH', 'AS', 'AD', 'AC'];
    expect(resolveTie(tied, 'rank_order')).toBe('AS');
  });
});
