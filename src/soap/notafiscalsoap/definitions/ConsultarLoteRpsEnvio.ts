import { Prestador } from './Prestador';
import { Signature } from './Signature';

/** ConsultarLoteRpsEnvio */
export interface ConsultarLoteRpsEnvio {
  /** Prestador */
  Prestador?: Prestador;
  /** xs:string */
  Protocolo?: string;
  /** Signature */
  Signature?: Signature;
}
