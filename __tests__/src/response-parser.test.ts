import { parseEnviarDpsResponse } from '../../src/client/responseParser';

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

  test('interpreta campos e mensagens em XML com namespace', () => {
    const result = parseEnviarDpsResponse({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      rawRequest: '<DPS/>',
      rawResponse: [
        '<ns:ret xmlns:ns="urn:test">',
        '<ns:chaveAcesso>abc</ns:chaveAcesso>',
        '<ns:numeroNfse>10</ns:numeroNfse>',
        '<ns:mensagem>',
        '<ns:codigo>E1</ns:codigo>',
        '<ns:descricao>Autorizada</ns:descricao>',
        '<ns:campo>DPS</ns:campo>',
        '</ns:mensagem>',
        '</ns:ret>',
      ].join(''),
      httpStatus: 200,
      headers: { 'content-type': 'application/xml' },
    });

    expect(result.status).toBe('autorizada');
    expect(result.chaveAcesso).toBe('abc');
    expect(result.numeroNfse).toBe('10');
    expect(result.mensagens[0]).toEqual({ codigo: 'E1', descricao: 'Autorizada', campo: 'DPS' });
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

  test('não classifica status por texto livre', () => {
    const naoAutorizada = parseEnviarDpsResponse({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      rawRequest: '<DPS/>',
      rawResponse: 'DPS não autorizada',
      httpStatus: 200,
      headers: {},
    });
    const semSucesso = parseEnviarDpsResponse({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      rawRequest: '<DPS/>',
      rawResponse: 'processado sem sucesso',
      httpStatus: 200,
      headers: {},
    });

    expect(naoAutorizada.status).toBe('desconhecida');
    expect(semSucesso.status).toBe('desconhecida');
  });

  test('interpreta sucesso por campos estruturados nacionais', () => {
    const result = parseEnviarDpsResponse({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      rawRequest: '<DPS/>',
      rawResponse: '{"cStat":"100","nfseXmlGZipB64":"abc"}',
      httpStatus: 200,
      headers: {},
    });

    expect(result.status).toBe('autorizada');
  });
});
