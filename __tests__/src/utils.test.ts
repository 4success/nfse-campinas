import { formatDecimal, roundHalfEven } from '../../src/utils/decimals';
import { redactSensitiveXml } from '../../src/utils/redact';

describe('utils', () => {
  test('mascara CNPJ antes de CPF sem vazar sufixo', () => {
    expect(redactSensitiveXml('<CNPJ>12345678000199</CNPJ><CPF>12345678901</CPF>')).toBe(
      '<CNPJ>***CNPJ***</CNPJ><CPF>***CPF***</CPF>',
    );
  });

  test('arredonda half-even sem ponto flutuante', () => {
    expect(roundHalfEven('1.015', 2)).toBe('1.02');
    expect(roundHalfEven('1.025', 2)).toBe('1.02');
    expect(formatDecimal('26947.275', 2)).toBe('26947.28');
  });
});
