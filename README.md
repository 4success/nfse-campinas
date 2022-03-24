# NFSe Campinas

Pacote de integração que abstrai os webservices da prefeitura de Campinas.

## Instruções de uso

Instalar via `npm install @4success/nfse` ou `yarn add @4success/nfse`

Com a biblioteca instalada, basta criar uma instância apontando para a URL do webservice, passando também um Buffer com o arquivo do certificado e a senha do certificado
```javascript
 const cert = fs.readFileSync(`/caminho/para/certificado.pfx`);

 const nfse = new NfseCampinas(
    'https://issdigital.campinas.sp.gov.br/WsNFe2/LoteRps.jws?wsdl',
    cert,
    'senhaCertificado',
  );
```

Com a instância criada, basta chamar o método passando os parâmetros especificados no tipo:
```javascript
  const response = await nfse.consultarNota({
    CodCidade: 6291,
    CPFCNPJRemetente: '9999999999999',
    InscricaoMunicipalPrestador: '002163896',
    'dtInicio': '2022-03-01',
    'dtFim': '2022-03-31',
    Versao: parseInt('1'),
  });
```

O editor da sua IDE irá avisar sobre os campos obrigatórios.

### Suporte
Para suporte basta abrir um issue no repositório.