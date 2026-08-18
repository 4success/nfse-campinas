# Reforma Tributária e NFSe Campinas

A v3 segue o Padrão Nacional NFS-e / DPS v1.01 usado na implantação da Reforma Tributária do Consumo em Campinas.

O SDK não consulta automaticamente tabelas de CNAE, CBO, Código de Tributação Nacional, NBS ou domínios de IBS/CBS. Esses códigos devem ser escolhidos pelo emissor e informados explicitamente na DPS.

## Cancelamento

Campinas publicou em homologação o endpoint síncrono
`POST /notafiscal-adn-ws/api/adn/nfse/{chaveAcesso}/eventos`. O pedido usa o XML assinado do evento de cancelamento
`101101`; o SDK o envia compactado no campo JSON `pedidoRegistroEventoXmlGZipB64`. Veja
[Cancelamento de NFSe](cancelamento.md) para a URL completa e a configuração explícita exigida em produção.
