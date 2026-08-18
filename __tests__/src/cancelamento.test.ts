import nock from 'nock';
import { gunzipSync } from 'zlib';
import { NfseCampinasV3 } from '../../src/classes/NfseCampinasV3';
import { CampinasDpsClient } from '../../src/client/CampinasDpsClient';
import { HOMOLOGACAO_EVENTOS_ENDPOINT, resolveEventosEndpoint } from '../../src/client/endpoints';
import { parseCancelarNfseResponse } from '../../src/client/responseParser';
import { MissingProductionEndpointError } from '../../src/errors/MissingProductionEndpointError';
import { ValidationError } from '../../src/errors/ValidationError';

const mockToPem = jest.fn(() => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }));

jest.mock('../../src/certificate/PfxCertificate', () => ({
  PfxCertificate: jest.fn().mockImplementation(() => ({
    toPem: mockToPem,
  })),
}));

describe('cancelamento de NFSe', () => {
  const chaveAcesso = 'NFS35095022215547137000138000000000210026073571802007';
  const signedXml =
    '<?xml version="1.0"?><evento-opaco><conteudo>preservar sem alterações</conteudo><Signature>assinatura-teste</Signature></evento-opaco>';

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  test('resolve somente o endpoint de eventos oficialmente publicado', () => {
    expect(HOMOLOGACAO_EVENTOS_ENDPOINT).toBe('https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse');
    expect(resolveEventosEndpoint('homologacao')).toBe(HOMOLOGACAO_EVENTOS_ENDPOINT);
    expect(resolveEventosEndpoint('homologacao', { eventos: 'https://eventos.local/nfse/' })).toBe(
      'https://eventos.local/nfse/',
    );
    expect(resolveEventosEndpoint('producao', { eventos: 'https://eventos-producao.local/nfse' })).toBe(
      'https://eventos-producao.local/nfse',
    );
    expect(() => resolveEventosEndpoint('producao')).toThrow(MissingProductionEndpointError);
  });

  test('envia o pedido assinado em JSON GZip/Base64 para a rota síncrona de eventos', async () => {
    const endpoint = 'https://eventos.local/nfse/';
    const scope = nock('https://eventos.local')
      .post(`/nfse/${chaveAcesso}/eventos`, (body) => {
        const payload = typeof body === 'string' ? JSON.parse(body) : body;
        expect(Object.keys(payload)).toEqual(['pedidoRegistroEventoXmlGZipB64']);
        expect(gunzipSync(Buffer.from(payload.pedidoRegistroEventoXmlGZipB64, 'base64')).toString('utf8')).toBe(
          signedXml,
        );
        return true;
      })
      .matchHeader('content-type', /application\/json/)
      .reply(
        201,
        JSON.stringify({
          tipoAmbiente: 2,
          versaoAplicativo: '1.0',
          eventoXmlGZipB64: 'H4sIAAAAAAAA',
          alertas: [],
        }),
        { 'content-type': 'application/json' },
      );

    const result = await new CampinasDpsClient({
      endpoint,
      transport: { useClientCertificate: false },
    }).cancelarNfse({ chaveAcesso, signedXml });

    expect(result).toMatchObject({
      chaveAcesso,
      signedXml,
      tipoAmbiente: '2',
      versaoAplicativo: '1.0',
      eventoXmlGZipB64: 'H4sIAAAAAAAA',
      alertas: [],
      httpStatus: 201,
    });
    expect(JSON.parse(result.rawRequest)).toHaveProperty('pedidoRegistroEventoXmlGZipB64');
    expect(result.rawResponse).toContain('eventoXmlGZipB64');
    expect(scope.isDone()).toBe(true);
  });

  test('codifica a chave de acesso ao montar a rota no cliente de baixo nível', async () => {
    const scope = nock('https://eventos.local')
      .post('/nfse/NFS%2F1/eventos')
      .reply(200, JSON.stringify({ eventoXmlGZipB64: 'H4sIAAAAAAAA', alertas: [] }), {
        'content-type': 'application/json',
      });

    const result = await new CampinasDpsClient({
      endpoint: 'https://eventos.local/nfse',
      transport: { useClientCertificate: false },
    }).cancelarNfse({ chaveAcesso: 'NFS/1', signedXml });

    expect(result.chaveAcesso).toBe('NFS/1');
    expect(scope.isDone()).toBe(true);
  });

  test('preserva resposta e alertas da Prefeitura em erro HTTP', async () => {
    const rawResponse = JSON.stringify({
      tipoAmbiente: 2,
      alertas: [{ codigo: 'E1102', mensagem: 'NFS-e já cancelada' }],
    });
    nock('https://eventos-error.local').post(`/nfse/${chaveAcesso}/eventos`).reply(400, rawResponse, {
      'content-type': 'application/json',
    });

    await expect(
      new CampinasDpsClient({
        endpoint: 'https://eventos-error.local/nfse',
        transport: { useClientCertificate: false },
      }).cancelarNfse({ chaveAcesso, signedXml }),
    ).rejects.toMatchObject({
      chaveAcesso,
      response: {
        chaveAcesso,
        signedXml,
        tipoAmbiente: '2',
        alertas: [{ codigo: 'E1102', mensagem: 'NFS-e já cancelada' }],
        rawResponse,
        httpStatus: 400,
      },
    });
  });

  test.each([
    [
      'lista de erros',
      { erros: [{ Codigo: 'E1103', Descricao: 'Pedido de evento rejeitado', Complemento: 'campo infPedReg' }] },
    ],
    [
      'erro singular',
      { erro: { Codigo: 'E1103', Descricao: 'Pedido de evento rejeitado', Complemento: 'campo infPedReg' } },
    ],
  ])('normaliza %s do padrão nacional sem perder o complemento', (_formato, response) => {
    const result = parseCancelarNfseResponse({
      chaveAcesso,
      signedXml,
      rawRequest: '{}',
      rawResponse: JSON.stringify(response),
      httpStatus: 400,
      headers: { 'content-type': 'application/json' },
    });

    expect(result.alertas).toEqual([
      {
        codigo: 'E1103',
        mensagem: 'Pedido de evento rejeitado',
        complemento: 'campo infPedReg',
      },
    ]);
  });

  test('parser preserva campos conhecidos, conteúdo bruto e extensões da resposta', () => {
    const rawRequest = JSON.stringify({ pedidoRegistroEventoXmlGZipB64: 'H4sIAAAAAAAA' });
    const rawResponse = JSON.stringify({
      tipoAmbiente: 2,
      versaoAplicativo: '1.0',
      dataHoraProcessamento: '2026-08-18T10:00:00-03:00',
      eventoXmlGZipB64: 'EVENTO_GZIP_BASE64',
      alertas: [],
      extensaoPrefeitura: { protocolo: '123' },
    });

    const result = parseCancelarNfseResponse({
      chaveAcesso,
      signedXml,
      rawRequest,
      rawResponse,
      httpStatus: 200,
      headers: { 'content-type': 'application/json' },
    });

    expect(result).toMatchObject({
      chaveAcesso,
      signedXml,
      tipoAmbiente: '2',
      versaoAplicativo: '1.0',
      dataHoraProcessamento: '2026-08-18T10:00:00-03:00',
      eventoXmlGZipB64: 'EVENTO_GZIP_BASE64',
      alertas: [],
      rawRequest,
      rawResponse,
      httpStatus: 200,
      parsedResponse: { extensaoPrefeitura: { protocolo: '123' } },
    });
  });

  test('fachada usa endpoint de eventos customizado sem alterar nem reassinar o XML', async () => {
    const chaveSemPrefixo = chaveAcesso.slice(3);
    const scope = nock('https://eventos-fachada.local')
      .post(`/nfse/${chaveSemPrefixo}/eventos`, (body) => {
        const payload = typeof body === 'string' ? JSON.parse(body) : body;
        return gunzipSync(Buffer.from(payload.pedidoRegistroEventoXmlGZipB64, 'base64')).toString('utf8') === signedXml;
      })
      .reply(200, JSON.stringify({ eventoXmlGZipB64: 'H4sIAAAAAAAA', alertas: [] }), {
        'content-type': 'application/json',
      });
    const nfse = new NfseCampinasV3({
      environment: 'producao',
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: { eventos: 'https://eventos-fachada.local/nfse' },
      transport: { useClientCertificate: false },
    });

    const result = await nfse.cancelarNfse({ chaveAcesso: chaveSemPrefixo, signedXml });

    expect(result).toMatchObject({
      chaveAcesso: chaveSemPrefixo,
      signedXml,
      eventoXmlGZipB64: 'H4sIAAAAAAAA',
    });
    expect(mockToPem).not.toHaveBeenCalled();
    expect(scope.isDone()).toBe(true);
  });

  test.each([
    [{ chaveAcesso: 'invalida', signedXml }, 'chaveAcesso'],
    [{ chaveAcesso, signedXml: '   ' }, 'signedXml'],
  ])('fachada rejeita entrada inválida antes da rede: %s', async (input, field) => {
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    await expect(nfse.cancelarNfse(input)).rejects.toMatchObject({
      name: ValidationError.name,
      issues: [expect.objectContaining({ field, severity: 'error' })],
    });
    expect(nock.isDone()).toBe(true);
  });
});
