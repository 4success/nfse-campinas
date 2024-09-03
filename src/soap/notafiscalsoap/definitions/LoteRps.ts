import { CpfCnpj } from './CpfCnpj';
import { ListaRps } from './ListaRps';

/**
 * LoteRps
 * @targetNSAlias `ns1`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface LoteRps {
  /** xs:nonNegativeInteger */
  NumeroLote?: string;
  /** CpfCnpj */
  CpfCnpj?: CpfCnpj;
  /** xs:string */
  InscricaoMunicipal?: string;
  /** xs:int */
  QuantidadeRps?: number;
  /** ListaRps */
  ListaRps?: ListaRps;
}
