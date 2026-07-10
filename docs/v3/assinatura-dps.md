# Assinatura DPS

A DPS é assinada com XMLDSIG enveloped usando certificado A1 `.pfx/.p12`.

Regras implementadas:

- `Reference URI` aponta para `#<Id da DPS>`.
- `Id` fica em `infDPS` por padrão.
- A opção `signature.idAttributeTarget` permite alternar para `DPS` se a homologação de Campinas exigir.
- `<Signature>` é inserida como filha direta de `<DPS>`, logo após `</infDPS>`.
- A assinatura é gerada sem prefixo `ds:` por padrão.
- Transforms: enveloped-signature e Canonical XML 1.0.

Para depurar rejeições, salve o XML exato enviado e a resposta bruta retornada pela Prefeitura.
