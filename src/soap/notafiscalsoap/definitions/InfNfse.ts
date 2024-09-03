import { ValoresNfse } from './ValoresNfse';
import { PrestadorServico } from './PrestadorServico';
import { OrgaoGerador } from './OrgaoGerador';
import { DeclaracaoPrestacaoServico } from './DeclaracaoPrestacaoServico';

/**
 * InfNfse
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface InfNfse {
  /** xs:nonNegativeInteger */
  Numero?: string;
  /** xs:string */
  CodigoVerificacao?: string;
  /** xs:dateTime */
  DataEmissao?: string;
  /** xs:nonNegativeInteger */
  NfseSubstituida?: string;
  /** xs:string */
  OutrasInformacoes?: string;
  /** ValoresNfse */
  ValoresNfse?: ValoresNfse;
  /** xs:decimal */
  ValorCredito?: number;
  /** PrestadorServico */
  PrestadorServico?: PrestadorServico;
  /** OrgaoGerador */
  OrgaoGerador?: OrgaoGerador;
  /** DeclaracaoPrestacaoServico */
  DeclaracaoPrestacaoServico?: DeclaracaoPrestacaoServico;
}
