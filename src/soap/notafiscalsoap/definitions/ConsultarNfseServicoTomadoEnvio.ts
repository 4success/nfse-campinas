import { Consulente } from './Consulente';
import { PeriodoEmissao } from './PeriodoEmissao';
import { PeriodoCompetencia } from './PeriodoCompetencia';
import { Prestador } from './Prestador';
import { IdentificacaoTomador } from './IdentificacaoTomador';
import { IdentificacaoIntermediario } from './IdentificacaoIntermediario';
import { Signature } from './Signature';

/** ConsultarNfseServicoTomadoEnvio */
export interface ConsultarNfseServicoTomadoEnvio {
  /** Consulente */
  Consulente?: Consulente;
  /** xs:nonNegativeInteger */
  NumeroNfse?: string;
  /** PeriodoEmissao */
  PeriodoEmissao?: PeriodoEmissao;
  /** PeriodoCompetencia */
  PeriodoCompetencia?: PeriodoCompetencia;
  /** Prestador */
  Prestador?: Prestador;
  /** Tomador */
  Tomador?: IdentificacaoTomador;
  /** Intermediario */
  Intermediario?: IdentificacaoIntermediario;
  /** xs:nonNegativeInteger */
  Pagina?: string;
  /** Signature */
  Signature?: Signature;
}
