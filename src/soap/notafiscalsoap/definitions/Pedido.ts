import { InfPedidoCancelamento } from './InfPedidoCancelamento';
import { Signature } from './Signature';

/**
 * Pedido
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Pedido {
  /** InfPedidoCancelamento */
  InfPedidoCancelamento: InfPedidoCancelamento;
  /** Signature */
  Signature?: Signature;
}
