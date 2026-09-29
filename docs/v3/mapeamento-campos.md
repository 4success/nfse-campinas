# Mapeamento de Campos v3

Campos principais de entrada e XML:

| Entrada SDK                                                 | XML DPS                                         |
|-------------------------------------------------------------|-------------------------------------------------|
| `ambiente`                                                  | `tpAmb`                                         |
| `dataHoraEmissao`                                           | `dhEmi`                                         |
| `versaoAplicativo`                                          | `verAplic`                                      |
| `serie`                                                     | `serie`                                         |
| `numeroDps`                                                 | `nDPS`                                          |
| `dataCompetencia`                                           | `dCompet`                                       |
| `tipoEmitente`                                              | `tpEmit`                                        |
| `municipioEmissao`                                          | `cLocEmi`                                       |
| `prestador`                                                 | `prest`                                         |
| `tomador`                                                   | `toma`                                          |
| `tomador.endereco.municipio`                                | `toma/end/endNac/cMun`                          |
| `tomador.endereco.cep`                                      | `toma/end/endNac/CEP`                           |
| `servico.municipioPrestacao`                                | `serv/locPrest/cLocPrestacao`                   |
| `servico.codigoTributacaoNacional`                          | `serv/cServ/cTribNac`                           |
| `servico.codigoTributacaoMunicipal`                         | `serv/cServ/cTribMun`                           |
| `servico.codigoNbs`                                         | `serv/cServ/cNBS`                               |
| `valores.valorServico`                                      | `valores/vServPrest/vServ`                      |
| `valores.tributacaoFederal.pisCofins.cst`                   | `valores/trib/tribFed/piscofins/CST`            |
| `valores.tributacaoFederal.pisCofins.tipoRetencaoPisCofins` | `valores/trib/tribFed/piscofins/tpRetPisCofins` |
| `ibsCbs.codigoIndicadorOperacao`                            | `IBSCBS/cIndOp`                                 |
| `ibsCbs.cst`                                                | `IBSCBS/valores/trib/gIBSCBS/CST`               |
| `ibsCbs.classificacaoTributaria`                            | `IBSCBS/valores/trib/gIBSCBS/cClassTrib`        |

Os códigos fiscais são serializados como recebidos. Para o envio homologado de consultoria em TI, Campinas aceitou
`cTribNac=010601`, `cTribMun=001` e `cNBS=115011000`; confirme os códigos aplicáveis ao serviço e ao prestador antes
de reutilizá-los.

## Formatos na transmissão

- `nDPS` é serializado sem zeros à esquerda. O número continua preenchido até 15 posições na composição do `Id`
  da DPS; `buildDpsId` e o helper público `normalizeNumeroDps` preservam esse contrato. A série permanece preenchida
  até cinco posições.
- Nos campos monetários `vServ`, `vDescIncond`, `vDescCond`, `vBCPisCofins`, `vPis`, `vCofins`, `vRetIRRF` e
  `vRetCSLL`, um `Number` positivo com uma casa decimal recebe o zero final: `0.3` produz `0.30`. Inteiros e números
  com duas ou mais casas permanecem sem alteração; o SDK não arredonda valores nem recalcula tributos.
- Strings monetárias permanecem exatamente como recebidas, inclusive separador e precisão. Essa preservação não
  implica aceitação pelo município; o tipo nacional `TSDec15V2` admite inteiro ou exatamente duas casas decimais.
- Strings de data/hora também são preservadas. Para o formato municipal observado, o chamador deve enviar segundos
  e offset, por exemplo `2026-09-29T10:00:00-03:00`, sem frações de segundo. O SDK não converte silenciosamente uma
  data fornecida para outro fuso ou precisão.
