import { CpfCnpj } from './CpfCnpj';

/**
 * IdentificacaoIntermediario
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface IdentificacaoIntermediario {
  /** CpfCnpj */
  CpfCnpj: CpfCnpj;
  /** xs:string */
  InscricaoMunicipal?: string;
}
