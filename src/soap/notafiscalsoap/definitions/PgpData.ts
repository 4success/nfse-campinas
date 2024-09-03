/**
 * PGPData
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.w3.org/2000/09/xmldsig#`
 */
export interface PgpData {
  /** a */
  0?: string;
  /** n */
  1?: string;
  /** y */
  2?: string;
  /** xs:base64Binary */
  PGPKeyPacket?: string;
  /** xs:base64Binary */
  PGPKeyID?: string;
}
