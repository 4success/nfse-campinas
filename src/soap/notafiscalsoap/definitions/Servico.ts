import { Valores } from './Valores';

/**
 * Servico
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Servico {
  /** Valores */
  Valores?: Valores;
  /** xs:byte */
  IssRetido?: string;
  /** xs:byte */
  ResponsavelRetencao?: string;
  /** xs:string */
  ItemListaServico?: string;
  /** xs:int */
  CodigoCnae?: number;
  /** xs:string */
  CodigoTributacaoMunicipio?: string;
  /** xs:string */
  CodigoNbs?: string;
  /** xs:string */
  Discriminacao?: string;
  /** xs:int */
  CodigoMunicipio?: number;
  /** xs:string */
  CodigoPais?: string;
  /** xs:byte */
  ExigibilidadeISS?: string;
  /** xs:int */
  MunicipioIncidencia?: number;
  /** xs:string */
  NumeroProcesso?: string;
}
