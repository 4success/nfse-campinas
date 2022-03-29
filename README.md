# NFSe Campinas

Pacote de integração que abstrai os webservices da prefeitura de Campinas.

## Instruções de uso

Instalar via `npm install @4success/nfse-campinas` ou `yarn add @4success/nfse-campinas`

Com a biblioteca instalada, basta criar uma instância apontando para a URL do webservice, passando também um Buffer com
o arquivo do certificado e a senha do certificado

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

### Exemplos de chamadas

Consulta de lotes:

```javascript
  const response = await nfse.consultarLote({
      CodCidade: '6291',
      CPFCNPJRemetente: '9999999999999',
      Versao: 1,
      NumeroLote: 286604087
  });
```

Consulta de próxima sequência numérica de RPS:

```javascript
  const response = await nfse.consultaSequenciaRps({
      CodCid: 6291,
      CPFCNPJRemetente: '9999999999999',
      IMPrestador: '999999999',
      Versao: '1',
      SeriePrestacao: '99'
  }); 
```

Envio de lote RPS:

```javascript
  const response = await nfse.enviarLoteSincrono({
      Cabecalho: {
        CodCidade: 6291,
        CPFCNPJRemetente: "9999999999999",
        RazaoSocialRemetente: "EMPRESA DE TESTE",
        transacao: "",
        dtInicio: "2022-02-28",
        dtFim: "2022-02-28",
        QtdRPS: 1,
        ValorTotalServicos: "448.00",
        ValorTotalDeducoes: 0,
        Versao: 1,
        MetodoEnvio: "WS"
      },
      Lote: {
        "@Id": "20220228090209015",
        RPS: [
          {
            "@Id": `rps:1`,
            InscricaoMunicipalPrestador: "9999999",
            RazaoSocialPrestador: "EMPRESA DE TESTE",
            TipoRPS: "RPS",
            SerieRPS: "NF",
            NumeroRPS: 1,
            DataEmissaoRPS: "2022-02-28T09:00:09",
            SituacaoRPS: "N",
            SeriePrestacao: "99",
            InscricaoMunicipalTomador: "0000000",
            CPFCNPJTomador: "000000000000000",
            RazaoSocialTomador: "CLIENTE DE TESTE",
            TipoLogradouroTomador: "Rua",
            LogradouroTomador: "dos Testes",
            NumeroEnderecoTomador: "755",
            ComplementoEnderecoTomador: "SL TESTE",
            TipoBairroTomador: "Bairro",
            BairroTomador: "Consolação",
            CidadeTomador: "7107",
            CidadeTomadorDescricao: "São Paulo",
            CEPTomador: "01415000",
            EmailTomador: "emaildocliente@teste.com.br",
            CodigoAtividade: "620400001",
            AliquotaAtividade: 2,
            TipoRecolhimento: "A",
            MunicipioPrestacao: 6291,
            MunicipioPrestacaoDescricao: "CAMPINAS",
            Operacao: "A",
            Tributacao: "T",
            ValorPIS: "2.91",
            ValorCOFINS: "13.44",
            ValorINSS: 0,
            ValorIR: 0,
            ValorCSLL: "4.48",
            AliquotaPIS: 0.65,
            AliquotaCOFINS: 3,
            AliquotaINSS: 0,
            AliquotaIR: 0,
            AliquotaCSLL: 1,
            DescricaoRPS: "Mensalidade",
            DDDPrestador: "19",
            TelefonePrestador: "999999999",
            DDDTomador: "11",
            TelefoneTomador: "999999999",
            Deducoes: [],
            Itens: {
              Item: [
                {
                  DiscriminacaoServico: "Mensalidade",
                  Quantidade: 1,
                  ValorUnitario: "448.00",
                  ValorTotal: "448.00"
                }
              ]
            }
          }
        ]
      }
  });
```

Cancelar nota:

```javascript
  const response = await nfse.cancelarNotaFiscal({
      Lote: {
        "@Id": 'lote:286923780',
        Nota: [{
          "@Id": `nota:1090`,
          InscricaoMunicipalPrestador: '999999999',
          NumeroNota: '1090',
          CodigoVerificacao: 'avc9s84d',
          MotivoCancelamento: 'Motivo de cancelamento'
        }]
      },
      Cabecalho: {
        CodCidade: '6291',
        CPFCNPJRemetente: '99999999999',
        transacao: true,
        Versao: 1
      }
  });
```

### Data Scraper para imprimir Danfe e buscar link da prefeitura e impressão de PDF

Após a emissão da NFSe via RPS, o sistema não possui um método para resgatar o link da NFSe para pegar a Danfe e enviar, quando necessário. Isso pode ser feito automaticamente usando automaçõa 
```typescript
  const response = await DataScraper.consultaLinkNfse({
    "cnpj": "9999999999999",
    "nfNum": 1000,
    "codVerificacao": "346ea2c2",
    "inscricaoMunicipal": "9999999"
  });
```
Se os dados forem válidos, será retornado uma resposta nesse padrão:
```json
{
  "url": "https://nfse.campinas.sp.gov.br/NotaFiscal/visualizarNota.php?id_nota_fiscal=XXXXX&confirma=Tg==&temPrestador=Tg==&doc_prestador=XXXXXX=&numero_nota_fiscal=XXXXX==&inscricao_prestador=XXXXXX==&cod_verificacao=XXXX",
  "id_nota_fiscal": "511111111",
  "confirma": "N",
  "temPrestador": "N",
  "doc_prestador": "9999999999999",
  "numero_nota_fiscal": "1000",
  "inscricao_prestador": "9999999",
  "cod_verificacao": "346ea2c2"
}
```

Para imprimir o PDF com base no link, foi disponibilizado um método que já faz essa tarefa e retorna um base64:
```typescript
  const response = await DataScraper.imprimePdfNfse("https://nfse.campinas.sp.gov.br/NotaFiscal/visualizarNota.php?id_nota_fiscal=XXXXX&confirma=Tg==&temPrestador=Tg==&doc_prestador=XXXXXX=&numero_nota_fiscal=XXXXX==&inscricao_prestador=XXXXXX==&cod_verificacao=XXXX");
```

Se os dados forem válidos, será retornado uma resposta nesse padrão:
```json
{
  "nfse": "1000",
  "pdfBase64Content": "BASE64DOPDF=="
}
```

### Rodando em AWS Lambda / Serverless Framework
Por ter em suas dependências o pacote `chrome-aws-lambda`, o projeto tem algumas pecularidades ao rodar usando AWS Lambda.
Resumidamente, caso você estiver usando o `serverless-bundle`, você precisa forçar a exclusão desse pacote do bundle, importar via Lambda Layer e ter pelo menos 2GB de memória:

```yml
custom:
  bundle:
    externals:
      - x509.js
    forceExclude:
      - chrome-aws-lambda
```

Visto que o pacote foi excluído do bundle, é necessário usar uma Lambda Layer para ter os arquivos necessários para o processamento:
```yml
functions:
  imprimePdfNfse:
    handler: src/handlers/nfseDataScraper.imprimePdfNfse
    timeout: 30
    memorySize: 2048
    layers:
      - arn:aws:lambda:us-east-1:764866452798:layer:chrome-aws-lambda:25
    events:
      - http:
          path: v1/nfse/imprimePdfNfse
          method: post
          private: true
          cors: true
```

### Suporte e dúvidas

Para suporte basta abrir um [issue no repositório](https://github.com/4success/nfse-campinas/issues).