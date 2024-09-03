import { Rps } from './Rps';
import { Servico } from './Servico';
import { Prestador } from './Prestador';
import { Tomador } from './Tomador';
import { Intermediario } from './Intermediario';
import { ConstrucaoCivil } from './ConstrucaoCivil';

/**
 * InfDeclaracaoPrestacaoServico
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface InfDeclaracaoPrestacaoServico {
  /** Rps */
  Rps?: Rps;
  /** xs:date */
  Competencia?: string;
  /** Servico */
  Servico?: Servico;
  /** Prestador */
  Prestador?: Prestador;
  /** Tomador */
  Tomador?: Tomador;
  /** Intermediario */
  Intermediario?: Intermediario;
  /** ConstrucaoCivil */
  ConstrucaoCivil?: ConstrucaoCivil;
  /** xs:byte */
  RegimeEspecialTributacao?: string;
  /** xs:byte */
  OptanteSimplesNacional?: string;
  /** xs:byte */
  IncentivoFiscal?: string;
}
