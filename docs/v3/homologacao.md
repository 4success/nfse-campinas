# Homologação Campinas v3

Checklist para o primeiro envio real:

1. Usar `environment: 'homologacao'` e `tpAmb=2`.
2. Usar certificado A1 do prestador informado em `prest`.
3. Gerar `idDps` com município, documento do prestador, série e número.
4. Informar `cTribNac`, `cTribMun`, `cNBS`, `cIndOp` e `cClassTrib` escolhidos fora do SDK.
5. Gerar XML DPS v1.01.
6. Assinar XML referenciando `#idDps`.
7. Enviar `POST` para `https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps`.
8. Guardar request e response brutos para suporte.
