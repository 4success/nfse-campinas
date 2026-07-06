import { validateDpsInput } from '../../src/dps/validators';
import { sampleDpsInput } from '../../test-support/fixtures';

describe('validateDpsInput', () => {
  test('aceita fixture mínima válida', () => {
    expect(validateDpsInput(sampleDpsInput).filter((issue) => issue.severity === 'error')).toEqual([]);
  });

  test('retorna erros estruturais', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      dataHoraEmissao: '2026-06-30T21:41:28',
      municipioEmissao: '123',
      prestador: { cnpj: '123' },
      servico: { ...sampleDpsInput.servico, codigoTributacaoNacional: 'abc', descricao: '' },
    });

    expect(issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining([
        'dataHoraEmissao',
        'municipioEmissao',
        'prestador.cnpj',
        'servico.codigoTributacaoNacional',
        'servico.descricao',
      ]),
    );
  });
});
