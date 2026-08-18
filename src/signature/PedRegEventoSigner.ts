import { PfxCertificate } from '../certificate/PfxCertificate';
import { defaultDpsSignatureOptions } from './signatureTypes';
import { XmlSigner } from './XmlSigner';

export class PedRegEventoSigner {
  private readonly signer: XmlSigner;

  constructor(certificate: PfxCertificate) {
    this.signer = new XmlSigner(certificate, {
      idAttributeTarget: 'infPedReg',
      idAttributeName: 'Id',
      signatureLocationTarget: 'infPedReg',
      signaturePrefix: '',
      canonicalizationAlgorithm: defaultDpsSignatureOptions.canonicalizationAlgorithm,
      signatureAlgorithm: defaultDpsSignatureOptions.signatureAlgorithm,
      digestAlgorithm: defaultDpsSignatureOptions.digestAlgorithm,
      transforms: defaultDpsSignatureOptions.transforms,
      missingIdError: 'XML do pedido de registro de evento não contém Id em infPedReg',
    });
  }

  sign(xml: string): string {
    return this.signer.sign(xml);
  }

  verify(xml: string): boolean {
    return this.signer.verify(xml);
  }
}
