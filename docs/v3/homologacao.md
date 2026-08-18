# Homologação Campinas v3

Checklist para o primeiro envio real:

1. Usar `environment: 'homologacao'` e `tpAmb=2`.
2. Usar certificado A1 do prestador informado em `prest`.
3. Gerar `idDps` com município, documento do prestador, série e número.
4. Informar `cTribNac`, `cTribMun`, `cNBS`, `cIndOp`, CST e `cClassTrib` escolhidos fora do SDK.
5. Gerar XML DPS v1.01.
6. Assinar XML referenciando `#idDps`.
7. Compactar o XML assinado com gzip e enviar `POST` JSON para `https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps` no campo `dpsXmlGZipB64`.
8. Guardar request e response brutos para suporte.

## Consulta de NFSe

Use `GET https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse/{chaveAcesso}`. A resposta é JSON com
`tipoAmbiente`, `versaoAplicativo`, `dataHoraProcessamento`, `nfseXmlGZipB64` e `alertas`. O XML autorizado vem em
`nfseXmlGZipB64`, compactado com GZip e codificado em Base64.

## Consulta de DPS

Use `GET https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps/{IdentificadorDPS}` para recuperar a chave de
acesso da NFS-e gerada a partir de uma DPS:

```ts
const result = await nfse.consultarDps(idDps);
console.log(result.chaveAcesso);
```

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
POST https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse/{chaveAcesso}/eventos
```

Forneça a `cancelarNfse` a chave da NFS-e, o CPF ou CNPJ do autor, o código do motivo (`1`, `2` ou `9`) e sua
descrição. O SDK gera o `pedRegEvento` v1.01 do evento `101101`, assina `infPedReg` com o certificado configurado,
compacta o XML com GZip/Base64 e envia o JSON `{ pedidoRegistroEventoXmlGZipB64 }`. Preserve a requisição, a resposta
bruta e os alertas para diagnóstico. Um XML externo já assinado continua aceito em `signedXml` e não é reassinado.

A URL divulgada é somente de homologação. Em produção, `endpoints.eventos` é obrigatório enquanto Campinas não
publicar uma URL oficial; sem essa opção, `cancelarNfse` lança `MissingProductionEndpointError`. Não derive esse
endereço por simples troca de host.

Em produção, envio e consultas usam a base
`https://novanfse.campinas.sp.gov.br/notafiscal-adn-ws/api/adn`, cuja ativação foi anunciada para `01/08/2026`.

Observações validadas em homologação:

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
