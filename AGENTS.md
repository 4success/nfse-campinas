# AGENTS.md

## Commands

- Use `corepack pnpm@11.10.0 ...` when you need the repo-pinned package manager explicitly.
- Install: `pnpm install`.
- Full local validation: `pnpm format && pnpm test && pnpm build && pnpm lint`.
- Single Jest file: `pnpm test -- __tests__/src/<name>.test.ts`.
- Build runs `prebuild` first, deleting `dist/`, then `tsc --emitDeclarationOnly && node esbuild.mjs`.
- `prepare` runs `pnpm run build`; GitHub installs of this package build from source.
- `pnpm-workspace.yaml` intentionally allows `esbuild` build scripts for pnpm 11 git/package preparation.

## Package Shape

- v3 is a breaking major: `NfseCampinas` exports `NfseCampinasV3`; consumers needing ABRASF/SOAP must stay on
  `@4success/nfse-campinas@^2`.
- Public API is exported from `src/index.ts`; implementation is flat under
  `src/{classes,client,certificate,dps,errors,signature,utils}`. Do not reintroduce a `src/v3` namespace just because
  older docs/specs mention it.
- `dist/` is generated and ignored. Source package contents are limited by `files: ["dist/**/*"]` for packed/published
  artifacts.
- Tests live under `__tests__/src`; shared valid DPS input is `test-support/fixtures.ts`.

## Campinas v3 Behavior

- Target protocol is DPS v1.01 / Padrão Nacional, not ABRASF 2.03, RPS, SOAP, or WSDL.
- Homologation DPS endpoint is `https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps`.
- Production has no hardcoded endpoint; sending with `environment: 'producao'` without `endpoints.dps` must keep
  throwing `MissingProductionEndpointError`.
- The Campinas endpoint expects `Content-Type: application/json` with `{ dpsXmlGZipB64 }`; raw XML with
  `application/xml` returned `HTTP 415`.
- Consulta, cancelamento, and eventos are not implemented for Campinas v3; stubs should keep throwing
  `NotImplementedError` until endpoints are published.
- `debug=true` deliberately logs signed XML and raw response without redaction. Do not add partial redaction unless
  product requirements change.

## Certificates And Transport

- Input certificate is A1 `.pfx/.p12`; `PfxCertificate` converts it to PEM for signing and mTLS.
- Preserve the matching leaf certificate plus intermediates in PEM output; TLS can require the client cert chain.
- `CampinasDpsClient` prefers PEM `key`/`cert` for `https.Agent`, with PFX fallback only when PEM is absent.
- Never commit real certificates, passwords, XML with client data, or raw municipal responses.

## Validation Rules That Are Easy To Break

- `validationMode: 'warn'` still blocks `severity: 'error'`; only `off` bypasses local validation.
- Dates must be real ISO dates/date-times with timezone; validation uses Luxon to reject impossible values and invalid
  `Date` objects.
- `serie`, `numeroDps`, and `codigoTributacaoMunicipal` accept only digits before padding; do not silently strip
  letters/signs.
- `codigoTributacaoNacional` accepts digits and dot formatting like `01.03.01`; reject letters before normalization.
- `idDps` override must match `DPS` + 42 digits.
- Validate optional `tomador`/`destinatario` CPF/CNPJ and address municipality when supplied, but do not make optional
  parties mandatory.
- `servico.codigoNbs` is only a warning when not 9 digits after normalization.
- Do not validate or normalize IBS/CBS domain codes locally; emit `cIndOp` and `cClassTrib` exactly as supplied.

## Docs And Examples

- High-signal docs: `README.md`, `docs/v3/homologacao.md`, `docs/v3/mapeamento-campos.md`, `docs/v3/assinatura-dps.md`,
  and `docs/v3/reforma-tributaria.md`.
- `docs/SPEC_V3_NFSE_CAMPINAS.md` is useful historical context but contains proposed paths that no longer match the
  flattened `src/` layout.
- Example scripts under `exemplos/v3` import from `../../src`; they are for local source usage, not published package
  examples.
