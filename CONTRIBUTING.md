# Como contribuir

Obrigado pelo interesse em contribuir com `@4success/nfse-campinas`.

## Antes de começar

- Use issues para relatar bugs, propor melhorias ou discutir mudanças maiores antes de abrir um pull request.
- Este pacote atende Campinas no Padrão Nacional NFS-e / DPS v1.01. Alterações para ABRASF, RPS, SOAP ou WSDL pertencem
  a versões anteriores do pacote.
- Não envie certificados `.pfx` ou `.p12`, senhas, XMLs reais, respostas da Prefeitura ou quaisquer dados pessoais e
  fiscais de clientes.

## Ambiente local

Use Node.js compatível com o projeto e pnpm 11.10.0:

```bash
pnpm install
```

## Desenvolvimento

- Mantenha as mudanças focadas no problema abordado.
- Adicione ou atualize testes em `__tests__/src` para alterações de comportamento.
- Preserve valores fiscais e declarativos recebidos do consumidor; não os normalize ou altere silenciosamente.
- Documente mudanças de API pública, endpoints ou comportamento no `README.md` ou em `docs/v3`.

## Validação

Antes de abrir o pull request, execute:

```bash
pnpm format && pnpm test && pnpm build && pnpm lint
```

## Pull requests

- Descreva o problema e a solução proposta.
- Explique impactos de compatibilidade e breaking changes.
- Mantenha o pull request pequeno e independente de alterações não relacionadas.
- Confirme que os testes e verificações locais passaram.

Ao contribuir, você concorda em seguir o [Código de Conduta](CODE_OF_CONDUCT.md).
