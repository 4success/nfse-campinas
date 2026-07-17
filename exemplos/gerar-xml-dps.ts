import { NfseCampinas } from '../src';

const nfse = new NfseCampinas({
  environment: 'homologacao',
  certificate: Buffer.from(''),
  certPassword: '',
});

const xml = nfse.buildDpsXml({
  ambiente: 'homologacao',
  serie: '00001',
  numeroDps: '1',
  dataCompetencia: '2026-06-30',
  dataHoraEmissao: '2026-06-30T21:41:28-03:00',
  tipoEmitente: 1,
  municipioEmissao: '3509502',
  prestador: { cnpj: '99999999000199' },
  servico: {
    municipioPrestacao: '3509502',
    codigoTributacaoNacional: '010601',
    codigoTributacaoMunicipal: '001',
    descricao: 'servico de homologacao',
    codigoNbs: '115011000',
  },
  valores: {
    valorServico: '100.00',
    tributacaoMunicipal: { tributacaoIssqn: 1, tipoRetencaoIssqn: 1, aliquota: '2' },
    tributacaoFederal: { pisCofins: { cst: '00', tipoRetencaoPisCofins: 0 } },
    totalTributos: { indicadorTotalTributos: 0 },
  },
  ibsCbs: {
    finalidadeNfse: 0,
    codigoIndicadorOperacao: '100301',
    indicadorDestinatario: 0,
    cst: '000',
    classificacaoTributaria: '000001',
  },
});

console.log(xml);
