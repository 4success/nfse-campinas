# Mapeamento de Campos v3

Campos principais de entrada e XML:

| Entrada SDK                         | XML DPS                                  |
|-------------------------------------|------------------------------------------|
| `ambiente`                          | `tpAmb`                                  |
| `dataHoraEmissao`                   | `dhEmi`                                  |
| `versaoAplicativo`                  | `verAplic`                               |
| `serie`                             | `serie`                                  |
| `numeroDps`                         | `nDPS`                                   |
| `dataCompetencia`                   | `dCompet`                                |
| `tipoEmitente`                      | `tpEmit`                                 |
| `municipioEmissao`                  | `cLocEmi`                                |
| `prestador`                         | `prest`                                  |
| `tomador`                           | `toma`                                   |
| `tomador.endereco.municipio`        | `toma/end/endNac/cMun`                   |
| `tomador.endereco.cep`              | `toma/end/endNac/CEP`                    |
| `servico.municipioPrestacao`        | `serv/locPrest/cLocPrestacao`            |
| `servico.codigoTributacaoNacional`  | `serv/cServ/cTribNac`                    |
| `servico.codigoTributacaoMunicipal` | `serv/cServ/cTribMun`                    |
| `servico.codigoNbs`                 | `serv/cServ/cNBS`                        |
| `valores.valorServico`              | `valores/vServPrest/vServ`               |
| `ibsCbs.codigoIndicadorOperacao`    | `IBSCBS/cIndOp`                          |
| `ibsCbs.cst`                        | `IBSCBS/valores/trib/gIBSCBS/CST`        |
| `ibsCbs.classificacaoTributaria`    | `IBSCBS/valores/trib/gIBSCBS/cClassTrib` |
