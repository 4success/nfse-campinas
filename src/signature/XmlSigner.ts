import { SignedXml } from 'xml-crypto';
import { PfxCertificate } from '../certificate/PfxCertificate';

export type XmlSignerOptions = {
  idAttributeTarget: string;
  idAttributeName: string;
  signatureLocationTarget: string;
  signaturePrefix: string;
  canonicalizationAlgorithm: string;
  signatureAlgorithm: string;
  digestAlgorithm: string;
  transforms: string[];
  missingIdError: string;
};

export class XmlSigner {
  constructor(private readonly certificate: PfxCertificate, private readonly options: XmlSignerOptions) {}

  sign(xml: string): string {
    const pem = this.certificate.toPem();
    const id = this.extractId(xml);
    const targetXPath = this.targetXPath(id);
    const sig = new SignedXml({
      privateKey: pem.privateKey,
      publicCert: this.extractLeafCertificate(pem.publicCert),
      ...this.customIdAttributeOption(),
      signatureAlgorithm: this.options.signatureAlgorithm,
      canonicalizationAlgorithm: this.options.canonicalizationAlgorithm,
      implicitTransforms: ['http://www.w3.org/TR/2001/REC-xml-c14n-20010315'],
    });

    sig.addReference({
      xpath: targetXPath,
      uri: `#${id}`,
      transforms: this.options.transforms,
      digestAlgorithm: this.options.digestAlgorithm,
    });

    sig.computeSignature(xml, {
      prefix: this.options.signaturePrefix,
      location: {
        reference: `//*[local-name(.)='${this.options.signatureLocationTarget}']`,
        action: 'after',
      },
    });

    return sig.getSignedXml();
  }

  verify(xml: string): boolean {
    const signatureMatch = xml.match(/<([A-Za-z_][\w.-]*:)?Signature\b[\s\S]*?<\/\1Signature>/);
    if (!signatureMatch) {
      return false;
    }

    const sig = new SignedXml({
      publicCert: this.extractLeafCertificate(this.certificate.toPem().publicCert),
      ...this.customIdAttributeOption(),
    });
    try {
      sig.loadSignature(signatureMatch[0]);
      if (!sig.checkSignature(xml)) {
        return false;
      }

      const id = this.extractId(xml);
      const references = sig.getReferences();
      return references.length === 1 && references[0].uri === `#${id}`;
    } catch {
      return false;
    }
  }

  private extractId(xml: string): string {
    const targetMatch = xml.match(
      new RegExp(
        `<(?:[A-Za-z_][\\w.-]*:)?${this.options.idAttributeTarget}\\b[^>]*\\s${this.options.idAttributeName}\\s*=\\s*(["'])([^"']+)\\1`,
      ),
    );
    if (!targetMatch) {
      throw new Error(this.options.missingIdError);
    }
    return targetMatch[2];
  }

  private targetXPath(id: string): string {
    return `//*[local-name(.)='${this.options.idAttributeTarget}' and @${this.options.idAttributeName}='${id}']`;
  }

  private extractLeafCertificate(publicCert: string): string {
    const leafCertificate = publicCert.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);
    return leafCertificate?.[0] || publicCert;
  }

  private customIdAttributeOption(): { idAttribute?: string } {
    return ['Id', 'ID', 'id'].includes(this.options.idAttributeName)
      ? {}
      : { idAttribute: this.options.idAttributeName };
  }
}
