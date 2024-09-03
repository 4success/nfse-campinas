import { Pedido } from './Pedido';
import { DeclaracaoPrestacaoServico } from './DeclaracaoPrestacaoServico';

/** SubstituicaoNfse */
export interface SubstituicaoNfse1 {
  /** Pedido */
  Pedido?: Pedido;
  /** Rps */
  Rps?: DeclaracaoPrestacaoServico;
}
