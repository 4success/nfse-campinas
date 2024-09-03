import { ListaNfse1 } from './ListaNfse1';
import { ListaMensagemRetorno3 } from './ListaMensagemRetorno3';
import { ListaMensagemRetornoLote } from './ListaMensagemRetornoLote';

/** EnviarLoteRpsSincronoResposta */
export interface EnviarLoteRpsSincronoResposta {
  /** xs:nonNegativeInteger */
  NumeroLote?: string;
  /** xs:dateTime */
  DataRecebimento?: string;
  /** xs:string */
  Protocolo?: string;
  /** ListaNfse */
  ListaNfse?: ListaNfse1;
  /** ListaMensagemRetorno */
  ListaMensagemRetorno?: ListaMensagemRetorno3;
  /** ListaMensagemRetornoLote */
  ListaMensagemRetornoLote?: ListaMensagemRetornoLote;
}
