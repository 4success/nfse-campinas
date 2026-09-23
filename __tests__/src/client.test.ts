import nock from 'nock';
import https from 'https';
import { gunzipSync } from 'zlib';
import { NfseCampinasV3 } from '../../src/classes/NfseCampinasV3';
import { CampinasDpsClient } from '../../src/client/CampinasDpsClient';
import {
  HOMOLOGACAO_CONSULTA_DPS_ENDPOINT,
  HOMOLOGACAO_CONSULTA_ENDPOINT,
  HOMOLOGACAO_DPS_ENDPOINT,
  PRODUCAO_CONSULTA_DPS_ENDPOINT,
  PRODUCAO_CONSULTA_ENDPOINT,
  PRODUCAO_DPS_ENDPOINT,
  resolveConsultaDpsEndpoint,
  resolveConsultaEndpoint,
  resolveDpsEndpoint,
} from '../../src/client/endpoints';

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

    const result = await new CampinasDpsClient({
      endpoint: HOMOLOGACAO_DPS_ENDPOINT,
      transport: { useClientCertificate: false },
    }).sendSignedDps({
      idDps: 'DPS1',
      signedXml: '<DPS><Signature></Signature></DPS>',
    });

    expect(result.status).toBe('autorizada');
    expect(JSON.parse(result.rawRequest).dpsXmlGZipB64).toBeDefined();
    expect(scope.isDone()).toBe(true);
  });

  test('resolve endpoints oficiais de produção', () => {
    expect(resolveDpsEndpoint('producao')).toBe(PRODUCAO_DPS_ENDPOINT);
    expect(resolveConsultaEndpoint('producao')).toBe(PRODUCAO_CONSULTA_ENDPOINT);
    expect(resolveConsultaDpsEndpoint('producao')).toBe(PRODUCAO_CONSULTA_DPS_ENDPOINT);
  });

  test('resolve endpoints de consulta de homologação e aceita overrides', () => {
    expect(resolveConsultaEndpoint('homologacao')).toBe(HOMOLOGACAO_CONSULTA_ENDPOINT);
    expect(resolveConsultaEndpoint('homologacao', { consulta: 'https://consulta.local/nfse' })).toBe(
      'https://consulta.local/nfse',
    );
    expect(resolveConsultaDpsEndpoint('homologacao')).toBe(HOMOLOGACAO_CONSULTA_DPS_ENDPOINT);
    expect(resolveConsultaDpsEndpoint('homologacao', { dps: 'https://consulta.local/dps' })).toBe(
      'https://consulta.local/dps',
    );
    expect(
      resolveConsultaDpsEndpoint('homologacao', {
        dps: 'https://consulta.local/nfse',
        consultaDps: 'https://consulta.local/dps',
      }),
    ).toBe('https://consulta.local/dps');
  });

  test.each([
    ['homologacao' as const, 'https://preprod-nfseapi.ima.sp.gov.br'],
    ['producao' as const, 'https://nfseapi.campinas.sp.gov.br'],
  ])('fachada usa as novas rotas oficiais de envio e consultas em %s', async (environment, origin) => {
    const idDps = 'DPS350950221234567800019900001000000000000001';
    const chaveAcesso = `NFS${'1'.repeat(50)}`;
    const scope = nock(origin)
      .post('/notafiscal-ws/nfse')
      .reply(201, { chaveAcesso })
      .get(`/notafiscal-ws/nfse/dps/${idDps}`)
      .reply(200, { chaveAcesso })
      .get(`/notafiscal-ws/nfse/${chaveAcesso}`)
      .reply(200, { nfseXmlGZipB64: 'XML_COMPACTADO' });
    const nfse = new NfseCampinasV3({
      environment,
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    await expect(nfse.enviarDps(`<DPS Id="${idDps}"><Signature/></DPS>`)).resolves.toMatchObject({
      chaveAcesso,
      httpStatus: 201,
    });
    await expect(nfse.consultarDps(idDps)).resolves.toMatchObject({ idDps, chaveAcesso, httpStatus: 200 });
    await expect(nfse.consultarNfse(chaveAcesso)).resolves.toMatchObject({
      chaveAcesso,
      nfseXmlGZipB64: 'XML_COMPACTADO',
      httpStatus: 200,
    });
    expect(scope.isDone()).toBe(true);
  });

  test('fachada permite envio e consulta de DPS em rotas independentes como na Sefin Nacional', async () => {
    const idDps = 'DPS350950221234567800019900001000000000000001';
    const chaveAcesso = `NFS${'1'.repeat(50)}`;
    const scope = nock('https://sefin.local')
      .post('/SefinNacional/nfse')
      .reply(201, { chaveAcesso })
      .get(`/SefinNacional/dps/${idDps}`)
      .reply(200, { chaveAcesso });
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: {
        dps: 'https://sefin.local/SefinNacional/nfse',
        consultaDps: 'https://sefin.local/SefinNacional/dps',
      },
      transport: { useClientCertificate: false },
    });

    await expect(nfse.enviarDps(`<DPS Id="${idDps}"><Signature/></DPS>`)).resolves.toMatchObject({ chaveAcesso });
    await expect(nfse.consultarDps(idDps)).resolves.toMatchObject({ idDps, chaveAcesso });
    expect(scope.isDone()).toBe(true);
  });

  test('fachada mantém o endpoint de envio customizado como consulta quando consultaDps não é informado', async () => {
    const idDps = 'DPS350950221234567800019900001000000000000001';
    const chaveAcesso = `NFS${'1'.repeat(50)}`;
    const scope = nock('https://legado.local').get(`/api/adn/dps/${idDps}`).reply(200, { chaveAcesso });
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: { dps: 'https://legado.local/api/adn/dps/' },
      transport: { useClientCertificate: false },
    });

    await expect(nfse.consultarDps(idDps)).resolves.toMatchObject({ idDps, chaveAcesso });
    expect(scope.isDone()).toBe(true);
  });

  test('consulta NFSe por GET com chave codificada e sem Content-Type', async () => {
    const scope = nock('https://consulta.local')
      .get('/nfse/NFS%2F1')
      .matchHeader('accept', /application\/json/)
      .matchHeader('content-type', (value) => value === undefined)
      .reply(200, JSON.stringify({ tipoAmbiente: '2', alertas: [] }), { 'content-type': 'application/json' });

    const result = await new CampinasDpsClient({
      endpoint: 'https://consulta.local/nfse/',
      transport: { useClientCertificate: false },
    }).consultarNfse({ chaveAcesso: 'NFS/1' });

    expect(result).toMatchObject({ chaveAcesso: 'NFS/1', tipoAmbiente: '2', alertas: [], httpStatus: 200 });
    expect(scope.isDone()).toBe(true);
  });

  test('preserva alerta da prefeitura em erro HTTP de consulta', async () => {
    nock('https://consulta-error.local')
      .get('/nfse/NFS1')
      .reply(400, JSON.stringify({ alertas: [{ codigo: 'E0044', mensagem: 'NFS-e não existe' }] }), {
        'content-type': 'application/json',
      });

    await expect(
      new CampinasDpsClient({
        endpoint: 'https://consulta-error.local/nfse',
        transport: { useClientCertificate: false },
      }).consultarNfse({ chaveAcesso: 'NFS1' }),
    ).rejects.toMatchObject({
      chaveAcesso: 'NFS1',
      response: { httpStatus: 400, alertas: [{ codigo: 'E0044', mensagem: 'NFS-e não existe' }] },
    });
  });

  test('consulta chave de acesso por GET no identificador da DPS', async () => {
    const idDps = 'DPS350950221234567800019900001000000000000001';
    const chaveAcesso = '35095022215547137000138000000000210026073571802007';
    const scope = nock('https://consulta.local')
      .get(`/dps/${idDps}`)
      .matchHeader('accept', /application\/json/)
      .matchHeader('content-type', (value) => value === undefined)
      .reply(200, JSON.stringify({ chaveAcesso, alertas: [] }), { 'content-type': 'application/json' });

    const result = await new CampinasDpsClient({
      endpoint: 'https://consulta.local/dps/',
      transport: { useClientCertificate: false },
    }).consultarDps({ idDps });

    expect(result).toMatchObject({ idDps, chaveAcesso, alertas: [], httpStatus: 200 });
    expect(scope.isDone()).toBe(true);
  });

  test('preserva identificador e alertas em erro HTTP da consulta de DPS', async () => {
    const idDps = 'DPS350950221234567800019900001000000000000001';
    nock('https://consulta-dps-error.local')
      .get(`/dps/${idDps}`)
      .reply(404, JSON.stringify({ alertas: [{ codigo: 'E0044', mensagem: 'DPS não encontrada' }] }), {
        'content-type': 'application/json',
      });

    await expect(
      new CampinasDpsClient({
        endpoint: 'https://consulta-dps-error.local/dps',
        transport: { useClientCertificate: false },
      }).consultarDps({ idDps }),
    ).rejects.toMatchObject({
      idDps,
      response: {
        httpStatus: 404,
        alertas: [{ codigo: 'E0044', mensagem: 'DPS não encontrada' }],
      },
    });
  });

  test('preserva metadados quando erro da consulta de DPS não traz alertas', async () => {
    const idDps = 'DPS350950221234567800019900001000000000000001';
    nock('https://consulta-dps-error.local')
      .get(`/dps/${idDps}`)
      .reply(
        404,
        JSON.stringify({
          tipoAmbiente: 2,
          versaoAplicativo: '1.0',
          dataHoraProcessamento: '2026-07-29T10:00:00-03:00',
        }),
        { 'content-type': 'application/json' },
      );

    await expect(
      new CampinasDpsClient({
        endpoint: 'https://consulta-dps-error.local/dps',
        transport: { useClientCertificate: false },
      }).consultarDps({ idDps }),
    ).rejects.toMatchObject({
      idDps,
      response: {
        httpStatus: 404,
        tipoAmbiente: '2',
        versaoAplicativo: '1.0',
        alertas: [],
      },
    });
  });

  test('prefere certificado PEM ao PFX para mTLS', async () => {
    const OriginalAgent = https.Agent;
    const agentSpy = jest
      .spyOn(https, 'Agent')
      .mockImplementation((options?: https.AgentOptions) => new OriginalAgent(options));
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

  test('recusa redirecionamento do envio sem transformar POST em GET e preserva Location', async () => {
    const location = 'https://redirect.local/nfse';
    const original = nock('https://redirect.local').post('/dps').reply(302, 'Endpoint movido', { Location: location });
    const redirected = nock('https://redirect.local').get('/nfse').reply(405, 'Method Not Allowed');

    await expect(
      new CampinasDpsClient({
        endpoint: 'https://redirect.local/dps',
        transport: { useClientCertificate: false },
      }).sendSignedDps({ idDps: 'DPS1', signedXml: '<DPS/>' }),
    ).rejects.toMatchObject({
      idDps: 'DPS1',
      signedXml: '<DPS/>',
      message: 'Falha ao enviar DPS DPS1: HTTP 302: Endpoint movido',
      cause: { response: { status: 302, headers: { location } } },
    });
    expect(original.isDone()).toBe(true);
    expect(redirected.isDone()).toBe(false);
  });

  test.each(['consultarNfse', 'consultarDps'] as const)(
    '%s recusa redirecionamento e preserva status, corpo e Location',
    async (operacao) => {
      const location = 'https://redirect-consulta.local/destino';
      const original = nock('https://redirect-consulta.local')
        .get('/origem/ID1')
        .reply(302, 'Endpoint movido', { Location: location });
      const redirected = nock('https://redirect-consulta.local').get('/destino').reply(200, {});
      const client = new CampinasDpsClient({
        endpoint: 'https://redirect-consulta.local/origem',
        transport: { useClientCertificate: false },
      });
      const consulta =
        operacao === 'consultarNfse'
          ? client.consultarNfse({ chaveAcesso: 'ID1' })
          : client.consultarDps({ idDps: 'ID1' });

      await expect(consulta).rejects.toMatchObject({
        response: { httpStatus: 302, rawResponse: 'Endpoint movido', headers: { location } },
      });
      expect(original.isDone()).toBe(true);
      expect(redirected.isDone()).toBe(false);
    },
  );

  test('registra trace HTTP de request e response quando debug está ativo', async () => {
    const endpoint = 'https://trace.local/dps';
    const logs: Array<{ prefix: string; data: any }> = [];
    nock('https://trace.local')
      .post('/dps')
      .reply(201, JSON.stringify({ chaveAcesso: 'abc' }), {
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
    nock('https://trace-error.local')
      .post('/dps')
      .reply(400, JSON.stringify({ alertas: [{ codigo: 'E1' }] }), {
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
