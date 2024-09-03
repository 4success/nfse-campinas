import { X509IssuerSerial } from './X509IssuerSerial';

/**
 * X509Data
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.w3.org/2000/09/xmldsig#`
 */
export interface X509Data {
  /** a */
  0?: string;
  /** n */
  1?: string;
  /** y */
  2?: string;
  /** xs:string */
  X509SubjectName?: string;
  /** xs:base64Binary */
  X509Certificate?: string;
  /** xs:base64Binary */
  X509CRL?: string;
  /** xs:base64Binary */
  X509SKI?: string;
  /** X509IssuerSerial */
  X509IssuerSerial?: X509IssuerSerial;
}
