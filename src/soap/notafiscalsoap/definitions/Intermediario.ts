import { IdentificacaoIntermediario } from './IdentificacaoIntermediario';

/**
 * Intermediario
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Intermediario {
  /** IdentificacaoIntermediario */
  IdentificacaoIntermediario: IdentificacaoIntermediario;
  /** xs:string */
  RazaoSocial: string;
  /** xs:int */
  CodigoMunicipio: number;
}
