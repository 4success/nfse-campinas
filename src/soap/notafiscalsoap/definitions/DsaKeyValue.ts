/**
 * DSAKeyValue
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.w3.org/2000/09/xmldsig#`
 */
export interface DsaKeyValue {
  /** xs:base64Binary */
  P?: string;
  /** xs:base64Binary */
  Q?: string;
  /** xs:base64Binary */
  G?: string;
  /** xs:base64Binary */
  Y?: string;
  /** xs:base64Binary */
  J?: string;
  /** xs:base64Binary */
  Seed?: string;
  /** xs:base64Binary */
  PgenCounter?: string;
}
