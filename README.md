# NFSe Campinas v3

Pacote de integração para NFSe Campinas no Padrão Nacional NFS-e / DPS v1.01, conforme implantação da Reforma Tributária do Consumo.

## Aviso de Breaking Change

A versão `3.x` não usa mais ABRASF 2.03, RPS, SOAP ou WSDL. A API pública passa a trabalhar com DPS e envio REST/JSON municipal.

Para continuar usando ABRASF 2.03, instale a linha anterior:

```bash
pnpm add @4success/nfse-campinas@^2
```

Para DSFNET legacy, use a linha `1.x`.

## Instalação

```bash
pnpm add @4success/nfse-campinas
```

## Status dos Endpoints

- Envio DPS homologação: implementado em `https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps`.
- Produção: aguardando URL oficial da Prefeitura; é possível informar `endpoints.dps` manualmente.
- Consulta, cancelamento e eventos: ainda não publicados pela Prefeitura de Campinas.

## Exemplo Mínimo

```ts
import fs from 'node:fs';
import { NfseCampinas } from '@4success/nfse-campinas';

const nfse = new NfseCampinas({
  environment: 'homologacao',
  certificate: fs.readFileSync('./certificado.pfx'),
  certPassword: process.env.CERTIFICATE_PASSWORD!,
});

const result = await nfse.enviarDps({
  ambiente: 'homologacao',
  serie: '00001',
  numeroDps: '1',
  dataCompetencia: '2026-06-30',
  dataHoraEmissao: '2026-06-30T21:41:28-03:00',
  tipoEmitente: 1,
  municipioEmissao: '3509502',
  prestador: {
    cnpj: '99999999000199',
    inscricaoMunicipal: '123456',
    regimeTributario: { opcaoSimplesNacional: 1, regimeEspecialTributacao: 0 },
  },
  tomador: {
    cnpj: '99999999000199',
    razaoSocial: 'TOMADOR LTDA',
    endereco: { municipio: '3509502', cep: '13000000', logradouro: 'Rua Exemplo', numero: '100', bairro: 'Centro' },
  },
  servico: {
    municipioPrestacao: '3509502',
    codigoTributacaoNacional: '010301',
    codigoTributacaoMunicipal: '001',
    descricao: 'descricao do servico prestado para fins de homologacao',
    codigoNbs: '1.1501.10.00',
  },
  valores: {
    valorServico: '26947.27',
    tributacaoMunicipal: { tributacaoIssqn: 1, tipoRetencaoIssqn: 1, aliquota: '5' },
    totalTributos: { indicadorTotalTributos: 0 },
  },
  ibsCbs: {
    finalidadeNfse: 0,
    codigoIndicadorOperacao: '100301',
    indicadorDestinatario: 0,
    classificacaoTributaria: '000001',
  },
});

console.log(result.status);
console.log(result.idDps);
console.log(result.rawResponse);
```

## Segurança

- Use certificado A1 `.pfx/.p12` do prestador.
- Nunca versionar certificados, senhas, XML real de cliente ou respostas com dados pessoais.
- `debug=true` imprime XML e resposta brutos para diagnóstico local.

## Migração

Consulte `docs/v3/migracao-v2-para-v3.md` para o mapa entre ABRASF/RPS/SOAP e Padrão Nacional/DPS.
