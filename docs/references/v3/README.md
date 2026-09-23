# Referências v3

Endpoints conferidos nas fontes oficiais em 2026-09-23. Artefatos nacionais consultados em 2026-08-18.

- Prefeitura de Campinas, documentação técnica: https://campinas.sp.gov.br/sites/reformatributaria/documentacao-tecnica
- Guia Reforma Tributária — NFSe Campinas Padrão Nacional, atualizado em 18/09/2026 no grupo técnico indicado pela
  Prefeitura: https://groups.google.com/g/wsnfsecampinas/c/oQOKosJ7n-Y/m/177VueC0AQAJ
- Bases de envio, consulta de NFSe e eventos confirmadas nas seções 1.1 e 2.1 do guia:

  - Homologação: `https://preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse`
  - Produção: `https://nfseapi.campinas.sp.gov.br/notafiscal-ws/nfse`, disponível desde 21/09/2026.

- A consulta por DPS acrescenta `/dps/{idDps}` às bases acima; a consulta de NFSe acrescenta `/{chaveAcesso}` e o
  cancelamento usa `POST` com `/{chaveAcesso}/eventos`.
- Grupo técnico Campinas: https://groups.google.com/g/wsnfsecampinas
- Documentação nacional NFS-e: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual
- XSD v1.01-20260209: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/nfse-esquemas_xsd-v1-01-20260209.zip
- XSD de produção restrita v1.01-20260727:
  https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/producao-restrita/esquemas-nfse-rtc-v1-01-20260727.zip
- Anexo I v1.01-20260209: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_i-sefin_adn-dps_nfse-snnfse-v1-01-20260209.xlsx
- Anexo II — Pedido de Registro de Evento/Evento v1.01-20260122:
  https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_ii-sefin_adn-pedregevt_evt-snnfse-v1-01-20260122.xlsx
- Manual Integrado do Sistema Nacional NFS-e v1.01 — perfil XMLDSig:
  https://www.gov.br/nfse/pt-br/biblioteca/eventos_NFS-e/evento-tecnico-setembro-de-2022/manualintegradosnnfse_v1-01-00-homologacao.pdf/view

Os artefatos oficiais foram consultados durante a implementação, mas não são versionados no pacote para evitar
incorporar arquivos grandes sem revisão de licença e distribuição.

## Divergência entre fontes municipais

Em 23/09/2026, a página técnica da Prefeitura confirmava os novos endereços de produção e a disponibilidade desde
21/09, mas a seção de homologação ainda exibia o host `preprod-nfse.ima.sp.gov.br` com `/notafiscal-ws/api/adn/`.
Os links dessa seção apontavam para o contexto ainda anterior `/notafiscal-adn-ws/`. O guia oficial fixado no grupo
técnico, atualizado em 18/09/2026, já informava `preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse` e as rotas específicas
de consulta por DPS e eventos. Os padrões do SDK seguem esse guia atualizado.

O bloqueio de redirecionamentos (`maxRedirects: 0`) é uma decisão de robustez do SDK para preservar o status e o
cabeçalho `Location` de uma mudança de endereço, não uma exigência declarada pela Prefeitura.
