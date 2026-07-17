import fs from 'node:fs';
import { DateTime } from 'luxon';
import { NfseCampinas } from '../src';

async function main() {
  const nfse = new NfseCampinas({
    environment: 'homologacao',
    certificate: fs.readFileSync(process.env.CERTIFICATE_PATH!),
    certPassword: process.env.CERTIFICATE_PASSWORD!,
    timeoutMs: 120000,
  });
  const now = DateTime.now().setZone('America/Sao_Paulo');

  const result = await nfse.enviarDps({
    ambiente: 'homologacao',
    serie: '99',
    numeroDps: String(Date.now()).slice(-10),
    dataCompetencia: now.toISODate()!,
    dataHoraEmissao: now.toISO()!,
    tipoEmitente: 1,
    municipioEmissao: '3509502',
    prestador: { cnpj: '99999999000199', inscricaoMunicipal: '123456' },
    // Confirme os códigos conforme o serviço e o cadastro econômico do prestador.
    servico: {
      municipioPrestacao: '3509502',
      codigoTributacaoNacional: '010601',
      codigoTributacaoMunicipal: '001',
      codigoNbs: '115011000',
      descricao: 'servico de homologacao',
    },
    valores: {
      valorServico: '10.00',
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

  console.log(result.status);
  console.log(result.rawResponse);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
