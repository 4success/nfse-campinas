# NFSe Campinas v3

Pacote de integração para NFSe Campinas no Padrão Nacional NFS-e / DPS v1.01, conforme implantação da Reforma Tributária do Consumo.

## Aviso de Breaking Change

A versão `3.x` não usa mais ABRASF 2.03, RPS, SOAP ou WSDL. A API pública passa a trabalhar com DPS e envio REST/JSON municipal.

Para continuar usando ABRASF 2.03, instale a linha anterior:

```bash
pnpm add @4success/nfse-campinas@^2
```

Para DSFNET legacy, use a linha `1.x`.

## Instalação

```bash
pnpm add @4success/nfse-campinas
```

## Status dos Endpoints

- Envio DPS homologação: implementado em `https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps`.
- Consulta DPS homologação: implementada por identificador em
  `https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps/{IdentificadorDPS}`.
- Consulta NFSe homologação: implementada por chave de acesso em
  `https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse/{chaveAcesso}`.
- Produção: envio e consultas usam por padrão `https://novanfse.campinas.sp.gov.br/notafiscal-adn-ws/api/adn`;
  a Prefeitura informou ativação em `01/08/2026`.
- Cancelamento de NFSe em homologação: implementado em
  `POST https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse/{chaveAcesso}/eventos`.
- A URL de eventos em produção ainda não foi publicada; informe `endpoints.eventos` explicitamente nesse ambiente ou
  `cancelarNfse` lançará `MissingProductionEndpointError`.

## Exemplo Mínimo

```ts
import fs from 'node:fs';
import { assertNfseXmlMatchesDps, decodeNfseXmlGZipB64, NfseCampinas } from '@4success/nfse-campinas';

const nfse = new NfseCampinas({
  environment: 'homologacao',
  certificate: fs.readFileSync('./certificado.pfx'),
  certPassword: process.env.CERTIFICATE_PASSWORD!,
  // O endpoint de homologacao pode levar mais de 30 segundos para responder.
  timeoutMs: 120000,
});

const result = await nfse.enviarDps({
  ambiente: 'homologacao',
  serie: '00001',
  numeroDps: '1',
  dataCompetencia: '2026-06-30',
  dataHoraEmissao: '2026-06-30T21:41:28-03:00',
  tipoEmitente: 1,
  municipioEmissao: '3509502',
  prestador: {
    cnpj: '99999999000199',
    inscricaoMunicipal: '123456',
    regimeTributario: { opcaoSimplesNacional: 1, regimeEspecialTributacao: 0 },
  },
  tomador: {
    cnpj: '99999999000199',
    razaoSocial: 'TOMADOR LTDA',
    endereco: { municipio: '3509502', cep: '13000000', logradouro: 'Rua Exemplo', numero: '100', bairro: 'Centro' },
  },
  servico: {
    municipioPrestacao: '3509502',
    codigoTributacaoNacional: '010601',
    codigoTributacaoMunicipal: '001',
    descricao: 'descricao do servico prestado para fins de homologacao',
    codigoNbs: '115011000',
  },
  valores: {
    valorServico: '26947.27',
    tributacaoMunicipal: { tributacaoIssqn: 1, tipoRetencaoIssqn: 1, aliquota: '5' },
    tributacaoFederal: {
      pisCofins: { cst: '00', tipoRetencaoPisCofins: 0 },
    },
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
console.log(result.idDps);
console.log(result.rawResponse);

if (result.nfseXmlGZipB64) {
  const nfseXml = decodeNfseXmlGZipB64(result.nfseXmlGZipB64);
  assertNfseXmlMatchesDps(nfseXml, result.idDps);
  console.log(nfseXml);

  const danfseHtml = await nfse.imprimirDanfse({ nfseXmlGZipB64: result.nfseXmlGZipB64 });
  console.log(danfseHtml);
}
```

`rawResponse` preserva a resposta original da Prefeitura, `parsedResponse` expõe o corpo parseado quando possível, e
`nfseXmlGZipB64` traz o XML autorizado da NFSe compactado em GZip/Base64.

## Consulta NFSe

Consulte uma NFSe autorizada pela chave de acesso retornada no envio:

```ts
const consulta = await nfse.consultarNfse('NFS35095022215547137000138000000000210026073571802007');

if (consulta.nfseXmlGZipB64) {
  const xml = decodeNfseXmlGZipB64(consulta.nfseXmlGZipB64);
  console.log(xml);
}
```

Uma NFSe inexistente retorna `HTTP 400` com alertas da Prefeitura, preservados em `ConsultaHttpError.response`.

## Cancelamento de NFSe

Forneça ao SDK o XML `pedRegEvento` de cancelamento, código `101101`, já assinado digitalmente:

```ts
const cancelamento = await nfse.cancelarNfse({
  chaveAcesso: 'NFS35095022215547137000138000000000210026073571802007',
  signedXml: pedidoRegistroEventoXmlAssinado,
});

console.log(cancelamento.alertas);
console.log(cancelamento.rawResponse);
```

Em homologação, a chamada síncrona usa
`POST https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse/{chaveAcesso}/eventos`. O SDK compacta o XML
assinado com GZip/Base64 e envia o JSON `{ pedidoRegistroEventoXmlGZipB64 }`. Ele não gera nem assina o Pedido de
Registro de Evento. Consulte [o guia de cancelamento](docs/v3/cancelamento.md) para configurar produção e tratar a
resposta.

O exemplo local completo está em `exemplos/consultar-nfse.ts`; ele usa `CERTIFICATE_PATH`, `CERTIFICATE_PASSWORD` e a
chave de acesso como primeiro argumento.

## Consulta por DPS

Quando o envio tiver resultado incerto — por exemplo, timeout depois de a Prefeitura receber a DPS — consulte o mesmo
identificador antes de considerar qualquer reenvio:

```ts
const consultaDps = await nfse.consultarDps('DPS350950221234567800019900001000000000000001');

console.log(consultaDps.chaveAcesso);
```

`consultarNfsePorDps` é um alias de `consultarDps`. A consulta usa certificado digital (mTLS), e a chave só é revelada
quando o titular do certificado corresponde ao prestador, tomador ou intermediário da NFS-e. Erros HTTP preservam
alertas e a resposta bruta em `ConsultaDpsHttpError.response`.

Por segurança, não associe a chave retornada ao seu documento sem consultar a NFS-e e conferir se o `Id` de `infDPS`
no XML autorizado é igual ao identificador solicitado. Essa conferência também protege contra uma resposta municipal
inconsistente:

```ts
if (!consultaDps.chaveAcesso) {
  throw new Error(`Consulta da DPS não retornou chave: ${consultaDps.rawResponse}`);
}

const chaveConsulta = consultaDps.chaveAcesso.startsWith('NFS')
  ? consultaDps.chaveAcesso
  : `NFS${consultaDps.chaveAcesso}`;
const consultaNfse = await nfse.consultarNfse(chaveConsulta);
if (!consultaNfse.nfseXmlGZipB64) {
  throw new Error(`Consulta da NFS-e não retornou XML: ${consultaNfse.rawResponse}`);
}
const xml = decodeNfseXmlGZipB64(consultaNfse.nfseXmlGZipB64);

assertNfseXmlMatchesDps(xml, 'DPS350950221234567800019900001000000000000001');
```

O exemplo local completo está em `exemplos/consultar-dps.ts`.

## DANFSe

Depois que a Prefeitura autoriza a NFSe, use o XML autorizado para gerar o HTML imprimível do DANFSe:

```ts
const html = await nfse.imprimirDanfse({ nfseXmlGZipB64: result.nfseXmlGZipB64! });
```

Também é possível informar o XML autorizado já descompactado:

```ts
const html = await nfse.imprimirDanfse({ xml: nfseXml });
```

O método retorna HTML. A geração de PDF deve ser feita pelo consumidor a partir desse HTML, usando o renderer apropriado
para o ambiente de execução.

## Segurança

- Use certificado A1 `.pfx/.p12` do prestador.
- Nunca versione certificados, senhas, XML real de cliente ou respostas com dados pessoais.
- `debug=true` imprime XML e resposta brutos para diagnóstico local.

## Comunidade

- [Como contribuir](CONTRIBUTING.md)
- [Código de Conduta](CODE_OF_CONDUCT.md)
- [Política de Segurança](SECURITY.md)
- [Licença MIT](LICENSE)

## Migração

Consulte `docs/v3/migracao-v2-para-v3.md` para o mapa entre ABRASF/RPS/SOAP e Padrão Nacional/DPS.
