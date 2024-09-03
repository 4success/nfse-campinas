import fs from 'fs';
import { NfseCampinas } from '../../../src';
import { createClientAsync } from '../../../src/soap/notafiscalsoap';
import { SignedXml } from 'xml-crypto';
import pem, { Pkcs12ReadResult } from 'pem';

// Mock das dependências
jest.mock('fs');
jest.mock('pem');
jest.mock('../../../src/soap/notafiscalsoap');
jest.mock('xml-crypto');

describe('NfseCampinas', () => {
  const mockCertificate = Buffer.from('mocked-certificate');
  const mockCertPassword = 'mocked-password';
  const mockHost = 'https://mocked-soap-host';
  let instance: NfseCampinas;

  beforeEach(() => {
    instance = new NfseCampinas(mockHost, mockCertificate, mockCertPassword);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deve criar uma instância e salvar o certificado temporário', () => {
    expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), mockCertificate);
    expect(instance.certTempFile).toMatch(/cert-/);
  });

  test('deve deletar o arquivo de certificado temporário ao chamar cleanup', () => {
    instance.cleanup();
    expect(fs.unlinkSync).toHaveBeenCalledWith(instance.certTempFile);
  });

  test('deve criar um cliente SOAP ao chamar getSoapClient', async () => {
    const mockClient = {};
    (createClientAsync as jest.Mock).mockResolvedValue(mockClient);

    const client = await instance['getSoapClient']();
    expect(createClientAsync).toHaveBeenCalledWith(mockHost);
    expect(client).toBe(mockClient);
  });

  test('deve ler e converter o certificado PFX ao chamar getPemCert', async () => {
    const mockCertResult = { key: 'mocked-key', cert: 'mocked-cert' };
    const mockPfx = Buffer.from('mocked-pfx');
    (fs.readFileSync as jest.Mock).mockReturnValue(mockPfx);
    (pem.readPkcs12 as jest.Mock).mockImplementation((_, __, callback) => {
      callback(null, mockCertResult);
    });

    const pemCert = await instance['getPemCert']();
    expect(fs.readFileSync).toHaveBeenCalledWith(instance.certTempFile);
    expect(pemCert).toBe(mockCertResult);
  });

  test('deve assinar XML corretamente ao chamar getSignedXml', () => {
    const mockPemCert = { key: 'mocked-key', cert: 'mocked-cert' };
    const mockXml = '<soap:Envelope><soap:Body>mocked-body</soap:Body></soap:Envelope>';
    const mockSignedXml = '<soap:Envelope><soap:Body>mocked-signed-xml</soap:Body></soap:Envelope>';

    const mockSigInstance = {
      addReference: jest.fn(),
      computeSignature: jest.fn(),
      getSignedXml: jest.fn().mockReturnValue(mockSignedXml),
    };
    jest.mocked(SignedXml).mockImplementation(() => mockSigInstance as unknown as SignedXml);

    const signedXml = instance['getSignedXml'](mockXml, {}, {}, mockPemCert as Pkcs12ReadResult);

    expect(SignedXml).toHaveBeenCalledWith({
      privateKey: mockPemCert.key,
      publicCert: mockPemCert.cert,
      implicitTransforms: ['http://www.w3.org/TR/2001/REC-xml-c14n-20010315'],
    });
    expect(signedXml).toContain(mockSignedXml);
  });

  test('deve logar a última request e response quando debug é true', () => {
    const mockClient = { lastRequest: '<request/>', lastResponse: '<response/>' };
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
    });

    instance = new NfseCampinas(mockHost, mockCertificate, mockCertPassword, true);
    instance['logLastRequestResponse'](mockClient as any);

    expect(consoleLogSpy).toHaveBeenCalledWith('<request/>');
    expect(consoleLogSpy).toHaveBeenCalledWith('<response/>');
  });
});
