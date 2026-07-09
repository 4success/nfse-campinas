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

  test.each([
    ['aspas simples', "<DPS versao='1.01'><infDPS Id='DPS350950221234567800019900001000000000000001'></infDPS></DPS>"],
    [
      'prefixo namespace',
      '<nfse:DPS versao="1.01"><nfse:infDPS Id="DPS350950221234567800019900001000000000000001"></nfse:infDPS></nfse:DPS>',
    ],
  ])('extrai Id ao assinar XML externo com %s', (_caseName, xml) => {
    const certificate = { toPem: () => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }) } as PfxCertificate;
    const sigInstance = {
      addReference: jest.fn(),
      computeSignature: jest.fn(),
      getSignedXml: jest.fn().mockReturnValue('<DPS><infDPS></infDPS><Signature></Signature></DPS>'),
    };

    jest.mocked(SignedXml).mockImplementation(() => sigInstance as unknown as SignedXml);

    new DpsSigner(certificate).sign(xml);

    expect(sigInstance.addReference).toHaveBeenCalledWith(
      expect.objectContaining({
        xpath: "//*[local-name(.)='infDPS' and @Id='DPS350950221234567800019900001000000000000001']",
        uri: '#DPS350950221234567800019900001000000000000001',
      }),
    );
  });

  test('verifica assinatura com prefixo ds', () => {
    const xml = '<DPS><infDPS Id="DPS1"></infDPS><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"></ds:Signature></DPS>';
    const certificate = { toPem: () => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }) } as PfxCertificate;
    const sigInstance = {
      loadSignature: jest.fn(),
      checkSignature: jest.fn().mockReturnValue(true),
      getReferences: jest.fn().mockReturnValue([{ uri: '#DPS1' }]),
    };

    jest.mocked(SignedXml).mockImplementation(() => sigInstance as unknown as SignedXml);

    expect(new DpsSigner(certificate).verify(xml)).toBe(true);
    expect(sigInstance.loadSignature).toHaveBeenCalledWith(
      '<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"></ds:Signature>',
    );
    expect(sigInstance.checkSignature).toHaveBeenCalledWith(xml);
  });

  test('rejeita assinatura válida sobre uma referência diferente da DPS', () => {
    const xml = '<DPS><infDPS Id="DPS1"></infDPS><Signature></Signature></DPS>';
    const certificate = { toPem: () => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }) } as PfxCertificate;
    const sigInstance = {
      loadSignature: jest.fn(),
      checkSignature: jest.fn().mockReturnValue(true),
      getReferences: jest.fn().mockReturnValue([{ uri: '#OUTRO' }]),
    };

    jest.mocked(SignedXml).mockImplementation(() => sigInstance as unknown as SignedXml);

    expect(new DpsSigner(certificate).verify(xml)).toBe(false);
  });

  test('retorna false quando loadSignature falha', () => {
    const xml = '<DPS><infDPS Id="DPS1"></infDPS><Signature></Signature></DPS>';
    const certificate = { toPem: () => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }) } as PfxCertificate;
    const sigInstance = {
      loadSignature: jest.fn().mockImplementation(() => {
        throw new Error('invalid signature');
      }),
      checkSignature: jest.fn(),
    };

    jest.mocked(SignedXml).mockImplementation(() => sigInstance as unknown as SignedXml);

    expect(new DpsSigner(certificate).verify(xml)).toBe(false);
    expect(sigInstance.checkSignature).not.toHaveBeenCalled();
  });

  test('retorna false quando checkSignature falha', () => {
    const xml = '<DPS><infDPS Id="DPS1"></infDPS><Signature></Signature></DPS>';
    const certificate = { toPem: () => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }) } as PfxCertificate;
    const sigInstance = {
      loadSignature: jest.fn(),
      checkSignature: jest.fn().mockImplementation(() => {
        throw new Error('bad signature value');
      }),
    };

    jest.mocked(SignedXml).mockImplementation(() => sigInstance as unknown as SignedXml);

    expect(new DpsSigner(certificate).verify(xml)).toBe(false);
  });
});
