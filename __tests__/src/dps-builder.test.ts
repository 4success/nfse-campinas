import { DpsXmlBuilder } from '../../src/dps/DpsXmlBuilder';
import { sampleDpsInput } from '../../test-support/fixtures';

describe('DpsXmlBuilder', () => {
  test('gera XML DPS v1.01 em ordem determinística', () => {
    const { xml, idDps } = new DpsXmlBuilder().build(sampleDpsInput);

    expect(idDps).toBe('DPS350950221234567800019900001000000000000001');
    expect(xml).toContain('<DPS versao="1.01">');
    expect(xml).toContain('<infDPS Id="DPS350950221234567800019900001000000000000001">');
    expect(xml.indexOf('<tpAmb>2</tpAmb>')).toBeLessThan(xml.indexOf('<prest>'));
    expect(xml.indexOf('<prest>')).toBeLessThan(xml.indexOf('<toma>'));
    expect(xml.indexOf('<toma>')).toBeLessThan(xml.indexOf('<serv>'));
    expect(xml.indexOf('<serv>')).toBeLessThan(xml.indexOf('<valores>'));
    expect(xml.indexOf('<valores>')).toBeLessThan(xml.indexOf('<IBSCBS>'));
    expect(xml.indexOf('<vServPrest>')).toBeLessThan(xml.indexOf('<trib><tribMun>'));
  });

  test('preserva códigos fiscais e escapa XML', () => {
    const { xml } = new DpsXmlBuilder().build(sampleDpsInput);

    expect(xml).toContain('<cTribNac>01.03.01</cTribNac>');
    expect(xml).toContain('<cTribMun>1</cTribMun>');
    expect(xml).toContain('<cNBS>1.1506.90.00</cNBS>');
    expect(xml).toContain('TOMADOR LTDA &amp; CIA');
    expect(xml).not.toContain('<dest>');
  });

  test('preserva texto fiscal em vez de sanitizar silenciosamente', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      servico: { ...sampleDpsInput.servico, descricao: 'serviço 😀' },
    });

    expect(xml).toContain('<xDescServ>serviço 😀</xDescServ>');
  });

  test('não limpa NBS arbitrário para outro valor fiscal', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      servico: { ...sampleDpsInput.servico, codigoNbs: 'ABC1.1501.10.00' },
    });

    expect(xml).toContain('<cNBS>ABC1.1501.10.00</cNBS>');
  });

  test('normaliza CEP somente quando o formato básico é válido', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      tomador: {
        ...sampleDpsInput.tomador!,
        endereco: { ...sampleDpsInput.tomador!.endereco!, cep: '13000-000' },
      },
    });

    expect(xml).toContain('<CEP>13000000</CEP>');
    expect(() =>
      new DpsXmlBuilder().build({
        ...sampleDpsInput,
        tomador: {
          ...sampleDpsInput.tomador!,
          endereco: { ...sampleDpsInput.tomador!.endereco!, cep: 'ABC13000-000' },
        },
      }),
    ).toThrow('DPS inválida');
  });

  test('emite CNPJ alfanumérico preservando letras', () => {
    const { xml, idDps } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      prestador: { ...sampleDpsInput.prestador, cnpj: 'AB.345.678/0001-99' },
    });

    expect(idDps).toContain('AB345678000199');
    expect(xml).toContain('<CNPJ>AB345678000199</CNPJ>');
  });

  test('suporta Id no elemento DPS e namespace configurável', () => {
    const { xml } = new DpsXmlBuilder({ idAttributeTarget: 'DPS', namespace: 'http://www.sped.fazenda.gov.br/nfse' }).build({
      ...sampleDpsInput,
      xml: undefined,
    });

    expect(xml).toContain('<DPS versao="1.01" xmlns="http://www.sped.fazenda.gov.br/nfse" Id="DPS');
    expect(xml).toContain('<infDPS>');
  });

  test('emite códigos IBS/CBS exatamente como informados', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      ibsCbs: {
        ...sampleDpsInput.ibsCbs!,
        codigoIndicadorOperacao: 'ABC100301',
        classificacaoTributaria: 'ABC000001',
      },
    });

    expect(xml).toContain('<cIndOp>ABC100301</cIndOp>');
    expect(xml).toContain('<gIBSCBS><CST>000</CST><cClassTrib>ABC000001</cClassTrib></gIBSCBS>');
  });

  test('modo warn ainda bloqueia erros estruturais', () => {
    expect(() =>
      new DpsXmlBuilder().build({
        ...sampleDpsInput,
        validationMode: 'warn',
        dataHoraEmissao: '2026-13-40T99:99:99-03:00',
      }),
    ).toThrow('DPS inválida');
  });

  test('modo off permite pular validações locais', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      validationMode: 'off',
      dataHoraEmissao: '2026-13-40T99:99:99-03:00',
    });

    expect(xml).toContain('<dhEmi>2026-13-40T99:99:99-03:00</dhEmi>');
  });

  test('preserva timestamp ISO com precisão maior que milissegundos', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      dataHoraEmissao: '2026-07-08T16:13:36.707848125-03:00',
    });

    expect(xml).toContain('<dhEmi>2026-07-08T16:13:36.707848125-03:00</dhEmi>');
  });

  test.each([null, ''])('bloqueia valorServico %p antes de gerar XML', (valorServico) => {
    expect(() =>
      new DpsXmlBuilder().build({
        ...sampleDpsInput,
        valores: { ...sampleDpsInput.valores, valorServico: valorServico as any },
      }),
    ).toThrow('DPS inválida');
  });

  test('bloqueia CPF e CNPJ simultâneos antes de gerar XML', () => {
    expect(() =>
      new DpsXmlBuilder().build({
        ...sampleDpsInput,
        prestador: { ...sampleDpsInput.prestador, cpf: '123.456.789-01' },
      }),
    ).toThrow('DPS inválida');
  });

  test('bloqueia idDps manual inconsistente antes de gerar XML', () => {
    expect(() =>
      new DpsXmlBuilder().build({
        ...sampleDpsInput,
        idDps: 'DPS350950221234567800019900001000000000000002',
      }),
    ).toThrow('DPS inválida');
  });

  test('bloqueia tipoEmitente ausente antes de gerar XML', () => {
    expect(() =>
      new DpsXmlBuilder().build({
        ...sampleDpsInput,
        tipoEmitente: undefined as any,
      }),
    ).toThrow('DPS inválida');
  });

  test('preserva valor de serviço negativo para validação da Prefeitura', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      valores: { ...sampleDpsInput.valores, valorServico: '-1' },
    });

    expect(xml).toContain('<vServ>-1</vServ>');
  });

  test('preserva valor de serviço com precisão excessiva para validação da Prefeitura', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      valores: { ...sampleDpsInput.valores, valorServico: '1.005' },
    });

    expect(xml).toContain('<vServ>1.005</vServ>');
  });

  test('preserva formatos decimais recebidos', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      valores: {
        ...sampleDpsInput.valores,
        valorServico: ' 5,00 ',
        tributacaoMunicipal: { ...sampleDpsInput.valores.tributacaoMunicipal!, aliquota: '5' },
        tributacaoFederal: {
          ...sampleDpsInput.valores.tributacaoFederal,
          pisCofins: { ...sampleDpsInput.valores.tributacaoFederal!.pisCofins!, valorPis: '175.165' },
        },
        totalTributos: { indicadorTotalTributos: 0, percentualTotalTributos: '12,34' },
      },
    });

    expect(xml).toContain('<vServ> 5,00 </vServ>');
    expect(xml).toContain('<pAliq>5</pAliq>');
    expect(xml).toContain('<vPis>175.165</vPis>');
    expect(xml).toContain('<pTotTrib>12,34</pTotTrib>');
  });

  test('bloqueia IBS/CBS incompleto antes de gerar XML', () => {
    expect(() =>
      new DpsXmlBuilder().build({
        ...sampleDpsInput,
        ibsCbs: {} as any,
      }),
    ).toThrow('DPS inválida');
  });

});
