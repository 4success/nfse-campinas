import { SignedXml } from 'xml-crypto';
import { PfxCertificate } from '../../src/certificate/PfxCertificate';
import { PedRegEventoSigner } from '../../src/signature/PedRegEventoSigner';

jest.mock('xml-crypto');

describe('PedRegEventoSigner', () => {
  afterEach(() => jest.clearAllMocks());

  test('assina infPedReg sem prefixo e insere Signature logo após o alvo', () => {
    const chaveAcesso = '1'.repeat(50);
    const id = `PRE${chaveAcesso}101101`;
    const xml = `<pedRegEvento versao="1.01"><infPedReg Id="${id}"><tpAmb>2</tpAmb></infPedReg></pedRegEvento>`;
    const leafCertificate = '-----BEGIN CERTIFICATE-----\nLEAF\n-----END CERTIFICATE-----';
    const certificate = {
      toPem: () => ({
        privateKey: 'PRIVATE',
        publicCert: `${leafCertificate}\n-----BEGIN CERTIFICATE-----\nINTERMEDIATE\n-----END CERTIFICATE-----`,
      }),
    } as PfxCertificate;
    const sigInstance = {
      addReference: jest.fn(),
      computeSignature: jest.fn(),
      getSignedXml: jest
        .fn()
        .mockReturnValue('<pedRegEvento><infPedReg></infPedReg><Signature></Signature></pedRegEvento>'),
    };

    jest.mocked(SignedXml).mockImplementation(() => sigInstance as unknown as SignedXml);

    const signedXml = new PedRegEventoSigner(certificate).sign(xml);

    expect(SignedXml).toHaveBeenCalledWith({
      privateKey: 'PRIVATE',
      publicCert: leafCertificate,
      signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
      canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
      implicitTransforms: ['http://www.w3.org/TR/2001/REC-xml-c14n-20010315'],
    });
    expect(sigInstance.addReference).toHaveBeenCalledWith({
      xpath: `//*[local-name(.)='infPedReg' and @Id='${id}']`,
      uri: `#${id}`,
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
      ],
      digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    });
    expect(sigInstance.computeSignature).toHaveBeenCalledWith(xml, {
      prefix: '',
      location: { reference: "//*[local-name(.)='infPedReg']", action: 'after' },
    });
    expect(signedXml).toContain('<Signature>');
  });

  test('aceita infPedReg prefixado e Id com aspas simples', () => {
    const id = `PRE${'2'.repeat(50)}101101`;
    const xml = `<nfse:pedRegEvento><nfse:infPedReg Id='${id}'></nfse:infPedReg></nfse:pedRegEvento>`;
    const certificate = { toPem: () => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }) } as PfxCertificate;
    const sigInstance = {
      addReference: jest.fn(),
      computeSignature: jest.fn(),
      getSignedXml: jest.fn().mockReturnValue(xml),
    };

    jest.mocked(SignedXml).mockImplementation(() => sigInstance as unknown as SignedXml);

    new PedRegEventoSigner(certificate).sign(xml);

    expect(sigInstance.addReference).toHaveBeenCalledWith(
      expect.objectContaining({
        xpath: `//*[local-name(.)='infPedReg' and @Id='${id}']`,
        uri: `#${id}`,
      }),
    );
  });

  test('falha com mensagem específica quando infPedReg não contém Id', () => {
    const certificate = { toPem: () => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }) } as PfxCertificate;

    expect(() => new PedRegEventoSigner(certificate).sign('<pedRegEvento><infPedReg /></pedRegEvento>')).toThrow(
      'XML do pedido de registro de evento não contém Id em infPedReg',
    );
  });
});
