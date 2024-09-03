import { IdentificacaoTomador } from './IdentificacaoTomador';
import { Endereco } from './Endereco';
import { Contato } from './Contato';

/**
 * Tomador
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface Tomador {
  /** IdentificacaoTomador */
  IdentificacaoTomador?: IdentificacaoTomador;
  /** xs:string */
  NifTomador?: string;
  /** xs:string */
  RazaoSocial?: string;
  /** Endereco */
  Endereco?: Endereco;
  /** Contato */
  Contato?: Contato;
}
