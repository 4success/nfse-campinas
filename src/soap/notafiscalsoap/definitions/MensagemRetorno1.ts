import { IdentificacaoRps } from './IdentificacaoRps';

/**
 * MensagemRetorno
 * @targetNSAlias `ns1`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface MensagemRetorno1 {
  /** IdentificacaoRps */
  IdentificacaoRps?: IdentificacaoRps;
  /** xs:string */
  Codigo?: string;
  /** xs:string */
  Mensagem?: string;
}
