import { parseEnviarDpsResponse } from '../../../src/v3/client/responseParser';

describe('parseEnviarDpsResponse', () => {
  test('interpreta resposta XML de sucesso preservando bruto', () => {
    const result = parseEnviarDpsResponse({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      rawRequest: '<DPS/>',
      rawResponse: '<ret><chaveAcesso>abc</chaveAcesso><numeroNfse>10</numeroNfse></ret>',
      httpStatus: 200,
      headers: { 'content-type': 'application/xml' },
    });

    expect(result.status).toBe('autorizada');
    expect(result.chaveAcesso).toBe('abc');
    expect(result.numeroNfse).toBe('10');
    expect(result.rawResponse).toContain('<ret>');
  });

  test('interpreta rejeição JSON e erro HTTP', () => {
    const rejeicao = parseEnviarDpsResponse({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      rawRequest: '<DPS/>',
      rawResponse: '{"mensagens":[{"codigo":"E1","descricao":"DPS rejeitada","campo":"cTribNac"}]}',
      httpStatus: 200,
      headers: {},
    });
    const erroHttp = parseEnviarDpsResponse({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      rawRequest: '<DPS/>',
      rawResponse: 'Internal Server Error',
      httpStatus: 500,
      headers: {},
    });

    expect(rejeicao.status).toBe('rejeitada');
    expect(rejeicao.mensagens[0]).toEqual({ codigo: 'E1', descricao: 'DPS rejeitada', campo: 'cTribNac' });
    expect(erroHttp.status).toBe('erro_http');
  });
});
