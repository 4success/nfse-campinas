import { IdentificacaoRps } from './IdentificacaoRps';
import { Prestador } from './Prestador';
import { Signature } from './Signature';

/** ConsultarNfseRpsEnvio */
export interface ConsultarNfseRpsEnvio {
  /** IdentificacaoRps */
  IdentificacaoRps: IdentificacaoRps;
  /** Prestador */
  Prestador: Prestador;
  /** Signature */
  Signature?: Signature;
}
