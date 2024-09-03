import { InfNfse } from './InfNfse';
import { Signature } from './Signature';

/**
 * Nfse
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Nfse {
  /** InfNfse */
  InfNfse?: InfNfse;
  /** Signature */
  Signature?: Signature;
}
