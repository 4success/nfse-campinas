# Cancelamento de NFSe

A Prefeitura de Campinas publicou o endpoint síncrono de homologação para cancelamento de NFSe no Padrão Nacional:

```txt
POST https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse/{chaveAcesso}/eventos
```

O pedido é um XML `pedRegEvento` de cancelamento, código `101101`, devidamente assinado digitalmente. O SDK não gera
nem assina esse XML: o chamador deve fornecê-lo pronto em `signedXml`.

```ts
const result = await nfse.cancelarNfse(
  {
    chaveAcesso: 'NFS35095022215547137000138000000000210026073571802007',
    signedXml: pedidoRegistroEventoXmlAssinado,
  },
  { timeoutMs: 120000 },
);

console.log(result.alertas);
console.log(result.rawResponse);
```

`chaveAcesso` aceita tanto os 50 caracteres retornados por `consultarDps` quanto o mesmo identificador com o prefixo
`NFS`. O SDK não adiciona nem remove o prefixo: envia a chave exatamente como recebida.

O SDK compacta `signedXml` com GZip, codifica o resultado em Base64 e envia:

```json
{
  "pedidoRegistroEventoXmlGZipB64": "<XML assinado compactado com GZip e codificado em Base64>"
}
```

O resultado preserva a resposta original em `rawResponse`, o corpo parseado em `parsedResponse` e os alertas em
`alertas`. Quando retornados pelo serviço, `eventoXmlGZipB64` e `nfseXmlGZipB64` também ficam disponíveis. Erros HTTP
lançam `CancelamentoHttpError`, preservando a resposta e os alertas devolvidos por Campinas.

## Produção

A URL divulgada é exclusiva do ambiente de homologação. Enquanto Campinas não publicar uma URL oficial de eventos em
produção, configure `endpoints.eventos` explicitamente. Sem essa opção, `cancelarNfse` lança
`MissingProductionEndpointError`:

```ts
const nfse = new NfseCampinas({
  environment: 'producao',
  certificate,
  certPassword,
  endpoints: {
    eventos: 'https://endpoint-oficial-publicado-pela-prefeitura/.../nfse',
  },
});
```

Não derive a URL de produção por simples troca de host. O valor de `endpoints.eventos` é a base do recurso `nfse`; o
SDK acrescenta `/{chaveAcesso}/eventos` ao enviar o pedido.

Esta documentação não reproduz nem infere o leiaute do `pedRegEvento`. Gere e assine o XML de acordo com os esquemas e
orientações oficiais adotados por Campinas.

Fontes oficiais:

- [Documentação técnica da Reforma Tributária de Campinas](https://campinas.sp.gov.br/sites/reformatributaria/documentacao-tecnica)
- [Documentação técnica atual do Sistema Nacional NFS-e](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual)
