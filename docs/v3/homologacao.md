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
