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
      tomador: { cpf: '123', endereco: { municipio: 'ABC' } },
      destinatario: { cnpj: 'abc', endereco: { municipio: '123' } },
      servico: { ...sampleDpsInput.servico, codigoTributacaoNacional: 'abc', descricao: '' },
    });

    expect(issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining([
        'dataHoraEmissao',
        'municipioEmissao',
        'prestador.cnpj',
        'tomador.cpf',
        'tomador.endereco.municipio',
        'destinatario.cnpj',
        'destinatario.endereco.municipio',
        'servico.codigoTributacaoNacional',
        'servico.descricao',
      ]),
    );
  });

  test('rejeita datas impossíveis e Date inválido', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      dataHoraEmissao: '2026-13-40T99:99:99-03:00',
      dataCompetencia: '2026-02-30',
    });
    const invalidDateIssues = validateDpsInput({ ...sampleDpsInput, dataHoraEmissao: new Date('invalid') });

    expect(issues.map((issue) => issue.field)).toEqual(expect.arrayContaining(['dataHoraEmissao', 'dataCompetencia']));
    expect(invalidDateIssues.map((issue) => issue.field)).toContain('dataHoraEmissao');
  });

  test('não valida domínio nem normaliza códigos IBS/CBS', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      ibsCbs: {
        ...sampleDpsInput.ibsCbs!,
        codigoIndicadorOperacao: 'ABC100301',
        classificacaoTributaria: 'ABC000001',
      },
    });

    expect(issues.map((issue) => issue.field)).not.toEqual(
      expect.arrayContaining(['ibsCbs.codigoIndicadorOperacao', 'ibsCbs.classificacaoTributaria']),
    );
  });

  test('rejeita código municipal sem dígitos em modo estrito', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      servico: { ...sampleDpsInput.servico, codigoTributacaoMunicipal: 'ABC' },
    });

    expect(issues.map((issue) => issue.field)).toContain('servico.codigoTributacaoMunicipal');
  });

  test('rejeita código nacional com caracteres que não são formatação', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      servico: { ...sampleDpsInput.servico, codigoTributacaoNacional: 'ABC010301' },
    });

    expect(issues.map((issue) => issue.field)).toContain('servico.codigoTributacaoNacional');
  });

  test('rejeita série e número DPS com caracteres não numéricos', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      serie: 'A1',
      numeroDps: 'RPS10',
    });

    expect(issues.map((issue) => issue.field)).toEqual(expect.arrayContaining(['serie', 'numeroDps']));
  });

  test('rejeita idDps manual com formato inválido', () => {
    const issues = validateDpsInput({ ...sampleDpsInput, idDps: 'ABC' });

    expect(issues.map((issue) => issue.field)).toContain('idDps');
  });
});
