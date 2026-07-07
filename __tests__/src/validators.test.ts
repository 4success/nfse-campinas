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
      tomador: { cpf: '123' },
      destinatario: { cnpj: 'abc' },
      servico: { ...sampleDpsInput.servico, codigoTributacaoNacional: 'abc', descricao: '' },
    });

    expect(issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining([
        'dataHoraEmissao',
        'municipioEmissao',
        'prestador.cnpj',
        'tomador.cpf',
        'destinatario.cnpj',
        'servico.codigoTributacaoNacional',
        'servico.descricao',
      ]),
    );
  });

  test('rejeita código municipal sem dígitos em modo estrito', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      servico: { ...sampleDpsInput.servico, codigoTributacaoMunicipal: 'ABC' },
    });

    expect(issues.map((issue) => issue.field)).toContain('servico.codigoTributacaoMunicipal');
  });
});
