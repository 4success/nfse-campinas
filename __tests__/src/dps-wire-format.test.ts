import { DpsXmlBuilder } from '../../src/dps/DpsXmlBuilder';
import { normalizeNumeroDps } from '../../src/dps/normalize';
import { sampleDpsInput } from '../../test-support/fixtures';

describe('formatos da DPS transmitida', () => {
  test.each([
    ['7', '7'],
    ['000000000000007', '7'],
    ['999999999999999', '999999999999999'],
    ['000', '0'],
  ])('separa o número %s do preenchimento usado no Id', (numeroDps, expected) => {
    const { xml, idDps } = new DpsXmlBuilder().build({ ...sampleDpsInput, numeroDps });

    expect(xml).toContain(`<nDPS>${expected}</nDPS>`);
    expect(idDps).toBe(`DPS350950221234567800019900001${expected.padStart(15, '0')}`);
    expect(normalizeNumeroDps(numeroDps)).toBe(expected.padStart(15, '0'));
    expect(xml).toContain('<serie>00001</serie>');
  });

  test.each([
    [0.3, '0.30'],
    [12.5, '12.50'],
    [12.34, '12.34'],
    [12, '12'],
    [0, '0'],
    [1.005, '1.005'],
    [0.1 + 0.2, '0.30000000000000004'],
    [-0.3, '-0.3'],
    ['0.3', '0.3'],
    [' 0,30 ', ' 0,30 '],
    ['1.005', '1.005'],
  ])('serializa vCofins %p sem arredondar nem reescrever strings', (valorCofins, expected) => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      valores: {
        ...sampleDpsInput.valores,
        tributacaoFederal: {
          ...sampleDpsInput.valores.tributacaoFederal,
          pisCofins: { ...sampleDpsInput.valores.tributacaoFederal!.pisCofins!, valorCofins },
        },
      },
    });

    expect(xml).toContain(`<vCofins>${expected}</vCofins>`);
  });

  test('completa valores monetários numéricos sem modificar alíquotas', () => {
    const { xml } = new DpsXmlBuilder().build({
      ...sampleDpsInput,
      valores: {
        valorServico: 12.5,
        valorDescontoIncondicionado: 0.3,
        valorDescontoCondicionado: 0.3,
        tributacaoMunicipal: { ...sampleDpsInput.valores.tributacaoMunicipal!, aliquota: 2.5 },
        tributacaoFederal: {
          valorRetidoIrrf: 0.3,
          valorRetidoCsll: 0.3,
          pisCofins: {
            ...sampleDpsInput.valores.tributacaoFederal!.pisCofins!,
            baseCalculo: 12.5,
            valorPis: 0.3,
            valorCofins: 0.3,
            aliquotaPis: 0.5,
            aliquotaCofins: 2.5,
          },
        },
      },
    });

    for (const tag of ['vDescIncond', 'vDescCond', 'vPis', 'vCofins', 'vRetIRRF', 'vRetCSLL']) {
      expect(xml).toContain(`<${tag}>0.30</${tag}>`);
    }
    expect(xml).toContain('<vServ>12.50</vServ>');
    expect(xml).toContain('<vBCPisCofins>12.50</vBCPisCofins>');
    expect(xml).toContain('<pAliq>2.5</pAliq>');
    expect(xml).toContain('<pAliqPis>0.5</pAliqPis>');
    expect(xml).toContain('<pAliqCofins>2.5</pAliqCofins>');
  });
});
