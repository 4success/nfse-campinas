import { Prestador } from './Prestador';
import { Endereco } from './Endereco';
import { Contato } from './Contato';

/**
 * PrestadorServico
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface PrestadorServico {
  /** IdentificacaoPrestador */
  IdentificacaoPrestador?: Prestador;
  /** xs:string */
  RazaoSocial?: string;
  /** xs:string */
  NomeFantasia?: string;
  /** Endereco */
  Endereco?: Endereco;
  /** Contato */
  Contato?: Contato;
}
