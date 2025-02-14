import { Rps } from './Rps';
import { Servico } from './Servico';
import { Prestador } from './Prestador';
import { Tomador } from './Tomador';
import { Intermediario } from './Intermediario';
import { ConstrucaoCivil } from './ConstrucaoCivil';
import { Binario } from './Binario';

/**
 * InfDeclaracaoPrestacaoServico
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface InfDeclaracaoPrestacaoServico {
  /** Rps */
  Rps?: Rps;
  /** xs:date */
  Competencia: string;
  /** Servico */
  Servico: Servico;
  /** Prestador */
  Prestador: Prestador;
  /** Tomador */
  Tomador?: Tomador;
  /** Intermediario */
  Intermediario?: Intermediario;
  /** ConstrucaoCivil */
  ConstrucaoCivil?: ConstrucaoCivil;
  /** xs:byte */
  RegimeEspecialTributacao?: RegimeEspecialTributacao;
  /** xs:byte */
  OptanteSimplesNacional: Binario;
  /** xs:byte */
  IncentivoFiscal: Binario;
}

export enum RegimeEspecialTributacao {
  MICROEMPRESA_MUNICIPAL = '1',
  ESTIMATIVA = '2',
  SOCIEDADE_PROFISSIONAIS = '3',
  COOPERATIVA = '4',
  MEI = '5',
  ME_EPP = '6',
}
