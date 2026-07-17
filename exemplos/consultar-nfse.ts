import fs from 'node:fs';
import { ConsultaHttpError, decodeNfseXmlGZipB64, NfseCampinas } from '../src';

async function main() {
  const chaveAcesso = process.argv[2];
  if (!chaveAcesso) {
    throw new Error('Informe a chave de acesso da NFSe como primeiro argumento');
  }

  const nfse = new NfseCampinas({
    environment: 'homologacao',
    certificate: fs.readFileSync(process.env.CERTIFICATE_PATH!),
    certPassword: process.env.CERTIFICATE_PASSWORD!,
    timeoutMs: 120000,
  });
  const result = await nfse.consultarNfse(chaveAcesso);

  console.log(result.tipoAmbiente);
  console.log(result.dataHoraProcessamento);
  console.log(result.alertas);
  if (result.nfseXmlGZipB64) {
    console.log(decodeNfseXmlGZipB64(result.nfseXmlGZipB64));
  }
}

main().catch((error) => {
  if (error instanceof ConsultaHttpError && error.response) {
    console.error(error.response.alertas);
  } else {
    console.error(error);
  }
  process.exit(1);
});
