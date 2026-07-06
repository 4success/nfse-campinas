import { SignedXml } from 'xml-crypto';
import { PfxCertificate } from '../../src/certificate/PfxCertificate';
import { DpsSigner } from '../../src/signature/DpsSigner';

jest.mock('xml-crypto');

describe('DpsSigner', () => {
  afterEach(() => jest.clearAllMocks());

  test('configura assinatura enveloped sem prefixo ds após infDPS', () => {
    const xml = '<DPS versao="1.01"><infDPS Id="DPS350950221234567800019900001000000000000001"></infDPS></DPS>';
    const certificate = { toPem: () => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }) } as PfxCertificate;
    const sigInstance = {
      addReference: jest.fn(),
      computeSignature: jest.fn(),
      getSignedXml: jest.fn().mockReturnValue('<DPS><infDPS></infDPS><Signature></Signature></DPS>'),
    };

    jest.mocked(SignedXml).mockImplementation(() => sigInstance as unknown as SignedXml);

    const signedXml = new DpsSigner(certificate).sign(xml);

    expect(SignedXml).toHaveBeenCalledWith(
      expect.objectContaining({
        privateKey: 'PRIVATE',
        publicCert: 'PUBLIC',
        idAttribute: 'Id',
        signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
        canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
      }),
    );
    expect(sigInstance.addReference).toHaveBeenCalledWith({
      xpath: "//*[local-name(.)='infDPS' and @Id='DPS350950221234567800019900001000000000000001']",
      uri: '#DPS350950221234567800019900001000000000000001',
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
      ],
      digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    });
    expect(sigInstance.computeSignature).toHaveBeenCalledWith(xml, {
      prefix: '',
      location: { reference: "//*[local-name(.)='infDPS']", action: 'after' },
    });
    expect(signedXml).toContain('<Signature>');
  });
});
