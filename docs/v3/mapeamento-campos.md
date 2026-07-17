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
