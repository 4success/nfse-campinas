import { NfseCampinas } from '../src';
import * as fs from 'fs';
import * as nock from 'nock';

const scopeNockNfseCampinas = nock('https://issdigital.campinas.sp.gov.br');
scopeNockNfseCampinas.get('/WsNFe2/LoteRps.jws?wsdl')
  .reply(200, (uri) => {
    return fs.readFileSync(`${__dirname}/data/LoteRps.wsdl`).toString('utf8');
  });

test('consulta de nota', async () => {
  scopeNockNfseCampinas.post('/WsNFe2/LoteRps.jws').reply(200, uri => {
    return fs.readFileSync(`${__dirname}/data/consultarNota/response.xml`).toString();
  });

  scopeNockNfseCampinas.persist();

  const cert = fs.readFileSync(`${__dirname}/data/certificado.pfx`);
  const nfse = new NfseCampinas(
    'https://issdigital.campinas.sp.gov.br/WsNFe2/LoteRps.jws?wsdl',
    cert,
    'p0k3rf4c3',
    true,
  );

  const response = await nfse.consultarNota({
    CodCidade: 6291,
    CPFCNPJRemetente: '9999999999999',
    InscricaoMunicipalPrestador: '002163896',
    'dtInicio': '2022-03-01',
    'dtFim': '2022-03-31',
    Versao: parseInt('1'),
  });

  expect(response).toBeDefined();
  expect(response.Notas.Nota.length).toBeGreaterThan(1);
});