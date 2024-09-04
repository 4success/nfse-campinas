/**
 * Valores
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Valores {
  /** xs:decimal */
  ValorServicos: number;
  /** xs:decimal */
  ValorDeducoes?: number;
  /** xs:decimal */
  ValorPis?: number;
  /** xs:decimal */
  ValorCofins?: number;
  /** xs:decimal */
  ValorInss?: number;
  /** xs:decimal */
  ValorIr?: number;
  /** xs:decimal */
  ValorCsll?: number;
  /** xs:decimal */
  OutrasRetencoes?: number;
  /** xs:decimal */
  ValTotTributos?: number;
  /** xs:decimal */
  ValorIss?: number;
  /** xs:decimal */
  Aliquota?: number;
  /** xs:decimal */
  DescontoIncondicionado?: number;
  /** xs:decimal */
  DescontoCondicionado?: number;
}
