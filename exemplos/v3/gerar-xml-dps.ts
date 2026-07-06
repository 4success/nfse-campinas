import { NfseCampinas } from '../../src';

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
    codigoTributacaoNacional: '010301',
    codigoTributacaoMunicipal: '001',
    descricao: 'servico de homologacao',
    codigoNbs: '115069000',
  },
  valores: { valorServico: '100.00' },
});

console.log(xml);
