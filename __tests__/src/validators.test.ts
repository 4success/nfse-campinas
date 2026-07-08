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

  test('rejeita grupo IBS/CBS incompleto quando informado', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      ibsCbs: {} as any,
    });

    expect(issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining([
        'ibsCbs.finalidadeNfse',
        'ibsCbs.codigoIndicadorOperacao',
        'ibsCbs.indicadorDestinatario',
        'ibsCbs.classificacaoTributaria',
      ]),
    );
  });

  test('aceita CNPJ alfanumérico válido', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      prestador: { ...sampleDpsInput.prestador, cnpj: 'AB.345.678/0001-99' },
    });

    expect(issues.map((issue) => issue.field)).not.toContain('prestador.cnpj');
  });

  test('rejeita CPF e CNPJ malformados antes de normalizar', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      prestador: { ...sampleDpsInput.prestador, cnpj: 'ABC12345678000199' },
      tomador: { cpf: 'ABC12345678901' },
    });

    expect(issues.map((issue) => issue.field)).toEqual(expect.arrayContaining(['prestador.cnpj', 'tomador.cpf']));
  });

  test('rejeita entidades com CPF e CNPJ simultâneos', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      prestador: { ...sampleDpsInput.prestador, cpf: '123.456.789-01' },
      tomador: { ...sampleDpsInput.tomador!, cpf: '123.456.789-01' },
      destinatario: { cpf: '123.456.789-01', cnpj: '12.345.678/0001-99' },
    });

    expect(issues.map((issue) => issue.field)).toEqual(expect.arrayContaining(['prestador', 'tomador', 'destinatario']));
  });

  test('rejeita municípios malformados antes de normalizar', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      municipioEmissao: 'ABC3509502',
      tomador: { ...sampleDpsInput.tomador!, endereco: { ...sampleDpsInput.tomador!.endereco!, municipio: 'ABC3509502' } },
      servico: { ...sampleDpsInput.servico, municipioPrestacao: 'ABC3509502' },
    });

    expect(issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining(['municipioEmissao', 'tomador.endereco.municipio', 'servico.municipioPrestacao']),
    );
  });

  test.each(['ABC', 'ABC12', '-1'])('rejeita código municipal malformado em modo estrito: %s', (codigo) => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      servico: { ...sampleDpsInput.servico, codigoTributacaoMunicipal: codigo },
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

  test('rejeita valores monetários negativos', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      valores: {
        ...sampleDpsInput.valores,
        valorServico: '-1',
        valorDescontoIncondicionado: '-0.01',
        tributacaoFederal: {
          ...sampleDpsInput.valores.tributacaoFederal,
          valorRetidoIrrf: '-1',
          pisCofins: {
            ...sampleDpsInput.valores.tributacaoFederal!.pisCofins!,
            valorPis: '-1',
          },
        },
      },
    });

    expect(issues.map((issue) => issue.field)).toEqual(
      expect.arrayContaining([
        'valores.valorServico',
        'valores.valorDescontoIncondicionado',
        'valores.tributacaoFederal.valorRetidoIrrf',
        'valores.tributacaoFederal.pisCofins.valorPis',
      ]),
    );
  });

  test.each([undefined, null, ''])('rejeita tipoEmitente obrigatório: %s', (tipoEmitente) => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      tipoEmitente: tipoEmitente as any,
    });

    expect(issues.map((issue) => issue.field)).toContain('tipoEmitente');
  });

  test('rejeita idDps manual com formato inválido', () => {
    const issues = validateDpsInput({ ...sampleDpsInput, idDps: 'ABC' });

    expect(issues.map((issue) => issue.field)).toContain('idDps');
  });

  test('aceita idDps manual com CNPJ alfanumérico', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      prestador: { ...sampleDpsInput.prestador, cnpj: 'AB.345.678/0001-99' },
      idDps: 'DPS35095022AB34567800019900001000000000000001',
    });

    expect(issues.map((issue) => issue.field)).not.toContain('idDps');
  });

  test('rejeita idDps manual inconsistente com os dados da DPS', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      idDps: 'DPS350950221234567800019900001000000000000002',
    });

    expect(issues.map((issue) => issue.field)).toContain('idDps');
  });

  test('rejeita idDps manual com letras no bloco de CPF', () => {
    const issues = validateDpsInput({
      ...sampleDpsInput,
      idDps: 'DPS35095021AB34567800019900001000000000000001',
    });

    expect(issues.map((issue) => issue.field)).toContain('idDps');
  });
});
