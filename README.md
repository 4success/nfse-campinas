# NFSe Campinas

Pacote de integração para os webservices da prefeitura de Campinas no padrão ABRASF 2.03.

> **Importante**: Se você procura a integração no padrão DSFNET, utilize
> a [versão 1.x](https://github.com/4success/nfse-campinas/tree/v1) deste pacote.

## Versões Disponíveis

- **2.x (Atual)**: Padrão ABRASF 2.03
  ```bash
  yarn add @4success/nfse-campinas
  # ou
  npm install @4success/nfse-campinas
  ```

- **1.x (Legacy)**: Padrão DSFNET
  ```bash
  yarn add @4success/nfse-campinas@^1.0.0
  # ou
  npm install @4success/nfse-campinas@^1.0.0
  ```
  - GitHub: [Branch v1](https://github.com/4success/nfse-campinas/tree/v1)
  - NPM: [Versão 1.2.13](https://www.npmjs.com/package/@4success/nfse-campinas/v/1.2.13)

## Compatibilidade

Este pacote é compatível com municípios que utilizam o Padrão ABRASF 1.3 ou superior. É necessária a utilização de
Certificado Digital A1.

## Como Usar

### Configuração Básica

```javascript
import { NfseCampinas } from '@4success/nfse-campinas';

const cert = fs.readFileSync('/caminho/para/certificado.pfx');
const nfse = new NfseCampinas(
        'https://homol-rps.ima.sp.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap?wsdl',
        cert,
        'senhaCertificado'
);
```

### Exemplo de Consulta

```javascript
const response = await nfse.ConsultarNfseServicoPrestado({
  ConsultarNfseServicoPrestadoEnvio: {
    Prestador: {
      CpfCnpj: {
        Cnpj: '99999999000199',
      },
    },
    PeriodoCompetencia: {
      DataFinal: '2024-08-31',
      DataInicial: '2024-08-01',
    },
  }
});
```

### Impressão da DANFE

```javascript
const pdfBuffer = await nfse.ImprimirNfse({
  cnpj: '99999999000199',
  inscricaoMunicipal: '1234567',
  numeroNfse: '123',
  codigoVerificacao: 'ABC123'
});

// Salvar o PDF
fs.writeFileSync('danfe.pdf', pdfBuffer);
```

### Configuração para Serverless (AWS Lambda)

Para utilizar em ambientes serverless, adicione as seguintes configurações:

1. No seu `serverless.yml`, adicione a layer necessária:
```yaml
layers:
  - arn:aws:lambda:us-east-1:034541671702:layer:openssl-lambda:1
```

## Funcionalidades

✅ Implementado

- ✅ Emissão com XMLs assinados
- ✅ Consulta de NFSe por RPS
- ✅ Consulta de serviços prestados
- ✅ Consulta de serviços tomados
- ✅ Cancelamento de NFSe
- ✅ Impressão da DANFE em PDF
- ✅ Suporte para ambientes serverless

## Links Úteis

- [Documentação ABRASF 2.03](https://abrasf.org.br/biblioteca/arquivos-publicos/nfs-e/versao-2-03)
- [Grupo de Discussão](https://groups.google.com/g/wsnfsecampinas)
- [Issues e Suporte](https://github.com/4success/nfse-campinas/issues)

## Contribuindo

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -am 'Adicionando nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Crie um novo Pull Request

## Suporte

Para suporte, dúvidas ou sugestões, por favor abra
um [issue no repositório](https://github.com/4success/nfse-campinas/issues).