import forge from 'node-forge';
import { PemCertificate } from './types';

export class PfxCertificate {
  private pem?: PemCertificate;

  constructor(private readonly pfx: Buffer, private readonly password: string) {}

  toPem(): PemCertificate {
    if (this.pem) {
      return this.pem;
    }

    try {
      const p12Asn1 = forge.asn1.fromDer(this.pfx.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, this.password);
      const keyBags = [
        ...(p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag] || []),
        ...(p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag] || []),
      ];
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] || [];
      const keyBag = keyBags.find((bag) => bag.key);
      const key = keyBag?.key;
      const cert = keyBag && key ? this.findMatchingCertificate(keyBag, key, certBags) : undefined;

      if (!key || !cert) {
        throw new Error('certificado PFX não contém chave privada e certificado correspondente válidos');
      }

      this.pem = {
        privateKey: forge.pki.privateKeyToPem(key),
        publicCert: this.buildCertificateChainPem(cert, certBags),
      };

      return this.pem;
    } catch (error) {
      throw new Error(
        `Falha ao converter certificado PFX: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
    }
  }

  private findMatchingCertificate(keyBag: forge.pkcs12.Bag, key: forge.pki.PrivateKey, certBags: forge.pkcs12.Bag[]) {
    const keyLocalKeyId = this.getLocalKeyId(keyBag);
    if (keyLocalKeyId) {
      const byLocalKeyId = certBags.find((bag) => bag.cert && this.getLocalKeyId(bag) === keyLocalKeyId);
      if (byLocalKeyId?.cert) {
        return byLocalKeyId.cert;
      }
    }

    if (certBags.length === 1) {
      return certBags[0].cert;
    }

    return certBags.find((bag) => bag.cert && this.publicKeyMatchesPrivateKey(bag.cert.publicKey, key))?.cert;
  }

  private getLocalKeyId(bag: forge.pkcs12.Bag): string | undefined {
    const value = bag.attributes?.localKeyId;
    const localKeyId = Array.isArray(value) ? value[0] : value;
    if (!localKeyId) {
      return undefined;
    }
    if (typeof localKeyId === 'string') {
      return forge.util.bytesToHex(localKeyId);
    }
    if (Buffer.isBuffer(localKeyId)) {
      return localKeyId.toString('hex');
    }
    return String(localKeyId);
  }

  private buildCertificateChainPem(leafCert: forge.pki.Certificate, certBags: forge.pkcs12.Bag[]): string {
    const certificates = [
      leafCert,
      ...certBags
        .map((bag) => bag.cert)
        .filter((cert): cert is forge.pki.Certificate => Boolean(cert && cert !== leafCert)),
    ];
    const pems: string[] = [];

    certificates.forEach((cert) => {
      const pem = forge.pki.certificateToPem(cert);
      if (!pems.includes(pem)) {
        pems.push(pem);
      }
    });

    return pems.join('');
  }

  private publicKeyMatchesPrivateKey(publicKey: forge.pki.PublicKey, privateKey: forge.pki.PrivateKey): boolean {
    const publicRsa = publicKey as forge.pki.rsa.PublicKey;
    const privateRsa = privateKey as forge.pki.rsa.PrivateKey;
    return Boolean(
      publicRsa.n &&
        privateRsa.n &&
        publicRsa.e &&
        privateRsa.e &&
        publicRsa.n.toString(16) === privateRsa.n.toString(16) &&
        publicRsa.e.toString(16) === privateRsa.e.toString(16),
    );
  }
}
