import nock from 'nock';
import { CampinasDpsClient } from '../../../src/v3/client/CampinasDpsClient';
import { HOMOLOGACAO_DPS_ENDPOINT, resolveDpsEndpoint } from '../../../src/v3/client/endpoints';
import { MissingProductionEndpointError } from '../../../src/v3/errors/MissingProductionEndpointError';

describe('CampinasDpsClient', () => {
  afterEach(() => nock.cleanAll());

  test('envia POST para endpoint de homologação com XML assinado', async () => {
    const endpoint = new URL(HOMOLOGACAO_DPS_ENDPOINT);
    const scope = nock(`${endpoint.protocol}//${endpoint.host}`)
      .post(endpoint.pathname, (body) => String(body).includes('<Signature>'))
      .matchHeader('content-type', /application\/xml/)
      .reply(200, '<ret><chaveAcesso>abc</chaveAcesso></ret>', { 'content-type': 'application/xml' });

    const result = await new CampinasDpsClient({ endpoint: HOMOLOGACAO_DPS_ENDPOINT, transport: { useClientCertificate: false } }).sendSignedDps({
      idDps: 'DPS1',
      signedXml: '<DPS><Signature></Signature></DPS>',
    });

    expect(result.status).toBe('autorizada');
    expect(scope.isDone()).toBe(true);
  });

  test('produção sem endpoint explícito falha', () => {
    expect(() => resolveDpsEndpoint('producao')).toThrow(MissingProductionEndpointError);
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
