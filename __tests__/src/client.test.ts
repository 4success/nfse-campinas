import nock from 'nock';
import https from 'https';
import { gunzipSync } from 'zlib';
import { CampinasDpsClient } from '../../src/client/CampinasDpsClient';
import { HOMOLOGACAO_DPS_ENDPOINT, resolveDpsEndpoint } from '../../src/client/endpoints';
import { MissingProductionEndpointError } from '../../src/errors/MissingProductionEndpointError';

describe('CampinasDpsClient', () => {
  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  test('envia POST para endpoint de homologação com XML assinado compactado em JSON', async () => {
    const endpoint = new URL(HOMOLOGACAO_DPS_ENDPOINT);
    const scope = nock(`${endpoint.protocol}//${endpoint.host}`)
      .post(endpoint.pathname, (body) => {
        const payload = typeof body === 'string' ? JSON.parse(body) : body;
        return gunzipSync(Buffer.from(payload.dpsXmlGZipB64, 'base64')).toString('utf8').includes('<Signature>');
      })
      .matchHeader('content-type', /application\/json/)
      .reply(200, '<ret><chaveAcesso>abc</chaveAcesso></ret>', { 'content-type': 'application/xml' });

    const result = await new CampinasDpsClient({ endpoint: HOMOLOGACAO_DPS_ENDPOINT, transport: { useClientCertificate: false } }).sendSignedDps({
      idDps: 'DPS1',
      signedXml: '<DPS><Signature></Signature></DPS>',
    });

    expect(result.status).toBe('autorizada');
    expect(JSON.parse(result.rawRequest).dpsXmlGZipB64).toBeDefined();
    expect(scope.isDone()).toBe(true);
  });

  test('produção sem endpoint explícito falha', () => {
    expect(() => resolveDpsEndpoint('producao')).toThrow(MissingProductionEndpointError);
  });

  test('prefere certificado PEM ao PFX para mTLS', async () => {
    const OriginalAgent = https.Agent;
    const agentSpy = jest.spyOn(https, 'Agent').mockImplementation((options?: https.AgentOptions) => new OriginalAgent(options));
    const endpoint = 'https://pem.local/dps';
    nock('https://pem.local').post('/dps').reply(200, '<ret><chaveAcesso>abc</chaveAcesso></ret>');

    await new CampinasDpsClient({
      endpoint,
      certificate: Buffer.from('INVALID_PFX'),
      certPassword: 'secret',
      clientKeyPem: 'PRIVATE_KEY_PEM',
      clientCertPem: 'PUBLIC_CERT_PEM',
    }).sendSignedDps({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
    });

    expect(agentSpy).toHaveBeenCalledWith({
      key: 'PRIVATE_KEY_PEM',
      cert: 'PUBLIC_CERT_PEM',
      rejectUnauthorized: true,
    });
  });

  test('falha em resposta HTTP não 2xx', async () => {
    const endpoint = 'https://erro.local/dps';
    nock('https://erro.local').post('/dps').reply(415, 'Unsupported Media Type');

    await expect(
      new CampinasDpsClient({ endpoint, transport: { useClientCertificate: false } }).sendSignedDps({
        idDps: 'DPS1',
        signedXml: '<DPS/>',
      }),
    ).rejects.toMatchObject({
      idDps: 'DPS1',
      message: 'Falha ao enviar DPS DPS1: HTTP 415: Unsupported Media Type',
    });
  });

  test('timeout preserva idDps e XML assinado', async () => {
    const endpoint = 'https://timeout.local/dps';
    nock('https://timeout.local').post('/dps').delay(100).reply(200, 'ok');

    await expect(
      new CampinasDpsClient({ endpoint, timeoutMs: 1, transport: { useClientCertificate: false } }).sendSignedDps({
        idDps: 'DPS1',
        signedXml: '<DPS/>',
      }),
    ).rejects.toMatchObject({ idDps: 'DPS1', signedXml: '<DPS/>' });
  });
});
