# Migração v2 para v3

| v2 ABRASF                       | v3 Nacional                                    |
|---------------------------------|------------------------------------------------|
| RPS                             | DPS                                            |
| SOAP/WSDL                       | HTTP POST JSON com `{ dpsXmlGZipB64 }`         |
| `GerarNfse`                     | `enviarDps`                                    |
| `RecepcionarLoteRpsSincrono`    | não há lote; enviar uma DPS por requisição     |
| `InfDeclaracaoPrestacaoServico` | `DPS/infDPS`                                   |
| Código municipal/CNAE           | `cTribNac`, `cTribMun`, `cNBS`                 |
| Cancelamento SOAP               | eventos ainda não publicados para Campinas     |
| Consulta SOAP                   | `consultarNfse(chaveAcesso)` por HTTP GET JSON |

A v3 é uma major version sem compatibilidade com a API ABRASF. Consumidores que precisarem do fluxo antigo devem instalar `@4success/nfse-campinas@^2`.

`consultarNfsePorDps(idDps)` não existe na v3: Campinas publicou consulta por chave de acesso da NFSe, não por ID da
DPS.
