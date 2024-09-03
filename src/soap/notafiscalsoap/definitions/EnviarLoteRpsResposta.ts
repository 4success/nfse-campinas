import { ListaMensagemRetorno2 } from './ListaMensagemRetorno2';

/** EnviarLoteRpsResposta */
export interface EnviarLoteRpsResposta {
  /** xs:nonNegativeInteger */
  NumeroLote?: string;
  /** xs:dateTime */
  DataRecebimento?: string;
  /** xs:string */
  Protocolo?: string;
  /** ListaMensagemRetorno */
  ListaMensagemRetorno?: ListaMensagemRetorno2;
}
