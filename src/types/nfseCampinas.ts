export enum SituacaoRps {
    NORMAL = 'N',
    CANCELADA = 'C'
}

export enum TipoRecolhimento {
    A_RECEBER = 'A',
    RETIDO_NA_FONTE = 'R'
}

export enum OperacaoRps {
    SEM_DEDUCAO = 'A',
    COM_DEDUCAO_MATERIAIS = 'B',
    IMUNE_ISENTA_ISSQN = 'C',
    DEVOLUCAO_SIMPLES_REMESSA = 'D',
    INTERMEDIACAO = 'J'
}

export enum Tributacao {
    ISENTA_ISS = 'C',
    NAO_INCIDENCIA_NO_MUNICIPIO = 'E',
    IMUNE = 'F',
    EXIBILIDADE_SUSPENSA = 'K',
    NAO_TRIBUTAVEL = 'N',
    TRIBUTAVEL = 'T',
    TRIBUTAVEL_FIXO = 'G',
    TRIBUTAVEL_SN = 'H',
    MEI = 'M'
}

export enum ItemTributavel {
    ITEM_TRIBUTAVEL = 'S',
    NAO_TRIBUTAVEL = 'N'
}

export enum DeducaoPor {
    PERCENTUAL = 'Percentual',
    VALOR = 'Valor'
}

export enum TipoLogradouro {
    AVENIDA = 'Avenida',
    RUA = 'Rua',
    RODOVIA = 'Rodovia',
    RUELA = 'Ruela',
    SITIO = 'Sítio',
    QUADRA = 'Quadra',
    TRAVESSA = 'Travessa',
    VALE = 'Vale',
    VIA = 'Via',
    VIADUTO = 'Viaduto',
    VIELA = 'Viela',
    VILA = 'Vila',
    VARGEM = 'Vargem',
}

export enum TipoBairro {
    BAIRRO = 'Bairro',
    BOSQUE = 'Bosque',
    CHACARA = 'Chácara',
    CONJUNTO = 'Conjunto',
    DESMEMBRAMENTO = 'Desmembramento',
    DISTRITO = 'Distrito',
    FAVELA = 'Favela',
    FAZENDA = 'Fazenda',
    GLEBA = 'Gleba',
    HORTO = 'Horto',
    JARDIM = 'Jardim',
    LOTEAMENTO = 'Loteamento',
    NUCLEO = 'Núcleo',
    PARQUE = 'Parque',
    RESIDENCIAL = 'Residencial',
    SITIO = 'Sítio',
    TROPICAL = 'Tropical',
    VILA = 'Vila',
    ZONA = 'Zona',
}


export type ConsultarNotaRequest = {
    CodCidade: number;
    CPFCNPJRemetente: string;
    InscricaoMunicipalPrestador: string;
    dtInicio: string;
    dtFim: string;
    NotaInicial?: number
    Versao: number
}

export namespace ConsultarNotaResponse {
    export interface Cabecalho {
        CodCidade: string;
        CPFCNPJRemetente: string;
        InscricaoMunicipalPrestador: string;
        dtInicio: string;
        dtFim: string;
        Versao: string;
    }

    export interface SerieRPSSubstituido {
    }

    export interface InscricaoMunicipalTomador {
    }

    export interface MotCancelamento {
    }

    export interface Deducoes {
    }

    export interface Item {
        DiscriminacaoServico: string;
        Quantidade: string;
        ValorUnitario: string;
        ValorTotal: string;
        Tributavel: string;
    }

    export interface Itens {
        Item: Item;
    }

    export interface Nota {
        NumeroNota: string;
        DataProcessamento: Date;
        NumeroLote: string;
        CodigoVerificacao: string;
        Assinatura: string;
        InscricaoMunicipalPrestador: string;
        RazaoSocialPrestador: string;
        TipoRPS: string;
        SerieRPS: string;
        NumeroRPS: string;
        DataEmissaoRPS: Date;
        SituacaoRPS: string;
        SerieRPSSubstituido: SerieRPSSubstituido;
        NumeroRPSSubstituido: string;
        NumeroNFSeSubstituida: string;
        DataEmissaoNFSeSubstituida: Date;
        SeriePrestacao: string;
        InscricaoMunicipalTomador: InscricaoMunicipalTomador;
        CPFCNPJTomador: string;
        RazaoSocialTomador: string;
        TipoLogradouroTomador: string;
        LogradouroTomador: string;
        NumeroEnderecoTomador: string;
        ComplementoEnderecoTomador?: string;
        TipoBairroTomador: string;
        BairroTomador: string;
        CidadeTomador: string;
        CidadeTomadorDescricao: string;
        CEPTomador: string;
        EmailTomador: string;
        CodigoAtividade: string;
        AliquotaAtividade: string;
        TipoRecolhimento: string;
        MunicipioPrestacao: string;
        MunicipioPrestacaoDescricao: string;
        Operacao: string;
        Tributacao: string;
        ValorPIS: string;
        ValorCOFINS: string;
        ValorINSS: string;
        ValorIR: string;
        ValorCSLL: string;
        AliquotaPIS: string;
        AliquotaCOFINS: string;
        AliquotaINSS: string;
        AliquotaIR: string;
        AliquotaCSLL: string;
        DescricaoRPS: string;
        DDDPrestador?: string;
        TelefonePrestador?: string;
        DDDTomador?: string;
        TelefoneTomador?: string;
        MotCancelamento?: MotCancelamento;
        CpfCnpjIntermediario?: string,
        Deducoes: Deducoes;
        Itens: Itens;
    }

    export interface Notas {
        Nota: Nota[];
    }

    export interface RetornoConsultaNotas {
        Cabecalho: Cabecalho;
        Notas: Notas;
    }

    export interface RootObject {
        'ns1:RetornoConsultaNotas': RetornoConsultaNotas
    }
}


export namespace EnvioRpsRequest {
    export interface Cabecalho {
        CodCidade: string;
        CPFCNPJRemetente: string;
        RazaoSocialRemetente: string;
        transacao: boolean | '';
        dtInicio: string;
        dtFim: string;
        QtdRPS: number;
        ValorTotalServicos: number;
        ValorTotalDeducoes: number;
        Versao: number;
        MetodoEnvio: 'WS';
    }

    export interface CabecalhoSubstituicao extends Cabecalho {
        NumeroNFSeSubstituida: number;
        DataEmissaoNFSeSubstituida: string;
    }

    export interface Deducao {
        DeducaoPor: DeducaoPor;
        TipoDeducao: string;
        CPFCNPJReferencia: string;
        NumeroNFReferencia: string;
        ValorTotalReferencia: number;
        PercentualDeduzir: number;
        ValorDeduzir: number;
    }

    export interface Deducoes {
        Deducao: Deducao;
    }

    export interface Item {
        DiscriminacaoServico: string;
        Quantidade: number;
        ValorUnitario: number;
        ValorTotal: number;
    }

    export interface Itens {
        Item: Item[];
    }

    export interface RPS {
        '@Id': string;
        Assinatura: string;
        InscricaoMunicipalPrestador: string;
        RazaoSocialPrestador: string;
        TipoRPS: 'RPS';
        SerieRPS: string;
        NumeroRPS: string;
        DataEmissaoRPS: string;
        SituacaoRPS: SituacaoRps;
        SerieRPSSubstituido: string;
        NumeroRPSSubstituido: string;
        NumeroNFSeSubstituida: string;
        DataEmissaoNFSeSubstituida: string;
        SeriePrestacao: string;
        InscricaoMunicipalTomador: string;
        CPFCNPJTomador: string;
        RazaoSocialTomador: string;
        TipoLogradouroTomador: TipoLogradouro;
        LogradouroTomador: string;
        NumeroEnderecoTomador: string;
        ComplementoEnderecoTomador?: string;
        TipoBairroTomador: TipoBairro;
        BairroTomador: string;
        CidadeTomador: string;
        CidadeTomadorDescricao: string;
        CEPTomador: string;
        EmailTomador: string;
        CodigoAtividade: string;
        AliquotaAtividade: string;
        TipoRecolhimento: TipoRecolhimento;
        MunicipioPrestacao: string;
        MunicipioPrestacaoDescricao: string;
        Operacao: OperacaoRps;
        Tributacao: Tributacao;
        ValorPIS: number;
        ValorCOFINS: number;
        ValorINSS: number;
        ValorIR: number;
        ValorCSLL: number;
        AliquotaPIS: number;
        AliquotaCOFINS: number;
        AliquotaINSS: number;
        AliquotaIR: number;
        AliquotaCSLL: number;
        DescricaoRPS: string;
        DDDPrestador: string;
        TelefonePrestador: string;
        DDDTomador: string;
        TelefoneTomador: string;
        MotCancelamento: string;
        Deducoes: Deducoes[];
        Itens: Itens;
    }

    export interface Lote {
        '@Id': string;
        RPS: RPS[];
    }

    export interface Padrao {
        Cabecalho: Cabecalho;
        Lote: Lote;
    }

    export interface Substituicao {
        Cabecalho: CabecalhoSubstituicao;
        Lote: Lote;
    }
}

export namespace EnvioLoteResponse {
    export interface Cabecalho {
        CodCidade: string;
        Sucesso: string;
        NumeroLote: string;
        CPFCNPJRemetente: string;
        DataEnvioLote: Date;
        QtdNotasProcessadas: string;
        TempoProcessamento: string;
        ValorTotalServicos: string;
        ValorTotalDeducoes: string;
        Versao: string;
        Assincrono: string;
    }

    export interface ChaveNFe {
        CodigoVerificacao: string;
        InscricaoPrestador: number;
        NumeroNFe: number;
        RazaoSocialPrestador: string;
    }

    export interface ChaveRPS {
        DataEmissaoRPS: Date;
        InscricaoPrestador: number;
        NumeroRPS: number;
        RazaoSocialPrestador: string;
        SerieRPS: string;
    }

    export interface ChaveNFSeRPS {
        ChaveNFe: ChaveNFe;
        ChaveRPS: ChaveRPS;
    }

    export interface ChavesNFSeRPS {
        ChaveNFSeRPS: ChaveNFSeRPS;
    }

    export interface RetornoEnvioLoteRPS {
        Cabecalho: Cabecalho;
        Alertas: any[];
        Erros: string;
        ChavesNFSeRPS: ChavesNFSeRPS;
    }

    export interface RootObject {
        'ns1:RetornoEnvioLoteRPS': RetornoEnvioLoteRPS
    }
}


export namespace ConsultaLoteRequest {
    export interface Cabecalho {
        CodCidade: string;
        CPFCNPJRemetente: string;
        Versao: number;
        NumeroLote: number;
    }

    export interface RootObject {
        Cabecalho: Cabecalho;
    }
}

export namespace ConsultaLoteResponse {
    export interface Cabecalho {
        CodCidade: string;
        Sucesso: string;
        NumeroLote: string;
        CPFCNPJRemetente: string;
        RazaoSocialRemetente: string;
        DataEnvioLote: string;
        QtdNotasProcessadas: string;
        TempoProcessamento: string;
        ValorTotalServicos: string;
        ValorTotalDeducoes: string;
        Versao: string;
    }

    export interface ChaveRPS {
        InscricaoPrestador: string;
        SerieRPS: string;
        NumeroRPS: string;
        DataEmissaoRPS: string;
        RazaoSocialPrestador: string;
    }

    export interface Erro {
        Codigo: string;
        Descricao: string;
        ChaveRPS: ChaveRPS;
    }

    export interface ConsultaNFSe {
        InscricaoPrestador: string;
        NumeroNFe: string;
        CodigoVerificacao: string;
        SerieRPS: string;
        NumeroRPS: string;
        DataEmissaoRPS: string;
        RazaoSocialPrestador: string;
        TipoRecolhimento: string;
        ValorDeduzir: string;
        ValorTotal: string;
        Aliquota: string;
    }

    export interface ListaNFSe {
        ConsultaNFSe: ConsultaNFSe[];
    }

    export interface RetornoConsultaLote {
        Cabecalho: Cabecalho;
        Alertas?: string;
        Erros?: Erro[];
        ListaNFSe: ListaNFSe;
    }

    export interface RootObject {
        'ns1:RetornoConsultaLote': RetornoConsultaLote
    }
}

export namespace ConsultaSequencialRps {
    export interface Request {
        CodCid: string;
        IMPrestador: string;
        CPFCNPJRemetente: string;
        SeriePrestacao: number;
        Versao: number;
    }

    export interface Cabecalho {
        CodCid: string;
        CPFCNPJRemetente: string;
        IMPrestador: string;
        NroUltimoRps: string;
        SeriePrestacao: string;
        Versao: string;
    }

    export interface Ns1RetornoConsultaSeqRps {
        'xmlns:ns1': string;
        'xmlns:tipos': string;
        'xmlns:xsi': string;
        'xsi:schemaLocation': string;
        Cabecalho: Cabecalho;
    }

    export interface Response {
        'ns1:RetornoConsultaSeqRps': Ns1RetornoConsultaSeqRps;
    }
}

export namespace CancelarNfseRequest {

    export interface Cabecalho {
        CodCidade: string;
        CPFCNPJRemetente: string;
        transacao: boolean;
        Versao: number;
    }

    export interface Nota {
        '@Id': string;
        InscricaoMunicipalPrestador: string;
        NumeroNota: string;
        CodigoVerificacao: string;
        MotivoCancelamento: string;
    }

    export interface Lote {
        '@Id': string;
        Nota: Nota[];
    }

    export interface RootObject {
        '@schemaLocation'?: string;
        Cabecalho: Cabecalho;
        Lote: Lote;
    }
}

export namespace CancelarNfseResponse {

    export interface Cabecalho {
        CodCidade: string;
        Sucesso: string;
        CPFCNPJRemetente: string;
        Versao: string;
    }

    export interface Nota {
        InscricaoMunicipalPrestador: string;
        NumeroNota: string;
        CodigoVerificacao: string;
        MotivoCancelamento: string;
    }

    export interface NotasCanceladas {
        Nota: Nota;
    }

    export interface Alertas {
    }

    export interface Erros {
    }

    export interface Ns1RetornoCancelamentoNFSe {
        Cabecalho: Cabecalho;
        NotasCanceladas: NotasCanceladas;
        Alertas?: Alertas;
        Erros?: Erros;
    }

    export interface RootObject {
        'ns1:RetornoCancelamentoNFSe': Ns1RetornoCancelamentoNFSe;
    }

}

export namespace ConsultaNFSeRPSRequest {

    export interface Cabecalho {
        CodCidade: string;
        CPFCNPJRemetente: string;
        transacao: string;
        Versao: string;
    }

    export interface NotaConsulta {
        '@Id': string;
        InscricaoMunicipalPrestador: string;
        NumeroNota: string;
        CodigoVerificacao: string;
    }

    export interface RPSConsulta {
        '@Id': string;
        InscricaoMunicipalPrestador: string;
        NumeroRPS: string;
        SeriePrestacao: string;
    }

    export interface Lote {
        '@Id': string;
        NotaConsulta: NotaConsulta[];
        RPSConsulta: RPSConsulta[];
    }

    export interface RootObject {
        '@schemaLocation': string;
        Cabecalho: Cabecalho;
        Lote: Lote;
    }

}

export namespace ConsultaNFSeRPSResponse {

    export interface Cabecalho {
        CodCidade: string;
        CPFCNPJRemetente: string;
        transacao: string;
        Versao: string;
    }

    export interface Item {
        DiscriminacaoServico: string;
        Quantidade: string;
        ValorUnitario: string;
        ValorTotal: string;
        Tributavel: string;
    }

    export interface Itens {
        Item: Item[];
    }

    export interface NotasConsultada {
        NumeroNota: string;
        DataProcessamento: string;
        NumeroLote: string;
        CodigoVerificacao: string;
        Assinatura: string;
        InscricaoMunicipalPrestador: string;
        RazaoSocialPrestador: string;
        TipoRPS: string;
        SerieRPS: string;
        NumeroRPS: string;
        DataEmissaoRPS: string;
        SituacaoRPS: string;
        SerieRPSSubstituido: string;
        NumeroRPSSubstituido: string;
        NumeroNFSeSubstituida: string;
        DataEmissaoNFSeSubstituida: string;
        SeriePrestacao: string;
        InscricaoMunicipalTomador: string;
        CPFCNPJTomador: string;
        RazaoSocialTomador: string;
        TipoLogradouroTomador: string;
        LogradouroTomador: string;
        NumeroEnderecoTomador: string;
        ComplementoEnderecoTomador: string;
        TipoBairroTomador: string;
        BairroTomador: string;
        CidadeTomador: string;
        CidadeTomadorDescricao: string;
        CEPTomador: string;
        EmailTomador: string;
        CodigoAtividade: string;
        AliquotaAtividade: string;
        TipoRecolhimento: string;
        MunicipioPrestacao: string;
        MunicipioPrestacaoDescricao: string;
        Operacao: string;
        Tributacao: string;
        ValorPIS: string;
        ValorCOFINS: string;
        ValorINSS: string;
        ValorIR: string;
        ValorCSLL: string;
        AliquotaPIS: string;
        AliquotaCOFINS: string;
        AliquotaINSS: string;
        AliquotaIR: string;
        AliquotaCSLL: string;
        DescricaoRPS: string;
        DDDPrestador: string;
        TelefonePrestador: string;
        DDDTomador: string;
        TelefoneTomador: string;
        MotCancelamento: string;
        Deducoes: string;
        Itens: Itens;
    }

    export interface Erro {
        Codigo: string;
        Descricao: string;
    }

    export interface RootObject {
        '@schemaLocation': string;
        Cabecalho: Cabecalho;
        NotasConsultadas: NotasConsultada[];
        Alertas: any[];
        Erros: Erro[];
    }

}


export namespace ConsultaUrlNfse {
    export type Request = {
        cnpj: string,
        nfNum: string | number;
        codVerificacao: string;
        inscricaoMunicipal: string;
    }

    export type Response = {
        url: string,
        id_nota_fiscal: string,
        confirma: string,
        temPrestador: string,
        doc_prestador: string,
        numero_nota_fiscal: string,
        inscricao_prestador: string,
        cod_verificacao: string,
    }
}
