import { SignedXml } from 'xml-crypto';
import { PfxCertificate } from '../certificate/PfxCertificate';
import { defaultDpsSignatureOptions, DpsSignatureOptions } from './signatureTypes';

export class DpsSigner {
  constructor(
    private readonly certificate: PfxCertificate,
    private readonly options: DpsSignatureOptions = defaultDpsSignatureOptions,
  ) {}

  sign(xml: string, overrideOptions: Partial<DpsSignatureOptions> = {}): string {
    const options = { ...this.options, ...overrideOptions };
    const pem = this.certificate.toPem();
    const id = this.extractId(xml, options);
    const targetXPath = `//*[local-name(.)='${options.idAttributeTarget}' and @${options.idAttributeName}='${id}']`;
    const sig = new SignedXml({
      privateKey: pem.privateKey,
      publicCert: pem.publicCert,
      idAttribute: options.idAttributeName,
      signatureAlgorithm: options.signatureAlgorithm,
      canonicalizationAlgorithm: options.canonicalizationAlgorithm,
      implicitTransforms: ['http://www.w3.org/TR/2001/REC-xml-c14n-20010315'],
    });

    sig.addReference({
      xpath: targetXPath,
      uri: `#${id}`,
      transforms: options.transforms,
      digestAlgorithm: options.digestAlgorithm,
    });

    sig.computeSignature(xml, {
      prefix: options.signaturePrefix || '',
      location: {
        reference: "//*[local-name(.)='infDPS']",
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
      publicCert: this.certificate.toPem().publicCert,
      idAttribute: this.options.idAttributeName,
    });
    try {
      sig.loadSignature(signatureMatch[0]);
      return sig.checkSignature(xml);
    } catch {
      return false;
    }
  }

  private extractId(xml: string, options: DpsSignatureOptions): string {
    const targetMatch = xml.match(
      new RegExp(
        `<(?:[A-Za-z_][\\w.-]*:)?${options.idAttributeTarget}\\b[^>]*\\s${options.idAttributeName}\\s*=\\s*(["'])([^"']+)\\1`,
      ),
    );
    if (!targetMatch) {
      throw new Error(`XML da DPS não contém ${options.idAttributeName} em ${options.idAttributeTarget}`);
    }
    return targetMatch[2];
  }
}
