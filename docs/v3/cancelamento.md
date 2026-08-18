# Cancelamento de NFSe

A Prefeitura de Campinas publicou o endpoint síncrono de homologação para cancelamento de NFSe no Padrão Nacional:

```txt
POST https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse/{chaveAcesso}/eventos
```

O SDK gera o XML `pedRegEvento` v1.01 do cancelamento (`101101`), assina o elemento `infPedReg` com o certificado A1
configurado e transmite o pedido. O mesmo certificado é usado para autenticação mTLS da conexão.

```ts
const result = await nfse.cancelarNfse(
  {
    chaveAcesso: 'NFS35095022215547137000138000000000210026073571802007',
    autor: { cnpj: '15547137000138' },
    codigoMotivo: 1,
    motivo: 'Erro na emissão identificado após a autorização da nota',
    dataHoraEvento: '2026-08-18T14:30:00-03:00',
  },
  { timeoutMs: 120000 },
);

console.log(result.alertas);
console.log(result.signedXml);
console.log(result.rawResponse);
```

Os campos são:

- `chaveAcesso`: os 50 caracteres da chave, com o prefixo `NFS` opcional;
- `autor`: exatamente um `cpf` ou `cnpj` do autor do evento;
- `codigoMotivo`: `1` (erro na emissão), `2` (serviço não prestado) ou `9` (outros);
- `motivo`: descrição enviada em `xMotivo`; o leiaute nacional exige de 15 a 255 caracteres;
- `dataHoraEvento`: data e hora ISO 8601 com segundos e offset, opcional; se omitida, usa o instante atual;
- `versaoAplicativo`: opcional; usa `applicationVersion` da instância quando omitida.

O autor permanece explícito porque é um dado fiscal do pedido; o SDK não tenta deduzi-lo do certificado. O serviço
valida a compatibilidade entre o autor informado, a NFS-e e o titular da assinatura.

O código `101101` é fixo porque `cancelarNfse` implementa somente cancelamento. Substituição e outros eventos não são
inferidos a partir desse método.

No XML, o SDK remove apenas o prefixo documentado `NFS` de `chNFSe` e forma o identificador
`PRE{chaveAcessoSemPrefixo}101101`. Não existe `nPedRegEvento` no leiaute v1.01 atual. Na rota HTTP, a chave é enviada
como foi recebida para manter compatibilidade com o endpoint e com o transporte de XML externo.

## XML e assinatura

O pedido gerado segue esta estrutura:

```xml
<pedRegEvento xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">
  <infPedReg Id="PRE...101101">
    <tpAmb>2</tpAmb>
    <verAplic>meu-sistema-1.0</verAplic>
    <dhEvento>2026-08-18T14:30:00-03:00</dhEvento>
    <CNPJAutor>15547137000138</CNPJAutor>
    <chNFSe>...</chNFSe>
    <e101101>
      <xDesc>Cancelamento de NFS-e</xDesc>
      <cMotivo>1</cMotivo>
      <xMotivo>Erro na emissão identificado após a autorização da nota</xMotivo>
    </e101101>
  </infPedReg>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">...</Signature>
</pedRegEvento>
```

`Signature` referencia `infPedReg/@Id`, fica imediatamente depois de `infPedReg` e usa o mesmo perfil XMLDSig da DPS:
assinatura enveloped, C14N 1.0, RSA-SHA1, SHA-1 e somente o certificado final em `X509Certificate`.

Para inspecionar as etapas sem transmitir:

```ts
const xml = nfse.buildCancelamentoNfseXml(dadosCancelamento);
const signedXml = await nfse.signCancelamentoNfseXml(xml);
```

## XML externo já assinado

O caminho anterior continua disponível como opção avançada. O SDK preserva `signedXml` byte a byte e não o analisa
nem reassina:

```ts
const result = await nfse.cancelarNfse({
  chaveAcesso: 'NFS35095022215547137000138000000000210026073571802007',
  signedXml: pedidoRegistroEventoXmlAssinado,
});
```

Nos dois caminhos, o SDK compacta o XML assinado com GZip, codifica o resultado em Base64 e envia:

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
SDK acrescenta `/{chaveAcesso}/eventos` ao enviar o pedido. No caminho tipado, `tpAmb` é derivado do mesmo ambiente da
instância usado para resolver o endpoint.

Fontes oficiais:

- [Documentação técnica da Reforma Tributária de Campinas](https://campinas.sp.gov.br/sites/reformatributaria/documentacao-tecnica)
- [Documentação técnica atual do Sistema Nacional NFS-e](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual)
- [Esquemas de produção NFS-e v1.01 de 09/02/2026](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/nfse-esquemas_xsd-v1-01-20260209.zip)
- [Esquemas de homologação NFS-e v1.01 de 27/07/2026](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/producao-restrita/esquemas-nfse-rtc-v1-01-20260727.zip)
- [Manual Integrado do Sistema Nacional NFS-e v1.01 — perfil XMLDSig](https://www.gov.br/nfse/pt-br/biblioteca/eventos_NFS-e/evento-tecnico-setembro-de-2022/manualintegradosnnfse_v1-01-00-homologacao.pdf/view)
