# Especificação técnica — @4success/nfse-campinas v3

**Objetivo:** orientar agentes locais Codex a transformar o pacote `@4success/nfse-campinas` da versão 2.x, baseada em ABRASF 2.03/SOAP, para a versão 3.x, baseada no **Padrão Nacional NFS-e / DPS v1.01-20260209**, conforme implantação da Reforma Tributária do Consumo em Campinas.

**Data-base:** 2026-07-06.

---

## 1. Decisões de produto e release

### 1.1. Estratégia de versionamento

A v3 é uma **major version com quebra de compatibilidade**. O protocolo muda de ABRASF SOAP/RPS para DPS/NFS-e Padrão Nacional via endpoint REST/XML municipal.

Tarefas obrigatórias antes de alterar `main`:

1. Criar branch de preservação da v2 a partir do estado atual:
   ```bash
   git checkout main
   git pull
   git checkout -b v2
   git push origin v2
   ```
2. Taggear o último estado v2 se necessário, por exemplo `v2.3.0`.
3. A partir de `main`, implementar v3 e atualizar `package.json` para `3.0.0`.
4. Atualizar README deixando claro:
   - `3.x`: Padrão Nacional / DPS / Reforma Tributária.
   - `2.x`: ABRASF 2.03, usar `@4success/nfse-campinas@^2` ou branch `v2`.
   - `1.x`: DSFNET legacy, conforme README atual.

### 1.2. Escopo v3.0.0

Implementar com qualidade de produção:

- Geração de XML de **DPS v1.01**.
- Formação determinística do identificador `Id` da DPS.
- Assinatura XML Digital Signature da DPS com certificado A1 `.pfx/.p12`.
- Envio da DPS assinada para o endpoint municipal de homologação de Campinas.
- Parsing padronizado de sucesso, rejeição e erro HTTP.
- Testes unitários e de contrato com fixtures.
- Documentação de migração v2 → v3.

Não implementar em v3.0.0, salvo se a Prefeitura publicar endpoints durante o desenvolvimento:

- Consulta municipal v3.
- Cancelamento/eventos municipais v3.
- Substituição por endpoint específico municipal.
- Impressão DANFSe v3.

Esses métodos não devem ser anunciados como disponíveis. Podem existir stubs que lancem `NotImplementedError` com mensagem clara: “endpoint ainda não publicado pela Prefeitura de Campinas”.

---

## 2. Fontes oficiais e materiais de apoio

Use estes links como material de apoio e guarde cópias em `docs/references/v3/` durante a implementação, preferencialmente com data e hash do arquivo baixado.

### 2.1. Campinas / Reforma Tributária

- Página técnica da Prefeitura: `https://campinas.sp.gov.br/sites/reformatributaria/documentacao-tecnica`
- Grupo técnico: `https://groups.google.com/g/wsnfsecampinas`
- Comunicado de homologação disponível: `https://groups.google.com/g/wsnfsecampinas` e mensagem fixada de 01/07/2026.
- Código de Tributação Nacional e NBS: `https://groups.google.com/g/wsnfsecampinas/c/QEqM0ZpInsk/m/hoAwVLTCAAAJ`
- Consulta por CNAE: `https://drm-codae.campinas.sp.gov.br/cnae.php`
- Consulta por CBO: `https://drm-codae.campinas.sp.gov.br/cbo.php`
- Consulta de NBS: `https://drm-codae.campinas.sp.gov.br/nbs.html`

### 2.2. Documentação nacional NFS-e

- Documentação Atual: `https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual`
- Esquemas XSD v1.01-20260209: `https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/nfse-esquemas_xsd-v1-01-20260209.zip`
- Anexo I — SEFIN_ADN-DPS_NFSe-SNNFSe v1.01-20260209: `https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_i-sefin_adn-dps_nfse-snnfse-v1-01-20260209.xlsx`
- Portal RTC: `https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc`
- Nota Técnica SE/CGNFS-e nº 007: `https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc/nt-007-se-cgnfse-v1-0.pdf`

Observação importante para os agentes: o portal RTC pode listar notas técnicas mais recentes que a NT007. Não aplicar mudanças de NT009/Anexos novos automaticamente sem validar se Campinas já as adotou no endpoint de homologação municipal. O alvo inicial desta v3 é o pacote citado pela Prefeitura: **v1.01-20260209 + NT007**.

### 2.3. Materiais Campinas

- Manual do usuário RTC v1: `https://portal-adm.campinas.sp.gov.br//sites/default/files/anexos_avulsos/Manual%20de%20Emiss%C3%A3o%20de%20NFSe%20RTC%20-%20V1.pdf`
- Modelo de DPS: `https://portal-adm.campinas.sp.gov.br//sites/default/files/anexos_avulsos/modelo_DPS_0.pdf`

### 2.4. Padrão XMLDSIG

- XMLDSIG: `https://www.w3.org/TR/xmldsig-core/`
- Canonical XML 1.0: `http://www.w3.org/TR/2001/REC-xml-c14n-20010315`

---

## 3. Ambientes e endpoints

### 3.1. Homologação Campinas

Endpoint de envio de DPS:

```txt
POST https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps
```

Emissor online de homologação:

```txt
https://preprod-nfse.ima.sp.gov.br/notafiscal/paginas/login/login.jsf
```

No emissor online, o menu citado pela Prefeitura é: `NFSe-Prestador → Emitir Nota Fiscal Nacional`.

### 3.2. Produção Campinas

Produção WS ainda não deve ser hardcoded.

- A Prefeitura informou que o endpoint WS de produção será disponibilizado em 01/08/2026.
- A URL do ambiente web de produção permanece `https://novanfse.campinas.sp.gov.br`, mas isso não significa que esse seja o endpoint WS de envio.

Comportamento obrigatório no SDK:

```ts
new NfseCampinasV3({ environment: 'producao', ... })
```

Deve lançar `MissingProductionEndpointError` ao tentar enviar DPS enquanto não houver endpoint configurado explicitamente.

Permitir override seguro:

```ts
new NfseCampinasV3({
  environment: 'producao',
  endpoints: {
    dps: 'https://endpoint-publicado-em-2026-08-01/...',
  },
  certificate,
  certPassword,
});
```

### 3.3. Consulta e eventos

Para Campinas, no momento da especificação:

- Consulta: a ser publicada.
- Eventos/cancelamento/substituição: a serem publicados.

A API nacional possui referências genéricas para `/nfse`, `/dps/{id}` e `/nfse/{chaveAcesso}/eventos`, mas isso **não autoriza** o SDK a apontar automaticamente para endpoints nacionais ou municipais sem confirmação de Campinas.

---

## 4. Arquitetura proposta

### 4.1. Estrutura de diretórios

Criar namespace claro para v3 e não misturar com SOAP ABRASF:

```txt
src/
  index.ts
  v3/
    index.ts
    classes/
      NfseCampinasV3.ts
    client/
      CampinasDpsClient.ts
      endpoints.ts
      responseParser.ts
    certificate/
      PfxCertificate.ts
      types.ts
    dps/
      buildDpsId.ts
      DpsXmlBuilder.ts
      normalize.ts
      types.ts
      validators.ts
    signature/
      DpsSigner.ts
      signatureTypes.ts
      verifySignature.ts
    errors/
      NfseCampinasV3Error.ts
      HttpError.ts
      ValidationError.ts
      MissingProductionEndpointError.ts
      NotImplementedError.ts
    utils/
      decimals.ts
      dates.ts
      xml.ts
  schemas/
    nacional/v1.01-20260209/
      README.md
      *.xsd
  __tests__/
    v3/
      fixtures/
        modelo-dps-campinas.xml
        modelo-dps-campinas-assinado.xml
      dps-id.test.ts
      dps-builder.test.ts
      dps-signer.test.ts
      client.test.ts
      response-parser.test.ts
      validators.test.ts
exemplos/
  v3/
    enviar-dps-homologacao.ts
    gerar-xml-dps.ts
    assinar-xml-dps.ts
docs/
  v3/
    reforma-tributaria.md
    assinatura-dps.md
    mapeamento-campos.md
    homologacao.md
    migracao-v2-para-v3.md
```

### 4.2. Export público

No `src/index.ts` da v3:

```ts
export { NfseCampinasV3, NfseCampinasV3 as NfseCampinas } from './v3/classes/NfseCampinasV3';
export * from './v3/dps/types';
export * from './v3/client/endpoints';
export * from './v3/errors/NfseCampinasV3Error';
```

Decisão: na v3, `NfseCampinas` passa a apontar para o cliente v3. O usuário que precisar de ABRASF deve ficar em `@4success/nfse-campinas@^2`.

### 4.3. Dependências

Reutilizar dependências atuais sempre que possível:

- `axios`: envio HTTP e suporte a `httpsAgent`.
- `node-forge`: extração de chave/certificado do PFX para assinatura.
- `xml-crypto`: XMLDSIG.
- `fast-xml-parser`: parsing de XML de resposta e testes.
- `xmlbuilder`: geração ordenada de XML.

Evitar dependências nativas pesadas no runtime, especialmente validadores XSD baseados em `libxmljs2`, para preservar compatibilidade serverless.

Se os agentes adicionarem validação XSD, ela deve ser opcional e preferencialmente restrita a testes/dev tooling.

---

## 5. API pública v3

### 5.1. Construtor

```ts
export type NfseCampinasV3Environment = 'homologacao' | 'producao';

export type NfseCampinasV3Options = {
  environment?: NfseCampinasV3Environment;
  certificate: Buffer;
  certPassword: string;
  debug?: boolean;
  timeoutMs?: number;
  endpoints?: Partial<{
    dps: string;
    consulta: string;
    eventos: string;
  }>;
  applicationVersion?: string; // default: package version ou '3.0.0'
  requestHeaders?: Record<string, string>;
  signature?: Partial<DpsSignatureOptions>;
};
```

### 5.2. Classe principal

```ts
export class NfseCampinasV3 {
  constructor(options: NfseCampinasV3Options);

  buildDpsId(input: BuildDpsIdInput): string;

  buildDpsXml(input: DpsInput): string;

  signDpsXml(xml: string, options?: Partial<DpsSignatureOptions>): Promise<string>;

  enviarDps(input: DpsInput | string, options?: EnviarDpsOptions): Promise<EnviarDpsResult>;

  consultarNfsePorDps(_idDps: string): Promise<never>; // NotImplemented até Campinas publicar.

  cancelarNfse(_input: unknown): Promise<never>; // NotImplemented até Campinas publicar.
}
```

### 5.3. Fluxo de uso esperado

```ts
import fs from 'node:fs';
import { NfseCampinas } from '@4success/nfse-campinas';

const nfse = new NfseCampinas({
  environment: 'homologacao',
  certificate: fs.readFileSync('./certificado.pfx'),
  certPassword: process.env.CERT_PASSWORD!,
  debug: false,
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
    regimeTributario: {
      opcaoSimplesNacional: 1,
      regimeEspecialTributacao: 0,
    },
  },
  tomador: {
    cnpj: '99999999000199',
    razaoSocial: 'TOMADOR LTDA',
    endereco: {
      municipio: '3509502',
      cep: '13000000',
      logradouro: 'Rua Exemplo',
      numero: '100',
      bairro: 'Centro',
    },
  },
  servico: {
    municipioPrestacao: '3509502',
    codigoTributacaoNacional: '010301',
    codigoTributacaoMunicipal: '001',
    descricao: 'descricao do servico prestado para fins de homologacao e emissao de nota fiscal',
    codigoNbs: '115069000',
  },
  valores: {
    valorServico: '26947.27',
    tributacaoMunicipal: {
      tributacaoIssqn: 1,
      tipoRetencaoIssqn: 1,
      aliquota: '5',
    },
    tributacaoFederal: {
      pisCofins: {
        cst: '00',
        valorPis: '175.16',
        valorCofins: '808.42',
        tipoRetencaoPisCofins: 3,
      },
      valorRetidoIrrf: '404.20',
      valorRetidoCsll: '269.48',
    },
    totalTributos: { indicadorTotalTributos: 0 },
  },
  ibsCbs: {
    finalidadeNfse: 0,
    codigoIndicadorOperacao: '100301',
    indicadorDestinatario: 0,
    classificacaoTributaria: '000001',
    indicadorZonaFrancaManausAlc: undefined,
  },
});

console.log(result.status);
console.log(result.idDps);
console.log(result.rawResponse);
```

---

## 6. Modelo de dados da DPS

### 6.1. Campos mínimos do XML base Campinas

O `modelo_DPS_0.pdf` traz o XML base com estes grupos principais:

```xml
<DPS versao="1.01">
  <infDPS Id="DPS??????????">
    <tpAmb>?</tpAmb>
    <dhEmi>2026-06-30T21:41:28-03:00</dhEmi>
    <verAplic>1.01</verAplic>
    <serie>00001</serie>
    <nDPS>1</nDPS>
    <dCompet>2026-06-30</dCompet>
    <tpEmit>1</tpEmit>
    <cLocEmi>???????</cLocEmi>
    <prest>...</prest>
    <toma>...</toma>
    <serv>...</serv>
    <valores>...</valores>
    <IBSCBS>...</IBSCBS>
  </infDPS>
</DPS>
```

Mapear esses nomes XML de forma literal. Não traduzir tags no XML.

### 6.2. Tipos TypeScript sugeridos

```ts
export type AmbienteDps = 1 | 2; // 1 produção, 2 homologação

export type DpsInput = {
  ambiente?: 'producao' | 'homologacao' | AmbienteDps;
  idDps?: string;
  dataHoraEmissao: string | Date;
  versaoAplicativo?: string;
  serie: string | number;
  numeroDps: string | number;
  dataCompetencia: string | Date;
  tipoEmitente: number;
  municipioEmissao: string;
  prestador: PrestadorDps;
  tomador?: TomadorDps;
  destinatario?: DestinatarioDps;
  servico: ServicoDps;
  valores: ValoresDps;
  ibsCbs?: IbsCbsDps;
};
```

Detalhar em `src/dps/types.ts` todos os subtipos, mesmo que inicialmente sejam amplos. Preferir union types e strings para códigos fiscais, pois muitos códigos têm zeros à esquerda.

### 6.3. Código de Tributação Nacional, Código Municipal e NBS

Novos campos obrigatórios/relevantes na etapa Serviço:

- `cTribNac`: Código de Tributação Nacional. No XML do modelo aparece sem pontos, exemplo `010301`.
- `cTribMun`: Código Complementar Municipal, exemplo `001`.
- `cNBS`: código NBS, exemplo `115069000`.
- `cIndOp`: indicador da operação, no grupo `IBSCBS`, exemplo `100301`.
- `cClassTrib`: classificação tributária, exemplo `000001`.

Normalizações obrigatórias:

```ts
normalizeCodigoTributacaoNacional('01.03.01') === '010301'
normalizeCodigoTributacaoMunicipal('1') === '001'
normalizeNbs('1.1506.90.00') === '115069000'
```

Não inventar relação CNAE/CBO → cTribNac dentro do SDK em v3.0.0. O SDK deve aceitar o código já escolhido pelo usuário/sistema. As consultas auxiliares de Campinas podem ser documentadas, mas não chamadas automaticamente.

### 6.4. Valores monetários e arredondamento

Não usar `number` internamente para serializar dinheiro sem normalização. Aceitar entrada `string | number`, converter para string decimal com ponto e casas adequadas.

Implementar utilitários:

```ts
formatDecimal(value: string | number, scale = 2): string;
roundHalfEven(value: string | number, scale = 2): string;
```

A NT007 informa arredondamento bancário, half-even, e tolerância de R$ 0,01 para `vPis` e `vCofins`. O SDK não deve recalcular tributos de forma agressiva; deve apenas oferecer helper e validar formato.

---

## 7. Formação do identificador da DPS

### 7.1. Regra

Criar `buildDpsId` com base no layout nacional:

```txt
"DPS" + cMunEmi(7) + tipoInscricaoFederal(1) + inscricaoFederal(14) + serieDps(5) + numeroDps(15)
```

Comprimento esperado: `3 + 7 + 1 + 14 + 5 + 15 = 45` caracteres.

Entrada:

```ts
export type BuildDpsIdInput = {
  codigoMunicipioEmissao: string;
  tipoInscricaoFederal: '1' | '2'; // confirmar domínio no Anexo I: CPF/CNPJ
  inscricaoFederal: string;
  serie: string | number;
  numeroDps: string | number;
};
```

Normalização:

- Remover qualquer pontuação de CPF/CNPJ.
- CPF deve ser preenchido à esquerda com zeros até 14 dígitos.
- CNPJ deve ter 14 dígitos.
- Série deve ter 5 posições, com zeros à esquerda.
- Número da DPS deve ter 15 posições, com zeros à esquerda.
- Rejeitar string maior que o limite, em vez de truncar.

Exemplo com dados fictícios:

```ts
buildDpsId({
  codigoMunicipioEmissao: '3509502',
  tipoInscricaoFederal: '2',
  inscricaoFederal: '12345678000199',
  serie: '00001',
  numeroDps: 1,
});
// DPS350950221234567800019900001000000000000001
```

### 7.2. Local do atributo Id

Fonte técnica publicada pela Prefeitura no modelo de DPS mostra:

```xml
<DPS versao="1.01">
  <infDPS Id="DPS??????????">
```

A mensagem fixada do grupo mencionada pelo proprietário do repositório fala em `<DPS Id="DPS00001...">`. Como isso conflita com o modelo publicado e possivelmente com o XSD nacional, implementar assim:

1. **Default:** `Id` em `<infDPS>`, porque é o que aparece no modelo de DPS publicado.
2. A assinatura deve referenciar `URI="#<idDps>"`.
3. A assinatura deve ser inserida como filha direta de `<DPS>`, depois de `</infDPS>`.
4. Criar opção avançada:
   ```ts
   signature: { idAttributeTarget: 'infDPS' | 'DPS' }
   ```
   Default: `'infDPS'`.
5. Não colocar `Id` nos dois lugares ao mesmo tempo.
6. Se a homologação de Campinas rejeitar o default e confirmar a exigência do comunicado, mudar o default para `'DPS'` em patch/minor com fixture real de rejeição/aceite.

---

## 8. Geração do XML

### 8.1. Ordem das tags

O XML deve respeitar a ordem do XSD/Anexo I. Não serializar objeto JS arbitrariamente se isso puder reordenar campos.

Usar `xmlbuilder` com construção explícita em ordem.

Exemplo de ordem base:

```txt
DPS@versao
  infDPS@Id
    tpAmb
    dhEmi
    verAplic
    serie
    nDPS
    dCompet
    tpEmit
    cLocEmi
    prest
    toma
    dest?           // quando aplicável e permitido
    serv
    valores
    IBSCBS?
  Signature?        // após assinatura
```

### 8.2. Namespace

Os agentes devem confirmar no XSD `DPS_1.01.xsd` se o namespace padrão é obrigatório. Muitos exemplos nacionais usam:

```xml
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">
```

O modelo de Campinas publicado no PDF não exibe `xmlns`. Implementar opção:

```ts
xml: {
  namespace?: string | false;
}
```

Default recomendado após validação do XSD: `http://www.sped.fazenda.gov.br/nfse` se o XSD exigir; caso contrário, seguir o modelo Campinas sem namespace. O teste de homologação deve registrar qual formato foi aceito.

### 8.3. Sanitização de texto

- Remover caracteres de controle inválidos para XML 1.0.
- Escapar `&`, `<`, `>`, aspas onde necessário.
- Não remover acentuação de nomes/descrições salvo se a homologação demonstrar rejeição.
- Proibir emojis e caracteres fora do BMP por padrão em campos descritivos, pois rejeições de assinatura/validação por caracteres especiais já ocorreram historicamente em integrações municipais.

---

## 9. Assinatura da DPS

### 9.1. Requisitos funcionais

Implementar assinatura XMLDSIG enveloped.

Regras operacionais fornecidas no grupo:

- `Reference URI` deve apontar exatamente para o `Id` precedido por `#`.
- O grupo `<Signature>` deve ficar dentro do bloco principal da DPS, após `</infDPS>`.
- Gerar assinatura sem prefixo `ds:`: usar `<Signature>` e não `<ds:Signature>`.
- Transformações obrigatórias:
  - `http://www.w3.org/2000/09/xmldsig#enveloped-signature`
  - `http://www.w3.org/TR/2001/REC-xml-c14n-20010315`

### 9.2. Algoritmos

Default inicial:

```ts
canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
digestAlgorithm = 'http://www.w3.org/2000/09/xmldsig#sha1';
transforms = [
  'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
  'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
];
```

Centralizar em `DpsSignatureOptions` para trocar por SHA-256 se o XSD/Anexo I ou homologação exigir.

### 9.3. Implementação com `xml-crypto`

Criar classe:

```ts
export type DpsSignatureOptions = {
  idAttributeTarget: 'infDPS' | 'DPS';
  idAttributeName: 'Id';
  signaturePrefix?: '' | 'ds'; // default ''
  canonicalizationAlgorithm: string;
  signatureAlgorithm: string;
  digestAlgorithm: string;
  transforms: string[];
};

export class DpsSigner {
  constructor(private certificate: PfxCertificate, private options: DpsSignatureOptions) {}
  sign(xml: string): string;
  verify(xml: string): boolean;
}
```

Checklist da assinatura:

- Extrair chave privada e certificado público do PFX com `node-forge`.
- `privateKey` deve ser PEM.
- `publicCert` deve ser PEM ou X509 conforme exigência de `xml-crypto`.
- O `<X509Certificate>` deve conter apenas Base64 do certificado, sem `-----BEGIN CERTIFICATE-----`.
- Registrar atributo `Id` como ID se a lib exigir.
- Não assinar envelope SOAP. V3 não usa SOAP.
- Não assinar a string com pretty-print diferente da enviada.
- Não reformatar XML após `computeSignature`.

### 9.4. Forma esperada pós-assinatura

```xml
<DPS versao="1.01">
  <infDPS Id="DPS...">
    ...
  </infDPS>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="#DPS...">
        <Transforms>
          <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
          <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
        </Transforms>
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <DigestValue>...</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>...</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>...</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>
</DPS>
```

---

## 10. Cliente HTTP

### 10.1. Envio

Criar `CampinasDpsClient`:

```ts
export type SendSignedDpsInput = {
  signedXml: string;
  idDps: string;
  timeoutMs?: number;
};

export class CampinasDpsClient {
  constructor(options: CampinasDpsClientOptions);
  sendSignedDps(input: SendSignedDpsInput): Promise<EnviarDpsHttpResult>;
}
```

Request:

```txt
POST /notafiscal-adn-ws/api/adn/dps
Content-Type: application/json
Accept: application/xml, application/json, text/plain, */*
Body: { "dpsXmlGZipB64": "<XML DPS assinado compactado com gzip e codificado em base64>" }
```

Validado em homologação de Campinas: XML bruto com `application/xml` retorna `HTTP 415`; o endpoint processa o payload JSON `dpsXmlGZipB64`.

### 10.2. Certificado no transporte

Usar `https.Agent` com PFX/passphrase por padrão:

```ts
const httpsAgent = new https.Agent({
  pfx: certificate,
  passphrase: certPassword,
  rejectUnauthorized: true,
});
```

Se a homologação aceitar sem mTLS, manter o envio com certificado mesmo assim, pois consultas/eventos nacionais costumam exigir certificado e isso não deve quebrar servidores TLS corretamente configurados.

Permitir desativar apenas para testes unitários:

```ts
transport: { useClientCertificate?: boolean }
```

Default: `true`.

### 10.3. Retry e idempotência

Não fazer retry automático em `POST` por padrão. Emissão fiscal não deve duplicar tentativa silenciosamente.

Em timeout/ECONNRESET:

- Retornar/lançar erro contendo `idDps`, `signedXml` e `requestId` local.
- Instruir usuário a consultar por DPS quando endpoint estiver publicado.
- Permitir retry manual explícito pelo consumidor.

### 10.4. Parser de resposta

Resposta pode vir como XML, JSON ou texto. Implementar parser resiliente:

```ts
export type EnviarDpsResult = {
  status: 'autorizada' | 'rejeitada' | 'erro_http' | 'desconhecida';
  idDps: string;
  chaveAcesso?: string;
  numeroNfse?: string;
  codigoVerificacao?: string;
  mensagens: Array<{ codigo?: string; descricao: string; campo?: string }>;
  signedXml: string;
  rawRequest: string;
  rawResponse: string;
  httpStatus: number;
  headers: Record<string, string | string[] | undefined>;
};
```

Nunca descartar `rawResponse`. Usuários precisam disso para suporte com a Prefeitura.

### 10.5. Logs e segurança

Quando `debug=true`, logar:

- URL.
- HTTP status.
- XML request/response brutos.

Nunca logar:

- Senha do certificado.
- Chave privada.
- PFX em base64.

---

## 11. Validações locais

Implementar `validateDpsInput(input: DpsInput): ValidationIssue[]` e chamar antes de gerar XML.

Validações mínimas:

- Ambiente: `1` produção, `2` homologação.
- `dhEmi`: data/date-time ISO 8601 aceito pelo Luxon; timezone é recomendado, mas não exigido localmente, ex.
  `2026-06-30T21:41:28-03:00`.
- `dCompet`: `YYYY-MM-DD`.
- CNPJ/CPF: dígitos e tamanho válido.
- `cLocEmi`, `cLocPrestacao`, `cMun`: 7 dígitos.
- Série: 1 a 5 dígitos, serializada com 5.
- `nDPS`: 1 a 15 dígitos.
- `cTribNac`: 6 dígitos após normalização.
- `cTribMun`: 3 dígitos após normalização.
- `cNBS`: 9 dígitos após normalização, confirmar tamanho no Anexo I.
- `cIndOp`: domínio conforme Anexo VII.
- `cClassTrib`: domínio conforme Anexo VI/Anexo I.
- Valores monetários com ponto decimal e casas compatíveis.
- Uma requisição deve conter uma única DPS.

Modo de validação:

```ts
validationMode?: 'strict' | 'warn' | 'off'
```

Default: `strict` para erros estruturais; `warn` para domínios que dependem de tabelas externas ainda não embarcadas.

---

## 12. Tabelas e domínios

### 12.1. O que embarcar na v3.0.0

Não embarcar tabelas completas grandes sem script de atualização.

Criar pasta:

```txt
docs/references/v3/domains/
```

E script opcional:

```bash
pnpm docs:sync-v3
```

O script pode baixar e armazenar:

- XSD zip.
- Anexo I XLSX.
- Anexo VI/Anexo VII RTC utilizados.

No runtime, v3.0.0 deve funcionar sem baixar nada.

### 12.2. Consultas Campinas

Documentar no README:

- CNAE → Código Tributação Nacional.
- CBO → Código Tributação Nacional.
- NBS.

Não chamar esses sites automaticamente no SDK.

---

## 13. Testes obrigatórios

### 13.1. Comandos existentes

Manter comandos do `AGENTS.md` atual:

```bash
pnpm build
pnpm test
pnpm lint
pnpm format
```

### 13.2. Testes unitários

Criar testes em `src/__tests__/v3`.

#### `dps-id.test.ts`

Casos:

- CNPJ com pontuação.
- CPF com zeros à esquerda para 14 posições.
- Série número `1` vira `00001`.
- Número DPS `1` vira `000000000000001`.
- Resultado tem 45 chars e começa com `DPS`.
- Erro se CNPJ inválido.
- Erro se série > 5.
- Erro se número DPS > 15.

#### `dps-builder.test.ts`

- Gera XML equivalente ao `modelo_DPS_0.pdf` usando fixture.
- Mantém ordem das tags.
- Normaliza `01.03.01` para `010301`.
- Normaliza `cTribMun` para 3 dígitos.
- Escapa caracteres XML.
- Não inclui tags opcionais vazias.

#### `dps-signer.test.ts`

- Gera certificado de teste em memória ou usa fixture segura sem chave real.
- Assina XML da fixture.
- Verifica que existe `<Signature>` sem prefixo `ds:`.
- Verifica `Reference URI="#DPS..."`.
- Verifica transforms obrigatórias.
- Verifica que `Signature` fica após `</infDPS>` e antes de `</DPS>`.
- Verifica assinatura com `xml-crypto`.
- Verifica que reformatar pós-assinatura quebra assinatura, para proteger contra regressões.

#### `client.test.ts`

Usar `nock`.

- POST para endpoint de homologação.
- `Content-Type` correto.
- Body é XML assinado.
- Parser entende resposta XML de sucesso.
- Parser entende rejeição JSON.
- Timeout gera erro com `idDps` e `signedXml`.
- Produção sem endpoint lança `MissingProductionEndpointError`.

#### `validators.test.ts`

- Valida campos obrigatórios.
- Valida datas.
- Valida dinheiro.
- Valida NBS/códigos.
- Valida `ibsCbs` opcional/obrigatório conforme modo.

### 13.3. Teste de integração opcional

Criar teste desabilitado por padrão:

```bash
NFSE_CAMPINAS_RUN_INTEGRATION=1 \
NFSE_CAMPINAS_CERT_PATH=./cert.pfx \
NFSE_CAMPINAS_CERT_PASSWORD=... \
NFSE_CAMPINAS_CNPJ=... \
pnpm test -- src/__tests__/v3/integration/enviar-dps-homologacao.test.ts
```

O teste deve:

1. Validar variáveis de ambiente.
2. Gerar uma DPS de homologação com dados explicitamente marcados como teste.
3. Assinar.
4. Enviar para homologação.
5. Salvar request/response em `tmp/v3-integration/` com dados sensíveis redigidos.

Não rodar em CI público.

---

## 14. Documentação obrigatória

### 14.1. README principal

Atualizar as seções:

- Título: pacote para NFSe Campinas Padrão Nacional / DPS.
- Aviso de breaking change.
- Instalação v3.
- Como continuar usando v2.
- Exemplo mínimo de envio de DPS em homologação.
- Status dos endpoints:
  - Envio DPS homologação: implementado.
  - Produção: aguardando URL 01/08/2026, mas com override.
  - Consulta/eventos: aguardando publicação.
- Segurança de certificado.

### 14.2. `docs/v3/migracao-v2-para-v3.md`

Tabela sugerida:

| v2 ABRASF | v3 Nacional |
|---|---|
| RPS | DPS |
| SOAP/WSDL | HTTP POST XML |
| `GerarNfse` | `enviarDps` |
| `RecepcionarLoteRpsSincrono` | não há lote; enviar uma DPS por requisição |
| `InfDeclaracaoPrestacaoServico` | `DPS/infDPS` |
| Código municipal/CNAE | `cTribNac`, `cTribMun`, `cNBS` |
| Cancelamento SOAP | eventos ainda não publicados para Campinas |
| Consulta SOAP | consulta ainda não publicada para Campinas |

### 14.3. `docs/v3/assinatura-dps.md`

Incluir:

- Exemplo antes/depois da assinatura.
- Regra de `Id`.
- `Reference URI`.
- Transforms.
- Como depurar rejeição de assinatura.
- Como verificar se o certificado pertence ao prestador.

### 14.4. `docs/v3/homologacao.md`

Incluir checklist:

1. Empresa/certificado A1 válido.
2. Código de Tributação Nacional escolhido no emissor/consulta CNAE/CBO.
3. NBS correspondente.
4. Série e número DPS controlados pelo sistema emissor.
5. Ambiente `tpAmb=2`.
6. XML assinado.
7. POST para o endpoint de homologação.
8. Guardar request/response.

---

## 15. Plano de execução para agentes Codex

### Agente 0 — Preparação e documentação de referência

Objetivo: preparar branch, baixar materiais e deixar trilha auditável.

Tarefas:

1. Criar branch `v2` se ainda não existir.
2. Criar branch de trabalho `feature/v3-padrao-nacional-dps`.
3. Criar `docs/references/v3/README.md` com links e data de acesso.
4. Baixar XSD zip e Anexo I XLSX manualmente ou via script, se o ambiente permitir.
5. Registrar hashes SHA256 dos arquivos baixados.
6. Não commitar certificados, XML real de cliente ou respostas com dados pessoais.

Aceite:

- Branch v2 preservada.
- `docs/references/v3/README.md` criado.
- `pnpm test` ainda passa antes das mudanças funcionais.

### Agente 1 — Tipos, normalização e Id DPS

Objetivo: criar fundação de tipos e validação.

Tarefas:

1. Criar `src/dps/types.ts`.
2. Criar `normalize.ts` para CPF/CNPJ, códigos e dinheiro.
3. Criar `buildDpsId.ts`.
4. Criar `validators.ts`.
5. Criar testes unitários.

Aceite:

- `buildDpsId` retorna 45 chars.
- Testes cobrem CPF, CNPJ, padding e erros.
- Nenhum código fiscal com zero à esquerda é tratado como número internamente.

### Agente 2 — Builder XML

Objetivo: gerar DPS v1.01 em XML determinístico.

Tarefas:

1. Criar `DpsXmlBuilder.ts`.
2. Criar fixture baseada no modelo DPS Campinas.
3. Implementar ordem exata das tags.
4. Implementar opções de namespace.
5. Implementar sanitização XML.
6. Testar snapshot/estrutura.

Aceite:

- XML gerado contém `DPS versao="1.01"`.
- Contém `infDPS Id="DPS..."`.
- Contém grupos `prest`, `toma`, `serv`, `valores`, `IBSCBS`.
- Não contém campos vazios.

### Agente 3 — Certificado e assinatura

Objetivo: assinar DPS corretamente.

Tarefas:

1. Criar `PfxCertificate.ts` reaproveitando lógica atual de PFX.
2. Criar `DpsSigner.ts`.
3. Inserir `<Signature>` no local correto.
4. Garantir assinatura sem prefixo `ds:`.
5. Garantir transforms obrigatórias.
6. Criar verificador local de assinatura para testes.

Aceite:

- Assinatura local verifica com sucesso.
- `Reference URI` referencia o Id correto.
- `Signature` é filha direta de `DPS`.
- Chave privada/senha nunca aparecem em logs/erros.

### Agente 4 — Cliente HTTP e parser

Objetivo: enviar DPS assinada para homologação.

Tarefas:

1. Criar `endpoints.ts`.
2. Criar `CampinasDpsClient.ts` com axios + httpsAgent.
3. Criar `responseParser.ts`.
4. Criar classes de erro.
5. Testar com `nock`.

Aceite:

- Endpoint de homologação padrão correto.
- Produção sem endpoint explícito falha com erro claro.
- Parser preserva `rawResponse`.
- Timeout preserva `idDps` e XML assinado.

### Agente 5 — Classe pública e exemplos

Objetivo: orquestrar builder + signer + client.

Tarefas:

1. Criar `NfseCampinasV3.ts`.
2. Atualizar `src/index.ts`.
3. Criar exemplos em `exemplos/v3`.
4. Atualizar `.env.example`.
5. Garantir build de declarações TypeScript.

Aceite:

- Exemplo compila.
- `import { NfseCampinas }` aponta para v3.
- `enviarDps(input)` faz build, assinatura e POST.
- `enviarDps(xmlAssinado)` permite envio de XML já assinado.

### Agente 6 — README, migração e release

Objetivo: preparar pacote para publicação.

Tarefas:

1. Atualizar README.
2. Criar docs v3.
3. Atualizar `package.json` para `3.0.0`.
4. Atualizar keywords/description.
5. Rodar `pnpm format`, `pnpm lint`, `pnpm test`, `pnpm build`.
6. Criar changelog.

Aceite:

- Usuário entende como instalar v2 ou v3.
- Status dos endpoints está honesto.
- CI local passa.
- Não há segredos nos commits.

---

## 16. Critérios finais de aceite da v3.0.0

A release só pode ser considerada pronta quando todos estes itens forem verdadeiros:

- [ ] Branch/tag v2 preservada.
- [ ] `package.json` versão `3.0.0`.
- [ ] `pnpm build` passa.
- [ ] `pnpm test` passa.
- [ ] `pnpm lint` passa ou a regra legada foi ajustada de forma documentada.
- [ ] README informa que v3 é Padrão Nacional/DPS.
- [ ] README informa que v2 é ABRASF 2.03.
- [ ] Endpoint de homologação configurado.
- [ ] Produção sem endpoint explícito não envia por engano.
- [ ] `buildDpsId` implementado e testado.
- [ ] XML DPS v1.01 gerado em ordem determinística.
- [ ] Assinatura XMLDSIG sem prefixo `ds:`.
- [ ] `Reference URI` usa `#<Id>`.
- [ ] Transforms incluem enveloped-signature e C14N.
- [ ] `Signature` fica dentro de `DPS` após `infDPS`.
- [ ] Envio usa `POST` com body XML assinado.
- [ ] Parser preserva request/response bruto.
- [ ] Consulta/eventos/cancelamento não são anunciados como implementados.
- [ ] Exemplos v3 criados.
- [ ] Nenhum certificado, senha, XML real sensível ou resposta real com PII foi commitado.

---

## 17. Riscos e pontos de atenção

### 17.1. Conflito sobre localização do `Id`

O modelo DPS publicado mostra `infDPS Id`; mensagem fixada reportada pelo proprietário fala em `DPS Id`. Resolver com configuração e teste de homologação. Não assumir que a mensagem informal substitui o XSD sem prova de aceite/rejeição.

### 17.2. Namespace

O modelo PDF de Campinas não mostra `xmlns`, mas o padrão nacional costuma usar namespace. Confirmar via XSD e homologação. Manter opção configurável.

### 17.3. Endpoint de produção

Não inferir produção a partir da URL do emissor web. A Prefeitura informou que o WS será divulgado em 01/08/2026.

### 17.4. Consulta por DPS após timeout

Sem endpoint municipal publicado, a v3.0.0 não consegue recuperar automaticamente status de uma DPS após timeout. O erro deve expor `idDps` e XML assinado para tentativa manual posterior.

### 17.5. Tabelas fiscais

`cTribNac`, `cNBS`, `cIndOp`, `cClassTrib` dependem de tabelas externas. A v3 deve validar formato e documentar fontes, mas não deve bloquear emissão por falta de tabela embarcada se o usuário informar códigos válidos.

---

## 18. Checklist rápido para o primeiro teste real em homologação

1. Usar ambiente `homologacao` e `tpAmb=2`.
2. Usar certificado A1 do prestador informado em `prest`.
3. Gerar `idDps` com dados do prestador, município, série e número.
4. Gerar XML DPS v1.01.
5. Assinar referenciando `#idDps`.
6. Conferir que `<Signature>` está dentro de `<DPS>` e depois de `</infDPS>`.
7. Conferir que não existe `<ds:Signature>`.
8. POST no endpoint de homologação.
9. Salvar request e response.
10. Se rejeitar assinatura, testar a alternância `idAttributeTarget: 'DPS'` vs `'infDPS'` e namespace ligado/desligado, sempre comparando com XSD.
