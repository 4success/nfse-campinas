import { Prestador } from './Prestador';
import { Faixa } from './Faixa';
import { Signature } from './Signature';

/** ConsultarNfseFaixaEnvio */
export interface ConsultarNfseFaixaEnvio {
  /** Prestador */
  Prestador?: Prestador;
  /** Faixa */
  Faixa?: Faixa;
  /** xs:nonNegativeInteger */
  Pagina?: string;
  /** Signature */
  Signature?: Signature;
}
