import { SubstituicaoNfse } from './SubstituicaoNfse';
import { Signature } from './Signature';

/**
 * NfseSubstituicao
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface NfseSubstituicao {
  /** SubstituicaoNfse */
  SubstituicaoNfse?: SubstituicaoNfse;
  /** Signature */
  Signature?: Signature;
}
