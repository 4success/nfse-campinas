import fs from 'node:fs';
import { assertNfseXmlMatchesDps, ConsultaDpsHttpError, decodeNfseXmlGZipB64, NfseCampinas } from '../src';

async function main() {
  const idDps = process.argv[2];
  if (!idDps) {
    throw new Error('Informe o identificador da DPS como primeiro argumento');
  }

  const nfse = new NfseCampinas({
    environment: 'homologacao',
    certificate: fs.readFileSync(process.env.CERTIFICATE_PATH!),
    certPassword: process.env.CERTIFICATE_PASSWORD!,
    timeoutMs: 120000,
  });
  const result = await nfse.consultarDps(idDps);

  console.log(result.tipoAmbiente);
  console.log(result.dataHoraProcessamento);
  console.log(result.chaveAcesso);
  console.log(result.alertas);

  if (result.chaveAcesso) {
    const chaveConsulta = result.chaveAcesso.startsWith('NFS') ? result.chaveAcesso : `NFS${result.chaveAcesso}`;
    const consultaNfse = await nfse.consultarNfse(chaveConsulta);
    if (!consultaNfse.nfseXmlGZipB64) {
      throw new Error('A consulta da NFS-e não retornou o XML autorizado');
    }
    const xml = decodeNfseXmlGZipB64(consultaNfse.nfseXmlGZipB64);
    assertNfseXmlMatchesDps(xml, idDps);
    console.log('Vínculo entre DPS e NFS-e confirmado');
  }
}

main().catch((error) => {
  if (error instanceof ConsultaDpsHttpError && error.response) {
    console.error(error.response.alertas);
  } else {
    console.error(error);
  }
  process.exit(1);
});
