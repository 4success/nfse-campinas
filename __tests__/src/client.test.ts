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

  test('registra trace HTTP de request e response quando debug está ativo', async () => {
    const endpoint = 'https://trace.local/dps';
    const logs: Array<{ prefix: string; data: any }> = [];
    nock('https://trace.local').post('/dps').reply(201, JSON.stringify({ chaveAcesso: 'abc' }), {
      'content-type': 'application/json',
    });

    const result = await new CampinasDpsClient({
      endpoint,
      debug: true,
      traceLogger: (prefix, data) => {
        logs.push({ prefix, data });
      },
      transport: { useClientCertificate: false },
    }).sendSignedDps({
      idDps: 'DPS1',
      signedXml: '<DPS><Signature></Signature></DPS>',
    });

    expect(result.status).toBe('autorizada');
    expect(logs.map((log) => log.prefix)).toEqual(['Request:', 'Response:']);
    expect(logs[0].data).toMatchObject({ method: 'POST', url: endpoint, idDps: 'DPS1' });
    expect(logs[0].data.body.dpsXmlGZipB64).toBeDefined();
    expect(logs[0].data.signedXml).toContain('<Signature>');
    expect(logs[1].data).toMatchObject({ status: 201, body: { chaveAcesso: 'abc' } });
    expect(typeof logs[1].data.durationMs).toBe('number');
  });

  test('registra trace HTTP de erro quando debug está ativo', async () => {
    const endpoint = 'https://trace-error.local/dps';
    const logs: Array<{ prefix: string; data: any }> = [];
    nock('https://trace-error.local').post('/dps').reply(400, JSON.stringify({ alertas: [{ codigo: 'E1' }] }), {
      'content-type': 'application/json',
    });

    await expect(
      new CampinasDpsClient({
        endpoint,
        debug: true,
        traceLogger: (prefix, data) => {
          logs.push({ prefix, data });
        },
        transport: { useClientCertificate: false },
      }).sendSignedDps({
        idDps: 'DPS1',
        signedXml: '<DPS/>',
      }),
    ).rejects.toMatchObject({ idDps: 'DPS1' });

    expect(logs.map((log) => log.prefix)).toEqual(['Request:', 'Error:']);
    expect(logs[1].data).toMatchObject({ status: 400, body: { alertas: [{ codigo: 'E1' }] }, idDps: 'DPS1' });
    expect(typeof logs[1].data.durationMs).toBe('number');
  });

  test('não registra trace HTTP quando debug está inativo', async () => {
    const endpoint = 'https://no-trace.local/dps';
    const logger = jest.fn();
    nock('https://no-trace.local').post('/dps').reply(200, '<ret><chaveAcesso>abc</chaveAcesso></ret>');

    await new CampinasDpsClient({
      endpoint,
      traceLogger: logger,
      transport: { useClientCertificate: false },
    }).sendSignedDps({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
    });

    expect(logger).not.toHaveBeenCalled();
  });

  test('falha no trace HTTP não impede envio nem altera sucesso', async () => {
    const endpoint = 'https://trace-throws.local/dps';
    const scope = nock('https://trace-throws.local')
      .post('/dps')
      .reply(201, JSON.stringify({ chaveAcesso: 'abc' }), { 'content-type': 'application/json' });

    const result = await new CampinasDpsClient({
      endpoint,
      debug: true,
      traceLogger: () => {
        throw new Error('logger failed');
      },
      transport: { useClientCertificate: false },
    }).sendSignedDps({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
    });

    expect(result.status).toBe('autorizada');
    expect(scope.isDone()).toBe(true);
  });

  test('falha no trace HTTP não substitui erro de transporte', async () => {
    const endpoint = 'https://trace-error-throws.local/dps';
    nock('https://trace-error-throws.local').post('/dps').reply(400, 'DPS rejeitada');

    await expect(
      new CampinasDpsClient({
        endpoint,
        debug: true,
        traceLogger: () => {
          throw new Error('logger failed');
        },
        transport: { useClientCertificate: false },
      }).sendSignedDps({
        idDps: 'DPS1',
        signedXml: '<DPS/>',
      }),
    ).rejects.toMatchObject({
      idDps: 'DPS1',
      message: 'Falha ao enviar DPS DPS1: HTTP 400: DPS rejeitada',
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
