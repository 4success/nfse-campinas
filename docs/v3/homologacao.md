# Homologação Campinas v3

Checklist para o primeiro envio real:

1. Usar `environment: 'homologacao'` e `tpAmb=2`.
2. Usar certificado A1 do prestador informado em `prest`.
3. Gerar `idDps` com município, documento do prestador, série e número.
4. Informar `cTribNac`, `cTribMun`, `cNBS`, `cIndOp` e `cClassTrib` escolhidos fora do SDK.
5. Gerar XML DPS v1.01.
6. Assinar XML referenciando `#idDps`.
7. Compactar o XML assinado com gzip e enviar `POST` JSON para `https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps` no campo `dpsXmlGZipB64`.
8. Guardar request e response brutos para suporte.

Observações validadas em homologação:

- `Content-Type: application/json` é obrigatório para o endpoint ADN de Campinas.
- XML bruto com `application/xml` retorna `HTTP 415`.
- Para item LC 116 `1.06`, a tabela pública de Campinas inclui NBS `1.1501.10.00` para consultoria em TI.
- `opSimpNac=2` significa MEI e pode ser rejeitado por regra de emissão exclusiva no Portal Emissor Nacional.
