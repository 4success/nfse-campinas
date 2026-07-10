import { gzipSync } from 'zlib';
import { parseEnviarDpsResponse } from '../../src/client/responseParser';
import { decodeNfseXmlGZipB64 } from '../../src/utils/nfseXml';

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
    expect(result.parsedResponse).toEqual({ ret: { chaveAcesso: 'abc', numeroNfse: '10' } });
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

  test('interpreta alertas JSON de rejeição Campinas v3', () => {
    const result = parseEnviarDpsResponse({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      rawRequest: '<DPS/>',
      rawResponse: JSON.stringify({
        alertas: [
          {
            codigo: 'L0005',
            mensagem: 'CNPJ/Indicador Municipal do prestador informado na DPS é inválido.',
          },
        ],
        dataHoraProcessamento: '2026-07-08T16:13:36.707848125-03:00',
        idDps: 'DPS1',
        tipoAmbiente: 2,
        versaoAplicativo: '1.0',
      }),
      httpStatus: 200,
      headers: {},
    });

    expect(result.status).toBe('rejeitada');
    expect(result.mensagens[0]).toEqual({
      codigo: 'L0005',
      descricao: 'CNPJ/Indicador Municipal do prestador informado na DPS é inválido.',
    });
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
    const nfseXml = '<NFSe><infNFSe><nNFSe>10</nNFSe></infNFSe></NFSe>';
    const nfseXmlGZipB64 = gzipSync(Buffer.from(nfseXml, 'utf8')).toString('base64');
    const result = parseEnviarDpsResponse({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      rawRequest: '<DPS/>',
      rawResponse: JSON.stringify({ cStat: '100', nfseXmlGZipB64, campoNovoPrefeitura: 'valor' }),
      httpStatus: 200,
      headers: {},
    });

    expect(result.status).toBe('autorizada');
    expect(result.nfseXmlGZipB64).toBe(nfseXmlGZipB64);
    expect(decodeNfseXmlGZipB64(result.nfseXmlGZipB64!)).toBe(nfseXml);
    expect(result.parsedResponse).toEqual({ cStat: '100', nfseXmlGZipB64, campoNovoPrefeitura: 'valor' });
  });
});
