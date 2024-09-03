import { Confirmacao } from './Confirmacao';
import { Signature } from './Signature';

/**
 * NfseCancelamento
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface NfseCancelamento {
  /** Confirmacao */
  Confirmacao?: Confirmacao;
  /** Signature */
  Signature?: Signature;
}
