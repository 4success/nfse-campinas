import fs from 'node:fs';
import { NfseCampinas } from '../../src';

async function main() {
  const nfse = new NfseCampinas({
    environment: 'homologacao',
    certificate: fs.readFileSync(process.env.CERTIFICATE_PATH!),
    certPassword: process.env.CERTIFICATE_PASSWORD!,
  });

  const result = await nfse.enviarDps(fs.readFileSync(process.argv[2], 'utf8'));
  console.log(result.status);
  console.log(result.rawResponse);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
