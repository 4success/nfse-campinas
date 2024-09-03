import { Pedido } from './Pedido';

/**
 * Confirmacao
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Confirmacao {
  /** Pedido */
  Pedido?: Pedido;
  /** xs:dateTime */
  DataHora?: string;
}
