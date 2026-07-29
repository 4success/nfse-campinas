import nock from 'nock';
import { DpsSigner } from '../../src/signature/DpsSigner';
import { ValidationError } from '../../src/errors/ValidationError';
import { NfseCampinasV3 } from '../../src/classes/NfseCampinasV3';
import {
  HOMOLOGACAO_CONSULTA_DPS_ENDPOINT,
  HOMOLOGACAO_CONSULTA_ENDPOINT,
  HOMOLOGACAO_DPS_ENDPOINT,
  PRODUCAO_DPS_ENDPOINT,
} from '../../src/client/endpoints';
import { sampleDpsInput } from '../../test-support/fixtures';

const mockToPem = jest.fn(() => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }));

jest.mock('../../src/certificate/PfxCertificate', () => ({
  PfxCertificate: jest.fn().mockImplementation(() => ({
    toPem: mockToPem,
  })),
}));

jest.mock('../../src/signature/DpsSigner', () => ({
  DpsSigner: jest.fn().mockImplementation(() => ({
    sign: jest.fn((xml: string) => xml.replace('</DPS>', '<Signature></Signature></DPS>')),
  })),
}));

describe('NfseCampinasV3', () => {
  const externalSignedDpsId = 'DPS350950221234567800019900001000000000000001';
  const chaveAcesso = 'NFS35095022215547137000138000000000210026073571802007';

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  test('resolve endpoint usando ambiente efetivo da DPS', async () => {
    const endpoint = new URL(HOMOLOGACAO_DPS_ENDPOINT);
    const scope = nock(`${endpoint.protocol}//${endpoint.host}`).post(endpoint.pathname).reply(200, '<ret>ok</ret>');
    const nfse = new NfseCampinasV3({
      environment: 'producao',
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    await nfse.enviarDps({ ...sampleDpsInput, ambiente: 'homologacao' });

    expect(scope.isDone()).toBe(true);
  });

  test('usa endpoint oficial de produção para DPS marcada como produção', async () => {
    const endpoint = new URL(PRODUCAO_DPS_ENDPOINT);
    const scope = nock(`${endpoint.protocol}//${endpoint.host}`).post(endpoint.pathname).reply(200, '<ret>ok</ret>');
    const nfse = new NfseCampinasV3({
      environment: 'homologacao',
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    await nfse.enviarDps({ ...sampleDpsInput, ambiente: 'producao' });

    expect(scope.isDone()).toBe(true);
  });

  test('rejeita ambiente inválido informado na DPS', async () => {
    const nfse = new NfseCampinasV3({
      environment: 'homologacao',
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    await expect(nfse.enviarDps({ ...sampleDpsInput, ambiente: 'produção' as any })).rejects.toThrow(ValidationError);
  });

  test('assina usando o target efetivo do XML da DPS', async () => {
    const scope = nock('https://campinas.local').post('/dps').reply(200, '<ret>ok</ret>');
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: { dps: 'https://campinas.local/dps' },
      transport: { useClientCertificate: false },
    });

    await nfse.enviarDps({ ...sampleDpsInput, xml: { ...sampleDpsInput.xml, idAttributeTarget: 'DPS' } });

    const signer = jest.mocked(DpsSigner).mock.results[0].value as { sign: jest.Mock };
    expect(signer.sign).toHaveBeenCalledWith(expect.stringContaining('<DPS'), { idAttributeTarget: 'DPS' });
    expect(scope.isDone()).toBe(true);
  });

  test.each([
    ['Id', `<DPS><infDPS Id='${externalSignedDpsId}'></infDPS></DPS>`],
    ['Id com whitespace', `<DPS><infDPS Id = '${externalSignedDpsId}'></infDPS></DPS>`],
    [
      'Reference URI',
      `<DPS><infDPS></infDPS><Signature><SignedInfo><Reference URI='#${externalSignedDpsId}'></Reference></SignedInfo></Signature></DPS>`,
    ],
    [
      'Reference URI com whitespace',
      `<DPS><infDPS></infDPS><Signature><SignedInfo><Reference URI = '#${externalSignedDpsId}'></Reference></SignedInfo></Signature></DPS>`,
    ],
  ])('envia XML assinado externo com aspas simples em %s', async (_attribute, signedXml) => {
    const scope = nock('https://campinas.local').post('/dps').reply(200, '<ret>ok</ret>');
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: { dps: 'https://campinas.local/dps' },
      transport: { useClientCertificate: false },
    });

    const result = await nfse.enviarDps(signedXml);

    expect(result.idDps).toBe(externalSignedDpsId);
    expect(scope.isDone()).toBe(true);
  });

  test('não extrai PEM ao enviar XML assinado externo sem certificado de transporte', async () => {
    const signedXml = `<DPS><infDPS Id='${externalSignedDpsId}'></infDPS></DPS>`;
    const scope = nock('https://campinas.local').post('/dps').reply(200, '<ret>ok</ret>');
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: { dps: 'https://campinas.local/dps' },
      transport: { useClientCertificate: false },
    });

    await nfse.enviarDps(signedXml);

    expect(mockToPem).not.toHaveBeenCalled();
    expect(scope.isDone()).toBe(true);
  });

  test('consulta NFSe pela chave de acesso', async () => {
    const endpoint = new URL(HOMOLOGACAO_CONSULTA_ENDPOINT);
    const scope = nock(`${endpoint.protocol}//${endpoint.host}`)
      .get(`${endpoint.pathname}/${chaveAcesso}`)
      .reply(200, JSON.stringify({ tipoAmbiente: '2', nfseXmlGZipB64: 'H4sIAAAAAAAA', alertas: [] }));
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    const result = await nfse.consultarNfse(chaveAcesso);

    expect(result).toMatchObject({ chaveAcesso, tipoAmbiente: '2', alertas: [] });
    expect(scope.isDone()).toBe(true);
  });

  test('rejeita chave de acesso com estrutura inválida antes da consulta', async () => {
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    await expect(nfse.consultarNfse('invalida')).rejects.toThrow(ValidationError);
  });

  test('consulta chave de acesso pelo identificador da DPS', async () => {
    const endpoint = new URL(HOMOLOGACAO_CONSULTA_DPS_ENDPOINT);
    const chaveSemPrefixo = '35095022215547137000138000000000210026073571802007';
    const scope = nock(`${endpoint.protocol}//${endpoint.host}`)
      .get(`${endpoint.pathname}/${externalSignedDpsId}`)
      .reply(200, JSON.stringify({ chaveAcesso: chaveSemPrefixo, alertas: [] }));
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    const result = await nfse.consultarDps(externalSignedDpsId);

    expect(result).toMatchObject({ idDps: externalSignedDpsId, chaveAcesso: chaveSemPrefixo, alertas: [] });
    expect(scope.isDone()).toBe(true);
  });

  test('mantém alias consultarNfsePorDps e rejeita identificador inválido antes da rede', async () => {
    const endpoint = new URL(HOMOLOGACAO_CONSULTA_DPS_ENDPOINT);
    const scope = nock(`${endpoint.protocol}//${endpoint.host}`)
      .get(`${endpoint.pathname}/${externalSignedDpsId}`)
      .reply(200, JSON.stringify({ chaveAcesso, alertas: [] }));
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    const result = await nfse.consultarNfsePorDps(externalSignedDpsId);

    expect(result.chaveAcesso).toBe(chaveAcesso);
    await expect(nfse.consultarDps('DPS-invalida')).rejects.toThrow(ValidationError);
    expect(scope.isDone()).toBe(true);
  });

  test('aceita identificador com CNPJ alfanumérico e rejeita blocos fiscais inválidos', async () => {
    const idDpsAlfanumerico = 'DPS35095022ABCD123456789000001000000000000001';
    const endpoint = new URL(HOMOLOGACAO_CONSULTA_DPS_ENDPOINT);
    const scope = nock(`${endpoint.protocol}//${endpoint.host}`)
      .get(`${endpoint.pathname}/${idDpsAlfanumerico}`)
      .reply(200, JSON.stringify({ chaveAcesso, alertas: [] }));
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    await expect(nfse.consultarDps(idDpsAlfanumerico)).resolves.toMatchObject({
      idDps: idDpsAlfanumerico,
      chaveAcesso,
    });
    await expect(
      nfse.consultarDps(`${externalSignedDpsId.slice(0, 10)}3${externalSignedDpsId.slice(11)}`),
    ).rejects.toThrow(ValidationError);
    await expect(
      nfse.consultarDps(`${externalSignedDpsId.slice(0, 23)}A${externalSignedDpsId.slice(24)}`),
    ).rejects.toThrow(ValidationError);
    expect(scope.isDone()).toBe(true);
  });
});
