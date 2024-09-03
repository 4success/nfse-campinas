import { SignedInfo } from './SignedInfo';
import { KeyInfo } from './KeyInfo';
import { Object } from './Object';

/**
 * Signature
 * @targetNSAlias `ns2`
 * @targetNamespace `http://www.w3.org/2000/09/xmldsig#`
 */
export interface Signature {
  /** SignedInfo */
  SignedInfo?: SignedInfo;
  /** xs:base64Binary */
  SignatureValue?: string;
  /** KeyInfo */
  KeyInfo?: KeyInfo;
  /** Object[] */
  Object?: Array<Object>;
}
