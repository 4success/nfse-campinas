import { IdentificacaoRps } from './IdentificacaoRps';

/**
 * Rps
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Rps {
  /** IdentificacaoRps */
  IdentificacaoRps?: IdentificacaoRps;
  /** xs:date */
  DataEmissao?: string;
  /** xs:byte */
  Status?: string;
  /** RpsSubstituido */
  RpsSubstituido?: IdentificacaoRps;
}
