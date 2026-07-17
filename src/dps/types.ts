export type NfseCampinasV3Environment = 'homologacao' | 'producao';

/** Ambiente da DPS (`tpAmb`): 1 - Producao; 2 - Homologacao. */
export type AmbienteDps = 1 | 2;
export type ValidationMode = 'strict' | 'warn' | 'off';

/** Emitente da DPS (`tpEmit`): 1 - Prestador; 2 - Tomador; 3 - Intermediario. */
export type TipoEmitenteDps = 1 | 2 | 3;

/**
 * Situacao perante o Simples Nacional (`opSimpNac`):
 * 1 - Nao Optante; 2 - Optante MEI; 3 - Optante ME/EPP.
 */
export type OpcaoSimplesNacionalDps = 1 | 2 | 3;

/**
 * Regime especial de tributacao (`regEspTrib`): 0 - Nenhum; 1 - Ato Cooperado; 2 - Estimativa;
 * 3 - Microempresa Municipal; 4 - Notario ou Registrador; 5 - Profissional Autonomo;
 * 6 - Sociedade de Profissionais; 9 - Outros.
 */
export type RegimeEspecialTributacaoDps = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 9;

/** Tributacao ISSQN (`tribISSQN`): 1 - Tributavel; 2 - Imunidade; 3 - Exportacao; 4 - Nao incidencia. */
export type TributacaoIssqnDps = 1 | 2 | 3 | 4;

/** Retencao ISSQN (`tpRetISSQN`): 1 - Nao retido; 2 - Retido pelo tomador; 3 - Retido pelo intermediario. */
export type TipoRetencaoIssqnDps = 1 | 2 | 3;

/**
 * Codigo de Situacao Tributaria do PIS/COFINS (`CST`).
 * Valores oficiais do XSD DPS v1.01: 00, 01, 02, 03, 04, 05, 06, 07, 08, 09,
 * 49, 50, 51, 52, 53, 54, 55, 56, 60, 61, 62, 63, 64, 65, 66, 67,
 * 70, 71, 72, 73, 74, 75, 98, 99.
 */
export type CstPisCofinsDps =
  | '00'
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '49'
  | '50'
  | '51'
  | '52'
  | '53'
  | '54'
  | '55'
  | '56'
  | '60'
  | '61'
  | '62'
  | '63'
  | '64'
  | '65'
  | '66'
  | '67'
  | '70'
  | '71'
  | '72'
  | '73'
  | '74'
  | '75'
  | '98'
  | '99';

/**
 * Retencao PIS/COFINS/CSLL (`tpRetPisCofins`):
 * 0 - PIS/COFINS/CSLL nao retidos; 1 - PIS/COFINS retidos; 2 - PIS/COFINS nao retidos;
 * 3 - PIS/COFINS/CSLL retidos; 4 - PIS/COFINS retidos e CSLL nao retido;
 * 5 - PIS retido e COFINS/CSLL nao retido; 6 - COFINS retido e PIS/CSLL nao retido;
 * 7 - PIS nao retido e COFINS/CSLL retidos; 8 - PIS/COFINS nao retidos e CSLL retido;
 * 9 - COFINS nao retido e PIS/CSLL retidos.
 */
export type TipoRetencaoPisCofinsDps = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Indicador de total de tributos (`indTotTrib`): valor fixo 0 - Nao informar valor estimado. */
export type IndicadorTotalTributosDps = 0;

/** Finalidade da NFSe (`finNFSe`): valor fixo 0 - NFSe regular. */
export type FinalidadeNfseDps = 0;

/** Destinatario (`indDest`): 0 - Destinatario e o tomador; 1 - Destinatario nao e o tomador. */
export type IndicadorDestinatarioDps = 0 | 1;

export type BuildDpsIdInput = {
  codigoMunicipioEmissao: string;
  tipoInscricaoFederal: '1' | '2';
  inscricaoFederal: string;
  serie: string | number;
  numeroDps: string | number;
};

export type DpsXmlOptions = {
  namespace?: string | false;
  idAttributeTarget?: 'infDPS' | 'DPS';
};

export type DpsInput = {
  ambiente?: NfseCampinasV3Environment | AmbienteDps;
  idDps?: string;
  dataHoraEmissao: string | Date;
  versaoAplicativo?: string;
  serie: string | number;
  numeroDps: string | number;
  dataCompetencia: string | Date;
  tipoEmitente: TipoEmitenteDps;
  municipioEmissao: string;
  prestador: PrestadorDps;
  tomador?: TomadorDps;
  destinatario?: DestinatarioDps;
  servico: ServicoDps;
  valores: ValoresDps;
  ibsCbs?: IbsCbsDps;
  xml?: DpsXmlOptions;
  validationMode?: ValidationMode;
};

export type PrestadorDps = {
  cnpj?: string;
  cpf?: string;
  inscricaoMunicipal?: string;
  razaoSocial?: string;
  regimeTributario?: {
    opcaoSimplesNacional?: OpcaoSimplesNacionalDps;
    regimeEspecialTributacao?: RegimeEspecialTributacaoDps;
  };
};

export type EnderecoDps = {
  municipio: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
};

export type TomadorDps = {
  cnpj?: string;
  cpf?: string;
  nif?: string;
  razaoSocial?: string;
  email?: string;
  telefone?: string;
  endereco?: EnderecoDps;
};

export type DestinatarioDps = TomadorDps;

export type ServicoDps = {
  municipioPrestacao: string;
  codigoTributacaoNacional: string;
  codigoTributacaoMunicipal?: string;
  descricao: string;
  codigoNbs?: string;
};

export type ValoresDps = {
  valorServico: string | number;
  valorDescontoIncondicionado?: string | number;
  valorDescontoCondicionado?: string | number;
  tributacaoMunicipal?: {
    tributacaoIssqn?: TributacaoIssqnDps;
    tipoRetencaoIssqn?: TipoRetencaoIssqnDps;
    aliquota?: string | number;
  };
  tributacaoFederal?: {
    pisCofins?: {
      cst?: CstPisCofinsDps;
      baseCalculo?: string | number;
      aliquotaPis?: string | number;
      aliquotaCofins?: string | number;
      valorPis?: string | number;
      valorCofins?: string | number;
      tipoRetencaoPisCofins?: TipoRetencaoPisCofinsDps;
    };
    valorRetidoIrrf?: string | number;
    valorRetidoCsll?: string | number;
    valorRetidoInss?: string | number;
  };
  totalTributos?: {
    indicadorTotalTributos?: IndicadorTotalTributosDps;
    percentualTotalTributos?: string | number;
    valorTotalTributos?: string | number;
  };
};

export type IbsCbsDps = {
  finalidadeNfse: FinalidadeNfseDps;
  /** Codigo indicador de operacao (`cIndOp`): 6 digitos conforme tabela externa oficial IBS/CBS. */
  codigoIndicadorOperacao: string;
  indicadorDestinatario: IndicadorDestinatarioDps;
  /** Codigo de situacao tributaria (`IBSCBS/valores/trib/gIBSCBS/CST`). */
  cst: string;
  /** Classificacao tributaria (`cClassTrib`): 6 digitos conforme tabela externa oficial IBS/CBS. */
  classificacaoTributaria: string;
};
