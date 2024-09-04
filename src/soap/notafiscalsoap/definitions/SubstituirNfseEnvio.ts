import { SubstituicaoNfse1 } from './SubstituicaoNfse1';
import { Signature } from './Signature';

/** SubstituirNfseEnvio */
export interface SubstituirNfseEnvio {
  /** SubstituicaoNfse */
  SubstituicaoNfse: SubstituicaoNfse1;
  /** Signature */
  Signature?: Signature;
}
