import { DpsXmlBuilder } from '../../src/dps/DpsXmlBuilder';
import {
  normalizeCodigoTributacaoMunicipal,
  normalizeCodigoTributacaoNacional,
  normalizeNbs,
} from '../../src/dps/normalize';
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

  test('normaliza códigos fiscais e escapa XML', () => {
    const { xml } = new DpsXmlBuilder().build(sampleDpsInput);

    expect(normalizeCodigoTributacaoNacional('01.03.01')).toBe('010301');
    expect(normalizeCodigoTributacaoMunicipal('1')).toBe('001');
    expect(normalizeNbs('1.1506.90.00')).toBe('115069000');
    expect(xml).toContain('<cTribNac>010301</cTribNac>');
    expect(xml).toContain('<cTribMun>001</cTribMun>');
    expect(xml).toContain('<cNBS>115069000</cNBS>');
    expect(xml).toContain('TOMADOR LTDA &amp; CIA');
    expect(xml).not.toContain('<dest>');
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
    expect(xml).toContain('<cClassTrib>ABC000001</cClassTrib>');
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
});
