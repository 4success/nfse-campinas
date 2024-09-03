/**
 * RSAKeyValue
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.w3.org/2000/09/xmldsig#`
 */
export interface RsaKeyValue {
  /** xs:base64Binary */
  Modulus?: string;
  /** xs:base64Binary */
  Exponent?: string;
}
