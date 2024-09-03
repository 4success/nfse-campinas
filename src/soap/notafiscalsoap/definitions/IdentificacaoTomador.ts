import { CpfCnpj } from './CpfCnpj';

/**
 * IdentificacaoTomador
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface IdentificacaoTomador {
  /** CpfCnpj */
  CpfCnpj?: CpfCnpj;
  /** xs:string */
  InscricaoMunicipal?: string;
}
