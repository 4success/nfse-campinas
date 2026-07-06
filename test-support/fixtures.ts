import { DpsInput } from '../src/dps/types';

export const sampleDpsInput: DpsInput = {
  ambiente: 'homologacao',
  serie: '00001',
  numeroDps: '1',
  dataCompetencia: '2026-06-30',
  dataHoraEmissao: '2026-06-30T21:41:28-03:00',
  tipoEmitente: 1,
  municipioEmissao: '3509502',
  prestador: {
    cnpj: '12.345.678/0001-99',
    inscricaoMunicipal: '123456',
    razaoSocial: 'PRESTADOR LTDA',
    regimeTributario: {
      opcaoSimplesNacional: 1,
      regimeEspecialTributacao: 0,
    },
  },
  tomador: {
    cnpj: '99.999.999/0001-99',
    razaoSocial: 'TOMADOR LTDA & CIA',
    endereco: {
      municipio: '3509502',
      cep: '13000000',
      logradouro: 'Rua Exemplo',
      numero: '100',
      bairro: 'Centro',
    },
  },
  servico: {
    municipioPrestacao: '3509502',
    codigoTributacaoNacional: '01.03.01',
    codigoTributacaoMunicipal: '1',
    descricao: 'descricao do servico prestado para homologacao',
    codigoNbs: '1.1506.90.00',
  },
  valores: {
    valorServico: '26947.27',
    tributacaoMunicipal: {
      tributacaoIssqn: 1,
      tipoRetencaoIssqn: 1,
      aliquota: '5',
    },
    tributacaoFederal: {
      pisCofins: {
        cst: '00',
        valorPis: '175.16',
        valorCofins: '808.42',
        tipoRetencaoPisCofins: 3,
      },
      valorRetidoIrrf: '404.20',
      valorRetidoCsll: '269.48',
    },
    totalTributos: { indicadorTotalTributos: 0 },
  },
  ibsCbs: {
    finalidadeNfse: 0,
    codigoIndicadorOperacao: '100301',
    indicadorDestinatario: 0,
    classificacaoTributaria: '000001',
  },
  xml: { namespace: false },
};
