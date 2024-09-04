/**
 * IdentificacaoRps
 * @targetNSAlias `ns1`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface IdentificacaoRps {
  /** xs:nonNegativeInteger */
  Numero: string;
  /** xs:string */
  Serie: string;
  /** xs:string */
  Tipo: TipoRps;
}

export enum TipoRps {
  RPS = '1',
  NotaFiscalConjugada = '2',
  Cupom = '3'
}