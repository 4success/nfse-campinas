# NFSe Campinas

Pacote de integração que abstrai os webservices da prefeitura de Campinas  (**Padrão Asbraf 2.3**).

### Outras cidades atendidas

Se o você for de um município que seja atendido pelo Padrão Abrasf 1.3, esse pacote também funcionará. É necessário a
utilização do Certificado Digital A1

Importante: para emitir nota fiscal no Padrão DSFNET, utilize as versões a versão 1.X

## Instalação
Instalar via NPM ou Yarn:

- `npm install @4success/nfse-campinas@beta`
- `yarn add @4success/nfse-campinas@beta`

## Instruções de uso

Com a biblioteca instalada, basta criar uma instância apontando para a URL do webservice, passando também um Buffer com
o arquivo do certificado e a senha do certificado

```javascript
import { NfseCampinas } from '@4success/nfse-campinas';

const cert = fs.readFileSync(`/caminho/para/certificado.pfx`);
const nfse = new NfseCampinas(
  'https://issdigital.campinas.sp.gov.br/WsNFe2/LoteRps.jws?wsdl',
  cert,
  'senhaCertificado',
);
```

Com a instância criada, basta chamar o método passando os parâmetros especificados no tipo:

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

O editor da sua IDE irá avisar sobre os campos obrigatórios.

### Items cobertos nessa biblioteca

- [x] Emissão com XMLs assinados
- [ ] Download da Danfe em PDF
- [ ] Documentação para rodar em serverless

Como o processo via ABRASF ainda está em fase de homologação, essa biblioteca estará evoluindo até o processo de go-live
oficial.

### Links / Referências de apoio:

- [Grupo de discussão](https://groups.google.com/g/wsnfsecampinas)
- [Schema Abrasf 2.03.](https://abrasf.org.br/biblioteca/arquivos-publicos/nfs-e/versao-2-03)

### Suporte e dúvidas

Para suporte basta abrir um [issue no repositório](https://github.com/4success/nfse-campinas/issues).