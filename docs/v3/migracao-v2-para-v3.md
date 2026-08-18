# Migração v2 para v3

| v2 ABRASF                       | v3 Nacional                                    |
|---------------------------------|------------------------------------------------|
| RPS                             | DPS                                            |
| SOAP/WSDL                       | HTTP POST JSON com `{ dpsXmlGZipB64 }`         |
| `GerarNfse`                     | `enviarDps`                                    |
| `RecepcionarLoteRpsSincrono`    | não há lote; enviar uma DPS por requisição     |
| `InfDeclaracaoPrestacaoServico` | `DPS/infDPS`                                   |
| Código municipal/CNAE           | `cTribNac`, `cTribMun`, `cNBS`                 |
| Cancelamento SOAP               | `cancelarNfse` com evento `101101` assinado    |
| Consulta SOAP                   | `consultarNfse(chaveAcesso)` por HTTP GET JSON |
| Consulta por RPS                | `consultarDps(idDps)` por HTTP GET com mTLS    |

A v3 é uma major version sem compatibilidade com a API ABRASF. Consumidores que precisarem do fluxo antigo devem instalar `@4success/nfse-campinas@^2`.

Use `consultarDps(idDps)` para recuperar a chave após um envio com resultado incerto. O nome
`consultarNfsePorDps(idDps)` permanece disponível como alias.
