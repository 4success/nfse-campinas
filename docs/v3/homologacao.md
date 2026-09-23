# Homologação Campinas v3

Checklist para o primeiro envio real:

1. Usar `environment: 'homologacao'` e `tpAmb=2`.
2. Usar certificado A1 do prestador informado em `prest`.
3. Gerar `idDps` com município, documento do prestador, série e número.
4. Informar `cTribNac`, `cTribMun`, `cNBS`, `cIndOp`, CST e `cClassTrib` escolhidos fora do SDK.
5. Gerar XML DPS v1.01.
6. Assinar XML referenciando `#idDps`.
7. Compactar o XML assinado com gzip e enviar `POST` JSON para `https://preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse` no campo `dpsXmlGZipB64`.
8. Guardar request e response brutos para suporte.

## Consulta de NFSe

Use `GET https://preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse/{chaveAcesso}`. A resposta é JSON com
`tipoAmbiente`, `versaoAplicativo`, `dataHoraProcessamento`, `nfseXmlGZipB64` e `alertas`. O XML autorizado vem em
`nfseXmlGZipB64`, compactado com GZip e codificado em Base64.

## Consulta de DPS

Use `GET https://preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse/dps/{IdentificadorDPS}` para recuperar a chave de
acesso da NFS-e gerada a partir de uma DPS:

```ts
const result = await nfse.consultarDps(idDps);
console.log(result.chaveAcesso);
```

A consulta tem uma base própria, diferente do envio. `endpoints.consultaDps` permite sobrescrevê-la sem incluir o
identificador. Quando essa opção é omitida, um `endpoints.dps` explícito continua sendo usado como base da consulta por
compatibilidade; sem ambos os overrides, o SDK usa a constante de consulta por DPS do ambiente. Ao configurar os novos
endereços manualmente, informe `dps: 'https://preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse'` e
`consultaDps: 'https://preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse/dps'`.

O endpoint exige certificado digital na conexão. A chave só é informada quando o certificado pertence ao prestador,
tomador ou intermediário da NFS-e. Use esta consulta antes de retransmitir uma DPS cujo POST terminou com timeout ou
outro resultado incerto.

Em validação real em `29/07/2026`, o endpoint chegou a devolver para uma DPS conhecida a chave de uma NFS-e cujo XML
continha outro `infDPS/@Id`. Portanto, a chave recuperada deve ser seguida de `consultarNfse` e só pode ser persistida
depois que o `Id` da DPS embutida no XML autorizado coincidir exatamente com o identificador solicitado. Se houver
divergência, preserve as duas respostas para diagnóstico e não retransmita automaticamente.

O sucesso observado usa HTTP `200` e JSON com `tipoAmbiente`, `versaoAplicativo`, `dataHoraProcessamento` e
`chaveAcesso`, sem repetir o `idDps` solicitado. Erros `400` e `404` também podem retornar JSON apenas com metadados,
sem `alertas`; o status HTTP e o corpo bruto devem ser preservados.

## Cancelamento de NFSe

Use o endpoint síncrono publicado para homologação:

```txt
POST https://preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse/{chaveAcesso}/eventos
```

Forneça a `cancelarNfse` a chave da NFS-e, o CPF ou CNPJ do autor, o código do motivo (`1`, `2` ou `9`) e sua
descrição. O SDK gera o `pedRegEvento` v1.01 do evento `101101`, assina `infPedReg` com o certificado configurado,
compacta o XML com GZip/Base64 e envia o JSON `{ pedidoRegistroEventoXmlGZipB64 }`. Preserve a requisição, a resposta
bruta e os alertas para diagnóstico. Um XML externo já assinado continua aceito em `signedXml` e não é reassinado.

## Produção e migração dos endereços

O [guia oficial atualizado em 18/09/2026](https://groups.google.com/g/wsnfsecampinas/c/oQOKosJ7n-Y/m/177VueC0AQAJ)
informa que os novos endpoints de produção estão disponíveis desde `21/09/2026`.
Envio, consulta de NFSe e eventos usam a base `https://nfseapi.campinas.sp.gov.br/notafiscal-ws/nfse`; a consulta por DPS
usa `https://nfseapi.campinas.sp.gov.br/notafiscal-ws/nfse/dps`. Esses endereços são os padrões do SDK para
`environment: 'producao'`, sem exigir `endpoints.eventos`.

Remova overrides antigos ou atualize-os, incluindo `endpoints.consultaDps` quando o endereço de envio também for
configurado. Os endereços com `/notafiscal-adn-ws/` e `/api/adn/` pertencem à integração anterior.

As chamadas de envio, consulta e cancelamento usam `maxRedirects: 0`. Isso impede que um `302` transforme o POST em GET
e esconda a mudança de endereço sob um erro `405`. No envio, o `HttpError` preserva o erro Axios em `cause`, com status
em `cause.response.status` e destino em `cause.response.headers.location`. Nos erros `ConsultaHttpError`,
`ConsultaDpsHttpError` e `CancelamentoHttpError`, consulte `response.httpStatus` e `response.headers.location`, além
da resposta bruta. Um redirecionamento exige revisar o endpoint configurado.

## Observações de homologação

As observações abaixo foram validadas na integração anterior e não representam uma nova validação dos endpoints de
setembro de 2026:

- `Content-Type: application/json` é obrigatório para o endpoint ADN de Campinas.
- XML bruto com `application/xml` retorna `HTTP 415`.
- A resposta de emissão aceita usa HTTP `201`.
- O endpoint pode levar mais de 30 segundos para responder; usar `timeoutMs: 120000` em homologação.
- Para o serviço de consultoria em TI testado, Campinas aceitou `cTribNac=010601`, `cTribMun=001` e `cNBS=115011000`.
- Para a mesma emissão, Campinas aceitou PIS/COFINS `CST=00`, `tpRetPisCofins=0`, e IBS/CBS `CST=000`,
  `cClassTrib=000001`.
- O SDK preserva esses códigos exatamente como informados. Os formatos pontuados `01.06.01` e `1.1501.10.00` foram
  rejeitados nesse envio.
- Os códigos aceitos acima dependem do serviço e do cadastro econômico do prestador; não os reutilize sem confirmar a
  operação.
- `opSimpNac=2` significa MEI e pode ser rejeitado por regra de emissão exclusiva no Portal Emissor Nacional.
- Chave de acesso inexistente retorna `HTTP 400` com alerta `E0044`.
