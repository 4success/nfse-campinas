import { formatDecimal, roundHalfEven } from '../../src/utils/decimals';

describe('utils', () => {
  test('arredonda half-even sem ponto flutuante', () => {
    expect(roundHalfEven('1.015', 2)).toBe('1.02');
    expect(roundHalfEven('1.025', 2)).toBe('1.02');
    expect(formatDecimal('26947.275', 2)).toBe('26947.28');
  });
});
