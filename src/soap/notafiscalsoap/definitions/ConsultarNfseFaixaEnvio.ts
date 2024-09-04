import { Prestador } from './Prestador';
import { Faixa } from './Faixa';

/** ConsultarNfseFaixaEnvio */
export interface ConsultarNfseFaixaEnvio {
  /** Prestador */
  Prestador: Prestador;
  /** Faixa */
  Faixa: Faixa;
  /** xs:nonNegativeInteger */
  Pagina: string;
}
