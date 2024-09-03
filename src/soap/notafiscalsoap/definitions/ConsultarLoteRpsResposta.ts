import { ListaNfse3 } from './ListaNfse3';
import { ListaMensagemRetorno6 } from './ListaMensagemRetorno6';
import { ListaMensagemRetornoLote1 } from './ListaMensagemRetornoLote1';

/** ConsultarLoteRpsResposta */
export interface ConsultarLoteRpsResposta {
  /** xs:byte */
  Situacao?: string;
  /** ListaNfse */
  ListaNfse?: ListaNfse3;
  /** ListaMensagemRetorno */
  ListaMensagemRetorno?: ListaMensagemRetorno6;
  /** ListaMensagemRetornoLote */
  ListaMensagemRetornoLote?: ListaMensagemRetornoLote1;
}
