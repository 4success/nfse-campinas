import { DsaKeyValue } from './DsaKeyValue';
import { RsaKeyValue } from './RsaKeyValue';

/**
 * KeyValue
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.w3.org/2000/09/xmldsig#`
 */
export interface KeyValue {
  /** a */
  0?: string;
  /** n */
  1?: string;
  /** y */
  2?: string;
  /** DSAKeyValue */
  DSAKeyValue?: DsaKeyValue;
  /** RSAKeyValue */
  RSAKeyValue?: RsaKeyValue;
}
