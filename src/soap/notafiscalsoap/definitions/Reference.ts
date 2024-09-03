import { Transforms } from './Transforms';
import { DigestMethod } from './DigestMethod';

/**
 * Reference
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.w3.org/2000/09/xmldsig#`
 */
export interface Reference {
  /** Transforms */
  Transforms?: Transforms;
  /** DigestMethod */
  DigestMethod?: DigestMethod;
  /** xs:base64Binary */
  DigestValue?: string;
}
