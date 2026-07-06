import { buildDpsId } from '../../src/dps/buildDpsId';

describe('buildDpsId', () => {
  test('gera Id determinístico com CNPJ, série e número normalizados', () => {
    const id = buildDpsId({
      codigoMunicipioEmissao: '3509502',
      tipoInscricaoFederal: '2',
      inscricaoFederal: '12.345.678/0001-99',
      serie: 1,
      numeroDps: 1,
    });

    expect(id).toBe('DPS350950221234567800019900001000000000000001');
    expect(id).toHaveLength(45);
  });

  test('preenche CPF à esquerda até 14 posições', () => {
    expect(
      buildDpsId({
        codigoMunicipioEmissao: '3509502',
        tipoInscricaoFederal: '1',
        inscricaoFederal: '123.456.789-01',
        serie: '9',
        numeroDps: '10',
      }),
    ).toBe('DPS350950210001234567890100009000000000000010');
  });

  test('rejeita documentos e tamanhos inválidos', () => {
    expect(() =>
      buildDpsId({
        codigoMunicipioEmissao: '3509502',
        tipoInscricaoFederal: '2',
        inscricaoFederal: '123',
        serie: 1,
        numeroDps: 1,
      }),
    ).toThrow('CNPJ deve ter 14 dígitos');

    expect(() =>
      buildDpsId({
        codigoMunicipioEmissao: '3509502',
        tipoInscricaoFederal: '2',
        inscricaoFederal: '12345678000199',
        serie: '123456',
        numeroDps: 1,
      }),
    ).toThrow('Série da DPS');

    expect(() =>
      buildDpsId({
        codigoMunicipioEmissao: '3509502',
        tipoInscricaoFederal: '2',
        inscricaoFederal: '12345678000199',
        serie: '1',
        numeroDps: '1234567890123456',
      }),
    ).toThrow('Número da DPS');
  });
});
