import { CanonicalizationMethod } from './CanonicalizationMethod';
import { SignatureMethod } from './SignatureMethod';
import { Reference } from './Reference';

/**
 * SignedInfo
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.w3.org/2000/09/xmldsig#`
 */
export interface SignedInfo {
  /** CanonicalizationMethod */
  CanonicalizationMethod?: CanonicalizationMethod;
  /** SignatureMethod */
  SignatureMethod?: SignatureMethod;
  /** Reference[] */
  Reference?: Array<Reference>;
}
