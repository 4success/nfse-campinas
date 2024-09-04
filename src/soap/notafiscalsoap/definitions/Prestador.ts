import { CpfCnpj } from './CpfCnpj';

/**
 * Prestador
 * @targetNSAlias `ns1`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Prestador {
  /** CpfCnpj */
  CpfCnpj: CpfCnpj;
  /** xs:string */
  InscricaoMunicipal: string;
}
