/**
 * Endereco
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Endereco {
  /** xs:string */
  Endereco?: string;
  /** xs:string */
  Numero?: string;
  /** xs:string */
  Complemento?: string;
  /** xs:string */
  Bairro?: string;
  /** xs:int */
  CodigoMunicipio?: number;
  /** xs:string */
  Uf?: string;
  /** xs:string */
  CodigoPais?: string;
  /** xs:string */
  Cep?: string;
}
