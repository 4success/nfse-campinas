import { Prestador } from './Prestador';
import { PeriodoEmissao1 } from './PeriodoEmissao1';
import { PeriodoCompetencia1 } from './PeriodoCompetencia1';
import { IdentificacaoTomador } from './IdentificacaoTomador';
import { IdentificacaoIntermediario } from './IdentificacaoIntermediario';
import { Signature } from './Signature';

/** ConsultarNfseServicoPrestadoEnvio */
export interface ConsultarNfseServicoPrestadoEnvio {
  /** Prestador */
  Prestador: Prestador;
  /** xs:nonNegativeInteger */
  NumeroNfse?: string;
  /** PeriodoEmissao */
  PeriodoEmissao?: PeriodoEmissao1;
  /** PeriodoCompetencia */
  PeriodoCompetencia?: PeriodoCompetencia1;
  /** Tomador */
  Tomador?: IdentificacaoTomador;
  /** Intermediario */
  Intermediario?: IdentificacaoIntermediario;
  /** xs:nonNegativeInteger */
  Pagina: string;
  /** Signature */
  Signature?: Signature;
}
