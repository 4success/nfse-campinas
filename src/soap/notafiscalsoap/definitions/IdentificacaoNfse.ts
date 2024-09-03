import { CpfCnpj } from './CpfCnpj';

/**
 * IdentificacaoNfse
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface IdentificacaoNfse {
  /** xs:nonNegativeInteger */
  Numero: string;
  /** CpfCnpj */
  CpfCnpj: CpfCnpj;
  /** xs:string */
  InscricaoMunicipal?: string;
  /** xs:int */
  CodigoMunicipio: number;
}
