import { PfxCertificate } from '../certificate/PfxCertificate';
import { defaultDpsSignatureOptions, DpsSignatureOptions } from './signatureTypes';
import { XmlSigner } from './XmlSigner';

export class DpsSigner {
  constructor(
    private readonly certificate: PfxCertificate,
    private readonly options: DpsSignatureOptions = defaultDpsSignatureOptions,
  ) {}

  sign(xml: string, overrideOptions: Partial<DpsSignatureOptions> = {}): string {
    const options = { ...this.options, ...overrideOptions };
    return this.createSigner(options).sign(xml);
  }

  verify(xml: string): boolean {
    return this.createSigner(this.options).verify(xml);
  }

  private createSigner(options: DpsSignatureOptions): XmlSigner {
    return new XmlSigner(this.certificate, {
      ...options,
      signaturePrefix: options.signaturePrefix || '',
      signatureLocationTarget: 'infDPS',
      missingIdError: `XML da DPS não contém ${options.idAttributeName} em ${options.idAttributeTarget}`,
    });
  }
}
