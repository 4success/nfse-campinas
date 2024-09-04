import { CpfCnpj } from './CpfCnpj';

/**
 * Consulente
 * @targetNSAlias `ns1`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Consulente {
  /** CpfCnpj */
  CpfCnpj: CpfCnpj;
  /** xs:string */
  InscricaoMunicipal?: string;
}
