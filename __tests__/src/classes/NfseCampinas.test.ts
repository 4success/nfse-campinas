import fs from 'fs';
import { createClientAsync, NfseCampinas } from '../../../src';
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

  describe('ImprimirNfse', () => {
    const mockParams = {
      cnpj: '12345678000190',
      inscricaoMunicipal: '123456',
      numeroNfse: '1000',
      codigoVerificacao: 'ABC123',
    };

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    test('deve retornar um Buffer quando a requisição for bem sucedida', async () => {
      // Arrange
      const mockPdfContent = new Uint8Array([1, 2, 3, 4]);
      const expectedUrlString = `${mockHost}/servico/notafiscal/autenticacao/cpfCnpj/${mockParams.cnpj}/inscricaoMunicipal/${mockParams.inscricaoMunicipal}/numeroNota/${mockParams.numeroNfse}/codigoVerificacao/${mockParams.codigoVerificacao}`;
      const expectedOptions = {
        method: 'GET',
        headers: { 'Accept': 'application/pdf' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({
          'content-type': 'application/pdf',
        }),
        arrayBuffer: jest.fn().mockResolvedValueOnce(mockPdfContent.buffer),
      });

      // Act
      const result = await instance.ImprimirNfse(mockParams);

      // Assert
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString('hex')).toBe(Buffer.from(mockPdfContent).toString('hex'));
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const [calledUrl, calledOptions] = (global.fetch as jest.Mock).mock.calls[0];
      expect(calledUrl.toString()).toBe(expectedUrlString);
      expect(calledOptions).toEqual(expectedOptions);
    });

    test('deve lançar erro quando a resposta não for ok', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      // Act & Assert
      await expect(instance.ImprimirNfse(mockParams))
        .rejects
        .toThrow('Falha ao imprimir NFSe: Erro ao buscar NFSe: 404 - Not Found');
    });

    test('deve lançar erro quando o content-type não for PDF', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({
          'content-type': 'application/json',
        }),
      });

      // Act & Assert
      await expect(instance.ImprimirNfse(mockParams))
        .rejects
        .toThrow('Falha ao imprimir NFSe: Tipo de conteúdo inválido: application/json');
    });

    test('deve lançar erro quando o fetch falhar', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(instance.ImprimirNfse(mockParams))
        .rejects
        .toThrow('Falha ao imprimir NFSe: Network error');
    });
  });
});
