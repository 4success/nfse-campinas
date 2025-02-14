import { Valores } from './Valores';
import { Binario } from './Binario';

/**
 * Servico
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Servico {
  /** Valores */
  Valores: Valores;
  /** xs:byte */
  IssRetido: Binario;
  /** xs:byte */
  ResponsavelRetencao?: ResponsavelRetencao;
  /** xs:string */
  ItemListaServico: string;
  /** xs:int */
  CodigoCnae?: number;
  /** xs:string */
  CodigoTributacaoMunicipio?: string;
  /** xs:string */
  CodigoNbs?: string;
  /** xs:string */
  Discriminacao: string;
  /** xs:int */
  CodigoMunicipio: number;
  /** xs:string */
  CodigoPais?: string;
  /** xs:byte */
  ExigibilidadeISS: ExigibilidadeISS;
  /** xs:int */
  MunicipioIncidencia?: number;
  /** xs:string */
  NumeroProcesso?: string;
}

export enum ExigibilidadeISS {
  EXIGIVEL = '1',
  NAO_INCIDENCIA = '2',
  ISENCAO = '3',
  EXPORTACAO = '4',
  IMUNIDADE = '5',
  EXIBILIDADE_SUSPENSA_DECISAO_JURIDICAL = '6',
  EXIBILIDADE_SUSPENSA_PROCESSO_ADMINISTRATIVO = '7',
}

export enum ResponsavelRetencao {
  TOMADOR = '1',
  INTERMEDIARIO = '2',
}
