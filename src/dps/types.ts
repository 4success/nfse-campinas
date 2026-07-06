export type NfseCampinasV3Environment = 'homologacao' | 'producao';
export type AmbienteDps = 1 | 2;
export type ValidationMode = 'strict' | 'warn' | 'off';

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
  tipoEmitente: number;
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
    opcaoSimplesNacional?: number;
    regimeEspecialTributacao?: number;
  };
};

export type EnderecoDps = {
  municipio: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  uf?: string;
  pais?: string;
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
  codigoCnae?: string;
  codigoCbo?: string;
};

export type ValoresDps = {
  valorServico: string | number;
  valorDescontoIncondicionado?: string | number;
  valorDescontoCondicionado?: string | number;
  tributacaoMunicipal?: {
    tributacaoIssqn?: number;
    tipoRetencaoIssqn?: number;
    aliquota?: string | number;
  };
  tributacaoFederal?: {
    pisCofins?: {
      cst?: string;
      baseCalculo?: string | number;
      aliquotaPis?: string | number;
      aliquotaCofins?: string | number;
      valorPis?: string | number;
      valorCofins?: string | number;
      tipoRetencaoPisCofins?: number;
    };
    valorRetidoIrrf?: string | number;
    valorRetidoCsll?: string | number;
    valorRetidoInss?: string | number;
  };
  totalTributos?: {
    indicadorTotalTributos?: number;
    percentualTotalTributos?: string | number;
    valorTotalTributos?: string | number;
  };
};

export type IbsCbsDps = {
  finalidadeNfse: number;
  codigoIndicadorOperacao: string;
  indicadorDestinatario: number;
  classificacaoTributaria: string;
  indicadorZonaFrancaManausAlc?: number;
};
