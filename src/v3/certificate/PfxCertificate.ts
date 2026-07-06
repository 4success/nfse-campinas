import forge from 'node-forge';
import { PemCertificate } from './types';

export class PfxCertificate {
  constructor(private readonly pfx: Buffer, private readonly password: string) {}

  toPem(): PemCertificate {
    try {
      const p12Asn1 = forge.asn1.fromDer(this.pfx.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, this.password);
      const keyBags = [
        ...(p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || []),
        ...(p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] || []),
      ];
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [];
      const key = keyBags.find((bag) => bag.key)?.key;
      const cert = certBags.find((bag) => bag.cert)?.cert;

      if (!key || !cert) {
        throw new Error('certificado PFX não contém chave privada e certificado válidos');
      }

      return {
        privateKey: forge.pki.privateKeyToPem(key),
        publicCert: forge.pki.certificateToPem(cert),
      };
    } catch (error) {
      throw new Error(
        `Falha ao converter certificado PFX: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
    }
  }
}
