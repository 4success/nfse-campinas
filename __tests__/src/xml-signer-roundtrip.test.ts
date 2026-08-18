import forge from 'node-forge';
import { PfxCertificate } from '../../src/certificate/PfxCertificate';
import { DpsSigner } from '../../src/signature/DpsSigner';
import { PedRegEventoSigner } from '../../src/signature/PedRegEventoSigner';

function createTestCertificate(): PfxCertificate {
  const keyPair = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 });
  const certificate = forge.pki.createCertificate();
  const subject = [{ name: 'commonName', value: 'Certificado exclusivo dos testes' }];

  certificate.publicKey = keyPair.publicKey;
  certificate.serialNumber = '01';
  certificate.validity.notBefore = new Date('2026-01-01T00:00:00Z');
  certificate.validity.notAfter = new Date('2027-01-01T00:00:00Z');
  certificate.setSubject(subject);
  certificate.setIssuer(subject);
  certificate.sign(keyPair.privateKey, forge.md.sha256.create());

  return {
    toPem: () => ({
      privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
      publicCert: forge.pki.certificateToPem(certificate),
    }),
  } as PfxCertificate;
}

describe('assinatura XML real', () => {
  const certificate = createTestCertificate();

  test('assina e verifica o próprio pedRegEvento', () => {
    const id = `PRE${'1'.repeat(50)}101101`;
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<pedRegEvento xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">' +
      `<infPedReg Id="${id}"><tpAmb>2</tpAmb></infPedReg>` +
      '</pedRegEvento>';
    const signer = new PedRegEventoSigner(certificate);

    const signedXml = signer.sign(xml);

    expect(signedXml).toContain(`<Reference URI="#${id}">`);
    expect(signedXml).toContain('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">');
    expect(signer.verify(signedXml)).toBe(true);
  });

  test('preserva a verificação real da DPS após a extração do signer genérico', () => {
    const id = 'DPS350950221234567800019900001000000000000001';
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">' +
      `<infDPS Id="${id}"><tpAmb>2</tpAmb></infDPS>` +
      '</DPS>';
    const signer = new DpsSigner(certificate);

    const signedXml = signer.sign(xml);

    expect(signer.verify(signedXml)).toBe(true);
  });
});
