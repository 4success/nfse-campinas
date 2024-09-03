import { Nfse } from './Nfse';
import { NfseCancelamento } from './NfseCancelamento';
import { NfseSubstituicao } from './NfseSubstituicao';

/**
 * CompNfse
 * @targetNSAlias `ns1`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface CompNfse {
  /** Nfse */
  Nfse?: Nfse;
  /** NfseCancelamento */
  NfseCancelamento?: NfseCancelamento;
  /** NfseSubstituicao */
  NfseSubstituicao?: NfseSubstituicao;
}
